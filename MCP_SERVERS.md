# MCP Servers Configuration

This document describes the Model Context Protocol (MCP) servers configured for this repository.

## Configuration Types

There are **two different MCP configuration approaches** for this repository:

### 1. GitHub Copilot Agent (Recommended for GitHub UI)

For use with **GitHub Copilot coding agent in the GitHub UI**, configuration is done through repository settings, not through committed files.

**📖 See:** [GITHUB_COPILOT_AGENT_SETUP.md](./GITHUB_COPILOT_AGENT_SETUP.md) for complete setup instructions.

**Key differences:**

- Configuration entered in GitHub Settings UI (**Settings** > **Copilot** > **Coding agent**)
- Requires `type`, `tools`, and proper environment secret format
- Environment secrets must be prefixed with `COPILOT_MCP_`
- Supports `type: "local"`, `"http"`, or `"sse"`

### 2. IDE-Based MCP (For Local Development)

For use with **VS Code and local MCP clients**, configuration is done on your machine.

In this repo, we use two patterns:

- `.vscode/mcp.json` (VS Code format) for local dev. This file is **gitignored**.
- `.copilot/mcp-config.json` as a **reference** `mcpServers` config and for running the validation script.

---

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables large language models (LLMs) and AI coding agents to interact with external tools, resources, and data sources in a standardized way. MCP servers expose specific capabilities that coding agents can use to perform tasks more effectively.

## Configured MCP Servers

This repository’s current “primary” MCP server set is:

- GitHub MCP (remote)
- Qualtrics MCP (remote, SSE)
- Microsoft Learn MCP (remote)

### 1. GitHub MCP

**Purpose:** Provides access to GitHub repository operations, workflows, issues, pull requests, and more.

**Option A – GitHub Copilot Agent / VS Code (remote HTTP):**

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "tools": ["*"],
    "headers": {
      "X-MCP-Toolsets": "repos,issues,users,pull_requests,code_security,secret_protection,actions,web_search"
    }
  }
}
```

**Server Type:** Remote HTTP  
**URL:** `https://api.githubcopilot.com/mcp/` (the `/readonly` variant is read-only)

**Option B – Claude Desktop / local MCP clients (Docker):**

Use the official Docker image (`ghcr.io/github/github-mcp-server`). The
`@modelcontextprotocol/server-github` npm package is **deprecated** and officially superseded by this
Docker image, which provides better isolation, is maintained by GitHub, and receives continued updates.

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<REPLACE_WITH_YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>"
      }
    }
  }
}
```

Copy `claude_desktop_config.json.example` in the repository root to your Claude Desktop config path:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Image:** `ghcr.io/github/github-mcp-server` ([github/github-mcp-server](https://github.com/github/github-mcp-server))

**Capabilities:**

- Repository management and navigation
- Issue and pull request operations (read **and** write)
- GitHub Actions workflow management
- Code search and navigation
- Commit and branch operations

**Authentication:**

- GitHub Copilot provides baseline access for Option A.
- For Option A, a PAT is optional and may be added as `Authorization: Bearer $COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN` when you need broader scope or access to private resources; it can be omitted when baseline Copilot access is sufficient.
- For VS Code and other local IDE-based setups, follow `.vscode/mcp.with-github.json.example`.
- For Option B (Docker), set `GITHUB_PERSONAL_ACCESS_TOKEN` with appropriate scopes (`repo`, `read:org`, etc.).

**Documentation:** [GitHub MCP Server](https://github.com/github/github-mcp-server) | [GitHub Copilot Docs](https://docs.github.com/en/copilot)

---

### 2. Qualtrics MCP (Required)

**Purpose:** Manages Qualtrics surveys and data collection operations.

**Server Type:** Remote HTTP with OAuth + SSE  
**URL:** `https://<your-qualtrics-host>/API/mcp/survey-crud`

**Capabilities:**

- Survey CRUD operations (Create, Read, Update, Delete)
- Question management
- Response data access
- Survey distribution

**Authentication:** OAuth Bearer token via the `COPILOT_MCP_QUALTRICS_OAUTH_TOKEN` GitHub environment secret (referenced as `Bearer $COPILOT_MCP_QUALTRICS_OAUTH_TOKEN` in the MCP config)

**Important Notes:**

- Requires OAuth access token
- Uses Server-Sent Events (SSE) transport
- Replace hostname with your Qualtrics brand/cluster hostname
- See `qualtrics-mcp.md` for detailed setup instructions

**Claude Desktop users:** The `claude_desktop_config.json.example` file in the repository root uses
[`mcp-remote`](https://www.npmjs.com/package/mcp-remote) (`npx mcp-remote <url>`) to bridge Claude
Desktop's local-process model to the remote Qualtrics SSE endpoint. `mcp-remote` is the official
[`@modelcontextprotocol/mcp-remote`](https://github.com/modelcontextprotocol/mcp-remote) npm
package and is the standard way to connect Claude Desktop to any remote (HTTP/SSE) MCP server.

Example Qualtrics MCP URL (used during this repo’s setup):

- `https://smeal.yul1.qualtrics.com/API/mcp/survey-crud`

**Documentation:** See `qualtrics-mcp.md` in repository root

---

### 3. Microsoft Learn MCP

**Purpose:** Quick access to official Microsoft documentation and code samples.

**Server Type:** Remote HTTP  
**URL:** `https://learn.microsoft.com/api/mcp`

**Capabilities:**

- Search Microsoft Learn docs
- Fetch full Learn pages
- Find official code samples

**Authentication:** None

---

## Optional local servers (VS Code)

These are useful locally in VS Code, but are not part of the GitHub UI “primary 3” set:

- Playwright MCP (browser automation)
- MarkItDown MCP (convert content to Markdown)

## Environment Variables

The following environment variables are required for specific MCP servers:

### For GitHub Copilot Agent (Repository Settings UI)

When configuring MCP servers in GitHub Settings (**Settings** > **Copilot** > **Coding agent**), use these environment secret names (must be created in the `copilot` environment):

#### Qualtrics MCP

```bash
COPILOT_MCP_QUALTRICS_OAUTH_TOKEN=<your-oauth-access-token>
```

#### GitHub MCP (Optional)

```bash
COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN=<your-github-pat>
```

### For IDE/Local Development (Optional)

Some IDEs may support local environment variables without the `COPILOT_MCP_` prefix:

#### Qualtrics MCP

```bash
QUALTRICS_OAUTH_TOKEN=<your-oauth-access-token>
```

**Security Note:** Never commit these credentials to the repository. Use:

- GitHub Actions secrets (with `COPILOT_MCP_` prefix) for GitHub Copilot Agent
- Local environment variables or `.env` files (gitignored) for development
- VS Code input prompts for interactive use

## Using MCP Servers

### With GitHub Copilot

For the **GitHub Copilot coding agent in the GitHub UI**, MCP servers are configured in the repository settings UI. See [GITHUB_COPILOT_AGENT_SETUP.md](./GITHUB_COPILOT_AGENT_SETUP.md).

### With VS Code

For local development with VS Code, you can create a VS Code-specific MCP configuration:

1. Copy `.vscode/mcp.json.example` to `.vscode/mcp.json`
2. Customize the configuration as needed
3. Restart VS Code to load the new configuration

See `qualtrics-mcp.md` for detailed VS Code setup instructions.

### Manual Testing

You can test MCP server connectivity manually:

```bash
# Test GitHub MCP
curl -i https://api.githubcopilot.com/mcp/

# Test Qualtrics MCP (replace with your hostname)
curl -i https://<your-qualtrics-host>/API/mcp/survey-crud

# Test Microsoft Learn MCP
curl -i https://learn.microsoft.com/api/mcp
```

## Validating MCP Configuration

A validation script is provided to test the MCP configuration:

```bash
# Run the validation script
bash scripts/validate-mcp-config.sh
```

The script checks:

- JSON syntax validity
- Configuration structure
- HTTP server connectivity (GitHub and Qualtrics MCP)
- Required tools installation (node, npm, npx, jq)
- Environment variables setup

## Adding New MCP Servers

To add additional MCP servers:

1. Research available MCP servers at:
   - [github/github-mcp-server](https://github.com/github/github-mcp-server) - Official GitHub MCP server (Docker)
   - [Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers)
   - [MCP Examples](https://modelcontextprotocol.io/examples)
   - **Prefer Docker images or remote HTTP servers over `npx`-based npm packages.** Docker images provide better isolation, are more reproducible, and avoid dependency conflicts. Remote HTTP servers require no local installation at all.

2. Add the server configuration to `.copilot/mcp-config.json` (reference)

3. Document the server in this file (MCP_SERVERS.md)

4. Test the configuration using `bash scripts/validate-mcp-config.sh`

5. Commit changes following the repository's contribution guidelines

## Troubleshooting

### Server Not Found

- For Docker-based servers: ensure Docker is running and the image has been pulled (`docker pull ghcr.io/github/github-mcp-server`)
- For HTTP-based servers: verify network connectivity and the server URL
- Check that the command and args are correct

### Authentication Failures

- Verify environment variables are set correctly
- Check token/credential expiration
- Review server-specific authentication requirements

### Connection Timeouts

- For Qualtrics MCP: Ensure your MCP client supports Server-Sent Events (SSE)
- For remote servers: Check network connectivity and firewall rules
- For Docker servers: Ensure Docker Desktop is running

### Server Initialization Hangs

- Check server logs for errors
- Verify all required environment variables are set
- Try restarting the MCP client or coding agent

## Additional Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Qualtrics MCP Setup Guide](./qualtrics-mcp.md)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Security Considerations

1. **Credentials Management:**
   - Never commit API tokens, OAuth tokens, or credentials to the repository
   - Use GitHub Actions secrets for CI/CD environments
   - Use environment variables or secure vaults for local development

2. **Filesystem Access:**
   - In VS Code, MCP servers run locally and may have file access depending on the server.
   - Review all file operations performed by coding agents.

3. **External Services:**

- MCP servers can access external services (GitHub, Qualtrics, Microsoft Learn)
- Review and approve all operations that modify data or resources
- Monitor API usage and rate limits

4. **Third-Party Servers:**
   - Only add MCP servers from trusted sources
   - Review server code before enabling if possible
   - Keep server packages up to date for security patches

## Contributing

When contributing changes to MCP server configuration:

1. Test the configuration thoroughly
2. Update this documentation with any new servers or changes
3. Follow the repository's security and contribution guidelines
4. Document any new environment variables required

## License

This MCP configuration is part of the Technology Adoption Barriers website repository and is licensed under the Apache 2.0 license. See LICENSE file for details.
