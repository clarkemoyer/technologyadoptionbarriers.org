param(
  [string]$HostName = $env:QUALTRICS_MCP_HOST,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

if (-not $HostName) {
  $HostName = 'smeal.yul1.qualtrics.com'
}

# Ensure required env vars are available in this SAME PowerShell session:
# - QUALTRICS_CBM_OAUTH_CLIENT_ID
# - QUALTRICS_CBM_OAUTH_CLIENT_SECRET
# (or QUALTRICS_MCP_CLIENT_ID / QUALTRICS_MCP_CLIENT_SECRET)
$env:QUALTRICS_MCP_HOST = $HostName

$repoRoot = (Get-Location).Path
$tsScript = Join-Path $repoRoot 'scripts\get-qualtrics-mcp-oauth-token.ts'

if (-not (Test-Path $tsScript)) {
  throw "Token script not found: $tsScript"
}

$argsList = @()
if ($Force) {
  $argsList += '--force'
}

# Runs interactive PKCE only when needed; otherwise reuses/refreshes silently.
# This script does not print tokens.
npx tsx $tsScript @argsList

$tokenPath = Join-Path $repoRoot '.vscode\qualtrics-oauth-token.local.json'
if (-not (Test-Path $tokenPath)) {
  throw "Token cache not found: $tokenPath"
}

$cache = Get-Content $tokenPath -Raw | ConvertFrom-Json
$accessToken = $cache.token.access_token
if (-not $accessToken) {
  throw 'Token cache missing token.access_token'
}

$env:QUALTRICS_OAUTH_TOKEN = $accessToken
Write-Host '✅ QUALTRICS_OAUTH_TOKEN set for this PowerShell session (not printed).'
Write-Host 'Tip: run "Developer: Reload Window" so VS Code MCP picks it up.'
