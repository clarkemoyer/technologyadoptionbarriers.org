# Technology Adoption Series: Visuals System

This presentation uses a **Dual-Mode Visuals System** to ensure content is accessible and printable while providing a rich experience for digital presentations.

## Naming Convention & Library

All visuals follow a strict naming convention: `VisualXX_FriendlyName`.

- **📄 [ASCII Gallery](./ASCII_GALLERY.md):** A comprehensive document containing the text-based/ASCII version of every visual.
- **⚛️ Modern Components:** Located in `src/app/technology-adoption-series/presentation/presentation-visuals.tsx`.

## How It Works

1.  **Semantic Mapping:** Every slide is associated with a specific logical visual ID (e.g., `adoption-process-flow`).
2.  **Modern Mode (React):** Renders rich, animated interactive components.
3.  **ASCII/Text Mode (Markdown):** Renders text-based representation.

## Visual Catalog

### Part 1: Definitions & Framework (Slides 1-4)

| Slide | Visual ID                         | Standard Name                            | Modern | ASCII | Purpose                              |
| :---- | :-------------------------------- | :--------------------------------------- | :----: | :---: | :----------------------------------- |
| **1** | `adoption-process-flow`           | **Visual 01 - Adoption Process Flow**    |   ✅   |  ✅   | Flowchart of evaluation -> selection |
| **2** | `adoption-framework-layers`       | **Visual 02 - Framework Layers**         |   ✅   |  ✅   | Box diagram of framework layers      |
| **3** | `voluntary-vs-involuntary-table`  | **Visual 03 - Voluntary vs Involuntary** |   ✅   |  ✅   | Comparison table of adoption types   |
| **4** | `shelfware-vs-adopted-comparison` | **Visual 04 - Shelfware vs Adopted**     |   ✅   |  ✅   | Visual comparison of states          |

### Part 2: Strategy & Lifecycle (Slides 5-8)

| Slide | Visual ID                                  | Standard Name                                | Modern | ASCII | Purpose                                |
| :---- | :----------------------------------------- | :------------------------------------------- | :----: | :---: | :------------------------------------- |
| **5** | `strategic-adoption-pillars`               | **Visual 05 - Strategic Adoption Pillars**   |   ✅   |  ✅   | 3-column pillar diagram                |
| **6** | `technology-lifecycle-positioning-diagram` | **Visual 06 - Lifecycle Positioning**        |   ✅   |  ✅   | Comprehensive Bell Curve               |
| **7** | `lifecycle-stages-matrix`                  | **Visual 07 - Lifecycle Stages Matrix**      |   ✅   |  ✅   | Detailed risk/posture matrix           |
| **8** | `strategic-positioning-target`             | **Visual 08 - Strategic Positioning Target** |   ✅   |  ✅   | Simplified curve showing "Target Zone" |

### Part 3: Architecture & Decisions (Slides 9-12)

| Slide  | Visual ID                            | Standard Name                           | Modern | ASCII | Purpose                                  |
| :----- | :----------------------------------- | :-------------------------------------- | :----: | :---: | :--------------------------------------- |
| **9**  | `architecture-approaches-comparison` | **Visual 09 - Architecture Approaches** |   ✅   |  ✅   | Architecture Comparison Table            |
| **10** | `lifecycle-architecture-mapping`     | **Visual 10 - Lifecycle Arch Mapping**  |   ✅   |  ✅   | Mapping architecture to lifecycle stages |
| **11** | `lifecycle-planning-loop`            | **Visual 11 - Lifecycle Planning Loop** |   ✅   |  ✅   | Circular process loop                    |
| **12** | `adoption-driven-decisions-flow`     | **Visual 12 - Adoption Decisions Flow** |   ✅   |  ✅   | Flow from Adoption -> Architecture       |

### Part 4: Execution & Metrics (Slides 13-16)

| Slide  | Visual ID                           | Standard Name                         | Modern | ASCII | Purpose                    |
| :----- | :---------------------------------- | :------------------------------------ | :----: | :---: | :------------------------- |
| **13** | `adoption-enabling-capabilities`    | **Visual 13 - Enabling Capabilities** |   ✅   |  ✅   | Key capabilities list      |
| **14** | `adoption-success-metrics`          | **Visual 14 - Success Metrics**       |   ✅   |  ✅   | Success vs Warning signals |
| **15** | `phased-adoption-roadmap`           | **Visual 15 - Phased Roadmap**        |   ✅   |  ✅   | 5-phase journey map        |
| **16** | `adoption-best-practices-checklist` | **Visual 16 - Best Practices**        |   ✅   |  ✅   | 10-point checklist         |

### Transition (Slide 17)

| Slide  | Visual ID            | Standard Name                 | Modern | ASCII | Purpose                     |
| :----- | :------------------- | :---------------------------- | :----: | :---: | :-------------------------- |
| **17** | `qa-transition-card` | **Visual 17 - QA Transition** |   ✅   |  ✅   | Simple Q&A transition slide |

### Part 5: Deep Dives (Slides 18-25)

| Slide  | Visual ID                         | Standard Name                         | Modern | ASCII | Purpose                                        |
| :----- | :-------------------------------- | :------------------------------------ | :----: | :---: | :--------------------------------------------- |
| **18** | `deep-dive-tech-stack-comparison` | **Visual 18 - Tech Stack Comparison** |   ✅   |  ✅   | Hierarchical tech stack lists                  |
| **19** | `deep-dive-cloud-tiers`           | **Visual 19 - Cloud Tiers**           |   ✅   |  ✅   | Cloud platform examples                        |
| **20** | `deep-dive-sourcing-strategy`     | **Visual 20 - Sourcing Strategy**     |   ✅   |  ✅   | Sourcing categories                            |
| **21** | `deep-dive-anti-patterns`         | **Visual 21 - Anti-Patterns**         |   ✅   |  ✅   | List of 10 anti-patterns                       |
| **22** | `deep-dive-roi-analysis`          | **Visual 22 - ROI Analysis**          |   ✅   |  ✅   | Org vs User adoption gap diagram               |
| **23** | `deep-dive-legacy-migration`      | **Visual 23 - Legacy Migration**      |   ✅   |  ✅   | Migration strategy steps                       |
| **24** | `deep-dive-ai-friction`           | **Visual 24 - AI Friction**           |   ✅   |  ✅   | AI lifecycle stages                            |
| **25** | `deep-dive-lifecycle-cycles`      | **Visual 25 - Lifecycle Cycles**      |   ✅   |  ✅   | Innovation vs Legacy gravity wells             |
| **26** | `deep-dive-trifecta-model`        | **Visual 26 - The Trifecta**          |   ✅   |  ✅   | Triangle model of Org, User, Consumer adoption |

## Gap Analysis & Recommendations

The goal is to have a distinct ASCII art representation for complex concepts, rather than just text lists.

- **Slide 17 (Q&A):** No visual needed, but could use a simple ASCII placeholder.
- **Slide 13, 14, 16, 18, 19, 20, 21, 23, 24:** Currently use structured text lists in markdown.
  - _Recommendation:_ Convert these to robust ASCII diagrams (e.g., flowcharts, quadrants, or styled tables) to match the "Visual" quality of the earlier slides.

## Technical Implementation

- **Config Source:** `src/app/technology-adoption-series/presentation/presentation-visuals.tsx` (`VISUAL_CONFIG`)
- **Mapper:** `src/app/technology-adoption-series/presentation/presentation-client.tsx` (`SLIDE_TO_VISUAL_ID`)
