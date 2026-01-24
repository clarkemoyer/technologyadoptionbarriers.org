# Documentation Index

**Last Updated:** January 24, 2026

This index provides a comprehensive guide to all documentation in the TABS repository, organized by audience and purpose.

## About TABS

**Technology Adoption Barriers (TABS)** is a Culminating Research Project (CRP) for the **Smeal College of Business Doctor of Business Administration (DBA) program** at Penn State University. Led by **Clarke Moyer** as the primary researcher, with a CRP defense scheduled for **May 7, 2026**, this project combines rigorous academic research with practical application in technology adoption. A CRP is similar to a dissertation but is specific to doctoral programs (as distinct from PhD programs, which use the term "dissertation").

## Quick Navigation

- [🚀 Getting Started](#getting-started)
- [💻 Development](#development)
- [🔌 API Integration](#api-integration)
- [🧪 Testing & Quality](#testing--quality)
- [🏛️ Governance & Process](#governance--process)
- [🤖 AI Agents](#ai-agents)
- [📚 Complete File List](#complete-file-list)

---

## 🚀 Getting Started

### For New Contributors

**Start Here:**

1. **[ONBOARDING.md](./ONBOARDING.md)** (23KB) - **COMPREHENSIVE ONBOARDING GUIDE**
   - Project overview and mission
   - 5-minute quick start
   - Development environment setup
   - Project structure walkthrough
   - Contributing workflow
   - First PR guide
   - Resources and learning materials

2. **[QUICK_START.md](./QUICK_START.md)** (8KB) - **5-MINUTE SETUP**
   - Minimal setup instructions
   - Essential commands
   - Troubleshooting common issues
   - Quick command reference

3. **[README.md](./README.md)** (43KB) - **PROJECT OVERVIEW**
   - Academic research foundation (Smeal DBA program)
   - Production status
   - Complete page inventory (40+ pages)
   - API integrations overview
   - Site structure
   - Tech stack
   - Documentation navigation

### For Users & Researchers

**Learn About TABS:**

- [TABS Presentation](./TABS_PRESENTATION.md) - Research overview
- [Migration Status Complete](./MIGRATION_STATUS_COMPLETE.md) - Site completion summary and academic context

---

## 💻 Development

### Core Development Guides

**[CONTRIBUTING.md](./CONTRIBUTING.md)** - **CONTRIBUTION GUIDELINES**

- How to contribute
- Code style guidelines
- Pull request process
- Review workflow

**[NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)** - **REQUIRED READING**

- kebab-case for folders (SEO best practice)
- File naming standards
- Component naming
- Variable naming

**[RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md)** - **DESIGN GUIDE**

- Mobile-first principles
- Breakpoint guidelines
- Tailwind CSS usage
- Component patterns

**[CODE_QUALITY.md](./CODE_QUALITY.md)** - **QUALITY STANDARDS**

- ESLint configuration
- Prettier formatting
- TypeScript rules
- Code review checklist

### Technical Guides

**[DEPLOYMENT.md](./DEPLOYMENT.md)** - **DEPLOYMENT PROCESS**

- GitHub Pages setup
- Custom domain configuration
- CI/CD pipeline
- Production deployment

**[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - **CLOUDFLARE CONFIGURATION**

- DNS setup
- SSL configuration
- Performance optimization

**[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** - **KNOWN ISSUES**

- Tracked technical debt
- ESLint warnings explanation
- Security vulnerabilities
- Future refactoring plans

**[LESSONS_LEARNED.md](./LESSONS_LEARNED.md)** - **PROJECT RETROSPECTIVE**

- What worked well
- What didn't work
- Key learnings
- Best practices

---

## 🔌 API Integration

### Comprehensive Guide

**[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** (23KB) - **COMPLETE API REFERENCE**

- Overview of all three APIs
- Setup instructions
- Client library documentation
- Workflow automation
- GitHub Environments
- Security best practices
- Local development
- Troubleshooting

### API-Specific Documentation

**Qualtrics API v3:**

- **[qualtrics-api-cheatsheet.md](./qualtrics-api-cheatsheet.md)** - Quick reference for REST API endpoints
- **[qualtrics-mcp.md](./qualtrics-mcp.md)** - Model Context Protocol setup and OAuth configuration
- Client Library: `src/lib/qualtrics-api.ts`
- Workflows: 6 files in `.github/workflows/qualtrics-*.yml`

**Prolific API v1:**

- **[PROLIFIC_INTEGRATION.md](./PROLIFIC_INTEGRATION.md)** (30KB) - Complete integration guide
  - API client library documentation
  - Weekly data collection workflow
  - Qualtrics ↔ Prolific setup
  - Annual survey rollover process
  - Security and troubleshooting
- Client Library: `src/lib/prolific-api.ts`
- Workflow: `.github/workflows/prolific.yml`

**Google Analytics Data API v1:**

- **[API_INTEGRATION_GUIDE.md#google-analytics-data-api-v1](./API_INTEGRATION_GUIDE.md#google-analytics-data-api-v1)** - Analytics integration
- Client Library: `src/lib/google-analytics.ts`
- Workflow: `.github/workflows/ga-report.yml`
- Scripts: `scripts/generate-report.ts`, `scripts/send-report-email.ts`

### MCP Server Documentation

**[MCP_SERVERS.md](./MCP_SERVERS.md)** - **MCP CONFIGURATION**

- Model Context Protocol overview
- Configured servers (GitHub, Qualtrics, Microsoft Learn)
- Environment variables
- Validation and troubleshooting

**[MCP_QUICK_REFERENCE.md](./MCP_QUICK_REFERENCE.md)** - **QUICK REFERENCE**

- Quick setup guide
- Common operations
- Troubleshooting tips

**[GITHUB_COPILOT_AGENT_SETUP.md](./GITHUB_COPILOT_AGENT_SETUP.md)** - **GITHUB UI SETUP**

- Configuring MCP in GitHub Copilot agent
- Environment secrets setup
- Tool configuration

### External Dependencies

**[EXTERNAL_DEPENDENCIES.md](./EXTERNAL_DEPENDENCIES.md)** - **THIRD-PARTY SERVICES**

- Analytics (Google Analytics, Microsoft Clarity)
- Forms (Microsoft Forms)
- Social media integrations
- Privacy and data handling

---

## 🧪 Testing & Quality

### Testing Documentation

**[TESTING.md](./TESTING.md)** - **COMPREHENSIVE TESTING GUIDE**

- Unit tests (Jest + React Testing Library)
- E2E tests (Playwright)
- Accessibility tests (jest-axe)
- Performance testing (Lighthouse CI)
- Testing workflows
- Coverage requirements

**Test Files:**

- Unit tests: `__tests__/`
- E2E tests: `tests/`
- Configuration: `jest.config.js`, `playwright.config.ts`

### Quality Assurance

**[LIGHTHOUSE.md](./LIGHTHOUSE.md)** - **PERFORMANCE MONITORING**

- Lighthouse CI setup
- Performance budgets
- Optimization techniques

**[COPILOT_AUTOFIX_GUIDE.md](./COPILOT_AUTOFIX_GUIDE.md)** - **AUTOMATED CODE REVIEW**

- Understanding Copilot reviews
- Addressing feedback
- Review workflow

**[MERGE_QUEUE_VERIFICATION.md](./MERGE_QUEUE_VERIFICATION.md)** - **MERGE QUEUE**

- Pre-merge validation
- Quality gates
- CI/CD pipeline

---

## 🏛️ Governance & Process

### CNCF-Compliant Documentation

**Core Governance:**

- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Contributor Covenant 2.1
- **[GOVERNANCE.md](./GOVERNANCE.md)** - Decision-making processes
- **[MAINTAINERS.md](./MAINTAINERS.md)** - Repository maintainers
- **[CONTRIBUTORS.md](./CONTRIBUTORS.md)** - Recognition of contributors
- **[ADOPTERS.md](./ADOPTERS.md)** - Organizations using this project

**Security & Legal:**

- **[SECURITY.md](./SECURITY.md)** - Vulnerability reporting
- **[THREAT-MODEL.md](./THREAT-MODEL.md)** - Security threat analysis
- **[LICENSE](./LICENSE)** - Apache 2.0 open source license
- **[CITATION.cff](./CITATION.cff)** - Citation information

**Community Support:**

- **[SUPPORT.md](./SUPPORT.md)** - Getting help
- **[COMMUNITY_HEALTH_FILES.md](./COMMUNITY_HEALTH_FILES.md)** - GitHub navigation guide

### Process Documentation

**[RELEASING.md](./RELEASING.md)** - **RELEASE PROCESS**

- Version numbering
- Release notes
- Deployment procedures

**[CHANGELOG.md](./CHANGELOG.md)** - **RELEASE HISTORY**

- Version history
- Breaking changes
- Feature additions

**[DEPENDABOT.md](./DEPENDABOT.md)** - **DEPENDENCY MANAGEMENT**

- Automated updates
- Security scanning
- Review process

**[ISSUE_RESOLUTION.md](./ISSUE_RESOLUTION.md)** - **ISSUE TRACKING**

- Issue workflow
- Triage process
- Resolution guidelines

---

## 🤖 AI Agents

### AI Agent Configuration

**[AGENTS.md](./AGENTS.md)** - **GENERAL AGENT INSTRUCTIONS**

- Repository overview
- Development workflow
- CI/CD requirements
- Code quality standards
- Testing requirements

**[CLAUDE.md](./CLAUDE.md)** - **CLAUDE-SPECIFIC INSTRUCTIONS**

- Anthropic Claude in VS Code/Antigravity
- Claude's strengths for this project
- Project-specific guidance
- Terminal and MCP access

**[GEMINI.md](./GEMINI.md)** - **GEMINI-SPECIFIC INSTRUCTIONS**

- Google Gemini in VS Code/Antigravity
- Gemini's strengths for this project
- Quick start for Gemini
- Local development tips

---

## 📚 Complete File List

### Primary Documentation (By Category)

**Getting Started (4 files):**

- `ONBOARDING.md` (23KB) - Comprehensive onboarding
- `QUICK_START.md` (8KB) - 5-minute setup
- `README.md` (43KB) - Project overview
- `MIGRATION_STATUS_COMPLETE.md` (12KB) - Migration summary

**API Integration (5 files):**

- `API_INTEGRATION_GUIDE.md` (23KB) - Complete API guide
- `PROLIFIC_INTEGRATION.md` (30KB) - Prolific integration
- `qualtrics-api-cheatsheet.md` - Qualtrics quick reference
- `qualtrics-mcp.md` - Qualtrics MCP setup
- `EXTERNAL_DEPENDENCIES.md` - Third-party services

**MCP Servers (3 files):**

- `MCP_SERVERS.md` - MCP configuration
- `MCP_QUICK_REFERENCE.md` - Quick reference
- `GITHUB_COPILOT_AGENT_SETUP.md` - GitHub UI setup

**Development (7 files):**

- `CONTRIBUTING.md` - Contribution guidelines
- `NAMING_CONVENTIONS.md` - Naming standards
- `RESPONSIVE_DESIGN.md` - Design guide
- `CODE_QUALITY.md` - Quality standards
- `TECHNICAL_DEBT.md` - Known issues
- `LESSONS_LEARNED.md` - Retrospective
- `DEPLOYMENT.md` - Deployment process

**Testing (4 files):**

- `TESTING.md` - Testing guide
- `LIGHTHOUSE.md` - Performance monitoring
- `COPILOT_AUTOFIX_GUIDE.md` - Code review
- `MERGE_QUEUE_VERIFICATION.md` - Merge queue

**Governance (11 files):**

- `CODE_OF_CONDUCT.md` - Community standards
- `GOVERNANCE.md` - Decision-making
- `MAINTAINERS.md` - Maintainers
- `CONTRIBUTORS.md` - Contributors
- `ADOPTERS.md` - Adopters
- `SECURITY.md` - Security practices
- `THREAT-MODEL.md` - Threat analysis
- `SUPPORT.md` - Getting help
- `LICENSE` - Apache 2.0 license
- `CITATION.cff` - Citation info
- `COMMUNITY_HEALTH_FILES.md` - GitHub guide

**Process (5 files):**

- `RELEASING.md` - Release process
- `CHANGELOG.md` - Release history
- `DEPENDABOT.md` - Dependency management
- `ISSUE_RESOLUTION.md` - Issue workflow
- `SITE_IMPROVEMENTS.md` - Site enhancements

**AI Agents (3 files):**

- `AGENTS.md` - General instructions
- `CLAUDE.md` - Claude-specific
- `GEMINI.md` - Gemini-specific

**Other (5 files):**

- `CLOUDFLARE_SETUP.md` - Cloudflare config
- `NETWORK_ACCESS_NOTE.md` - Network notes
- `TABS_PRESENTATION.md` - Research presentation
- `RELEASE_NOTES_SITE_2026-01-19.md` - Release notes
- `CONTENT_EXTRACTION_GUIDE.md` - (Legacy) Content extraction

### Total Documentation

**Total Files:** 53 documentation files  
**Total Size:** ~500KB of documentation  
**Categories:** 10 categories

---

## 📋 Documentation by Audience

### For New Contributors

1. Start: [ONBOARDING.md](./ONBOARDING.md)
2. Setup: [QUICK_START.md](./QUICK_START.md)
3. Guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md)
4. Standards: [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)

### For Developers

1. Overview: [README.md](./README.md)
2. Testing: [TESTING.md](./TESTING.md)
3. Design: [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md)
4. Quality: [CODE_QUALITY.md](./CODE_QUALITY.md)
5. APIs: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

### For API Integration

1. Overview: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
2. Qualtrics: [qualtrics-api-cheatsheet.md](./qualtrics-api-cheatsheet.md)
3. Prolific: [PROLIFIC_INTEGRATION.md](./PROLIFIC_INTEGRATION.md)
4. MCP: [MCP_SERVERS.md](./MCP_SERVERS.md)

### For AI Agents

1. General: [AGENTS.md](./AGENTS.md)
2. Claude: [CLAUDE.md](./CLAUDE.md)
3. Gemini: [GEMINI.md](./GEMINI.md)

### For Maintainers

1. Governance: [GOVERNANCE.md](./GOVERNANCE.md)
2. Security: [SECURITY.md](./SECURITY.md)
3. Releases: [RELEASING.md](./RELEASING.md)
4. Dependencies: [DEPENDABOT.md](./DEPENDABOT.md)

---

## 🔍 Finding What You Need

### By Task

**"I want to contribute code"**
→ [ONBOARDING.md](./ONBOARDING.md) → [CONTRIBUTING.md](./CONTRIBUTING.md) → [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)

**"I need to set up APIs"**
→ [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) → Specific API docs

**"I want to run tests"**
→ [TESTING.md](./TESTING.md) → [QUICK_START.md](./QUICK_START.md)

**"I found a security issue"**
→ [SECURITY.md](./SECURITY.md)

**"I need help"**
→ [SUPPORT.md](./SUPPORT.md) → [ONBOARDING.md](./ONBOARDING.md)

### By Role

**Researcher:**

- [README.md](./README.md) - Project overview
- [TABS_PRESENTATION.md](./TABS_PRESENTATION.md) - Research details

**Developer:**

- [ONBOARDING.md](./ONBOARDING.md) - Complete onboarding
- [QUICK_START.md](./QUICK_START.md) - Fast setup
- [TESTING.md](./TESTING.md) - Testing guide

**DevOps/Infrastructure:**

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment process
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - API setup
- [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) - DNS/SSL

**Designer:**

- [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) - Design guide
- [CODE_QUALITY.md](./CODE_QUALITY.md) - Quality standards

**Maintainer:**

- [GOVERNANCE.md](./GOVERNANCE.md) - Decision-making
- [RELEASING.md](./RELEASING.md) - Release process
- [SECURITY.md](./SECURITY.md) - Security practices

---

## 📝 Documentation Standards

All documentation in this repository follows these standards:

**Format:**

- Markdown (.md) format
- Clear headings hierarchy (H1 → H2 → H3)
- Table of contents for long documents
- Code examples with syntax highlighting
- Internal links for cross-referencing

**Content:**

- Start with overview/purpose
- Include last updated date
- Provide practical examples
- Link to related documentation
- Include troubleshooting section

**Maintenance:**

- Update date on changes
- Verify links work
- Keep examples current
- Archive outdated docs

---

## 🆘 Getting Help

**Can't find what you need?**

1. Check this index for the right document
2. Search the repository: Use GitHub search
3. Ask in Discussions: [GitHub Discussions](https://github.com/clarkemoyer/technologyadoptionbarriers.org/discussions)
4. Open an Issue: [GitHub Issues](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues)
5. Email: contact@technologyadoptionbarriers.org

**Found outdated documentation?**
Please open an issue or submit a PR to update it!

---

**Last Updated:** January 24, 2026  
**Maintainer:** Clarke Moyer (contact@technologyadoptionbarriers.org)  
**License:** Apache 2.0
