# 🌐 Technology Adoption Barriers Survey (TABS)

<p align="center">
  <img src="public/logo.png" alt="TABS Logo" width="160" />
</p>

<p align="center">
  <b>Production Site:</b> <a href="https://technologyadoptionbarriers.org">technologyadoptionbarriers.org</a> ✅
</p>

<p align="center">
  A premium, high-fidelity Next.js 16.x platform built with App Router for the Technology Adoption Barriers Survey (TABS). Following Cloud Native Computing Foundation (CNCF) community standards, the platform features complete data collection workflows, comprehensive theoretical documentation, and robust automation pipelines.
</p>

---

## 🎨 Premium Branding & Visual Standards

The TABS platform adheres to the high-fidelity **Antigravity Web Design Standard**, designed to blend academic authority with modern technical interfaces.

### ✒️ Documentation Typography

Our visual brand employs an elegant, highly readable typographic pairing to serve different communicative contexts:

- **Serif Headings (`Faustina` / `Fauna One`)**: Used for page-level headers, research branch introductions, and academic theories to convey deep editorial rigor.
- **Sans-serif Body (`Inter` / `Lato`)**: Used for code blocks, configuration guides, parameters, and interactive dashboard elements to maintain clean technical readability.

### 🌟 Vibrant Harmonies

Colors are selected intentionally to define state, hierarchy, and context:

- `#0f172a` (Slate-900) and `#1e293b` (Slate-800) provide a sophisticated editorial canvas.
- Emerald green accents indicate verified production statuses, successful pipeline runs, and complete test suites.
- Vibrant deep blue gradients frame sections to guide reader focus down the documentation tree.

---

## 🎉 Production Status: LIVE

**Current Status:** ✅ **Fully Operational in Production**

The TABS website is live and serving users at [https://technologyadoptionbarriers.org](https://technologyadoptionbarriers.org) with the following features:

- **40+ Rich Content Pages:** Desktop, tablet, and mobile optimized templates covering homepage, academic series, specific guidelines, and policies.
- **End-to-End Survey Integration:** Complete integration with **Qualtrics REST API v3** for academic data gathering.
- **Participant Recruitment Funnel:** Seamless connection to the **Prolific API v1** for automated user recruitment.
- **Automated Impact Reporting:** Continuous tracking via the **Google Analytics Data API v1** and **Google Search Console API v1**.
- **Dynamic User Insights:** Live telemetry dashboard with **Microsoft Clarity** integration.

### 🚀 Get Started Quickly

| Guide                                                      | Target Audience            | Key Takeaway                                                              |
| :--------------------------------------------------------- | :------------------------- | :------------------------------------------------------------------------ |
| 🎯 **[Quick Start Guide](./QUICK_START.md)**               | Developers / Contributors  | Set up your local development environment in under 5 minutes.             |
| 👋 **[Onboarding Guide](./ONBOARDING.md)**                 | New Contributors           | Complete team member alignment, accounts config, and system access.       |
| 📑 **[Documentation Index](./DOCUMENTATION_INDEX.md)**     | Everyone                   | The master index directory to quickly locate any guide in the repository. |
| 🔧 **[API Integration Guide](./API_INTEGRATION_GUIDE.md)** | DevOps / Systems Engineers | Complete specification for Qualtrics, Prolific, GA4, and GSC connections. |
| 📖 **[MCP Servers Guide](./MCP_SERVERS.md)**               | AI Agents / Power Users    | Model Context Protocol specifications to interact with external tools.    |

---

## 📊 Academic Research Foundation

> [!NOTE]
> **Culminating Research Project (CRP)**
>
> TABS is the foundational research initiative of **Clarke Moyer** for the Smeal College of Business Doctor of Business Administration (DBA) program at **Penn State University**. This rigorous applied research initiative culminated in a formal CRP defense scheduled for **May 7, 2026**. A CRP is the doctoral program's direct equivalent to a PhD dissertation, emphasizing actionable corporate frameworks built upon academic integrity.

### 🎯 Mission & Framework

The platform investigates, catalogues, and measures the complex barriers organizations and individuals encounter during technical evolution. By analyzing variables across **cost, operational complexity, cognitive load, compatibility constraints, infrastructure limits, skill shortages, and risk vectors**, TABS offers leaders prescriptive models to navigate technology changes safely.

---

## 🧬 Automated Data Collection Pipelines

The TABS platform orchestrates a fully automated ecosystem that connects recruitment, research survey, analytics reporting, and deployment environments into a closed feedback loop.

### 🔄 Data & Integration Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Participant as Research Participant
    participant Prolific as Prolific Platform
    participant NextJS as Next.js Web App
    participant Qualtrics as Qualtrics Survey
    participant GActions as GitHub Actions
    participant GA4 as Google Analytics & GSC

    Note over Prolific, Qualtrics: 1. Participant Recruitment & Redirect Flow
    Prolific->>NextJS: Redirect with credentials (PROLIFIC_PID, STUDY_ID, SESSION_ID)
    NextJS->>Qualtrics: Route to locked down survey URL with query parameters
    Participant->>Qualtrics: Completes survey answers
    Qualtrics->>Prolific: Redirects to completion URL with verification code

    Note over GActions: 2. Scheduled Data Sync & Rollover Pipelines
    GActions->>Qualtrics: Request raw response counts & schema (fetch-qualtrics-questions)
    Qualtrics-->>GActions: Return survey metrics & question JSON
    GActions->>Prolific: Pull submission stats & payouts (weekly prolific.yml)
    Prolific-->>GActions: Return participant status & export CSV
    GActions->>GA4: Query GA4 properties & Search Console metrics (ga-report / seo-sync)
    GA4-->>GActions: Return traffic, SEO, and engagement data

    Note over GActions, NextJS: 3. Automatic Site Updates & Builds
    GActions->>GActions: Generate reports & commit metrics to JSON (impact.json, qualtrics-metrics.json)
    GActions->>NextJS: Re-build static pages & Deploy updated site to GitHub Pages
```

---

## ⚙️ External API Specifications

The website relies on four core APIs integrated directly into GitHub Actions environments to manage telemetry and automate manual research operations:

### 1. Qualtrics API v3 (REST)

- **Implementation Path:** `src/lib/qualtrics-api.ts`
- **Key Operations:**
  - Annual survey copying/rollover pipelines for long-term (10-year) study continuations.
  - Survey payload verification (Embedded Data validation, redirect URL lockdown).
  - Qualtrics schema extraction and metric syncing.
- **GitHub Environment:** `qualtrics-prod`
  - _Secrets:_ `QUALTRICS_API_TOKEN`, `PROLIFIC_COMPLETION_URL`, `PROLIFIC_COMPLETION_CODE_SUCCESS`, `QUALTRICS_USERID`, `QUALTRICS_USERNAME`
  - _Variables:_ `QUALTRICS_BASE_URL`, `QUALTRICS_SURVEY_ID`, `QUALTRICS_COPY_DESTINATION_OWNER`, `PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT`
- **Workflows:**
  - `.github/workflows/qualtrics-copy-survey.yml` - Handles annual survey copying and rollovers.
  - `.github/workflows/qualtrics-prolific-apply.yml` - Configures Prolific attributes inside Qualtrics.
  - `.github/workflows/qualtrics-prolific-verify.yml` - Validates integrity of integration constraints.
  - `.github/workflows/qualtrics-metrics-update.yml` - Updates active response counts.
  - `.github/workflows/fetch-qualtrics-questions.yml` - Pulls questions schema dynamically.
  - `.github/workflows/qualtrics-api-smoke.yml` - Quick API connection validation.

### 2. Prolific API v1 (REST)

- **Implementation Path:** `src/lib/prolific-api.ts`
- **Key Operations:**
  - Weekly automated participant recruitment (Triggered every Monday at 9:00 AM UTC).
  - Automated study status auditing, completion rate assessment, and submission management.
  - Participant metadata exportation to CSV format.
- **GitHub Environment:** `prolific-prod`
  - _Secrets:_ `TABS_PROLIFIC_TOKEN`
  - _Variables:_ `PROLIFIC_STUDY_ID`
- **Workflows:**
  - `.github/workflows/prolific.yml` - Orchestrates scheduled demographic matching and payouts.

### 3. Google Analytics Data API v1

- **Implementation Path:** `src/lib/google-analytics.ts`
- **Key Operations:**
  - Daily automated traffic and session data queries (Triggered at 00:00 UTC).
  - Automated updates to localized `src/data/impact.json` file.
  - Consolidated analytics reports emailed directly to key stakeholders.
- **GitHub Environment:** `google-prod`
  - _Secrets:_ `GA_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GMAIL_APP_PASSWORD`, `GOOGLE_PROJECT_OWNER_EMAIL`, `REPORT_RECIPIENT_EMAIL`
- **Workflows:**
  - `.github/workflows/ga-report.yml` - Orchestrates compilation and notification steps.

### 4. Google Search Console API v1

- **Implementation Path:** `scripts/update-seo-dashboard-sync.ts`
- **Key Operations:**
  - Daily organic visibility and keyword telemetry extraction (Triggered at 01:00 UTC).
  - Automatic update to time-series SEO variables within `src/data/seo-metrics.json`.
  - Dynamic regression alerts raised as GitHub Issues if SEO metrics drop below set bounds.
- **GitHub Environment:** `google-prod` (shares access token configuration with GA4)
- **Workflows:**
  - `.github/workflows/seo-dashboard-sync.yml` - Governs GSC metadata harvesting.

---

## 🔌 Model Context Protocol (MCP) Integration

TABS supports the **Model Context Protocol (MCP)**, allowing AI coding assistants to securely interact with external tools and configuration platforms:

1.  **GitHub MCP Server:** Facilitates branch manipulation, Issue triage, PR generation, and GitHub Action status polling.
2.  **Qualtrics MCP Server:** Exposes OAuth-authorized secure SSE channels for structural changes, survey compilation, and question configuration.
3.  **Microsoft Learn MCP Server:** Provides instant access to official Microsoft platforms for modern static hosting guidelines.

> [!TIP]
> Refer to the complete **[MCP Servers Reference Guide](./MCP_SERVERS.md)** and the **[Qualtrics MCP Guide](./qualtrics-mcp.md)** for local activation parameters and configuration files.

---

## 🗂️ Complete Site Architecture

```
src/
├── app/                                        # Next.js App Router (149+ pages)
│   ├── page.tsx                               # Homepage template
│   ├── layout.tsx                             # Root layout configuration with global SEO metadata
│   ├── not-found.tsx                          # Tailored 404 page
│   ├── globals.css                            # CSS variables and Tailwind style classes
│   ├── sitemap.ts                             # Dynamic sitemap engine
│   ├── robots.ts                              # Robots.txt configuration
│   │
│   ├── article-1-branch-introduction-the-users-journey/  # Branch 1 Hub: Individual Acceptance
│   ├── article-1-1-the-bedrock-foundational-theories-that-shaped-tech-acceptance/
│   ├── article-1-2-the-game-changer-a-deep-dive-into-the-technology-acceptance-model-tam/
│   ├── article-1-3-expanding-the-classic-the-evolution-to-tam-2-tam-3-and-c-tam-tpb/
│   ├── article-1-4-the-grand-unification-the-unified-theory-of-acceptance-and-use-of-technology-utaut/
│   ├── article-1-5-beyond-the-office-utaut2-consumer-context-and-modern-syntheses/
│   ├── article-1-6-context-is-king-specialized-individual-adoption-models/
│   ├── article-1-7-are-you-ready-the-role-of-technology-readiness-tri-and-tram/
│   │
│   ├── article-2-branch-introduction-the-organizations-playbook/  # Branch 2 Hub: Enterprise Frameworks
│   ├── article-2-1-the-strategic-lens-foundational-theories-for-organizational-adoption/
│   ├── article-2-2-from-chaos-to-control-a-guide-to-maturity-models/
│   ├── article-2-3-managing-the-lifecycle-the-gartner-hype-cycle/
│   ├── article-2-4-the-blueprint-for-enterprise-a-survey-of-architecture-frameworks/
│   ├── article-2-5-the-modern-mandate-frameworks-for-cybersecurity-and-risk/
│   ├── article-2-6-the-cloud-revolution-prescriptive-adoption-frameworks/
│   ├── article-2-7-the-ai-frontier-frameworks-for-adopting-ai-ml-and-genai/
│   │
│   ├── article-bibliography-comprehensive-series-bibliography/  # Aggregated citation bank
│   │
│   ├── barriers/                              # Core barrier taxonomy profiles
│   │   ├── page.tsx
│   │   └── survey-stats/                      # Triage counters & pipeline status reports
│   │
│   ├── for-organizations/                     # Specialized leadership resources
│   │   ├── page.tsx
│   │   ├── executive-leaders/
│   │   ├── finance-leaders/
│   │   ├── operations-leaders/
│   │   └── technology-leaders/
│   │
│   ├── making-of-tabs/                        # Meta-research, methodologies, files
│   │   ├── page.tsx
│   │   ├── cmo-survey/
│   │   └── tabs-presentation/
│   │
│   ├── start/                                 # Personalized interactive triage path
│   │   ├── page.tsx
│   │   └── [role]/                           # Dynamic parameters for custom role guidance
│   │
│   ├── bibliography-1-1-... through bibliography-1-21-.../  # 21 Branch 1 bibliography pages
│   ├── bibliography-2-1-... through bibliography-2-3-.../   # 3 Branch 2 bibliography pages
│   │
│   ├── get-involved/                          # Forms for volunteers, sponsors, donors
│   ├── media/                                 # Standard press kit templates
│   ├── survey-complete/                       # Landing platform post-survey redirects
│   ├── tabs-home/                             # Homepage custom UI wrappers
│   ├── tabs-presentation/                     # Interactive HTML presentation viewports
│   ├── technology-adoption-models/            # Master academic taxonomy matrix
│   ├── technology-adoption-series/            # Specialized trainer resources & hubs
│   │   ├── [slide]/                          # Dynamic presentation engine
│   │   ├── presentation/                     # Standardized slide layouts
│   │   │   └── 4k/                          # Ultra-high-def assets
│   │   ├── handout-materials/
│   │   ├── opening-and-closing-scripts/
│   │   ├── qa-preparation-guide/
│   │   ├── technology-lifecycle-assessment-template/
│   │   ├── visual-gallery/
│   │   └── workshop-and-trainer-materials/
│   │
│   ├── contribution-policy/                   # Governance & Standard Policies
│   ├── cookie-policy/
│   ├── privacy-policy/
│   ├── security-acknowledgements/
│   ├── terms-of-service/
│   └── vulnerability-disclosure-policy/
│
│
├── components/                                # Reusable UI components
│   ├── header/                               # Main menu bar & responsive configurations
│   ├── footer/                               # Footer component with sitemap links
│   ├── cookie-consent/                        # Overlay banner for cookie approvals
│   ├── google-tag-manager/                    # Telemetry loading engine
│   ├── clarity-route-tracker/                 # Path analysis for Microsoft Clarity
│   ├── series-navigation/                     # Sub-navigation for academic reading
│   ├── survey-stats/                          # Components displaying Qualtrics tallies
│   ├── impact/                                # Charts displaying traffic metrics
│   ├── tabs/                                  # Main survey iframe wrapper
│   ├── tabs-page/                             # Visual blocks for homepage TABS
│   ├── teaching-series-navigation/            # Sub-navigation for workshop elements
│   ├── technology-adoption-series/            # Media containers for training templates
│   ├── charity-validation-guide/              # Verification layout widgets
│   └── ui/                                    # Base design system (Buttons, Cards, Inputs)
│
├── data/                                      # Static JSON data storage
│   ├── faqs/                                  # FAQ items categorized by role
│   ├── faqs.ts                                # Typings & aggregation logic
│   ├── team/                                  # Profiles for research maintainers
│   ├── team.ts                                # Core mappings
│   ├── testimonials/                          # Research validation metrics
│   ├── testimonials.ts                        # aggregation logic
│   ├── barriers.ts                            # Core descriptions of known barriers
│   ├── impact.json                            # Localized analytics cache
│   ├── persona-navigation.ts                  # Layout objects for persona dashboard
│   ├── qualtrics-metrics.json                 # Auto-updated survey telemetry
│   ├── disposition-summary.json               # Auto-updated Prolific submission summaries
│   ├── technology-adoption-models-series.ts   # Core metadata for theoretical articles
│   ├── technology-adoption-teaching-series.ts # Metadata for slides & presentations
│   └── visual-gallery.ts                      # Mapping of educational graphics
│
├── lib/                                       # Core technical utilities & API wrappers
│   ├── articleStyles.ts                       # Shared styling constants for reader views
│   ├── assetPath.ts                           # Global wrapper resolving basePath differences
│   ├── fonts.ts                               # Typeface loaders
│   ├── github-utils.ts                        # Workflow activation utilities
│   ├── google-analytics.ts                    # Google Data API wrappers
│   ├── personas.ts                            # State management for persona quizzes
│   ├── prolific-api.ts                        # Prolific submission interfaces
│   ├── qualtrics-api.ts                       # Qualtrics survey managers
│   ├── release-notes.ts                       # Dynamic version compilation tools
│   ├── simple-markdown.tsx                    # Minimal markdown parser
│   ├── slugify.ts                             # String parsing for URL segments
│   ├── stripHtml.ts                           # Data cleansing functions
│   ├── tabs-survey.ts                         # Custom logic for survey orchestration
│   ├── technology-adoption-series.ts          # Page navigation utilities
│   └── technology-adoption-teaching-series-segment.ts # Workshop routing maps
│
└── public/                                    # Static assets (Favicons, Logos, Graphics)
```

---

## 🏛️ CNCF Open Source Governance

We follow the high standards of the **Cloud Native Computing Foundation (CNCF)** to build a transparent, secure, and welcoming contributor community.

### 📄 Standard Policies & Charters

- 📜 **[Apache 2.0 LICENSE](./LICENSE)** — Our permissive license for open-source modification and reuse.
- 🤝 **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** — Enforces Contributor Covenant 2.1 standards for an inclusive project environment.
- ⚖️ **[GOVERNANCE.md](./GOVERNANCE.md)** — Transparent operational charter outlining how decisions are finalized.
- 👥 **[MAINTAINERS.md](./MAINTAINERS.md)** — Roster of project owners and operational areas.
- 🎉 **[CONTRIBUTORS.md](./CONTRIBUTORS.md)** — Our community record acknowledging code and non-code contributions.
- 🔒 **[SECURITY.md](./SECURITY.md)** — Strict instructions for submitting vulnerability disclosures.
- 🛡️ **[THREAT-MODEL.md](./THREAT-MODEL.md)** — Threat vectors and security mitigations of our static architecture.
- 🌟 **[ADOPTERS.md](./ADOPTERS.md)** — Registry of external organizations adopting this architecture.
- 🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Code style guides, standard pull request procedures, and contribution workflows.
- 💬 **[SUPPORT.md](./SUPPORT.md)** — Channels for getting help, opening issues, and asking questions.
- 🔗 **[EXTERNAL_DEPENDENCIES.md](./EXTERNAL_DEPENDENCIES.md)** — Open registry of third-party telemetry integrations for transparency.
- 📖 **[CITATION.cff](./CITATION.cff)** — Citation guidelines for quoting the academic frameworks of TABS.
- 📝 **[CHANGELOG.md](./CHANGELOG.md)** — Semantic changelog recording major features and platform releases.

---

## 🧪 Comprehensive Quality & Testing Gates

Our CI/CD pipeline enforces high quality and safety constraints on every pull request prior to deployment.

```
                  ┌──────────────────────┐
                  │   Developer Push /   │
                  │   Pull Request (PR)  │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │    Format Checks     │◄── Prettier Formatting
                  │    & Static Lints    │◄── ESLint Checks
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  TypeScript Checks   │◄── tsconfig Verification
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Jest Unit Testing   │◄── React Testing Library
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Playwright E2E Tests │◄── UI, Layout, & Logo Spec
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Dependabot, Axe    │◄── WCAG Accessibility
                  │   & CodeQL Analysis  │◄── Vulnerability Scans
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Merge Approved /   │
                  │  Production Deploy   │
                  └──────────────────────┘
```

### 1. Execute Local Development Environment

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your modifications in real-time.

### 2. Verify and Run Test Suites

```bash
# 1. Compile production application bundle (required for E2E tests)
npm run build

# 2. Download Playwright local browsers (Required on first execution)
npx playwright install chromium

# 3. Trigger headless E2E verification
npm test

# 4. Trigger Playwright UI interface
npm run test:ui
```

### 3. Key QA Components

- **Jest Unit Tests:** Integrated with React Testing Library to verify component rendering and state transitions (located in `__tests__/`). Includes `jest-axe` for testing WCAG accessibility compliance.
- **Playwright E2E Tests:** Validates full system page load behaviors and asset loading pathways (located in `tests/`).
  - _Logo Verification:_ Enforces logo presence, image formats, and path logic.
  - _Path Compatibility:_ Tests basePath routing dynamically to guarantee assets load perfectly on apex subdomains and default GitHub Pages endpoints.
- **ESLint Configuration:** Managed inside `eslint.config.mjs` checking next core-web-vitals. Maintains a **0 errors, 0 warnings** quality gate.
- **Static TypeScript Audits:** Full type check verification automatically executed during every CI workflow.

---

## 🔒 Security Infrastructure & Dependency Scanning

To protect academic and participant data integrity, TABS integrates automatic vulnerability auditing tools:

- **GitHub Dependabot (`.github/dependabot.yml`):** Runs weekly dependency audits every Monday at 9:00 AM UTC. Automatically generates grouped pull requests for minor security patches.
- **GitHub CodeQL Workflow (`.github/workflows/codeql.yml`):** Runs automated static analysis on every branch push to identify potential code execution paths, input sanitation issues, or dependency flaws.
- **Manual Security Audit:** Maintainers perform periodic checks via `npm audit` to manage development package risk.

---

## 🚀 CI/CD Release & Deployments

TABS implements a separated **Phase 5 Continuous Integration and Deployment architecture** to maximize efficiency:

```
[Developer Branch] ──► [Pull Request Created] ──► [ci.yml executes formatting, unit, & E2E tests]
                                                                  │
                                                      (Success Gate Approved)
                                                                  │
                                                                  ▼
[Deploy Branch] ◄── [Automated Deploy] ◄── [deploy.yml runs build & deploys statically] ◄── [PR Merged]
```

### ⚡ Continuous Integration Workflow (`.github/workflows/ci.yml`)

- Automatically triggered by every `git push` and Pull Request creation.
- Builds the Next.js bundle utilizing custom basePaths to replicate host constraints.
- Executes ESLint validation, Jest unit tests, and Playwright E2E suites.
- Does not execute deployment tasks, providing rapid, non-blocking feedback.

### 🚢 Continuous Deployment Workflow (`.github/workflows/deploy.yml`)

- Executes exclusively when a commit is pushed to the default `main` branch.
- Guarantees that all test suites are completely green before publishing.
- Compiles static assets into `./out` utilizing `output: "export"` inside `next.config.ts`.
- Publishes the compiled production artifact directly to GitHub Pages.

---

## ⛅ Preview Deployments for Static Sites

To simplify reviews by non-technical stakeholders, we support automated pull request preview environments.

### 📊 Hosting Platform Evaluation

When hosting modern, open-source static portfolios, selecting an appropriate preview environment is vital:

| Key Criteria            | Cloudflare Pages (🏆 Recommended)            | Vercel (Alternative)                                   |
| :---------------------- | :------------------------------------------- | :----------------------------------------------------- |
| **Sustainability**      | 🟢 Extremely sustainable; generous free tier | 🟡 Strict hobby limits; usage tiers subject to updates |
| **Bandwidth Limit**     | ✅ **Unlimited bandwidth**                   | ❌ 100 GB monthly bandwidth limits                     |
| **Build Limits**        | 500 complete deployments monthly             | 6,000 build minutes monthly                            |
| **Static Performance**  | Global Edge network (270+ cities)            | Standard CDN networks                                  |
| **PR Comments**         | Automated bots write preview URLs in PRs     | Automated bots write preview URLs in PRs               |
| **Next.js Integration** | Excellent static bundle rendering            | Standard native support                                |

### 🛠️ Setting Up Cloudflare Pages (Recommended)

1.  Sign in to [pages.cloudflare.com](https://pages.cloudflare.com) using your GitHub account.
2.  Navigate to **Create a project** ──► **Connect to Git** and choose this repository.
3.  Configure these build options:
    - _Framework Preset:_ `Next.js (Static HTML Export)`
    - _Build Command:_ `npm run build`
    - _Build Output Directory:_ `out`
    - _Environment Variables:_ Ensure `NEXT_PUBLIC_BASE_PATH` is left blank for preview URLs.
4.  Enable automatic comments inside the project settings to get preview URLs posted directly on every GitHub Pull Request.

---

## 👋 New Contributor Guide: The Onboarding Review

We highly value contributions from new team members! To help you get familiar with our codebase and make an immediate impact, we ask that all new contributors begin with a **Fresh Review of the Live Application**.

> [!TIP]
> **Why start with a review?**
>
> 1.  It helps you learn the features, structure, and responsive design of our site.
> 2.  It allows you to identify UX, design, or performance gaps with a fresh set of eyes.
> 3.  It gets you comfortable with our issue templates and feedback workflows.

### How to Complete Your Onboarding Review

1.  **Test the Live Platform:** Open [https://technologyadoptionbarriers.org](https://technologyadoptionbarriers.org) and click through various paths, test the responsive menus on your mobile device, check accessibility compatibility, and verify the external links.
2.  **Generate a Review Issue:** Click the link below to initialize a pre-formatted reviewer issue directly in the repository:

    👉 [**Initialize Contributor Onboarding Issue Template**](../../issues/new?assignees=&labels=documentation%2Creview%2Conboarding&template=reviewer-onboarding.md)

3.  **Document Gaps & Create Tickets:** Use the checklist inside the onboarding issue to document visual bugs, sluggish components, or accessibility gaps. Break down any major issues into individual, actionable enhancement requests.
4.  **Pick Up Your First Code Issue:** Once you have submitted your review, connect with the project maintainers in your onboarding issue to claim and resolve your first bug fix or enhancement!

For more detail on coding standards, commit styles, and local setups, please read the **[Contributor Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md)**.

---

<p align="center">
  <sub>Penn State Smeal College of Business DBA Research Initiative • Clarke Moyer • © 2026</sub>
</p>
