# Qualtrics MCP (Model Context Protocol)

MCP is experimental and subject to change.

Qualtrics provides MCP servers that expose MCP tools for each JSON-based endpoint in their API reference. Non-JSON APIs are not supported.

See also:

- [MCP_SERVERS.md](./MCP_SERVERS.md) (overall MCP setup)
- [GITHUB_COPILOT_AGENT_SETUP.md](./GITHUB_COPILOT_AGENT_SETUP.md) (GitHub UI coding agent config)

## Repo policy (important)

- Do not commit access tokens or real MCP configs.
- This repo includes [mcp.json.example](mcp.json.example) as a template (valid JSON).
- A bearer-token template is also provided: [mcp.bearer.json.example](mcp.bearer.json.example).
- Local MCP config files are gitignored: `mcp.json` and `.vscode/mcp.json`.

## Configuring an MCP client

Most MCP clients accept an Anthropic-style `mcpServers` config.

Start by copying the example:

- Copy [mcp.json.example](mcp.json.example) to `mcp.json` (repo root).
- Replace `by-brand.iad1.qualtrics.com` with your Qualtrics brand/cluster hostname.

If you prefer to keep everything under VS Code settings, copy [.vscode/mcp.json.example](.vscode/mcp.json.example) to `.vscode/mcp.json`.

## Using GitHub Actions environment secrets with MCP

GitHub “Environment secrets” (like `QUALTRICS_API_TOKEN`) are only available _inside GitHub Actions jobs_ via `${{ secrets.NAME }}`.

VS Code MCP servers run on your local machine, so they **cannot read GitHub Actions secrets**.

To use the same credentials locally with VS Code MCP, you must provide them locally via one of these safe approaches:

- **VS Code prompt (recommended):** keep `.vscode/mcp.json` gitignored and use `${input:...}` prompts.
- **Local environment variable:** set an OS/user env var on your machine and reference it from your MCP client/config (only if your MCP client supports env substitution).

### Important: Qualtrics MCP uses OAuth + SSE

In practice, the Qualtrics MCP endpoint at `/API/mcp/...` expects:

- `Authorization: Bearer <access token>`
- `Accept: application/json, text/event-stream`

It responds to `initialize` using **Server-Sent Events** (`Content-Type: text/event-stream`). If your terminal MCP client does not support streamable HTTP/SSE transport, it can look like it’s “stuck” waiting for `initialize`.

### Troubleshooting: “Waiting for server to respond to `initialize`…”

If VS Code (or another client) shows it is waiting for `initialize` and never completes:

- Ensure your server config includes `Accept: application/json, text/event-stream`.
- Ensure the client supports **streamable HTTP / SSE** responses.
- If you used an API token (`X-API-TOKEN`), note that the MCP endpoint advertises `WWW-Authenticate: Bearer` and may require an OAuth access token.

You can confirm the endpoint is responding by POSTing a minimal `initialize` request and checking for `Content-Type: text/event-stream`.

### Troubleshooting: no prompt, but tools fail with 401 invalid_client

If you don’t see a prompt in VS Code, it may have cached an earlier (wrong/blank) value for an `${input:...}`.

Workarounds:

- Change the input id in your local `.vscode/mcp.json` (e.g. `qualtrics_access_token` → `qualtrics_access_token_v2`) to force a fresh prompt.
- Run `Developer: Reload Window`.

If your goal is CI automation (copy surveys, export/import), using the **Qualtrics REST API** directly with an API token (`X-API-TOKEN`) is often simpler than calling the MCP endpoint.

### VS Code note: config format differs

VS Code uses a `servers`-based MCP config format in `.vscode/mcp.json`.

This repo keeps:

- [mcp.json.example](mcp.json.example): a generic `mcpServers` template (works in many MCP clients).
- [.vscode/mcp.json.example](.vscode/mcp.json.example): a VS Code `.vscode/mcp.json` template using `servers`.

To use GitHub + Qualtrics MCP side-by-side in VS Code:

- If you already have a built-in/Marketplace GitHub MCP server registered, avoid defining a second `github` server name in `.vscode/mcp.json`.
- If you want **GitHub write support** in VS Code, configure the hosted GitHub MCP endpoint with a PAT and `X-MCP-Toolsets` header (see `.vscode/mcp.with-github.json.example`).

If you prefer a single-file VS Code config (no Marketplace install), you can start from [.vscode/mcp.with-github.json.example](.vscode/mcp.with-github.json.example).

### OAuth (recommended)

If your MCP client supports OAuth 2 logins using the `authorization_code` flow, use the config without headers and complete the standard login/consent flow in your client.

### Bearer token (fallback)

Some MCP clients support supplying a bearer token directly instead of running an interactive login. If so, you can provide:

- `Authorization: Bearer <access token>`

However, the Qualtrics MCP authorization server typically supports `authorization_code` (and refresh) flows for the MCP endpoints, so `client_credentials` may not be available.

## Using the secrets in GitHub Actions (CI)

If you run scripts in CI that need to call Qualtrics (or fetch an OAuth access token), reference the environment secrets like this:

- `QUALTRICS_API_TOKEN`: `${{ secrets.QUALTRICS_API_TOKEN }}`
- `QUALTRICS_CBM_OAUTH_CLIENT_ID`: `${{ secrets.QUALTRICS_CBM_OAUTH_CLIENT_ID }}`
- `QUALTRICS_CBM_OAUTH_CLIENT_SECRET`: `${{ secrets.QUALTRICS_CBM_OAUTH_CLIENT_SECRET }}`

### Example: pass secrets to a workflow step

In GitHub Actions, the standard pattern is to map secrets into environment variables for the step that needs them:

```yaml
- name: Qualtrics connectivity (do not print token)
  env:
    QUALTRICS_API_TOKEN: ${{ secrets.QUALTRICS_API_TOKEN }}
    QUALTRICS_HOST: by-brand.iad1.qualtrics.com
  run: |
    # Example only: this checks reachability without echoing secrets.
    # Whether this returns 200/401/etc depends on the endpoint and auth requirements.
    curl -sS -o /dev/null -D - \
      -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
      "https://$QUALTRICS_HOST/API/mcp/survey-crud"
```

Note: “using MCP in CI” only makes sense if you have an MCP-capable client/library in the job that speaks MCP over HTTP/stdio. If your goal is automation (copy surveys, export/import, etc.), calling the **Qualtrics REST API** directly in CI is usually simpler than calling the MCP endpoint.

### OAuth endpoints used by the Qualtrics MCP server

The MCP endpoint advertises an OAuth authorization server on your Qualtrics host, with endpoints under `/API/mcp/*`:

- Authorization: `https://<your-qualtrics-host>/API/mcp/authorize`
- Token: `https://<your-qualtrics-host>/API/mcp/token`

If VS Code prompts you for a client id/secret, it’s because it needs a manually created OAuth client (Qualtrics does not support automatic/dynamic registration for this flow).

## Quick connectivity check

You can sanity-check that the MCP endpoint is reachable from your machine (this should return a 401/redirect unless you include a valid token):

- `curl -i https://<your-qualtrics-host>/API/mcp/survey-crud`

For the GitHub remote MCP server endpoint (hosted by GitHub):

- `curl -i https://api.githubcopilot.com/mcp/`

## Safety warning: manage:all scope

Due to limitations in the MCP specification, the Qualtrics MCP server requests `manage:all` scopes when generating access tokens.

This means your MCP client may be authorized to perform any actions your account is permitted to take (including destructive actions). Only approve tool calls you understand.
