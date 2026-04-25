export interface VisualGalleryItem {
  id: string
  title: string
  slideNumber: number
  part: string
  ascii: string
}

export const VISUAL_GALLERY_DATA: VisualGalleryItem[] = [
  // PART 1
  {
    id: 'adoption-process-flow',
    title: 'Visual 01 - Adoption Process Flow',
    slideNumber: 1,
    part: 'Part 1: Definitions & Framework',
    ascii: `
(Evaluation)           (Selection)
     │                      │
     ▼                      ▼
[ Does it solve ] ---> [ Can we support ]
[  the problem? ]      [      it?       ]
     │                      │
     │ (Value)              │ (Feasibility)
     ▼                      ▼
[ Will users    ] ---> [ Is it secure   ]
[ adopt it?     ]      [ & compliant?   ]
     │                      │
     └──────────┬───────────┘
                │
                ▼
       [ GO / NO-GO DECISION ]
    `,
  },
  {
    id: 'adoption-framework-layers',
    title: 'Visual 02 - Framework Layers',
    slideNumber: 2,
    part: 'Part 1: Definitions & Framework',
    ascii: `
┌───────────────────────────────────────────────┐
│  STRATEGY (Why)                               │
│  [ Business Goals ] [ User Needs ] [ Risks ]  │
├───────────────────────────────────────────────┤
│  TACTICS (How)                                │
│  [ Architecture ] [ Training ] [ Support ]    │
├───────────────────────────────────────────────┤
│  EXECUTION (What)                             │
│  [ Deployment ] [ Onboarding ] [ Metrics ]    │
└───────────────────────────────────────────────┘
    `,
  },
  {
    id: 'voluntary-vs-involuntary-table',
    title: 'Visual 03 - Voluntary vs Involuntary',
    slideNumber: 3,
    part: 'Part 1: Definitions & Framework',
    ascii: `
| Feature       | Voluntary (User-Driven) | Involuntary (Org-Driven) |
|---------------|-------------------------|--------------------------|
| **Driver**    | Personal benefit        | Compliance / Policy      |
| **Adoption**  | Organic / Viral         | Mandated / Forced        |
| **Risk**      | Shadow IT / Security    | Shelf-ware / Workarounds |
| **Focus**     | Usability (UX)          | Control / Security       |
    `,
  },
  {
    id: 'shelfware-vs-adopted-comparison',
    title: 'Visual 04 - Shelfware vs Adopted',
    slideNumber: 4,
    part: 'Part 1: Definitions & Framework',
    ascii: `
[ SHELF-WARE ]                  [ ADOPTED TECH ]
┌──────────────────┐           ┌──────────────────┐
│ Purchased: YES   │           │ Purchased: YES   │
│ Deployed:  YES   │           │ Deployed:  YES   │
│ Used:      NO ❌ │           │ Used:      YES ✅│
│ Value:     ZERO  │           │ Value:     HIGH  │
└──────────────────┘           └──────────────────┘
    `,
  },

  // PART 2
  {
    id: 'strategic-adoption-pillars',
    title: 'Visual 05 - Strategic Adoption Pillars',
    slideNumber: 5,
    part: 'Part 2: Strategy & Lifecycle',
    ascii: `
      [ TRUST ]            [ UTILITY ]         [ FEASIBILITY ]
          │                    │                     │
    "Is it safe?"        "Is it useful?"       "Can I use it?"
          │                    │                     │
    [ Security ]         [ Features ]          [ Integration ]
    [ Privacy  ]         [ Performance ]       [ Support     ]
          │                    │                     │
    └─────┴────────────────────┼─────────────────────┴─────┘
                               ▼
                      SUCCESSFUL ADOPTION
    `,
  },
  {
    id: 'technology-lifecycle-positioning-diagram',
    title: 'Visual 06 - Lifecycle Positioning',
    slideNumber: 6,
    part: 'Part 2: Strategy & Lifecycle',
    ascii: `
                    ┌─── TARGET ZONE ───┐
     High │  ╲.                         .╱
          │   ╲ Innovation (dashed)    ╱ Risk (solid)
          │    ╲.     ╱╲             ╱
          │     ╲.  ╱    ╲         ╱
          │      ╲╱        ╲     ╱
          │     ╱ ╲          ╲ ╱
     Low  │   ╱    ╲...       ╲...
          └──────────────────────────────▶ Time
          Bleeding  Leading  Main-  Trending  End of
          Edge      Edge     stream Behind    Support

     --- Innovation Potential   ─── Adoption Risk
    `,
  },
  {
    id: 'lifecycle-stages-matrix',
    title: 'Visual 07 - Lifecycle Stages Matrix',
    slideNumber: 7,
    part: 'Part 2: Strategy & Lifecycle',
    ascii: `
| Stage           | Risk | Cost | Support | Strategy       |
|-----------------|------|------|---------|----------------|
| Bleeding Edge   | High | High | None    | Experiment     |
| Leading Edge    | Med  | High | Vendor  | Competitive    |
| Mainstream      | Low  | Med  | Good    | Standardize    |
| Trending Behind | Low  | Low  | Waning  | Contain        |
| End of Support  | High | High | None    | Migrate / Kill |
    `,
  },
  {
    id: 'strategic-positioning-target',
    title: 'Visual 08 - Strategic Positioning Target',
    slideNumber: 8,
    part: 'Part 2: Strategy & Lifecycle',
    ascii: `
            [ TARGET ZONE ]
            vvvvvvvvvvvvvvv
      Leading Edge <--> Mainstream
           │              │
[Bleeding] │              │ [Trailing]
(Too Early)│              │ (Too Late)
   ❌      │      ✅      │     ❌
           │              │
    `,
  },

  // PART 3
  {
    id: 'architecture-approaches-comparison',
    title: 'Visual 09 - Architecture Approaches',
    slideNumber: 9,
    part: 'Part 3: Architecture & Decisions',
    ascii: `
| Approach       | Focus                   | Pros                  | Cons                  |
|----------------|-------------------------|-----------------------|-----------------------|
| Cloud Enabling | Lift & Shift / Wrapper  | Fast, Low Risk        | Low Benefit, Tech Debt|
| Cloud Native   | Re-architect / PaaS     | Scalability, Agility  | High Effort, Lock-in  |
| Cloud Agnostic | Containers / K8s / IaC  | Potaibility, Control  | Complexity, Cost      |
    `,
  },
  {
    id: 'lifecycle-architecture-mapping',
    title: 'Visual 10 - Lifecycle Arch Mapping',
    slideNumber: 10,
    part: 'Part 3: Architecture & Decisions',
    ascii: `
Lifecycle Stage  -->  Recommended Architecture

Bleeding/Leading -->  Cloud Native (Speed)
Mainstream       -->  Cloud Agnostic (Stability)
Trending Behind  -->  Cloud Enabling (Containment)
End of Support   -->  Wrap & Trap / Retire
    `,
  },
  {
    id: 'lifecycle-planning-loop',
    title: 'Visual 11 - Lifecycle Planning Loop',
    slideNumber: 11,
    part: 'Part 3: Architecture & Decisions',
    ascii: `
      [ Plan ] ────────▶ [ Build ]
         ▲                   │
         │                   │
      [ Review ] ◀────── [ Run ]
         ▲
         │ (Feedback Loop)
    `,
  },
  {
    id: 'adoption-driven-decisions-flow',
    title: 'Visual 12 - Adoption Decisions Flow',
    slideNumber: 12,
    part: 'Part 3: Architecture & Decisions',
    ascii: `
[ User Goal ]
     │
     ▼
[ Adoption Type ] (Voluntary vs Involuntary)
     │
     ▼
[ Lifecycle Pos ] (Leading vs Mainstream)
     │
     ▼
[ Architecture  ] (Native vs Agnostic)
     │
     ▼
[ Tech Stack    ] (K8s, Serverless, VM)
    `,
  },

  // PART 4
  {
    id: 'adoption-enabling-capabilities',
    title: 'Visual 13 - Enabling Capabilities',
    slideNumber: 13,
    part: 'Part 4: Execution & Metrics',
    ascii: `
    ┌─────────────────────────┐
    │ 1. Graceful Degradation │
    │    (Fails Safely)       │
    └──────────────┬──────────┘
                   │
    ┌──────────────▼──────────┐
    │ 2. Scalable Deployment  │
    │    (10 -> 10k Users)    │
    └──────────────┬──────────┘
                   │
    ┌──────────────▼──────────┐
    │ 3. Resilient Operations │
    │    (Self-Healing)       │
    └─────────────────────────┘
    `,
  },
  {
    id: 'adoption-success-metrics',
    title: 'Visual 14 - SuccessMetrics',
    slideNumber: 14,
    part: 'Part 4: Execution & Metrics',
    ascii: `
     SUCCESS SIGNALS ✅             WARNING SIGNALS ⚠️
    ┌───────────────────┐          ┌────────────────────┐
    │ - Active Usage    │          │ - Low Usage        │
    │ - Task Completion │          │ - Workarounds      │
    │ - User Sat (CSAT) │          │ - Shadow IT        │
    │ - Advocacy (NPS)  │          │ - Compliance Only  │
    └───────────────────┘          └────────────────────┘
    `,
  },
  {
    id: 'phased-adoption-roadmap',
    title: 'Visual 15 - Phased Roadmap',
    slideNumber: 15,
    part: 'Part 4: Execution & Metrics',
    ascii: `
Phase 1: Pilot
  [ Small Group ] -> [ Feedback ] -> [ Iterate ]

Phase 2: Expand
  [ Department ]  -> [ Training ] -> [ Support ]

Phase 3: Scale
  [ Enterprise ]  -> [ Self-service ] -> [ Optimization ]
    `,
  },
  {
    id: 'adoption-best-practices-checklist',
    title: 'Visual 16 - Best Practices',
    slideNumber: 16,
    part: 'Part 4: Execution & Metrics',
    ascii: `
    ┌──────────────────────────────────────────────┐
    │  ADOPTION BEST PRACTICES CHECKLIST           │
    ├──────────────────────────────────────────────┤
    │ [x] 1. Identify valid user need              │
    │ [x] 2. Choose right lifecycle stage          │
    │ [x] 3. Select matching architecture          │
    │ [x] 4. Design for adoption (UX)              │
    │ [x] 5. Plan for support & training           │
    │ [x] 6. Define success metrics                │
    │ [x] 7. Pilot before scaling                  │
    │ [x] 8. Monitor for shelf-ware                │
    │ [x] 9. Iterate based on feedback             │
    │ [x] 10. Plan exit strategy                   │
    └──────────────────────────────────────────────┘
    `,
  },

  // TRANSITION
  {
    id: 'qa-transition-card',
    title: 'Visual 17 - QA Transition',
    slideNumber: 17,
    part: 'Part 5: Deep Dives',
    ascii: `
      ┌─────────────────────────────┐
      │                             │
      │        Q & A                │
      │                             │
      │  Discussion & Next Steps    │
      │                             │
      └─────────────────────────────┘
    `,
  },

  // PART 5
  {
    id: 'deep-dive-tech-stack-comparison',
    title: 'Visual 18 - Tech Stack Comparison',
    slideNumber: 18,
    part: 'Part 5: Deep Dives',
    ascii: `
Category      | Mainstream (Safe) | Trending Behind (Risk)
--------------|-------------------|-----------------------
Orchestration | Kubernetes        | Docker Swarm
IaC           | Terraform         | Chef / Puppet
CI/CD         | GitHub Actions    | Jenkins (Old)
Languages     | Python / Go / JS  | Perl / PHP (Legacy)
    `,
  },
  {
    id: 'deep-dive-cloud-tiers',
    title: 'Visual 19 - Cloud Tiers',
    slideNumber: 19,
    part: 'Part 5: Deep Dives',
    ascii: `
        [ SaaS (Software) ]
        (Salesforce, M365)
              │
              ▼
        [ PaaS (Platform) ]
        (Heroku, Google App Engine)
              │
              ▼
    [ IaaS (Infrastructure) ]
    (AWS EC2, Azure VMs)
    `,
  },
  {
    id: 'deep-dive-sourcing-strategy',
    title: 'Visual 20 - Sourcing Strategy',
    slideNumber: 20,
    part: 'Part 5: Deep Dives',
    ascii: `
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │    BUILD    │   │     BUY     │   │   PARTNER   │
    │  (Custom)   │   │ (COTS/SaaS) │   │ (Outsource) │
    ├─────────────┤   ├─────────────┤   ├─────────────┤
    │ Competitive │   │ Commodity   │   │ Non-Core    │
    │ Advantage   │   │ Speed       │   │ Cost Save   │
    └─────────────┘   └─────────────┘   └─────────────┘
    `,
  },
  {
    id: 'deep-dive-anti-patterns',
    title: 'Visual 21 - Anti-Patterns',
    slideNumber: 21,
    part: 'Part 5: Deep Dives',
    ascii: `
    ┌───────────────────────────────┐
    │  🚫 ANTI-PATTERN GRAVEYARD    │
    ├───────────────────────────────┤
    │ 1. "Big Bang" Deployment      │
    │ 2. Resume Driven Development  │
    │ 3. Analysis Paralysis         │
    │ 4. Not Invented Here (NIH)    │
    │ 5. Golden Hammer (One Tool)   │
    └───────────────────────────────┘
    `,
  },
  {
    id: 'deep-dive-roi-analysis',
    title: 'Visual 22 - ROI Analysis',
    slideNumber: 22,
    part: 'Part 5: Deep Dives',
    ascii: `
      Current State          Future State
      ┌───────────┐          ┌───────────┐
      │ Cost: $$$ │          │ Cost: $$  │
      │ Value: $  │  --->    │ Value: $$$│
      └───────────┘          └───────────┘
          (Shelf-ware)           (Adopted)
    `,
  },
  {
    id: 'deep-dive-legacy-migration',
    title: 'Visual 23 - Legacy Migration',
    slideNumber: 23,
    part: 'Part 5: Deep Dives',
    ascii: `
    [ 1. Encapsulate ] (API Wrapper)
           │
           ▼
    [ 2. Rehost      ] (Lift & Shift)
           │
           ▼
    [ 3. Replatform  ] (Managed DBs)
           │
           ▼
    [ 4. Refactor    ] (Cloud Native)
           │
           ▼
    [ 5. Retire      ] (Turn Off)
    `,
  },
  {
    id: 'deep-dive-ai-friction',
    title: 'Visual 24 - AI Friction',
    slideNumber: 24,
    part: 'Part 5: Deep Dives',
    ascii: `
    [ HIGH FRICTION ]
    ┌────────────────────────┐
    │ - Security / Privacy   │
    │ - Ethics / Bias        │
    │ - Skills Gap           │
    └──────────┬─────────────┘
               │
               ▼
    ┌────────────────────────┐
    │ - Chatbots / Copilot   │
    │ - Summarization        │
    └────────────────────────┘
    [ LOW FRICTION ]
    `,
  },
  {
    id: 'deep-dive-lifecycle-cycles',
    title: 'Visual 25 - Lifecycle Cycles',
    slideNumber: 25,
    part: 'Part 5: Deep Dives',
    ascii: `
   (Innovation Cycle)          (Legacy Cycle)
      Bleeding -> Leading         Trailing -> EoL
           ^       |                   ^       |
           |_______|                   |_______|
         New Tech                    Tech Debt
    `,
  },
  {
    id: 'deep-dive-trifecta-model',
    title: 'Visual 26 - The Trifecta',
    slideNumber: 26,
    part: 'Part 5: Deep Dives',
    ascii: `
            [ Organization ]
                  /  \\
                 /    \\
                / (1)  \\
               /        \\
              /__________\\
     [ User ] (2)      (3) [ Consumer ]
    `,
  },

  // LIFECYCLE TIMELINE EXAMPLES
  {
    id: 'hardware-lifecycle-timeline',
    title: 'Visual 27 - Hardware Lifecycle: HDDs',
    slideNumber: 27,
    part: 'Part 5: Deep Dives',
    ascii: `
Hardware: Hard Disk Drives (HDDs) - ~77 year lifecycle
Bar width proportional to time in phase

|-- Bleeding Edge --|-- Leading --|---- Mainstream ----|-- Trending --|EoS|
|  14 yrs (1956-70) | 15 yrs     |  30 yrs (1985-2015)| 13 yrs      |5yr|

Long mainstream plateau creates right-skewed curve
Sources: Computer History Museum (2024); IDC HDD Forecast (2024)
    `,
  },
  {
    id: 'software-lifecycle-timeline',
    title: 'Visual 28 - Software Lifecycle: Flash',
    slideNumber: 28,
    part: 'Part 5: Deep Dives',
    ascii: `
Software: Adobe Flash - ~25 year lifecycle
Bar width proportional to time in phase

|Bleed|Leading|- Mainstream -|Trending|EoS|E|
| 4yr | 5 yrs |    7 yrs    | 5 yrs  |3yr|1|

Compressed EOL after Apple rejection + HTML5
Sources: Adobe Flash EOL Page (2020); W3Techs (2023)
    `,
  },
  {
    id: 'supply-chain-lifecycle-timeline',
    title: 'Visual 29 - Supply Chain: Barcodes',
    slideNumber: 29,
    part: 'Part 5: Deep Dives',
    ascii: `
Supply Chain: Barcode/UPC Systems - ~83 year lifecycle
Bar width proportional to time in phase

|---- Bleeding Edge ----|-- Leading --|------ Mainstream ------|Trending|EoS|
|  22 yrs (1952-1974)   | 11 yrs     | 35 yrs (1985-2020)    | 10 yrs |5yr|

Extremely long bleeding edge - infrastructure lag before adoption
Sources: GS1 Barcode History (2024); McKinsey Supply Chain 4.0 (2024)
    `,
  },
]
