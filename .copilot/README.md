# .copilot Directory

This directory contains GitHub Copilot and MCP (Model Context Protocol) configuration for coding agents.

## Files

### mcp-config.json

Repository-level MCP server configuration for MCP-compatible coding agents and local tooling.

GitHub Copilot’s **coding agent in the GitHub UI** uses the repository settings UI (not committed files) as the source of truth. This file is kept as a reference configuration and for local validation.

**Important:**

- This file is committed to the repository for team-wide consistency
- Environment variables referenced (e.g., `$COPILOT_MCP_QUALTRICS_OAUTH_TOKEN`) must be configured in your environment (local) or as GitHub Environment secrets (for the GitHub UI coding agent)
- See [MCP_SERVERS.md](../MCP_SERVERS.md) for complete documentation

**Security Note:**

All MCP servers in this configuration use `"tools": ["*"]` to enable all available tools. This provides maximum flexibility for development and automation tasks. However, this means:

- Copilot coding agent will use these tools autonomously without asking for approval
- Tools can perform both read and write operations
- For production use, consider restricting to read-only tools only

To restrict tools, replace `"tools": ["*"]` with an array of specific tool names:

```json
{
  "tools": ["get_issue_details", "search_code", "list_files"]
}
```

See [GITHUB_COPILOT_AGENT_SETUP.md](../GITHUB_COPILOT_AGENT_SETUP.md) for more information on limiting tool access.

## MCP Servers Configured

1. **GitHub MCP** - Repository and GitHub operations
2. **Qualtrics MCP** - Survey management
3. **Microsoft Learn MCP** - Official docs + code samples

See [MCP_SERVERS.md](../MCP_SERVERS.md) for detailed documentation on each server.

## Security

- Never commit credentials or API tokens to this configuration
- Use environment variables for sensitive values
- Review the [Security Considerations](../MCP_SERVERS.md#security-considerations) section in MCP_SERVERS.md

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Repository MCP Servers Guide](../MCP_SERVERS.md)
