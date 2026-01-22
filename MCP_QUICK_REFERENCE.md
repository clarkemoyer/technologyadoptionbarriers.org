# MCP Server Quick Reference

This is a quick reference guide for using MCP servers in this repository.

## Quick Start

```bash
# Validate MCP configuration
bash scripts/validate-mcp-config.sh

# View configured servers
jq '.mcpServers | keys[]' .copilot/mcp-config.json
```

## MCP Servers Summary

| Server          | Type | Purpose                                   | Auth Required |
| --------------- | ---- | ----------------------------------------- | ------------- |
| GitHub          | HTTP | Repository operations, CI/CD, issues, PRs | Optional PAT  |
| Qualtrics       | HTTP | Survey management                         | OAuth token   |
| Microsoft Learn | HTTP | Official docs + code samples              | None          |

## Required Environment Variables

### For GitHub Copilot Agent (Repository Settings UI)

When using GitHub Copilot Agent, environment secrets must use the `COPILOT_MCP_` prefix and be created in the `copilot` environment:

```bash
# Qualtrics MCP
export COPILOT_MCP_QUALTRICS_OAUTH_TOKEN="your-oauth-token"

# GitHub MCP (optional)
export COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN="your-github-pat"
```

### For IDE/Local Development (Optional)

Some IDEs may support local environment variables without the `COPILOT_MCP_` prefix:

```bash
# Qualtrics MCP (IDE-local)
export QUALTRICS_OAUTH_TOKEN="your-oauth-token"
```

**Security:** Never commit these values. Use:

- GitHub environment secrets (with `COPILOT_MCP_` prefix) for GitHub Copilot Agent
- Local `.env` file (gitignored) for development
- VS Code input prompts for interactive use

## Common Tasks

### Test GitHub MCP Connectivity

```bash
curl -i https://api.githubcopilot.com/mcp/
```

### Test Qualtrics MCP Connectivity

```bash
curl -i https://<your-qualtrics-host>/API/mcp/survey-crud
```

Example used during this repo’s setup:

```bash
curl -i https://smeal.yul1.qualtrics.com/API/mcp/survey-crud
```

### Test Microsoft Learn MCP Connectivity

```bash
curl -i https://learn.microsoft.com/api/mcp
```

### View MCP Configuration

```bash
cat .copilot/mcp-config.json
```

### Validate Configuration

```bash
bash scripts/validate-mcp-config.sh
```

## Files

- `.copilot/mcp-config.json` - MCP server configuration
- `.copilot/README.md` - Configuration directory overview
- `MCP_SERVERS.md` - Complete documentation
- `scripts/validate-mcp-config.sh` - Validation script
- `qualtrics-mcp.md` - Qualtrics-specific setup guide

## Documentation

For detailed information, see:

- [MCP_SERVERS.md](./MCP_SERVERS.md) - Complete guide
- [qualtrics-mcp.md](./qualtrics-mcp.md) - Qualtrics setup
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP spec
- [GitHub Copilot Docs](https://docs.github.com/en/copilot) - Copilot guide

## Getting Help

- Check [Troubleshooting section](./MCP_SERVERS.md#troubleshooting) in MCP_SERVERS.md
- Review server-specific documentation
- Run validation script for diagnostic information

## Adding New Servers

1. Find server at [MCP servers](https://github.com/modelcontextprotocol/servers)
2. Add to `.copilot/mcp-config.json`
3. Document in `MCP_SERVERS.md`
4. Run `bash scripts/validate-mcp-config.sh`
5. Commit changes
