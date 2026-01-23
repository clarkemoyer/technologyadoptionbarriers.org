import http from 'node:http'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'

type TokenJson = Record<string, unknown>

type TokenCacheFile = {
  obtained_at?: string
  expires_at?: string | null
  host?: string
  resource?: string
  scope?: string
  token?: TokenJson
}

type ClientCredentials = {
  client_id: string
  client_secret: string
}

function requiredEnvOneOf(names: string[]): string {
  for (const name of names) {
    const value = (process.env[name] || '').trim()
    if (value) return value
  }
  throw new Error(`Missing required env var (one of): ${names.join(', ')}`)
}

function env(name: string, fallback = ''): string {
  return (process.env[name] || fallback).trim()
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function sha256(buf: Buffer): Buffer {
  return crypto.createHash('sha256').update(buf).digest()
}

function openBrowser(url: string) {
  // Windows-friendly: open default browser.
  // Prefer PowerShell's Start-Process (less likely to truncate very long URLs).
  // This does not print any secrets.
  const escaped = url.replace(/'/g, "''")
  try {
    spawn('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${escaped}'`], {
      stdio: 'ignore',
      detached: true,
    }).unref()
  } catch {
    // Fallback
    spawn('cmd.exe', ['/c', 'start', '""', url], { stdio: 'ignore', detached: true }).unref()
  }
}

async function postForm(
  url: string,
  form: Record<string, string>
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(form).toString()

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      `Token endpoint did not return JSON (HTTP ${res.status}): ${text.slice(0, 200)}`
    )
  }

  if (!res.ok) {
    throw new Error(`Token request failed (HTTP ${res.status}): ${text}`)
  }

  if (!json || typeof json !== 'object') {
    throw new Error(`Token endpoint returned non-object JSON: ${text}`)
  }

  return json as Record<string, unknown>
}

function parseArgs(argv: string[]) {
  const args = new Set(argv)
  return {
    force: args.has('--force') || args.has('-f'),
    refreshOnly: args.has('--refresh-only'),
    interactiveOnly: args.has('--interactive-only'),
    noBrowser: args.has('--no-browser'),
    printAuthorizeUrl: args.has('--print-authorize-url') || args.has('--print-authorize-url-only'),
    clientCredentials: args.has('--client-credentials') || args.has('--client-credentials-only'),
  }
}

async function postFormWithBasicAuth(
  url: string,
  form: Record<string, string>,
  clientId: string,
  clientSecret: string
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(form).toString()
  const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${basic}`,
    },
    body,
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      `Token endpoint did not return JSON (HTTP ${res.status}): ${text.slice(0, 200)}`
    )
  }

  if (!res.ok) {
    throw new Error(`Token request failed (HTTP ${res.status}): ${text}`)
  }

  if (!json || typeof json !== 'object') {
    throw new Error(`Token endpoint returned non-object JSON: ${text}`)
  }

  return json as Record<string, unknown>
}

function readJsonFileIfExists(filePath: string): unknown | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, { encoding: 'utf8' })
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readClientCredentialsFromFile(filePath: string): ClientCredentials | null {
  const raw = readJsonFileIfExists(filePath)
  if (!isRecord(raw)) return null
  const clientId = typeof raw.client_id === 'string' ? raw.client_id.trim() : ''
  const clientSecret = typeof raw.client_secret === 'string' ? raw.client_secret.trim() : ''
  if (!clientId || !clientSecret) return null
  return { client_id: clientId, client_secret: clientSecret }
}

function readClientCredentialsFromEnv(): { clientId: string; clientSecret: string } | null {
  const clientId = (
    process.env.QUALTRICS_MCP_CLIENT_ID ||
    process.env.QUALTRICS_CBM_OAUTH_CLIENT_ID ||
    ''
  ).trim()
  const clientSecret = (
    process.env.QUALTRICS_MCP_CLIENT_SECRET ||
    process.env.QUALTRICS_CBM_OAUTH_CLIENT_SECRET ||
    ''
  ).trim()
  if (clientId && clientSecret) return { clientId, clientSecret }
  return null
}

async function promptForClientCredentials(
  host: string
): Promise<{ clientId: string; clientSecret: string }> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    console.log(`Qualtrics OAuth client credentials are required for host=${host}.`)
    const clientId = (await rl.question('Client ID: ')).trim()
    if (!clientId) throw new Error('Missing client_id')
    const clientSecret = (await rl.question('Client Secret: ')).trim()
    if (!clientSecret) throw new Error('Missing client_secret')
    return { clientId, clientSecret }
  } finally {
    try {
      rl.close()
    } catch {
      // ignore
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getAccessToken(token: TokenJson | undefined): string {
  return typeof token?.access_token === 'string' ? token.access_token : ''
}

function getRefreshToken(token: TokenJson | undefined): string {
  return typeof token?.refresh_token === 'string' ? token.refresh_token : ''
}

function computeExpiresAt(obtainedAtIso: string, token: TokenJson): string | null {
  const expiresIn = typeof token.expires_in === 'number' ? token.expires_in : null
  if (!expiresIn) return null
  const obtainedAt = new Date(obtainedAtIso)
  if (!Number.isFinite(obtainedAt.getTime())) return null
  return new Date(obtainedAt.getTime() + expiresIn * 1000).toISOString()
}

function isAccessTokenStillValid(cache: TokenCacheFile, skewSeconds: number): boolean {
  const token = isRecord(cache.token) ? (cache.token as TokenJson) : undefined
  if (!getAccessToken(token)) return false

  let expiresAtIso: string | null = typeof cache.expires_at === 'string' ? cache.expires_at : null
  if (!expiresAtIso && typeof cache.obtained_at === 'string' && token) {
    expiresAtIso = computeExpiresAt(cache.obtained_at, token)
  }
  if (!expiresAtIso) return false

  const expiresAt = new Date(expiresAtIso)
  if (!Number.isFinite(expiresAt.getTime())) return false
  return Date.now() + skewSeconds * 1000 < expiresAt.getTime()
}

function writeTokenCache(filePath: string, data: TokenCacheFile) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: 'utf8' })
}

function isLoopbackRedirect(redirectUri: string): boolean {
  return (
    redirectUri.startsWith('http://127.0.0.1:') ||
    redirectUri.startsWith('http://localhost:') ||
    redirectUri.startsWith('http://[::1]:')
  )
}

const QUALTRICS_APPROVED_REDIRECT_URIS = new Set([
  'https://smeal.qualtrics.com/oauth-client-service/redirect',
  'https://yul1.qualtrics.com/oauth-client-service/redirect',
])

function inferApprovedRedirectUriFromHost(host: string): string | null {
  const h = host.toLowerCase()
  if (h === 'yul1.qualtrics.com' || h.endsWith('.yul1.qualtrics.com')) {
    return 'https://yul1.qualtrics.com/oauth-client-service/redirect'
  }
  if (h === 'smeal.qualtrics.com' || h.endsWith('.smeal.qualtrics.com')) {
    return 'https://smeal.qualtrics.com/oauth-client-service/redirect'
  }
  return null
}

function inferClusterHost(host: string): string {
  const h = host.toLowerCase()
  const parts = h.split('.').filter(Boolean)
  // Common Qualtrics hosts look like:
  // - yul1.qualtrics.com
  // - smeal.yul1.qualtrics.com
  // - by-brand.iad1.qualtrics.com
  // In all cases, the cluster host is typically the last 3 labels.
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === 'qualtrics' &&
    parts[parts.length - 1] === 'com'
  ) {
    return parts.slice(-3).join('.')
  }
  return host
}

function normalizeAndValidateRedirectUri(raw: string, host: string): string {
  const redirectUri = raw.trim()
  if (!redirectUri) {
    const inferred = inferApprovedRedirectUriFromHost(host)
    if (inferred) return inferred
    throw new Error(
      `QUALTRICS_MCP_REDIRECT_URI is required for host=${host}. Approved values: ${Array.from(
        QUALTRICS_APPROVED_REDIRECT_URIS
      ).join(', ')}`
    )
  }

  if (isLoopbackRedirect(redirectUri)) {
    // Loopback works only if it's registered in the OAuth client.
    // Keep it allowed when explicitly provided.
    return redirectUri
  }

  if (!QUALTRICS_APPROVED_REDIRECT_URIS.has(redirectUri)) {
    throw new Error(
      `Redirect URI not approved by Qualtrics tenant policy: ${redirectUri}. Approved values: ${Array.from(
        QUALTRICS_APPROVED_REDIRECT_URIS
      ).join(', ')}`
    )
  }

  return redirectUri
}

function extractCodeFromUserInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // Allow pasting either the raw code OR the full redirected URL.
  // Example: https://yul1.qualtrics.com/oauth-client-service/redirect?code=...&state=...
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const u = new URL(trimmed)
      return (u.searchParams.get('code') || '').trim()
    } catch {
      // fall through
    }
  }

  return trimmed
}

async function promptForCode(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const raw = await rl.question(
      'Paste the final redirected URL (…/oauth-client-service/redirect?code=...) OR paste only the code value: '
    )
    const code = extractCodeFromUserInput(raw)
    if (!code) {
      const hint = raw.trim()
      if (hint.startsWith('https://') && hint.includes('/oauth2/authorize')) {
        throw new Error(
          'Missing code. It looks like you pasted the authorize URL. Continue the browser login/consent until you land on the approved redirect URL (…/oauth-client-service/redirect?code=...), then paste that final URL here.'
        )
      }
      throw new Error(
        'Missing code. Paste the final redirected URL that contains `code=...` (…/oauth-client-service/redirect?code=...) or paste only the code value.'
      )
    }
    return code
  } finally {
    rl.close()
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  // Resource host (the MCP server lives here)
  const host = env('QUALTRICS_MCP_HOST', 'smeal.yul1.qualtrics.com')
  // OAuth host is often the cluster host (e.g. yul1.qualtrics.com), not the brand host.
  const oauthHost = env('QUALTRICS_MCP_OAUTH_HOST', inferClusterHost(host))

  const envCreds = readClientCredentialsFromEnv()
  let clientId: string
  let clientSecret: string
  if (envCreds) {
    clientId = envCreds.clientId
    clientSecret = envCreds.clientSecret
  } else {
    // Optional local file support (only if explicitly configured).
    const credPath = env('QUALTRICS_MCP_CLIENT_CREDENTIALS_PATH', '')
    if (credPath) {
      const creds = readClientCredentialsFromFile(credPath)
      if (!creds) {
        throw new Error(`Credential file did not contain client_id/client_secret: ${credPath}`)
      }
      clientId = creds.client_id
      clientSecret = creds.client_secret
    } else {
      const prompted = await promptForClientCredentials(host)
      clientId = prompted.clientId
      clientSecret = prompted.clientSecret
    }
  }

  // Qualtrics MCP endpoints are OAuth-protected resources. Some tenants require the
  // RFC 8707 `resource` parameter during authorization.
  const resource = env('QUALTRICS_MCP_RESOURCE', `https://${host}/API/mcp/survey-crud`)

  const port = Number(env('QUALTRICS_MCP_REDIRECT_PORT', '53123'))
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('QUALTRICS_MCP_REDIRECT_PORT must be a valid port number')
  }

  // IMPORTANT: many Qualtrics tenants only allow redirect URIs pointing at Qualtrics
  // `oauth-client-service/redirect` endpoints.
  const redirectUri = normalizeAndValidateRedirectUri(env('QUALTRICS_MCP_REDIRECT_URI'), oauthHost)
  const scope = env('QUALTRICS_MCP_SCOPES', 'openid manage:all')

  const outputPath = env(
    'QUALTRICS_MCP_TOKEN_CACHE_PATH',
    path.join(process.cwd(), '.vscode', 'qualtrics-oauth-token.local.json')
  )

  const skewSeconds = Number(env('QUALTRICS_MCP_TOKEN_EXPIRY_SKEW_SECONDS', '120'))
  const validSkewSeconds = Number.isFinite(skewSeconds) && skewSeconds >= 0 ? skewSeconds : 120

  const existingRaw = !args.force ? readJsonFileIfExists(outputPath) : null
  const existing: TokenCacheFile | null = isRecord(existingRaw)
    ? (existingRaw as TokenCacheFile)
    : null
  const existingToken =
    existing && isRecord(existing.token) ? (existing.token as TokenJson) : undefined

  if (existing && !args.force && !args.refreshOnly && !args.interactiveOnly) {
    if (isAccessTokenStillValid(existing, validSkewSeconds)) {
      const nowIso = new Date().toISOString()
      const obtainedAt = typeof existing.obtained_at === 'string' ? existing.obtained_at : nowIso
      const expiresAt =
        typeof existing.expires_at === 'string'
          ? existing.expires_at
          : existingToken
            ? computeExpiresAt(obtainedAt, existingToken)
            : null

      writeTokenCache(outputPath, {
        obtained_at: obtainedAt,
        expires_at: expiresAt,
        host,
        resource,
        scope,
        token: existingToken || {},
      })

      console.log('✅ Existing OAuth token is still valid; reusing cached token (not printed).')
      console.log(`Wrote: ${outputPath}`)
      return
    }
  }

  // Qualtrics OAuth uses the standard endpoints on the cluster host.
  // We keep the MCP `resource` host separate (it can be a brand host).
  // Qualtrics docs describe the auth-code kickoff endpoint as /oauth2/auth.
  // Some environments may also accept /oauth2/authorize.
  const authorizePath = env('QUALTRICS_MCP_OAUTH_AUTHORIZE_PATH', '/oauth2/auth')
  const tokenPath = env('QUALTRICS_MCP_OAUTH_TOKEN_PATH', '/oauth2/token')
  const tokenEndpoint = `https://${oauthHost}${tokenPath}`

  // Non-interactive option: use OAuth client_credentials grant (backend automation scenario).
  // This matches Qualtrics docs and avoids browser redirects entirely.
  if (args.clientCredentials) {
    const scopeForClientCredentials = scope
      .split(/\s+/)
      .filter((s) => s && s !== 'openid')
      .join(' ')
    const effectiveScope = scopeForClientCredentials || 'manage:all'

    const tokenJson = (await postFormWithBasicAuth(
      tokenEndpoint,
      {
        grant_type: 'client_credentials',
        scope: effectiveScope,
      },
      clientId,
      clientSecret
    )) as TokenJson

    const accessToken = typeof tokenJson.access_token === 'string' ? tokenJson.access_token : ''
    if (!accessToken) {
      throw new Error('Token response missing access_token')
    }

    const now = new Date()
    const expiresIn = typeof tokenJson.expires_in === 'number' ? tokenJson.expires_in : null
    const expiresAt = expiresIn ? new Date(now.getTime() + expiresIn * 1000).toISOString() : null

    writeTokenCache(outputPath, {
      obtained_at: now.toISOString(),
      expires_at: expiresAt,
      host,
      resource,
      scope,
      token: tokenJson,
    })

    console.log('✅ OAuth token saved via client_credentials grant (not printed)')
    console.log(`Wrote: ${outputPath}`)
    return
  }

  // If we have a refresh token, prefer refreshing silently.
  if (!args.interactiveOnly) {
    const refreshToken = getRefreshToken(existingToken)
    if (refreshToken) {
      console.log('Refreshing OAuth token via refresh_token grant…')
      const refreshed = (await postForm(tokenEndpoint, {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      })) as TokenJson

      // Some servers omit refresh_token on refresh; preserve existing refresh_token.
      if (!getRefreshToken(refreshed)) {
        refreshed.refresh_token = refreshToken
      }

      const accessToken = getAccessToken(refreshed)
      if (!accessToken) {
        throw new Error('Refresh response missing access_token')
      }

      const now = new Date()
      const expiresAt = computeExpiresAt(now.toISOString(), refreshed)

      writeTokenCache(outputPath, {
        obtained_at: now.toISOString(),
        expires_at: expiresAt,
        host,
        resource,
        scope,
        token: refreshed,
      })

      console.log('✅ OAuth token refreshed and saved (not printed)')
      console.log(`Wrote: ${outputPath}`)
      return
    }

    if (args.refreshOnly) {
      throw new Error(
        `--refresh-only was set, but no refresh_token was found in ${outputPath}. Run once without --refresh-only to do the interactive login.`
      )
    }
  }

  // Fall back to interactive auth-code + PKCE.
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32))
  const codeChallenge = base64UrlEncode(sha256(Buffer.from(codeVerifier)))
  const state = base64UrlEncode(crypto.randomBytes(16))
  const nonce = scope.split(/\s+/).includes('openid') ? base64UrlEncode(crypto.randomBytes(16)) : ''

  const authorizeUrl = new URL(`https://${oauthHost}${authorizePath}`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', scope)
  const useResource = env('QUALTRICS_MCP_OAUTH_USE_RESOURCE', 'false').toLowerCase() === 'true'
  if (useResource) {
    authorizeUrl.searchParams.set('resource', resource)
  }
  authorizeUrl.searchParams.set('state', state)
  if (nonce) {
    authorizeUrl.searchParams.set('nonce', nonce)
  }
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  if (args.printAuthorizeUrl) {
    // Single-line output for reliable copy/paste (no wrapping).
    process.stdout.write(authorizeUrl.toString() + '\n')
    return
  }

  let code: string

  if (isLoopbackRedirect(redirectUri)) {
    console.log('Starting local callback listener…')

    code = await new Promise<string>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        try {
          const reqUrl = new URL(req.url || '/', redirectUri)
          if (reqUrl.pathname !== '/callback') {
            res.writeHead(404)
            res.end('Not found')
            return
          }

          const returnedState = reqUrl.searchParams.get('state') || ''
          const returnedCode = reqUrl.searchParams.get('code') || ''
          const error = reqUrl.searchParams.get('error')
          const errorDescription = reqUrl.searchParams.get('error_description')

          if (error) {
            res.writeHead(400)
            res.end('OAuth error received. You can close this tab.')
            server.close()
            reject(
              new Error(`OAuth error: ${error}${errorDescription ? ` (${errorDescription})` : ''}`)
            )
            return
          }

          if (!returnedCode) {
            res.writeHead(400)
            res.end('Missing code. You can close this tab.')
            return
          }

          if (returnedState !== state) {
            res.writeHead(400)
            res.end('State mismatch. You can close this tab.')
            server.close()
            reject(new Error('OAuth state mismatch'))
            return
          }

          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Authorization received. You can close this tab and return to the terminal.')

          server.close()
          resolve(returnedCode)
        } catch (e) {
          server.close()
          reject(e)
        }
      })

      server.on('error', reject)
      server.listen(port, '127.0.0.1', () => {
        console.log('Opening browser for Qualtrics OAuth consent…')
        console.log('If the browser does not open, visit this URL manually:')
        console.log(authorizeUrl.toString())
        if (!args.noBrowser) {
          openBrowser(authorizeUrl.toString())
        }
      })
    })
  } else {
    console.log('Loopback redirect is disabled; using manual code entry mode.')
    console.log('Open this URL in a browser to authorize:')
    console.log(authorizeUrl.toString())
    if (!args.noBrowser) {
      openBrowser(authorizeUrl.toString())
    }
    code = await promptForCode()
  }

  console.log('Exchanging code for tokens…')

  const tokenJson = await postForm(tokenEndpoint, {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const accessToken = typeof tokenJson.access_token === 'string' ? tokenJson.access_token : ''
  if (!accessToken) {
    throw new Error('Token response missing access_token')
  }

  const now = new Date()
  const expiresIn = typeof tokenJson.expires_in === 'number' ? tokenJson.expires_in : null
  const expiresAt = expiresIn ? new Date(now.getTime() + expiresIn * 1000).toISOString() : null

  writeTokenCache(outputPath, {
    obtained_at: now.toISOString(),
    expires_at: expiresAt,
    host,
    resource,
    scope,
    token: tokenJson as TokenJson,
  })

  console.log('✅ OAuth token saved (not printed)')
  console.log(`Wrote: ${outputPath}`)
}

main().catch((err) => {
  console.error(
    '❌ Failed to get Qualtrics MCP OAuth token:',
    err instanceof Error ? err.message : err
  )
  process.exit(1)
})
