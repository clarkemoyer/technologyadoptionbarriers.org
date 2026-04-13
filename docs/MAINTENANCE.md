# TABS Maintenance & Lifecycle Management

This document outlines the recurring maintenance tasks required to keep the TABS infrastructure secure, performant, and aligned with evolving AI and protocol standards.

## What Dependabot Handles (Automated)

npm packages and GitHub Actions versions are managed automatically by Dependabot. No manual intervention is needed unless a PR fails CI or requires a major version migration.

- **Config**: `.github/dependabot.yml`
- **Docs**: [DEPENDABOT.md](../DEPENDABOT.md)
- **Schedule**: Weekly (Mondays 09:00 UTC)
- **View open PRs**: Filter by `label:dependencies` in the repo's PR list
- **Security fixes**: Immediate PRs when vulnerabilities are detected (bypasses weekly schedule)

## What Requires Manual Review (Quarterly)

The following are **not** tracked by Dependabot and require manual quarterly checks.

### Quarterly Non-npm Dependency Check

**Schedule:** January, April, July, October (First week)

1. **MCP Server Versions**: Check `.vscode/mcp.json` and `claude_desktop_config.json` pins against latest releases from each MCP server repo.
2. **Python Tools (`uvx`)**: Verify pinned versions (e.g., `pyzotero[mcp]==1.11.0`) against PyPI. Run `pip index versions <package>` to check.
3. **`gh` CLI**: Compare `gh --version` against [cli/cli releases](https://github.com/cli/cli/releases). Minimum: 2.67.0+ (2.89.0+ for newer agent features).
4. **MCP Protocol SEPs**: Review [modelcontextprotocol.io/seps](https://modelcontextprotocol.io/seps) for newly finalized SEPs that affect our integrations.
5. **Document Findings**: Update the non-npm dependency table in `EXTERNAL_DEPENDENCIES.md`.
6. **Plan Upgrades**: Create issues for updates that require testing.

### Quarterly Security Review

**Schedule:** January, April, July, October (Second week)

1. **Review MCP Servers**: Check the [Dependency Provenance Risk](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/783) for all active MCP integrations.
2. **Audit Secrets**: Ensure no credentials have been committed and GitHub Secrets are rotated if necessary.
3. **Validate PII Filters**: Verify that pipeline scripts are correctly filtering Prolific PIDs and other PII.

## Continuous Monitoring Strategy

### AI & Protocol Standards

Monitor the following channels for announcements related to the Model Context Protocol and agentic features:

- **MCP Specification**: [modelcontextprotocol.io/seps](https://modelcontextprotocol.io/seps)
- **GitHub CLI Releases**: [github.com/cli/cli/releases](https://github.com/cli/cli/releases)
- **Linux Foundation AI & Data**: [lfaidata.foundation](https://lfaidata.foundation/)
- **Anthropic Developer Blog**: [www.anthropic.com/news](https://www.anthropic.com/news)

### Pipeline Health

- Monitor daily runs of `daily-pipeline.yml` for failures.
- Check `qualtrics-api-smoke.yml` results for connectivity issues.

## Versioning Policy

- **npm Minor/Patch Updates**: Dependabot PRs - merge after CI passes.
- **npm Major Updates**: Dependabot opens individual PRs - require a dedicated review and full E2E validation.
- **Non-npm Updates**: Manual quarterly review per the checklist above.
- **MCP SEPs**: Standardize on "Final" SEPs; experimental SEPs require maintainer approval.

## Governance

All maintenance activities should be documented via GitHub Issues and Pull Requests. Direct commits to `main` are strictly prohibited.
