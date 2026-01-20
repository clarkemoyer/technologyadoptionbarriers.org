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

| Server | Type | Purpose | Auth Required |
|--------|------|---------|---------------|
| GitHub | HTTP | Repository operations, CI/CD, issues, PRs | Automatic |
| Qualtrics | HTTP | Survey management | OAuth token |
| Google Cloud | Command | Google Analytics API, GCP services | Service account |
| Playwright | Command | Browser automation, E2E testing | None |
| Filesystem | Command | File operations within repo | None |
| Next.js Devtools | Command | Next.js app insights | None |

## Required Environment Variables

```bash
# Qualtrics MCP
export QUALTRICS_OAUTH_TOKEN="your-oauth-token"

# Google Cloud MCP
export GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
export GA_PROPERTY_ID="123456789"
```

**Security:** Never commit these values. Use:
- GitHub Actions secrets for CI/CD
- Local `.env` file (gitignored) for development
- VS Code input prompts for interactive use

## Common Tasks

### Test GitHub MCP Connectivity
```bash
curl -i https://api.githubcopilot.com/mcp/
```

### Test Qualtrics MCP Connectivity
```bash
curl -i https://by-brand.iad1.qualtrics.com/API/mcp/survey-crud
```

### Install Playwright MCP Locally
```bash
npx @playwright/mcp@latest
```

### Install Google Cloud MCP Locally
```bash
npx gcloud-mcp
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
