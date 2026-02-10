# Technology Adoption Series: Visuals System

This presentation uses a **Dual-Mode Visuals System** to ensure content is accessible and printable while providing a rich experience for digital presentations.

## How It Works

1.  **Semantic Mapping:** Every slide is associated with a specific logical visual ID (e.g., `adoption-process-flow`).
2.  **Modern Mode (React):** `presentation-visuals.tsx` renders rich, animated interactive components (SVG, Tailwind cards) for the "Keynote" experience.
3.  **ASCII/Text Mode (Markdown):** `01-core-presentation-deck.md` contains a text-based representation (ASCII art or structured text) for each visual. This ensures the raw content file is self-contained and readable without the app.

## Visual Catalog

| Slide | Visual ID                                  | Modern Component | ASCII/Text Fallback | Notes                                             |
| :---- | :----------------------------------------- | :--------------- | :------------------ | :------------------------------------------------ |
| 1     | `adoption-process-flow`                    | ✅ `Visual1`     | ✅ ASCII Diagram    | Flowchart of evaluation -> selection              |
| 2     | `adoption-framework-layers`                | ✅ `Visual2`     | ✅ ASCII Diagram    | Box diagram of framework layers                   |
| 3     | `voluntary-vs-involuntary-table`           | ✅ `Visual3`     | ✅ Markdown Table   | Comparison table                                  |
| 4     | `shelfware-vs-adopted-comparison`          | ✅ `Visual4`     | ✅ ASCII Diagram    | Visual comparison of states                       |
| 5     | `strategic-adoption-pillars`               | ✅ `Visual5`     | ✅ ASCII Diagram    | 3-column pillar diagram                           |
| 6     | `technology-lifecycle-positioning-diagram` | ✅ `Visual6`     | ✅ ASCII Diagram    | Comprehensive lifecycle curve                     |
| 7     | `lifecycle-stages-matrix`                  | ✅ `Visual7`     | ✅ ASCII Table      | Detailed risk/posture matrix                      |
| 8     | `strategic-positioning-target`             | ✅ `Visual8`     | ✅ ASCII Diagram    | Simplified curve showing "Target Zone"            |
| 9     | `architecture-approaches-comparison`       | ✅ `Visual9`     | ✅ ASCII Table      | Enabling vs Native vs Agnostic                    |
| 10    | `lifecycle-architecture-mapping`           | ✅ `Visual10`    | ✅ ASCII Diagram    | Mapping architecture to lifecycle stages          |
| 11    | `lifecycle-planning-loop`                  | ✅ `Visual11`    | ✅ ASCII Diagram    | Circular process loop                             |
| 12    | `adoption-driven-decisions-flow`           | ✅ `Visual12`    | ✅ ASCII Diagram    | Flow from Adoption -> Architecture -> Development |
| 13    | `adoption-enabling-capabilities`           | ✅ `Visual13`    | ✅ Text List        | Key capabilities list                             |
| 14    | `adoption-success-metrics`                 | ✅ `Visual14`    | ✅ Text List        | Success vs Warning signals                        |
| 15    | `phased-adoption-roadmap`                  | ✅ `Visual15`    | ✅ ASCII Diagram    | 5-phase journey map                               |
| 16    | `adoption-best-practices-checklist`        | ✅ `Visual16`    | ✅ Text List        | 10-point checklist                                |
| 17    | `qa-transition-card`                       | ✅ `Visual17`    | ❌ None             | Simple Q&A transition slide                       |
| 18    | `deep-dive-tech-stack-comparison`          | ✅ `Visual18`    | ✅ Text Trees       | Hierarchical text lists of tech stacks            |
| 19    | `deep-dive-cloud-tiers`                    | ✅ `Visual19`    | ✅ Text list        | Cloud platform examples                           |
| 20    | `deep-dive-sourcing-strategy`              | ✅ `Visual20`    | ✅ Text List        | Sourcing categories                               |
| 21    | `deep-dive-anti-patterns`                  | ✅ `Visual21`    | ✅ Text List        | List of 10 anti-patterns                          |
| 22    | `deep-dive-roi-analysis`                   | ✅ `Visual22`    | ✅ ASCII Diagram    | Org vs User adoption gap diagram                  |
| 23    | `deep-dive-legacy-migration`               | ✅ `Visual23`    | ✅ Text List        | Migration strategy steps                          |
| 24    | `deep-dive-ai-friction`                    | ✅ `Visual24`    | ✅ Text List        | AI lifecycle stages                               |

## Gap Analysis & Recommendations

The goal is to have a distinct ASCII art representation for complex concepts, rather than just text lists.

- **Slide 17 (Q&A):** No visual needed, but could use a simple ASCII placeholder.
- **Slide 13, 14, 16, 19, 20, 21, 23, 24:** Currently use structured text lists in markdown.
  - _Recommendation:_ Convert these to robust ASCII diagrams (e.g., flowcharts, quadrants, or styled tables) to match the "Visual" quality of the earlier slides.

## Technical Implementation

- **Config Source:** `src/app/technology-adoption-series/presentation/presentation-visuals.tsx` (`VISUAL_CONFIG`)
- **Mapper:** `src/app/technology-adoption-series/presentation/presentation-client.tsx` (`SLIDE_TO_VISUAL_ID`)
