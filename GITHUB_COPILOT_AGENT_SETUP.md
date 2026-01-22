# GitHub Copilot Agent MCP Configuration Setup

This guide explains how to configure MCP servers for **GitHub Copilot Agent** in the repository settings UI.

## Important: GitHub UI Configuration

Unlike IDE-based MCP configurations, the GitHub Copilot Agent requires configuration through the **GitHub repository settings UI**, not through files committed to the repository.

## Setup Steps

### 1. Navigate to Repository Settings

1. On GitHub, navigate to the main page of the repository
2. Click **Settings** (under the repository name)
3. In the "Code & automation" section, click **Copilot** then **Coding agent**

### 2. Add Environment Secrets

Before configuring MCP servers, set up the required environment secrets. Only secrets with names prefixed with `COPILOT_MCP_` will be available to your MCP configuration.

1. In the left sidebar, click **Environments**
2. Click the `copilot` environment
3. Under "Environment secrets", click **Add environment secret**
4. Add the following secrets:

#### Required Secrets

**For Qualtrics MCP:**

- Secret name: `COPILOT_MCP_QUALTRICS_OAUTH_TOKEN`
- Value: Your Qualtrics OAuth access token

**For GitHub MCP (Optional - for wider access):**

- Secret name: `COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN`
- Value: Your GitHub personal access token with appropriate permissions

### 3. Configure MCP Servers

1. Navigate to **Settings** > **Copilot** > **Coding agent**
2. In the **MCP configuration** section, paste the following JSON configuration:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "tools": ["*"],
      "headers": {
        "X-MCP-Toolsets": "repos,issues,users,pull_requests,code_security,secret_protection,actions,web_search",
        "Authorization": "Bearer $COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN"
      }
    },
    "qualtrics-surveys": {
      "type": "http",
      "url": "https://<your-qualtrics-host>/API/mcp/survey-crud",
      "tools": ["*"],
      "headers": {
        "Accept": "application/json, text/event-stream",
        "Authorization": "Bearer $COPILOT_MCP_QUALTRICS_OAUTH_TOKEN"
      }
    },
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp",
      "tools": ["*"]
    }
  }
}
```

3. Click **Save MCP configuration**
4. Your configuration will be validated to ensure proper syntax

## Configuration Details

### GitHub MCP Server

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "tools": ["*"],
    "headers": {
      "X-MCP-Toolsets": "repos,issues,users,pull_requests,code_security,secret_protection,actions,web_search",
      "Authorization": "Bearer $COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN"
    }
  }
}
```

- **Type:** HTTP (remote server)
- **URL:** GitHub's hosted MCP server (`/mcp/` is full; `/readonly` is read-only)
- **Tools:** All tools (`["*"]`)
- **Toolsets:** Specifies which GitHub capabilities to enable
  - `repos` - Repository operations
  - `issues` - Issue management
  - `users` - User information
  - `pull_requests` - Pull request operations
  - `code_security` - Code security scanning
  - `secret_protection` - Secret detection
  - `actions` - GitHub Actions workflows
  - `web_search` - Web search capabilities

If you do not want to use a PAT, remove the `Authorization` header.

### Qualtrics MCP Server

```json
{
  "qualtrics-surveys": {
    "type": "http",
    "url": "https://<your-qualtrics-host>/API/mcp/survey-crud",
    "tools": ["*"],
    "headers": {
      "Accept": "application/json, text/event-stream",
      "Authorization": "Bearer $COPILOT_MCP_QUALTRICS_OAUTH_TOKEN"
    }
  }
}
```

- **Type:** HTTP (remote server with OAuth)
- **URL:** Replace `<your-qualtrics-host>` with your Qualtrics brand/cluster hostname
- **Tools:** All tools (`["*"]`)
- **Headers:**
  - `Accept`: Required for Server-Sent Events (SSE) support
  - `Authorization`: References the `COPILOT_MCP_QUALTRICS_OAUTH_TOKEN` environment secret

**Note:** The URL placeholder `<your-qualtrics-host>` must be replaced with your actual Qualtrics hostname before saving the configuration.

### Microsoft Learn MCP Server

```json
{
  "microsoft-learn": {
    "type": "http",
    "url": "https://learn.microsoft.com/api/mcp",
    "tools": ["*"]
  }
}
```

- **Type:** HTTP (remote)
- **Tools:** All tools (`["*"]`)
- **Authentication:** None

This server provides search/fetch tooling over Microsoft Learn docs and official code samples.

## Understanding the Configuration Format

### Required Fields

Every MCP server configuration must include:

1. **`type`** - One of:

- `"local"` - Command-based server running locally (requires runner support)
- `"http"` - Remote HTTP server
- `"sse"` - Server-Sent Events server

2. **`tools`** - Array of tool names or `["*"]` for all tools
   - Strongly recommended to allowlist specific read-only tools
   - Agent will use these tools autonomously without approval

### Local Server Fields

For `type: "local"`:

- **`command`** (required) - Command to run (e.g., `"npx"`)
- **`args`** (required) - Array of arguments
- **`env`** (optional) - Environment variables mapping:
  - Key: Variable name for the MCP server
  - Value: GitHub environment secret name (must start with `COPILOT_MCP_`)

Note: this repository currently uses only **remote** MCP servers in the GitHub UI config.

### Remote Server Fields

For `type: "http"` or `type: "sse"`:

- **`url`** (required) - Server URL
- **`headers`** (optional) - HTTP headers:
  - Can reference environment secrets with `$COPILOT_MCP_` prefix
  - Can use string values directly

## Environment Secrets

All environment secrets for MCP servers must:

1. Be created in the `copilot` environment
2. Have names starting with `COPILOT_MCP_`
3. Be referenced in the configuration without quotes or braces

### Example Reference Formats

**In `env` field (local servers):**

```json
"env": {
  "MY_VAR": "COPILOT_MCP_MY_SECRET"
}
```

The value of secret `COPILOT_MCP_MY_SECRET` will be passed as environment variable `MY_VAR`.

**In `headers` field (remote servers):**

```json
"headers": {
  "Authorization": "Bearer $COPILOT_MCP_MY_TOKEN"
}
```

The value of secret `COPILOT_MCP_MY_TOKEN` will be substituted.

## Customization

### Limiting Tools

Instead of allowing all tools with `["*"]`, you can specify exact tools:

```json
{
  "sentry": {
    "type": "local",
    "command": "npx",
    "args": ["@sentry/mcp-server@latest"],
    "tools": ["get_issue_details", "get_issue_summary"]
  }
}
```

### Custom Qualtrics Hostname

Replace the placeholder hostname with your actual Qualtrics brand:

```json
"url": "https://your-brand.datacenter.qualtrics.com/API/mcp/survey-crud"
```

Examples:

- `https://contoso.sjc1.qualtrics.com/API/mcp/survey-crud`
- `https://acme.eu.qualtrics.com/API/mcp/survey-crud`
- `https://smeal.yul1.qualtrics.com/API/mcp/survey-crud` (example used during this repo’s setup)

## Validation

When you click "Save MCP configuration", GitHub will:

1. Validate JSON syntax
2. Check required fields are present
3. Verify secret references start with `COPILOT_MCP_`

If validation fails, you'll see an error message describing the issue.

## Testing

After saving the configuration:

1. Open GitHub Copilot in your repository
2. Ask the coding agent to perform tasks using the configured tools
3. Check that the agent can access the MCP servers

Example prompts:

- "Search for recent issues with label 'bug'"
- "Get the latest Qualtrics survey results"
- "Check Playwright test results"

## Troubleshooting

### Configuration Not Saving

- Ensure JSON syntax is valid (no trailing commas, proper quotes)
- Verify all required fields are present (`type`, `tools`)
- Check that secret names start with `COPILOT_MCP_`

### MCP Server Not Working

- Verify environment secrets are created in the `copilot` environment
- Check that secret values are correct
- For remote servers, ensure URLs are accessible
- For local servers, verify the command and args are correct

### Tool Access Denied

- Check the `tools` array includes the tools you want to use
- Verify environment secrets have correct permissions

## Security Considerations

1. **Autonomous Tool Usage:** Copilot will use configured tools without asking for approval
2. **Read-Only Tools:** Strongly recommend allowlisting only read-only tools
3. **Secret Management:** All credentials should be stored as environment secrets
4. **Minimal Permissions:** Use fine-grained tokens with minimal required permissions

## References

- [GitHub Documentation: Extend coding agent with MCP](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub MCP Server Documentation](https://github.com/github/mcp-server)
- [Repository MCP Configuration Reference](./MCP_SERVERS.md)
