# v0.6.0 2026-06-18

> **Defense-Day Release: Walkthrough, Reproducibility Kits, & New Statistics**

## Main Summary

This release is the **defense-day milestone** for TABS. The work concentrates on three streams. First, it adds a public **Product Walkthrough** at `/making-of-tabs/product-walkthrough` — a single launching point that orients reviewers and presenters across the site's research, results, and reproducibility surfaces. Second, it ships **one-click reproducibility kits**: SPSS, Minitab, and Python validation bundles are now downloadable from the Reproducibility page with double-click launchers, plus a Python SEM companion that gives Minitab full parity with the rest of the suite. Third, the daily analysis pipeline computes **28 new statistical-validation keys** — including SRMR, Henze-Zirkler multivariate normality, separated-samples Bonferroni t-tests, Harman common-method variance, per-factor Tucker congruence coefficients, a validation-output registry, and R parity — closing the seven-statistic gap that previously existed between the live website and the defense materials.

The Results section has been redesigned around insight-first navigation. New `/results` and `/results/top-barriers` pages put the headline finding (the Top-3 barriers ranking) on the landing page, with a **Participant Voice** page surfacing every Q74 open-ended response from the full dataset, and a **Response Funnel** page that replaces the older "Survey Statistics" framing. A second branch of the Results section, `/results/crp-2026/`, mirrors every page using the frozen CRP-200 dataset; this release introduces a **shared-component refactor** so each page renders from a single content component (Descriptive, Sample, Reliability, Findings, Sensitivity, DataQuality, TopBarriers) regardless of which dataset feeds it. That refactor is what made the 28-key extension feasible.

The bibliography is now **fully canonicalized**. Every article in tracks 1 (1-1 through 1-21) and 2 (2-1 through 2-21) was upgraded to the canonical 16-section template, then revised against its source PDF in an "R1" pass that corrected fabricated sample sizes, mis-described frameworks, and stale category labels. Each article was reviewed against either its primary source PDF or a documented academic proxy. A new Zotero-backed reference-validation script and CI job now flag any pull request that introduces a citation Zotero hasn't seen — currently surfaced as a non-blocking warning (exit code 1 is allowed) so reviewers see the diff without blocking merges; only real script errors (exit 2+) fail CI.

The Prolific operations stack gained a **full-corpus message export workflow** that bypasses Prolific's 30-day limit by per-user fetch, plus a Q74 full-dataset analysis pipeline. The daily disposition report now includes 21-day auto-approve runway tracking and a stale-`AWAITING REVIEW` triage section (with PIDs redacted to last-4 in the issue body — see the post-mortem in `CLAUDE.md`). CI added a phantom-revert guard for stale-base PRs and a post-deploy production smoke fan-out that opens incident issues with per-check failure detail. Brand assets were rotated end-to-end: the FFC template favicons, PWA icons, and social-sharing image were replaced with TABS equivalents, and unused FFC template assets were removed.

Since the defense-day cut, the Prolific operations stack matured into a hands-off daily pipeline. The unified `daily-pipeline.yml` chains fetch → export/analyze → approve → message → dashboard → auto-stale-action → commit → report in a single run, and two new auto-action phases close the disposition loop without human involvement: **Phase 3d** auto-dispatches return requests on submissions that never replied to a flag message, and **Phase 3e** auto-rejects return-requests that go stale before Prolific's 21-day reserve auto-approves them — both ceiling-guarded, kill-switched, and re-validated against live Prolific state to avoid actioning a participant who replied in the interim (#2582). The daily disposition report gained a **HIGH RISK** alert for submissions within two days of auto-approval, an **N=500 enrollment forecast**, queue-resolution ETA, participant-reply tracking, multi-reply detection, and a bulk-reject fast-path for the high-rejection tier (#2778, #2638). For ad-hoc operator decisions, new **per-PID workflows** approve, request-return, or reject explicit submissions with disposition-aware reason text and the same safety rails as the automated phases — including `BYPASS_STALE_GATE` and `stale_hours` escape hatches for items the automated buckets don't cover (#2811, #2812, #2813, #2938).

**~182 substantive merged PRs since v0.5.0** (2026-04-15 → 2026-06-18), excluding routine daily-pipeline data, GA-stats, dependabot, and auto-issue PRs. The bulk of the May–June window was the daily pipeline running in production; the substantive additions concentrate in Prolific operations automation and reliability.\*\*

## 1. User Facing Changes

### 1.1 Defense-Day Walkthrough & Reproducibility Kits

- **Product Walkthrough page** at `/making-of-tabs/product-walkthrough` — single launching point for defense day, oriented to reviewers and presenters (#1911, closes #1908).
- **SPSS one-click launcher** — double-click runner for the SPSS validation bundle so reviewers don't need to wire up the syntax themselves (#1860).
- **Minitab one-click launcher + Python SEM companion** — full Minitab parity, with the Python SEM script providing the path-modeling step Minitab itself can't run (#1874).
- **Reproducibility page** now surfaces all three kits (SPSS, Minitab, Python) as direct downloads (#1907).
- **CRP-specific Making-of-TABS content** added: 50-Reviewer Process and Open-Source Research Value sections (#1669, closes #1667).
- **Reproducibility page** updated for the unified analysis pipeline (#1606).

### 1.2 Bibliography Canonicalization (42 articles)

- **Track 1 (1-1 → 1-21)** upgraded to the canonical 16-section template: TRA, DOI Individual, SCT, Innovation Resistance, SQB, TAM, TPB, PCA, IEM, DTPB, TTF, TRI, TAM2, ECM, UTAUT, MATH, Value-Based Adoption, TRAM, TAM3, UTAUT2, TRI 2.0 (#1552, #1614, #1617–#1623, #1625–#1635, #1712–#1724).
- **Track 2 (2-1 → 2-21)** upgraded to the canonical template: RBV, VRIO, Dynamic Capabilities, TQM, CMM, TOE, IT Implementation, BPR (Davenport & Short), BPR (Hammer & Champy), TAFIM, Gartner Hype Cycle, TOGAF, DoDAF, CMMI, IT-CMF, AWS CAF-AI, AWS ETF, Microsoft CAF, Microsoft AI Adoption, CMMC, DoI Organizational (#1636–#1655, #1665, #1727–#1747).
- **R1 PDF-based factual corrections**: every article reviewed against its primary source PDF or a documented academic proxy. Corrections include fabricated sample-size fixes (TAM2), maturity/capability level renames (CMMI), framework re-descriptions (AWS ETF, DTPB), stale category labels, and slug realignment (#1689, #1742, #1725, #1726, #1685, #1750, #1739).
- **Source-PDF page rewrites** for IEM, PCA, TAM, TPB, TRI, TRA, IT-CMF, Gartner Hype Cycle, IRM, DOI Individual, SCT, SQB, DTPB (#1660, #1661, #1662, #1663, #1666, #1668, #1671, #1672, #1677, #1678, #1679, #1680, #1683, #1685).
- **Zotero-backed bibliography reference validation** (CI + script) — flags PRs introducing citations Zotero hasn't seen (non-blocking warning today; only real script errors fail CI) (#1597).

### 1.3 New Statistical Analyses Surfaced

- **7 pipeline-gap statistics now computed daily**: SRMR, Henze-Zirkler multivariate normality, separated-samples Bonferroni t-tests, Harman common-method variance, per-factor Tucker congruence, validation-output registry, R parity (#1876, closes #1861).
- **28 new statistical-validation JSON keys** wired up to existing Validation, Factor Analysis, and Data Quality pages (#1853, references #1839).
- **Statistical extensions to TABS validation pipeline** — 28 new analyses (#1837, closes #1836).
- **Top-3 pick counts, item descriptives, construct grand means, and demographics detail** emitted by the pipeline (#1695).
- **Maturity sub-construct grouping labels** added to constants (#1682).
- **Tech / Non-Tech CRP-2026 sample classification depth** surfaced (CISO label fix, free-text Other-roles reclassification visible) (#1859, closes #1858).

### 1.4 New Results Pages & Navigation

- **`/results` landing page redesign** with insight-first nav reorder and Top-3 clarity (#1709).
- **Top-3 Barriers** page added for live data, alongside the existing CRP-2026 page; both wired into nav and sitemap (#1697, #1702, #1701).
- **Participant Voice page** at `/results/participant-voice` — Q74 open-ended feedback from the full dataset (#1904).
- **Survey Statistics → Response Funnel** page redesigned as the canonical funnel surface (#1809, with cleanup in #1811).
- **Sidebar nav**: all 6 top-level sections now navigate on first click (#1850, closes #1708).
- **Live methodology disclosure** added to the live results page, plus regression test for Other-roles (#1892, closes #1865).

### 1.5 Mind Maps & Visualizations

- **Mind Maps gallery** at `/making-of-tabs/mind-maps/<slug>` (#1773).
- **Featured Visualizations** group added to Home sidebar nav (#1790).
- **Static high-resolution literature review mind map** at `/lit-review-mind-map` (#1797).
- **`/lit-review-complex`** with pan/zoom SVG viewer (supersedes earlier #1610 prototype) (#1771).
- **Mind-map viewer**: fullscreen + keyboard shortcuts + zoom slider, route cuts via `initialFocus` (#1789, with regressions reverted in #1791 and refinements in #1792, #1795, #1796).
- **Inline `<Term>` tooltip component** for psychometric terms in glossary (#1782).

### 1.6 Homepage

- **Live Top-3 barriers section** on homepage, linking to `/results` (#1706).
- **Live Places Taken + Question Count** rendered from cached JSON (#1794, #1704).
- **Surveys Completed (300) and Survey Questions (57)** corrected on homepage (#1801).
- **Live Results prose N** aligned with Statistics callout (#1806).
- **Q74 — full-dataset participant voice** integration with homepage stat (#1905).

### 1.7 Brand

- **TABS favicon and PWA icons** replace FFC template assets; unused FFC template assets removed (#1913, closes #1912).
- **Social sharing metadata** updated with TABS logo (was FFC template) (#1888, closes #1887).

## 2. Internal Application Improvements

### 2.1 Live ↔ CRP-2026 Parity Refactor

Seven shared content components extracted so the live and CRP-2026 results pages render from a single source. This made the 28-key statistical extension a per-component edit rather than a per-page edit.

- `DescriptiveContent` (#1873)
- `SampleContent` (#1875)
- `ReliabilityContent` (#1872)
- `FindingsContent` (#1871)
- `SensitivityContent` (#1870)
- `DataQualityContent` (#1867)
- `TopBarriersContent` (#1866)

### 2.2 Pipeline Operations

- **Unified daily pipeline** — `daily-pipeline.yml` chains fetch → export/analyze → approve → message → dashboard → auto-stale-action → commit → report in one run (supersedes the separate analysis and disposition workflows).
- **Auto-stale-action phases (3d/3e)** — auto-request-return on no-reply flag messages, and auto-reject stale return-requests before the 21-day reserve auto-approves them; ceiling-guarded, kill switches, live race revalidation (#2582).
- **Daily report intelligence** — HIGH RISK auto-approve alert, N=500 forecast, queue-resolution ETA, participant-reply tracking, multi-reply detection, and bulk-reject fast-path (#2778, #2638).
- **Daily report resilient to missing GitHub labels** (#2926).
- **platform-stats reliability** — removed the `push:main` trigger that caused a self-feeding loop (#2776); environment-secret and glob-robustness fixes (#1914, #1918, #1925).
- **21-day auto-approve runway tracking** in the daily report; fixes 3 daily-report regressions (#1838).
- **Workflow to check 21-day auto-approved submissions** added (#1612).
- **Stale `AWAITING REVIEW` triage** in daily pipeline and report — with PIDs redacted to last-4 in the issue body and a 1-day artifact for the operator copy/paste list (see post-mortem in `CLAUDE.md`) (#1774).
- **Q74 full-dataset analysis** workflow + script (#1905).
- **Full-corpus Prolific message export** workflow + script (#1906); per-user fetch removes Prolific's 30-day window (#1909); raw write happens before the since-filter so the corpus is recoverable on re-runs (#1910).
- **Daily disposition Reasons column** populated end-to-end (#1852, #1894, closes #1851, #1893).
- **Stale-triage** tolerates messages missing timestamps and falls back to ObjectId timestamp when `sent_at` is null (#1779, #1842).
- **CRP offline document tools** brought under version control (#1696).

### 2.3 CI / Safety

- **Phantom-revert guard for stale-base PRs** (#1881).
- **Production smoke** surfaces per-check failure detail in incident issues (#1857, closes #1856).
- **Production-smoke incident-issue fix** for a smoke regression (#1855, closes #1849).
- **Post-deploy fan-out**: Prolific, GA, and GSC API smokes after deploy (#1815).
- **Plain dash for per-cell missing scalars** on findings (closes a prod smoke incident) (#1863).
- **Reduce Copilot review rounds to 7 + 60s cooldown** (#1611).
- **Article-toc / unified-navigation lint suppressions** unblocking bibliography PRs (#1676, #1684).
- **Question-count test exact-match** fix (#1879).

### 2.4 Security

- **npm vulnerabilities fixed** + least-privilege workflow permissions (#1481).
- **Vulnerable transitive deps + uuid/postcss overrides** bumped (#1816).
- **Production-deps group bump** (5 updates) (#1819).
- **Development-deps group bump** (9 updates) (#1818).
- **`next` 16.2.1 → 16.2.3** (#1426).
- **`ip-address` 10.1.0 → 10.2.0** (#1895).
- **`actions/github-script` 8 → 9** (#1508).
- **`actions/setup-python` 5 → 6** (#1507).
- **`actions/upload-pages-artifact` 4 → 5** (#1761).

## 3. External Integrations

### 3.1 Prolific

- **Auto-stale-action phases** — auto-request-return (Phase 3d) + auto-reject-stale-RR (Phase 3e) (#2582).
- **Per-PID ad-hoc workflows** — approve (#2811), request-return with `BYPASS_STALE_GATE` (#2812, #2813), reject with `stale_hours` override (#2938); all disposition-aware with dry-run defaults and confirmation gates.
- **Daily report** — HIGH RISK alert, N=500 forecast, reply tracking, bulk-reject fast-path (#2778, #2638).
- Full-corpus message export workflow + script (per-user fetch, no 30-day limit) (#1906, #1909, #1910).
- 21-day auto-approve runway tracking in the daily report (#1838).
- Stale `AWAITING REVIEW` triage with redacted PIDs in the issue body (#1774).
- Q74 full-dataset analysis (#1905).
- Empty-Reasons column fix in daily disposition report (#1852, #1894).
- Production smokes added to post-deploy fan-out (#1815).

### 3.2 Qualtrics

- None direct in this release (validation pipeline extensions consume existing Qualtrics exports).

### 3.3 Google

- Daily Google Analytics impact stats refresh (routine, ~26 PRs in window).
- Google Search Console post-deploy smoke added (#1815).

### 3.4 Microsoft

- None in this release.

## Contributors

### Human contributors (commit authors)

- Clarke Moyer (clarkemoyer)

### Automated commit authors (bots)

- Claude (Anthropic)
- Copilot (GitHub)
- dependabot (GitHub)

### AI / Tooling contributors

- GitHub Copilot Pro Plus
- Google Gemini Ultimate
- Anthropic Claude (Opus 4.7, Sonnet 4.6)

## Lessons Learned

- **Auto-PR commit messages can hide release scope.** The platform-stats refresh PRs (53 in this window) are merge commits that pull substantial work in via the merge boundary. A literal `git log v0.5.0..HEAD --oneline` made it look like only stats had changed. Use `git diff --stat v0.5.0..HEAD` and the GitHub PR list — not commit subjects — to assess release scope.
- **Live ↔ CRP parity refactor unblocked statistical extension.** The 28-key statistical addition (#1853, #1837, #1876) became feasible only after the seven shared content components were extracted (#1866–#1875). Refactoring before extending paid off cleanly.
- **R1 PDF-based reviews catch fabricated content.** The bibliography R1 pass turned up multiple fabricated sample sizes (TAM2 #1689) and mis-described frameworks (AWS ETF #1742, DTPB #1685) that the canonical-template pass alone would not have flagged. Hard-coupling each article to its source PDF (or a documented academic proxy) is the right standard going forward.
- **Stale-triage PID handling required a privacy fix mid-flight.** The first version of the stale-`AWAITING REVIEW` section in the daily report leaked full PROLIFIC_PIDs into a permanent GitHub issue body. Redaction to last-4 + 1-day artifact for the full list is now the rule, and the privacy table in `CLAUDE.md` was extended to make GitHub-managed surfaces explicit. See the post-mortem in `CLAUDE.md` (search for "Post-mortem: stale-triage PID leak").
- **Squash-merge titles set by automation are not sufficient.** Future release-notes workflows should derive scope from the diff and the GitHub PR list, not from commit subjects.

## Merged pull requests (newest &rarr; oldest)

> Excludes routine `chore: refresh platform-stats.json`, `Update daily pipeline data`, and `Update Google Analytics impact stats` auto-PRs, plus dependabot. Substantive PRs only (~182).

- [#2938](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2938) — feat(prolific): add stale_hours override to reject-by-pid workflow
- [#2926](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2926) — fix: make daily report resilient to missing GitHub labels
- [#2813](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2813) — feat(prolific): BYPASS_STALE_GATE escape hatch for request_return_by_pid
- [#2812](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2812) — feat(prolific): add request-return-by-PID workflow for ad-hoc cases
- [#2811](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2811) — feat(prolific): add approve-by-PID workflow for ad-hoc approval batches
- [#2778](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2778) — feat(daily): HIGH RISK alert, N=500 forecast, bulk-reject, multi-reply, queue ETA
- [#2776](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2776) — fix(platform-stats): remove push:main trigger to break self-feeding loop
- [#2638](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2638) — feat(daily): track participant replies + close FLAG-RECAPTCHA messaging gap
- [#2618](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2618) — fix(test): scope response-funnel value assertions to their metric cards
- [#2582](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/2582) — feat(ops): auto-dispatch stale request-returns and auto-reject stale RR window
- [#1925](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1925) — fix(ci): keep platform-stats in scan trigger and allow commit_sha keys
- [#1918](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1918) — fix(platform-stats): declare environment: copilot so the PR-token secret resolves
- [#1914](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1914) — fix(platform-stats): replace pipefail-fatal ls globs with find
- [#1913](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1913) — fix(brand): replace FFC favicon/PWA icons with TABS + clean unused FFC template assets
- [#1907](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1907) — feat: surface SPSS/Minitab/Python validation kit downloads on Reproducibility page
- [#1911](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1911) — feat(walkthrough): add /making-of-tabs/product-walkthrough page (defense-day launching point)
- [#1910](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1910) — fix(prolific): handle datetime_created field + write raw before since-filter
- [#1909](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1909) — fix(prolific): switch message export to per-user fetch (no 30-day limit)
- [#1906](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1906) — feat(prolific): full-corpus message export workflow + script
- [#1904](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1904) — feat(results): add Participant Voice page (Q74 open-ended feedback)
- [#1905](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1905) — feat: Q74 full-dataset analysis workflow + script
- [#1696](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1696) — crp-tools: bring offline CRP document tools under version control
- [#1597](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1597) — Zotero-backed bibliography reference validation (CI + script)
- [#1894](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1894) — Fix empty Reasons column in daily disposition report
- [#1896](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1896) — fix(#1657): refresh content-architecture page with current site stats
- [#1895](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1895) — npm(deps-dev): bump ip-address from 10.1.0 to 10.2.0
- [#1888](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1888) — fix: replace FFC template logo with TABS logo in social sharing metadata
- [#1892](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1892) — fix(#1865): live methodology disclosure + Other-roles regression test
- [#1881](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1881) — feat(ci): phantom-revert guard for stale-base PRs
- [#1876](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1876) — feat: add 7 missing pipeline-gap statistics (SRMR, Henze-Zirkler, SMB t-tests, Harman CMV, per-factor Tucker, validation registry, R parity)
- [#1879](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1879) — fix(test): use exact match for questionCount in response-funnel test
- [#1874](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1874) — feat(minitab): one-click launcher + Python SEM companion for full Minitab parity
- [#1860](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1860) — feat(spss): one-click double-click launcher for SPSS validation bundle
- [#1873](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1873) — refactor(results): extract shared DescriptiveContent component (live + CRP-2026 parity)
- [#1875](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1875) — refactor(results): extract shared SampleContent component (live + CRP-2026 parity)
- [#1872](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1872) — refactor(results): extract shared ReliabilityContent component (live + CRP-2026 parity)
- [#1871](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1871) — refactor(results): extract shared FindingsContent component (live + CRP-2026 parity)
- [#1870](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1870) — refactor(results): extract shared SensitivityContent component (live + CRP-2026 parity)
- [#1867](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1867) — refactor(results): extract shared DataQualityContent component (live + CRP-2026 parity)
- [#1866](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1866) — refactor(results): extract shared TopBarriersContent component (live + CRP-2026 parity)
- [#1859](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1859) — fix(#1858): surface Tech/Non-Tech classification depth on CRP-2026 sample page
- [#1863](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1863) — fix(findings): use plain dash for per-cell missing scalars (closes prod smoke incident)
- [#1853](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1853) — feat: surface 28 new statistical-validation JSON keys on existing pages (refs #1839)
- [#1857](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1857) — feat(smoke): surface per-check failure details in production incident issues
- [#1852](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1852) — Populate stale-triage Reasons column in daily report
- [#1850](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1850) — feat(nav): make all 6 top-level sidebar sections navigate on first click (closes #1708)
- [#1855](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1855) — fix(smoke): assert 'Prolific Accepted' on /results overview (closes #1849)
- [#1669](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1669) — Add CRP-specific content to Making of TABS: 50-Reviewer Process and Open-Source Research Value
- [#1709](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1709) — feat(results): insight-first nav reorder + /results landing redesign + Top-3 clarity
- [#1682](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1682) — Add maturity sub-construct grouping labels to constants
- [#1837](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1837) — Statistical extensions to TABS validation pipeline - 28 new analyses (closes #1836)
- [#1842](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1842) — fix(stale-triage): fall back to ObjectId timestamp when sent_at is null
- [#1838](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1838) — feat(pipeline): 21-day auto-approve runway tracking + fix 3 daily-report regressions
- [#1819](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1819) — npm(deps): bump the production-dependencies group across 1 directory with 5 updates
- [#1508](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1508) — ci(deps): bump actions/github-script from 8 to 9
- [#1507](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1507) — ci(deps): bump actions/setup-python from 5 to 6
- [#1761](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1761) — ci(deps): bump actions/upload-pages-artifact from 4 to 5
- [#1818](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1818) — npm(deps-dev): bump the development-dependencies group across 1 directory with 9 updates
- [#1481](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1481) — security: fix npm vulnerabilities and add least-privilege workflow permissions
- [#1815](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1815) — ci(smoke): add Prolific/GA/GSC API smokes + post-deploy fan-out
- [#1816](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1816) — security: bump vulnerable transitive deps + uuid/postcss overrides
- [#1811](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1811) — fix(homepage-redesign-cleanup): /media page bug, Survey Statistics → Response Funnel rename, doc sweep
- [#1809](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1809) — feat(survey-stats): redesign as canonical Response Funnel page
- [#1426](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1426) — npm(deps): bump next from 16.2.1 to 16.2.3
- [#1806](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1806) — fix(homepage): align Live Results prose N with Statistics callout
- [#1801](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1801) — fix(homepage): correct Surveys Completed (300) and Survey Questions (57)
- [#1796](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1796) — fix(mind-maps): correct viewBox on 5 cut SVGs to show their intended branch
- [#1797](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1797) — feat(lit-review): add static high-resolution literature review mind map at /lit-review-mind-map
- [#1795](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1795) — fix(mind-maps): drop wheel step so a mouse notch isn't a max-zoom jump
- [#1704](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1704) — [WIP] Update component to display real count and question count
- [#1794](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1794) — feat(homepage): show live Places Taken + Question Count from cached JSON
- [#1792](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1792) — fix(mind-maps): remove breakout wrapper, add fullscreen toggle, finer wheel zoom
- [#1791](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1791) — Revert #1789: mind-map viewer regressions (framing + zoom range)
- [#1790](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1790) — fix(nav): add Featured Visualizations group to Home sidebar
- [#1789](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1789) — feat(mind-maps): fullscreen + keyboard + zoom slider, route cuts via initialFocus
- [#1782](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1782) — feat(glossary): inline <Term> tooltip component for psychometric terms
- [#1706](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1706) — feat(homepage): add live Top-3 barriers section with link to /results
- [#1773](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1773) — feat(making-of-tabs): add Mind Maps gallery under /making-of-tabs/mind-maps/<slug>
- [#1779](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1779) — fix(stale-triage): tolerate messages missing timestamps
- [#1774](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1774) — feat(ops): add stale AWAITING REVIEW triage to daily pipeline and report
- [#1771](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1771) — feat(lit-review): add /lit-review-complex with pan/zoom SVG viewer (supersedes #1610)
- [#1753](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1753) — fix: 1-14 ECM (Bhattacherjee 2001) - rebased replacement for #1690
- [#1752](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1752) — fix: article-1-6 TTF sample description (Goodhue & Thompson 1995 PDF)
- [#1751](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1751) — fix: 1-11 TTF (Goodhue & Thompson, 1995) - single-file replacement for #1686
- [#1750](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1750) — fix(nav): update 3 stale references to 1-16 MATH slug
- [#1689](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1689) — docs: standardize bibliography 1-13 (TAM2) to canonical template and fix fabricated sample sizes
- [#1747](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1747) — docs: 2-6 TOE (Tornatzky & Fleischer, 1990) R1 - PDF-based factual corrections (via Zhu et al. 2006 Management Science proxy)
- [#1745](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1745) — docs: 2-4 TQM (Deming, 1982) R1 - PDF-based factual corrections (via Anderson 1994 AMR + Hackman & Wageman 1995 ASQ proxies)
- [#1744](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1744) — docs: 2-9 BPR (Hammer & Champy, 1993) R1 - PDF-based factual corrections (via Hammer 1990 HBR proxy)
- [#1743](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1743) — docs: 2-5 CMM (Humphrey, 1989) R1 - PDF-based factual corrections (via Paulk et al. 1993 IEEE Software proxy)
- [#1742](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1742) — fix: 2-17 AWS ETF - rewrite body to describe ETF (was describing EBA)
- [#1741](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1741) — docs: 2-19 Microsoft AI Adoption Framework R1 - PDF-based factual corrections
- [#1740](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1740) — docs: 2-18 Microsoft Cloud Adoption Framework R1 - PDF-based factual corrections
- [#1738](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1738) — docs: 2-20 CMMC (DoD, 2020) R1 - PDF-based factual corrections
- [#1737](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1737) — docs: 2-16 AWS CAF for AI (2024) R1 - PDF-based factual corrections
- [#1736](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1736) — docs: 2-12 TOGAF (The Open Group, 1995) R1 - PDF-based factual corrections (via TOGAF 10th Edition PDFs)
- [#1735](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1735) — docs: 2-11 Gartner Hype Cycle R1 - PDF-based factual corrections (via Linden & Fenn 2003)
- [#1734](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1734) — docs: 2-13 DoDAF (DoD, 2003) R1 - PDF-based factual corrections
- [#1733](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1733) — docs: 2-8 Business Process Redesign (Davenport & Short, 1990) R1 - PDF-based factual corrections
- [#1732](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1732) — docs: 2-3 Dynamic Capabilities (Teece, Pisano, Shuen, 1997) R1 - PDF-based factual corrections
- [#1731](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1731) — docs: 2-10 TAFIM (DoD, 1994) R1 - PDF-based factual corrections
- [#1730](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1730) — docs: 2-15 IT-CMF (Innovation Value Institute, 2016) R1 - PDF-based factual corrections
- [#1729](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1729) — docs: 2-2 VRIN/VRIO (Barney, 1991) R1 - PDF-based factual corrections
- [#1728](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1728) — docs: 2-7 IT Implementation Research (Cooper & Zmud, 1990) R1 - PDF-based factual corrections
- [#1727](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1727) — docs: 2-1 RBV (Wernerfelt, 1984) R1 - PDF-based factual corrections
- [#1726](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1726) — fix: 2-21 DoI Organizational R1 - PDF-based factual review
- [#1725](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1725) — fix: 2-14 CMMI R1 - correct maturity/capability level names and PA categories from source PDF
- [#1739](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1739) — fix(nav): update 2-20 navigation from Gartner HC Methodology to CMMC
- [#1724](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1724) — docs: 1-16 MATH (Brown & Venkatesh, 2005) - upgrade to canonical 16-section template
- [#1723](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1723) — docs: 1-15 UTAUT (Venkatesh et al., 2003) - upgrade to canonical 16-section template
- [#1722](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1722) — docs: 1-12 TRI (Parasuraman, 2000) - upgrade to canonical 16-section template
- [#1721](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1721) — docs: 1-10 Decomposed TPB (Taylor & Todd, 1995) - upgrade to canonical 16-section template
- [#1720](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1720) — docs: 1-9 Intrinsic/Extrinsic Motivation (Davis et al., 1992) - upgrade to canonical 16-section template
- [#1719](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1719) — docs: 1-8 PC Utilization (Thompson et al., 1991) - upgrade to canonical 16-section template
- [#1718](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1718) — docs: 1-7 TPB (Ajzen, 1991) - upgrade to canonical 16-section template
- [#1717](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1717) — docs: 1-6 TAM (Davis, 1989) - upgrade to canonical 16-section template
- [#1716](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1716) — docs: 1-5 SQB (Samuelson & Zeckhauser, 1988) - upgrade to canonical 16-section template
- [#1715](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1715) — docs: 1-4 Innovation Resistance (Ram & Sheth, 1989) - upgrade to canonical 16-section template
- [#1714](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1714) — docs: 1-3 SCT (Bandura, 1986) - upgrade to canonical 16-section template
- [#1713](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1713) — docs: 1-2 Diffusion of Innovations (Rogers, 1962) - upgrade to canonical 16-section template
- [#1712](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1712) — docs: 1-1 TRA (Fishbein & Ajzen, 1975) - upgrade to canonical 16-section template
- [#1642](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1642) — docs: standardize bibliography 2-7 IT Implementation (Cooper & Zmud, 1990)
- [#1641](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1641) — docs: standardize bibliography 2-6 TOE Framework (Tornatzky & Fleischer, 1990)
- [#1640](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1640) — docs: standardize bibliography 2-5 CMM (Humphrey, 1989)
- [#1643](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1643) — docs: standardize bibliography 2-8 Business Process Redesign (Davenport & Short, 1990)
- [#1634](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1634) — docs: standardize bibliography 1-20 UTAUT2 (Venkatesh et al., 2012)
- [#1631](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1631) — docs: standardize bibliography 1-17 Value-Based Adoption (Kim et al., 2007)
- [#1661](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1661) — fix: SQB page corrections from source PDF review
- [#1626](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1626) — docs: standardize bibliography 1-14 ECM (Bhattacherjee, 2001)
- [#1625](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1625) — docs: standardize bibliography 1-13 TAM2 (Venkatesh & Davis, 2000)
- [#1623](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1623) — docs: standardize bibliography 1-11 TTF (Goodhue & Thompson, 1995)
- [#1654](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1654) — docs: standardize bibliography 2-19 Microsoft AI Adoption (2025)
- [#1653](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1653) — docs: standardize bibliography 2-18 Microsoft CAF (2025)
- [#1652](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1652) — docs: standardize bibliography 2-17 AWS ETF (2024)
- [#1649](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1649) — docs: standardize bibliography 2-14 CMMI (Chrissis et al., 2005)
- [#1648](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1648) — docs: standardize bibliography 2-13 DoDAF (DoD, 2003)
- [#1647](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1647) — docs: standardize bibliography 2-12 TOGAF (The Open Group, 1995)
- [#1645](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1645) — docs: standardize bibliography 2-10 TAFIM (DoD, 1994)
- [#1644](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1644) — docs: standardize bibliography 2-9 BPR (Hammer & Champy, 1993)
- [#1639](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1639) — docs: standardize bibliography 2-4 TQM (Deming, 1982)
- [#1702](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1702) — feat(results): live /results/top-barriers page + wire both top-barriers pages into nav and sitemap
- [#1701](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1701) — fix(crp-2026/top-barriers): only show omission note when an item is actually omitted
- [#1638](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1638) — docs: standardize bibliography 2-3 Dynamic Capabilities (Teece, 1997)
- [#1697](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1697) — crp-2026: Top 3 Barriers page (pick-vs-mean ranking)
- [#1637](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1637) — docs: standardize bibliography 2-2 VRIO Framework (Barney, 1991)
- [#1695](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1695) — pipeline: emit top-3 pick counts, item descriptives, construct grand, and demographics detail
- [#1636](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1636) — docs: standardize bibliography 2-1 RBV (Wernerfelt, 1984)
- [#1635](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1635) — docs: standardize bibliography 1-21 TRI 2.0 (Parasuraman & Colby, 2015)
- [#1633](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1633) — docs: standardize bibliography 1-19 TAM3 (Venkatesh & Bala, 2008)
- [#1632](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1632) — docs: standardize bibliography 1-18 TRAM (Lin et al., 2007)
- [#1622](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1622) — docs: standardize bibliography 1-10 Decomposed TPB (Taylor & Todd, 1995)
- [#1685](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1685) — fix: DTPB page - rewrite fabricated decomposition structure
- [#1665](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1665) — docs: standardize IT-CMF page (2-15)
- [#1668](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1668) — fix: IT-CMF page corrections from source PDF review
- [#1684](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1684) — fix: suppress article-toc lint errors blocking CI
- [#1624](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1624) — docs: standardize bibliography 1-12 TRI (Parasuraman, 2000)
- [#1683](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1683) — fix: TRI page corrections from source PDF review
- [#1620](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1620) — docs: standardize bibliography 1-9 Intrinsic/Extrinsic Motivation (Davis, 1992)
- [#1680](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1680) — fix: IEM page corrections from source PDF review
- [#1618](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1618) — docs: standardize bibliography 1-7 TPB (Ajzen, 1991)
- [#1678](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1678) — fix: TPB page corrections from source PDF review
- [#1619](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1619) — docs: standardize bibliography 1-8 Personal Computing Acceptance (Thompson, 1991)
- [#1679](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1679) — fix: PCA page corrections from source PDF review
- [#1617](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1617) — docs: standardize bibliography 1-6 TAM (Davis, 1989)
- [#1677](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1677) — fix: TAM page corrections from source PDF review
- [#1552](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1552) — Bibliography 1-1 TRA: standardize to canonical 14-section template
- [#1671](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1671) — fix: TRA page corrections from source review
- [#1614](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1614) — docs: standardize bibliography 1-2 Diffusion of Innovations (Rogers, 1962)
- [#1672](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1672) — fix: DOI Individual page corrections from source review
- [#1676](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1676) — fix: suppress unified-navigation lint warnings blocking bibliography PRs
- [#1666](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1666) — fix: Gartner Hype Cycle page corrections from source PDF review
- [#1663](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1663) — fix: IRM page rewrite from source PDF review
- [#1662](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1662) — fix: DOI Org page corrections from source review
- [#1660](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1660) — fix: SCT page corrections from source PDF review
- [#1651](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1651) — docs: standardize bibliography 2-16 AWS CAF-AI (2024)
- [#1627](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1627) — docs: standardize bibliography 1-15 UTAUT (Venkatesh et al., 2003)
- [#1655](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1655) — docs: standardize bibliography 2-20 Gartner Hype Cycle Methodology (2025)
- [#1630](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1630) — docs: standardize bibliography 1-16 MATH (Brown & Venkatesh, 2005)
- [#1606](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1606) — docs: update reproducibility page for unified analysis pipeline
- [#1612](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1612) — chore: add workflow to check 21-day auto-approved submissions
- [#1611](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/1611) — fix: reduce Copilot review rounds to 7 and add 60s cooldown

## Closed issues included (newest &rarr; oldest)

> Excludes routine `Daily Disposition Report`, `Broken links detected`, and `Production smoke test failed` auto-issues. Substantive issues only (66).

- [#1912](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1912) — Replace Free For Charity logo throughout repo with TABS logo (favicons + decorative assets)
- [#1908](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1908) — Add `/making-of-tabs/product-walkthrough` page (defense-day launching point)
- [#1893](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1893) — Missing reasons in the daily Disposition report.
- [#1657](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1657) — This page needs an update
- [#1887](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1887) — Update the image used when sharing the website from the free for charity to tabs
- [#1861](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1861) — Pipeline gap: 7 statistics on defense materials are not computed daily (SRMR, Henze-Zirkler, SMB t-tests, Harman CMV, per-factor Tucker, registry counts)
- [#1858](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1858) — Sample / Findings pages hide the Tech vs Non-Tech classification depth (CISO missing from label, free-text reclassification of Others not surfaced)
- [#1856](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1856) — Need more details in the post smoke error issue
- [#1851](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1851) — Reason column not populating in the daily report.
- [#1708](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1708) — Audit and redesign major nav-category first-click landing pages
- [#1667](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1667) — Add CRP-specific content to Making of TABS: 50-Reviewer Process and Open-Source Research Value
- [#1707](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1707) — Redesign /results landing page: flow narrative + Live/CRP split path
- [#1681](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1681) — Add maturity sub-construct grouping labels to constants file
- [#1836](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1836) — Statistical extensions - add advanced psychometric analyses to validation pipeline
- [#1604](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1604) — Post-mortem: direct push to main during #1544 hotfix
- [#1525](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1525) — More Rendering Bugs In the articles.
- [#613](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/613) — Investigate: 4 NO_DATA PIDs (Prolific submissions with no Qualtrics data)
- [#1038](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1038) — security: address findings from automated security audit
- [#1810](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1810) — fix(homepage-redesign-cleanup): /media page wrong-source bug, Survey Statistics → Response Funnel rename, full doc sweep
- [#1808](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1808) — feat(survey-stats): redesign /results/survey-stats as canonical Response Funnel with explanations for every count
- [#1805](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1805) — fix(homepage): Live Results prose 'N verified participants' drifts from Statistics callout
- [#1800](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1800) — fix(homepage): wrong Surveys Completed (364) and Survey Questions (21) on landing-page Statistics
- [#1703](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1703) — This needs to be updated with information from the Live JSON to show the real count taken and question count
- [#1788](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1788) — fix(nav): Mind Maps not surfaced in sidebar on Home / from outside Making-of-TABS
- [#1780](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1780) — feat: inline glossary popovers for psychometric terms on results pages
- [#1705](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1705) — Need a new live results section on the homepage that give the top three barriers and has a link to the rest of the results pages as a teaser
- [#1608](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1608) — Recreate this Image as a full page webpage on this site under https://technologyadoptionbarriers.org/concept-mapping/
- [#1569](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1569) — Bibliography standardization: bibliography-1-16-math-venkatesh-brown-2001 (MATH (Brown & Venkatesh, 2005))
- [#1567](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1567) — Bibliography standardization: bibliography-1-15-unified-theory-utaut-venkatesh-2003 (UTAUT (Venkatesh et al., 2003))
- [#1564](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1564) — Bibliography standardization: bibliography-1-12-technology-readiness-index-tri-parasuraman-2000 (TRI (Parasuraman, 2000))
- [#1562](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1562) — Bibliography standardization: bibliography-1-10-decomposed-tpb-taylor-todd-1995 (Decomposed TPB (Taylor & Todd, 1995))
- [#1561](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1561) — Bibliography standardization: bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992 (Intrinsic/Extrinsic Motivation (Davis et al., 1992))
- [#1560](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1560) — Bibliography standardization: bibliography-1-8-personal-computing-acceptance-thompson-1991 (Personal Computing Utilization (Thompson et al., 1991))
- [#1559](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1559) — Bibliography standardization: bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991 (TPB (Ajzen, 1991))
- [#1558](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1558) — Bibliography standardization: bibliography-1-6-technology-acceptance-model-tam-davis-1989 (TAM (Davis, 1989))
- [#1557](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1557) — Bibliography standardization: bibliography-1-5-status-quo-bias-samuelson-zeckhauser-1988 (SQB (Samuelson & Zeckhauser, 1988))
- [#1556](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1556) — Bibliography standardization: bibliography-1-4-model-of-innovation-resistance-ram-sheth-1989 (Innovation Resistance (Ram, 1987))
- [#1555](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1555) — Bibliography standardization: bibliography-1-3-social-cognitive-theory-sct-bandura-1986 (SCT (Bandura, 1986))
- [#1554](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1554) — Bibliography standardization: bibliography-1-2-diffusion-of-innovations-rogers (DoI (Rogers, 1962))
- [#1551](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1551) — Bibliography 1-1 TRA: standardize to canonical 14-section template
- [#1581](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1581) — Bibliography standardization: bibliography-2-7-it-implementation-research-cooper-zmud-1990 (bibliography-2-7-it-implementation-research-cooper-zmud-1990)
- [#1580](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1580) — Bibliography standardization: bibliography-2-6-toe-framework-tornatzky-1990 (bibliography-2-6-toe-framework-tornatzky-1990)
- [#1579](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1579) — Bibliography standardization: bibliography-2-5-capability-maturity-model-cmm-humphrey-1989 (bibliography-2-5-capability-maturity-model-cmm-humphrey-1989)
- [#1582](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1582) — Bibliography standardization: bibliography-2-8-business-process-redesign-davenport-short-1990 (bibliography-2-8-business-process-redesign-davenport-short-1990)
- [#1573](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1573) — Bibliography standardization: bibliography-1-20-utaut2-venkatesh-2012 (bibliography-1-20-utaut2-venkatesh-2012)
- [#1570](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1570) — Bibliography standardization: bibliography-1-17-value-based-adoption-kim-2007 (VBA (Kim, Chan, & Gupta, 2007))
- [#1566](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1566) — Bibliography standardization: bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001 (ECM (Bhattacherjee, 2001))
- [#1565](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1565) — Bibliography standardization: bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000 (TAM2 (Venkatesh & Davis, 2000))
- [#1563](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1563) — Bibliography standardization: bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995 (TTF (Goodhue & Thompson, 1995))
- [#1593](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1593) — Bibliography standardization: bibliography-2-19-microsoft-ai-adoption-framework-2025 (bibliography-2-19-microsoft-ai-adoption-framework-2025)
- [#1592](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1592) — Bibliography standardization: bibliography-2-18-microsoft-cloud-adoption-framework-2025 (bibliography-2-18-microsoft-cloud-adoption-framework-2025)
- [#1591](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1591) — Bibliography standardization: bibliography-2-17-aws-etf-prescriptive-guidance-2024 (bibliography-2-17-aws-etf-prescriptive-guidance-2024)
- [#1588](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1588) — Bibliography standardization: bibliography-2-14-cmmi-chrissis-2005 (bibliography-2-14-cmmi-chrissis-2005)
- [#1587](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1587) — Bibliography standardization: bibliography-2-13-dodaf-dod-2003 (bibliography-2-13-dodaf-dod-2003)
- [#1586](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1586) — Bibliography standardization: bibliography-2-12-togaf-the-open-group-1995 (bibliography-2-12-togaf-the-open-group-1995)
- [#1584](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1584) — Bibliography standardization: bibliography-2-10-tafim-dod-1994 (bibliography-2-10-tafim-dod-1994)
- [#1583](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1583) — Bibliography standardization: bibliography-2-9-business-process-reengineering-hammer-champy-1993 (bibliography-2-9-business-process-reengineering-hammer-champy-1993)
- [#1578](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1578) — Bibliography standardization: bibliography-2-4-total-quality-management-tqm-deming-1982 (bibliography-2-4-total-quality-management-tqm-deming-1982)
- [#1577](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1577) — Bibliography standardization: bibliography-2-3-dynamic-capabilities-teece-1997 (bibliography-2-3-dynamic-capabilities-teece-1997)
- [#1576](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1576) — Bibliography standardization: bibliography-2-2-vrio-framework-barney-1991 (bibliography-2-2-vrio-framework-barney-1991)
- [#1575](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1575) — Bibliography standardization: bibliography-2-1-resource-based-view-rbv-wernerfelt-1984 (bibliography-2-1-resource-based-view-rbv-wernerfelt-1984)
- [#1574](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1574) — Bibliography standardization: bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015 (bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015)
- [#1572](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1572) — Bibliography standardization: bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008 (TAM3 (Venkatesh & Bala, 2008))
- [#1571](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1571) — Bibliography standardization: bibliography-1-18-tram-lin-2007 (TRAM (Lin, Shih, & Sher, 2007))
- [#1590](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1590) — Bibliography standardization: bibliography-2-16-aws-caf-ai-2024 (bibliography-2-16-aws-caf-ai-2024)
- [#1594](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1594) — Bibliography standardization: bibliography-2-20-gartner-hype-cycle-methodology-2025 (Gartner Hype Cycle (Gartner, 2025))

## Related

- Previous release: [v0.5.0](https://github.com/clarkemoyer/technologyadoptionbarriers.org/releases/tag/v0.5.0) (2026-04-15)
- Defense-day milestone: see `/making-of-tabs/product-walkthrough`
