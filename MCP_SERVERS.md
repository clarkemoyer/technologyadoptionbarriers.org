# MCP Servers Configuration

This document describes the Model Context Protocol (MCP) servers configured for this repository to enhance coding agent capabilities.

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables large language models (LLMs) and AI coding agents to interact with external tools, resources, and data sources in a standardized way. MCP servers expose specific capabilities that coding agents can use to perform tasks more effectively.

## Configuration Location

MCP servers are configured in `.copilot/mcp-config.json` at the repository level. This configuration is automatically discovered by GitHub Copilot and other MCP-compatible coding agents.

## Configured MCP Servers

### 1. GitHub MCP (Required)

**Purpose:** Provides access to GitHub repository operations, workflows, issues, pull requests, and more.

**Server Type:** Remote HTTP  
**URL:** `https://api.githubcopilot.com/mcp/`

**Capabilities:**
- Repository management and navigation
- Issue and pull request operations
- GitHub Actions workflow management
- Code search and navigation
- Commit and branch operations

**Authentication:** Handled automatically by GitHub Copilot

**Documentation:** [GitHub MCP Documentation](https://docs.github.com/en/copilot)

---

### 2. Qualtrics MCP (Required)

**Purpose:** Manages Qualtrics surveys and data collection operations.

**Server Type:** Remote HTTP with OAuth  
**URL:** `https://by-brand.iad1.qualtrics.com/API/mcp/survey-crud`

**Capabilities:**
- Survey CRUD operations (Create, Read, Update, Delete)
- Question management
- Response data access
- Survey distribution

**Authentication:** OAuth Bearer token via `QUALTRICS_OAUTH_TOKEN` environment variable

**Important Notes:**
- Requires OAuth access token
- Uses Server-Sent Events (SSE) transport
- Replace hostname with your Qualtrics brand/cluster hostname
- See `qualtrics-mcp.md` for detailed setup instructions

**Documentation:** See `qualtrics-mcp.md` in repository root

---

### 3. Google Cloud MCP (Required)

**Purpose:** Provides access to Google Cloud Platform services, including Google Analytics Data API.

**Server Type:** Local command (gcloud CLI wrapper)  
**Package:** `gcloud-mcp`

**Capabilities:**
- Google Analytics Data API access
- Google Cloud service management
- GCP resource operations
- Service account authentication

**Authentication:** Uses Google service account credentials from environment:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GA_PROPERTY_ID`

**Usage Example:**
- Query Google Analytics metrics
- Access GA4 reporting data
- Manage GCP resources

**Documentation:** [Google Cloud MCP GitHub](https://github.com/googleapis/gcloud-mcp)

---

### 4. Playwright MCP

**Purpose:** Browser automation and end-to-end testing capabilities.

**Server Type:** Local command  
**Package:** `@playwright/mcp`

**Capabilities:**
- Browser automation (Chrome, Firefox, WebKit, Edge)
- E2E test execution and debugging
- Web scraping and data extraction
- Accessibility tree navigation
- Screenshot and video capture

**Authentication:** None required

**Usage Example:**
- Run and debug E2E tests
- Automate browser interactions
- Generate test scripts
- Debug test failures

**Documentation:** [Playwright MCP on npm](https://www.npmjs.com/package/@playwright/mcp)

---

### 5. Filesystem MCP

**Purpose:** Secure file system operations within the repository.

**Server Type:** Local command  
**Package:** `@modelcontextprotocol/server-filesystem`

**Capabilities:**
- Read/write files
- Create/list/delete directories
- Move files and directories
- Search files by name or content
- Get file metadata

**Security:**
- Access restricted to repository directory only
- Path: `/home/runner/work/technologyadoptionbarriers.org/technologyadoptionbarriers.org`

**Authentication:** None required (path-based security)

**Usage Example:**
- Navigate repository structure
- Read and modify source files
- Search codebase
- File operations during development

**Documentation:** [Filesystem MCP on npm](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem)

---

### 6. Next.js Devtools MCP

**Purpose:** Provides insights into Next.js application structure, runtime, and configuration.

**Server Type:** Local command  
**Package:** `next-devtools-mcp`

**Capabilities:**
- Application runtime insights
- Live error detection and logs
- Page metadata and route analysis
- Server actions inspection
- Component tree analysis
- Project structure and configuration access

**Requirements:**
- Next.js v16+ (currently using v16.1.3)
- Development server must be running (`npm run dev`)

**Usage Example:**
- Analyze application structure
- Debug runtime errors
- Understand routing configuration
- Inspect server components and actions

**Documentation:** [Next.js MCP Server Guide](https://nextjs.org/docs/app/guides/mcp)

---

## Environment Variables

The following environment variables are required for specific MCP servers:

### Qualtrics MCP
```bash
QUALTRICS_OAUTH_TOKEN=<your-oauth-access-token>
```

### Google Cloud MCP
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=<service-account-private-key>
GA_PROPERTY_ID=<google-analytics-property-id>
```

**Security Note:** Never commit these credentials to the repository. Use:
- GitHub Actions secrets for CI/CD
- Local environment variables or `.env` files (gitignored) for development
- VS Code input prompts for interactive use

## Using MCP Servers

### With GitHub Copilot

GitHub Copilot automatically discovers and uses MCP servers configured in `.copilot/mcp-config.json`. No additional setup is required beyond configuring environment variables.

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
curl -i https://by-brand.iad1.qualtrics.com/API/mcp/survey-crud

# Install and test Playwright MCP
npx @playwright/mcp@latest

# Install and test Google Cloud MCP
npx gcloud-mcp
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
   - [Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers)
   - [MCP Examples](https://modelcontextprotocol.io/examples)
   - [npm MCP packages](https://www.npmjs.com/search?q=%40modelcontextprotocol)

2. Add the server configuration to `.copilot/mcp-config.json`

3. Document the server in this file (MCP_SERVERS.md)

4. Test the configuration using `bash scripts/validate-mcp-config.sh`

5. Commit changes following the repository's contribution guidelines

## Troubleshooting

### Server Not Found
- Ensure the server package is installed or accessible via `npx`
- Check that the command and args are correct
- Verify network connectivity for remote servers

### Authentication Failures
- Verify environment variables are set correctly
- Check token/credential expiration
- Review server-specific authentication requirements

### Connection Timeouts
- For Qualtrics MCP: Ensure your MCP client supports Server-Sent Events (SSE)
- For remote servers: Check network connectivity and firewall rules
- For local servers: Ensure required packages can be installed

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
   - Filesystem MCP is restricted to the repository directory only
   - Review all file operations performed by coding agents

3. **External Services:**
   - MCP servers can access external services (GitHub, Qualtrics, Google Cloud)
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
