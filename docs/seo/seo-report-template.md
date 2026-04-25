# SEO Benchmark Report Template

**Report Period:** `[YYYY-MM-DD]` to `[YYYY-MM-DD]`
**Prepared By:** `[Author Name]`
**Date:** `[YYYY-MM-DD]`
**Related Issue:** [#473 - SEO Benchmark Initiative](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/473)

---

## How to Use This Template

1. **Copy this file** and rename with the reporting period (e.g., `seo-report-2026-Q1.md`).
2. **Replace all `[placeholder]` values** with data from the sources listed in the [Methodology](#7-methodology-and-data-sources) section.
3. **Automated data:** Use output from `scripts/collect-seo-keywords.ts` and `scripts/collect-page-seo-metrics.ts` (saved to `reports/seo/`) to populate keyword and page tables.
4. **Reference the dashboard** at `docs/seo/seo-dashboard-template.md` for a quick-view format of the same data.
5. **Companion documents:**
   - [Competitor Profiles](./competitor-profiles.md) - detailed profiles for 12 competitors
   - [Competitive SERP Benchmarking](./competitive-serp-benchmarking.md) - keyword-by-keyword SERP analysis
   - [SEO Dashboard](./seo-dashboard-template.md) - quick-view KPI dashboard

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Keyword Performance](#2-keyword-performance)
- [3. Page Analysis](#3-page-analysis)
- [4. Competitive Benchmarking](#4-competitive-benchmarking)
- [5. Content Gap Analysis](#5-content-gap-analysis)
- [6. Action Items and Recommendations](#6-action-items-and-recommendations)
- [7. Methodology and Data Sources](#7-methodology-and-data-sources)
- [Appendix A: Full Keyword Data](#appendix-a-full-keyword-data)
- [Appendix B: Glossary](#appendix-b-glossary)

---

## 1. Executive Summary

### Overview

`[2–3 paragraph summary of overall SEO performance for the reporting period. Include key wins, challenges, and strategic context. Example below:]`

> During `[period]`, technologyadoptionbarriers.org continued its growth trajectory with organic clicks increasing `[X%]` to `[X]` total clicks and impressions growing `[X%]` to `[X]`. Average position improved from `[X]` to `[X]`, reflecting ongoing content optimization efforts.
>
> Key wins included `[e.g., reaching page 1 for "technology adoption survey," improvements in academic model keywords]`. Challenges remain in `[e.g., competing with DA 85+ domains for head terms, limited structured data implementation]`.

### Key Metrics Snapshot

| Metric                   |    Value | Change vs. Prior Period | Trend |
| :----------------------- | -------: | ----------------------: | :---: |
| Total Organic Clicks     |    `[X]` |               `[±X.X%]` | 🟢 ▲  |
| Total Impressions        |    `[X]` |               `[±X.X%]` | 🟢 ▲  |
| Average CTR              | `[X.X%]` |             `[±X.X pp]` | 🟡 ◆  |
| Average Position         |  `[X.X]` |                `[±X.X]` | 🟢 ▲  |
| Domain Authority         |    `[X]` |                  `[±X]` | 🟢 ▲  |
| Pages on Page 1 (top 10) |    `[X]` |                  `[±X]` | 🟢 ▲  |

### Top 3 Wins

1. **`[Win title]`** - `[brief description, e.g., "technology adoption survey" moved from position 6 to position 4]`
2. **`[Win title]`** - `[brief description]`
3. **`[Win title]`** - `[brief description]`

### Top 3 Challenges

1. **`[Challenge title]`** - `[brief description, e.g., "digital transformation barriers" stuck at position 22 despite content updates]`
2. **`[Challenge title]`** - `[brief description]`
3. **`[Challenge title]`** - `[brief description]`

---

## 2. Keyword Performance

### 2.1 Top Performing Keywords

| Rank | Keyword     | Position | Prev. Pos. | Change | Monthly Volume | Clicks | Impressions |      CTR |
| ---: | :---------- | -------: | ---------: | -----: | -------------: | -----: | ----------: | -------: |
|    1 | `[keyword]` |    `[X]` |      `[X]` | `[±X]` |          `[X]` |  `[X]` |       `[X]` | `[X.X%]` |
|    2 | `[keyword]` |    `[X]` |      `[X]` | `[±X]` |          `[X]` |  `[X]` |       `[X]` | `[X.X%]` |
|    3 | `[keyword]` |    `[X]` |      `[X]` | `[±X]` |          `[X]` |  `[X]` |       `[X]` | `[X.X%]` |
|    4 | `[keyword]` |    `[X]` |      `[X]` | `[±X]` |          `[X]` |  `[X]` |       `[X]` | `[X.X%]` |
|    5 | `[keyword]` |    `[X]` |      `[X]` | `[±X]` |          `[X]` |  `[X]` |       `[X]` | `[X.X%]` |

> **Source:** Google Search Console > Performance > Queries, filtered by date range. Volume estimates from Ubersuggest/Google Keyword Planner.

### 2.2 Keyword Movement Summary

| Category                             | Count | Examples             |
| :----------------------------------- | ----: | :------------------- |
| Improved (moved up 3+ positions)     | `[X]` | `[keyword examples]` |
| Stable (within ±2 positions)         | `[X]` | `[keyword examples]` |
| Declined (moved down 3+ positions)   | `[X]` | `[keyword examples]` |
| New entries (not previously tracked) | `[X]` | `[keyword examples]` |

### 2.3 Keyword Position Distribution

| Position Range | Count | % of Total | Change vs. Prior |
| :------------- | ----: | ---------: | ---------------: |
| 1–3 (Top 3)    | `[X]` |     `[X%]` |           `[±X]` |
| 4–10 (Page 1)  | `[X]` |     `[X%]` |           `[±X]` |
| 11–20 (Page 2) | `[X]` |     `[X%]` |           `[±X]` |
| 21–50          | `[X]` |     `[X%]` |           `[±X]` |
| 50+            | `[X]` |     `[X%]` |           `[±X]` |

### 2.4 Keyword Category Performance

| Category                     | Avg. Position | Avg. CTR | Total Clicks | Top Keyword |
| :--------------------------- | ------------: | -------: | -----------: | :---------- |
| Core Technology Adoption     |       `[X.X]` | `[X.X%]` |        `[X]` | `[keyword]` |
| Academic Model Keywords      |       `[X.X]` | `[X.X%]` |        `[X]` | `[keyword]` |
| Barrier & Challenge Keywords |       `[X.X]` | `[X.X%]` |        `[X]` | `[keyword]` |
| Leadership & Organizational  |       `[X.X]` | `[X.X%]` |        `[X]` | `[keyword]` |
| Long-Tail Opportunity        |       `[X.X]` | `[X.X%]` |        `[X]` | `[keyword]` |

> **Reference:** Keyword categories align with those defined in [Competitive SERP Benchmarking](./competitive-serp-benchmarking.md).

---

## 3. Page Analysis

### 3.1 Top Performing Pages (by Organic Clicks)

|   # | Page URL | Title     | Clicks | Impressions |      CTR | Avg Position | Sessions | Engagement |
| --: | :------- | :-------- | -----: | ----------: | -------: | -----------: | -------: | ---------: |
|   1 | `[/url]` | `[title]` |  `[X]` |       `[X]` | `[X.X%]` |      `[X.X]` |    `[X]` |   `[X.X%]` |
|   2 | `[/url]` | `[title]` |  `[X]` |       `[X]` | `[X.X%]` |      `[X.X]` |    `[X]` |   `[X.X%]` |
|   3 | `[/url]` | `[title]` |  `[X]` |       `[X]` | `[X.X%]` |      `[X.X]` |    `[X]` |   `[X.X%]` |

> **Source:** Combined from Google Search Console (clicks, impressions, CTR, position) and GA4 (sessions, engagement rate).

### 3.2 Underperforming Pages (Optimization Opportunities)

Pages with high impressions but below-average CTR - indicating ranking content that fails to attract clicks.

| Page URL | Impressions |      CTR | Avg Position | Likely Issue                  | Recommended Action                           |
| :------- | ----------: | -------: | -----------: | :---------------------------- | :------------------------------------------- |
| `[/url]` |       `[X]` | `[X.X%]` |      `[X.X]` | `[e.g., weak title tag]`      | `[e.g., rewrite title and meta description]` |
| `[/url]` |       `[X]` | `[X.X%]` |      `[X.X]` | `[e.g., no featured snippet]` | `[e.g., add FAQ structured data]`            |

### 3.3 Page Speed & Technical Performance

| Page URL | LCP (s) | INP (ms) |      CLS | Performance Score |                Status                 |
| :------- | ------: | -------: | -------: | ----------------: | :-----------------------------------: |
| `[/url]` | `[X.X]` |    `[X]` | `[X.XX]` |         `[X/100]` | `[🟢 Good / 🟡 Needs Work / 🔴 Poor]` |

> **Source:** Google PageSpeed Insights or Lighthouse CI. Core Web Vitals thresholds: LCP <2.5s (Good), INP <200ms (Good), CLS <0.1 (Good).

---

## 4. Competitive Benchmarking

### 4.1 TABS vs. Top Competitors

| Metric                       |  TABS | `[Competitor 1]` | `[Competitor 2]` | `[Competitor 3]` |
| :--------------------------- | ----: | ---------------: | ---------------: | ---------------: |
| Domain Authority             | `[X]` |            `[X]` |            `[X]` |            `[X]` |
| Referring Domains            | `[X]` |            `[X]` |            `[X]` |            `[X]` |
| Indexed Pages                | `[X]` |            `[X]` |            `[X]` |            `[X]` |
| Est. Monthly Organic Traffic | `[X]` |            `[X]` |            `[X]` |            `[X]` |

> **Reference:** See [Competitor Profiles](./competitor-profiles.md) for full profiles of 12 competitors.

### 4.2 Keyword-Level Competition

| Keyword       | TABS Pos. | Best Competitor | Comp. Pos. |   Gap | Opportunity Level   |
| :------------ | --------: | :-------------- | ---------: | ----: | :------------------ |
| `[keyword 1]` |     `[X]` | `[name]`        |      `[X]` | `[X]` | `[High/Medium/Low]` |
| `[keyword 2]` |     `[X]` | `[name]`        |      `[X]` | `[X]` | `[High/Medium/Low]` |
| `[keyword 3]` |     `[X]` | `[name]`        |      `[X]` | `[X]` | `[High/Medium/Low]` |

> **Opportunity level criteria:**
>
> - **High** - TABS within 5 positions of competitor; realistic to overtake with optimization
> - **Medium** - Gap of 5–15 positions; achievable with dedicated content investment
> - **Low** - Gap >15 positions; long-term play requiring DA growth

### 4.3 Competitive Strengths and Weaknesses

**TABS Competitive Advantages:**

- `[e.g., Only dedicated resource combining academic adoption models with practitioner barrier analysis]`
- `[e.g., Original survey data (TABS survey) provides unique, citable content]`
- `[e.g., Deep long-form content on academic models outperforms thin competitor pages]`

**TABS Competitive Disadvantages:**

- `[e.g., Domain Authority gap (DA ~12 vs. competitor average DA ~85)]`
- `[e.g., Limited backlink profile compared to established think tanks]`
- `[e.g., No content on trending topics (AI adoption, GenAI in enterprises)]`

---

## 5. Content Gap Analysis

### 5.1 Keywords Where Competitors Rank but TABS Does Not

| Keyword       | Monthly Volume | Difficulty | Top Competitor | Comp. Position | Content Needed                                |
| :------------ | -------------: | ---------: | :------------- | -------------: | :-------------------------------------------- |
| `[keyword 1]` |          `[X]` |  `[X/100]` | `[name]`       |          `[X]` | `[e.g., new article on AI adoption barriers]` |
| `[keyword 2]` |          `[X]` |  `[X/100]` | `[name]`       |          `[X]` | `[e.g., expand existing TRA page]`            |

### 5.2 Topic Areas for New Content

| Topic Area  | Search Volume Potential | Competition Level | Priority     | Recommended Format                |
| :---------- | ----------------------: | :---------------- | :----------- | :-------------------------------- |
| `[topic 1]` |                `[X/mo]` | `[Low/Med/High]`  | `[P1/P2/P3]` | `[e.g., long-form article + FAQ]` |
| `[topic 2]` |                `[X/mo]` | `[Low/Med/High]`  | `[P1/P2/P3]` | `[e.g., bibliography page]`       |

### 5.3 Existing Content Improvement Opportunities

| Page     | Current Keywords | Missing Keywords | Recommended Changes                                               |
| :------- | :--------------- | :--------------- | :---------------------------------------------------------------- |
| `[/url]` | `[current]`      | `[missing]`      | `[e.g., add section on organizational barriers, update examples]` |

---

## 6. Action Items and Recommendations

### Immediate Actions (This Period)

|   # | Action                 | Owner         | Priority | Expected Impact                                   | Status |
| --: | :--------------------- | :------------ | :------- | :------------------------------------------------ | :----: |
|   1 | `[action description]` | `[name/team]` | P1       | `[e.g., +15% CTR for target pages]`               |   ⬜   |
|   2 | `[action description]` | `[name/team]` | P1       | `[e.g., capture featured snippet for 3 keywords]` |   ⬜   |
|   3 | `[action description]` | `[name/team]` | P2       | `[e.g., +5 new indexed pages]`                    |   ⬜   |

### Medium-Term Initiatives (Next 1–3 Months)

|   # | Initiative     | Objective     | Resources Needed | Success Metric |
| --: | :------------- | :------------ | :--------------- | :------------- |
|   1 | `[initiative]` | `[objective]` | `[resources]`    | `[metric]`     |
|   2 | `[initiative]` | `[objective]` | `[resources]`    | `[metric]`     |

### Long-Term Strategy (3–12 Months)

|   # | Strategy                 | Goal     | Dependencies     |
| --: | :----------------------- | :------- | :--------------- |
|   1 | `[strategy description]` | `[goal]` | `[dependencies]` |
|   2 | `[strategy description]` | `[goal]` | `[dependencies]` |

---

## 7. Methodology and Data Sources

### Data Collection Tools

| Tool                      | Data Collected                                      | Access Method                              | Frequency          |
| :------------------------ | :-------------------------------------------------- | :----------------------------------------- | :----------------- |
| Google Search Console     | Keywords, clicks, impressions, CTR, position, pages | API via `src/lib/google-search-console.ts` | Weekly (automated) |
| Google Analytics 4        | Sessions, engagement rate, active users, page views | API via `src/lib/google-analytics.ts`      | Weekly (automated) |
| Moz Link Explorer (free)  | Domain Authority, backlinks                         | Manual (web UI)                            | Monthly            |
| Google PageSpeed Insights | Core Web Vitals, performance score                  | Manual or Lighthouse CI                    | Per release        |
| Manual SERP Analysis      | Competitor positions, SERP features                 | Google Search (incognito)                  | Monthly            |

### Automated Data Collection Scripts

| Script                                | Output                                         | Schedule                  |
| :------------------------------------ | :--------------------------------------------- | :------------------------ |
| `scripts/collect-seo-keywords.ts`     | `reports/seo/keyword-rankings-YYYY-MM-DD.json` | Weekly via GitHub Actions |
| `scripts/collect-page-seo-metrics.ts` | `reports/seo/page-metrics-YYYY-MM-DD.json`     | Weekly via GitHub Actions |

### Data Limitations

- Free tool data (Moz, Ubersuggest) provides directional estimates, not exact figures.
- SERP positions fluctuate daily; point-in-time snapshots may not reflect average positions.
- Google Search Console data has a 2–3 day reporting delay.
- GA4 engagement metrics use session-based calculation which may differ from historical UA metrics.
- Competitor traffic estimates are from SimilarWeb free tier and represent total site traffic, not just technology-adoption-related content.

### Report Update Process

1. **Collect data:** Run collection scripts or export from GSC/GA4 web UI.
2. **Update `src/data/seo-metrics.json`:** Replace with latest metrics for programmatic access.
3. **Copy this template:** Create a dated copy (e.g., `seo-report-2026-Q2.md`).
4. **Populate tables:** Fill in placeholder values from collected data.
5. **Analyze and write narrative:** Add executive summary, wins/challenges, and recommendations.
6. **Peer review:** Submit as a PR for team review before merging.

---

## Appendix A: Full Keyword Data

`[Include the complete keyword export from Google Search Console here, or link to the JSON report file.]`

> **File reference:** `reports/seo/keyword-rankings-[YYYY-MM-DD].json`

---

## Appendix B: Glossary

| Term                  | Definition                                                                                       |
| :-------------------- | :----------------------------------------------------------------------------------------------- |
| **CTR**               | Click-Through Rate - percentage of impressions that resulted in a click                          |
| **DA**                | Domain Authority - Moz metric (0–100) predicting a site's ability to rank                        |
| **DR**                | Domain Rating - Ahrefs metric similar to DA                                                      |
| **Impressions**       | Number of times a page appeared in search results                                                |
| **Position**          | Average ranking position in Google search results (1 = top)                                      |
| **SERP**              | Search Engine Results Page                                                                       |
| **CLS**               | Cumulative Layout Shift - Core Web Vital measuring visual stability                              |
| **LCP**               | Largest Contentful Paint - Core Web Vital measuring loading performance                          |
| **INP**               | Interaction to Next Paint - Core Web Vital measuring responsiveness/interactivity (replaces FID) |
| **FID**               | First Input Delay - legacy interactivity metric replaced by INP and no longer a Core Web Vital   |
| **Long-tail keyword** | Specific, multi-word search query with lower volume but higher intent                            |
| **Featured Snippet**  | Highlighted answer box at top of Google search results                                           |
| **PAA**               | People Also Ask - expandable question boxes in Google SERPs                                      |
