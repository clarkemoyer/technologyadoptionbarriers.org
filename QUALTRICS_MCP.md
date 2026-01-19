# Qualtrics MCP (Model Context Protocol)

MCP is experimental and subject to change.

Qualtrics provides MCP servers that expose MCP tools for each JSON-based endpoint in their API reference. Non-JSON APIs are not supported.

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

### VS Code note: config format differs

VS Code uses a `servers`-based MCP config format in `.vscode/mcp.json`.

This repo keeps:

- [mcp.json.example](mcp.json.example): a generic `mcpServers` template (works in many MCP clients).
- [.vscode/mcp.json.example](.vscode/mcp.json.example): a VS Code `.vscode/mcp.json` template using `servers`.

The VS Code template also includes the GitHub remote MCP server (`github`) so you can use GitHub + Qualtrics MCP side-by-side in the same workspace.

### OAuth (recommended)

If your MCP client supports OAuth 2 logins using the `authorization_code` flow, use the config without headers and complete the standard login/consent flow in your client.

### Bearer token (fallback)

If your MCP client does not support the OAuth login flow, you can generate a `client_credentials` token and provide it as:

- `Authorization: Bearer <oauth token>`

These tokens expire and will need rotation.

## Quick connectivity check

You can sanity-check that the MCP endpoint is reachable from your machine (this should return a 401/redirect unless you include a valid token):

- `curl -i https://<your-qualtrics-host>/API/mcp/survey-crud`

For the GitHub remote MCP server endpoint (hosted by GitHub):

- `curl -i https://api.githubcopilot.com/mcp/`

## Safety warning: manage:all scope

Due to limitations in the MCP specification, the Qualtrics MCP server requests `manage:all` scopes when generating access tokens.

This means your MCP client may be authorized to perform any actions your account is permitted to take (including destructive actions). Only approve tool calls you understand.
