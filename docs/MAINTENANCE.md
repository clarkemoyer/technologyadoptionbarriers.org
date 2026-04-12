# TABS Maintenance & Lifecycle Management

This document outlines the recurring maintenance tasks required to keep the TABS infrastructure secure, performant, and aligned with evolving AI and protocol standards.

## Recurring Tasks

### Quarterly Dependency Freshness Check

**Schedule:** January, April, July, October (First week)

1. **Scan Dependencies**: Run `npm outdated` and `pip list --outdated`.
2. **Audit Findings**: Document the current status in `EXTERNAL_DEPENDENCIES.md`.
3. **Update Core Tools**: Ensure `gh` CLI and MCP SDKs meet the minimum requirements in `CLAUDE.md`.
4. **Plan Upgrades**: Create issues for major version upgrades that require testing.

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
- **AAIF (AI Alliance)**: [lfaidata.foundation](https://lfaidata.foundation/)
- **Anthropic Developer Blog**: [www.anthropic.com/news](https://www.anthropic.com/news)

### Pipeline Health

- Monitor daily runs of `daily-pipeline.yml` for failures.
- Check `qualtrics-api-smoke.yml` results for connectivity issues.

## Versioning Policy

- **Minor/Patch Updates**: Apply immediately after verification via CI.
- **Major Updates**: Require a dedicated feature branch and full E2E validation.
- **MCP SEPs**: Standardize on "Final" SEPs; experimental SEPs require maintainer approval.

## Governance

All maintenance activities should be documented via GitHub Issues and Pull Requests. Direct commits to `main` are strictly prohibited.
