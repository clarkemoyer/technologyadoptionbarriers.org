/**
 * Technology Adoption Models Series - Navigation Structure
 *
 * This is the single source of truth for the complete series structure.
 * Used by:
 * - Header mega navigation
 * - In-article series navigation sections
 * - Sitemap generation
 */

export interface SeriesArticle {
  id: string
  title: string
  slug: string
  status?: 'published' | 'coming-soon'
}

export interface SeriesBranch {
  id: string
  title: string
  slug: string
  articles: SeriesArticle[]
}

export interface BibliographyEntry {
  id: string
  title: string
  slug: string
}

export interface SeriesStructure {
  root: {
    title: string
    slug: string
  }
  branches: SeriesBranch[]
  bibliography: {
    title: string
    slug: string
  }
  bibliographyArticles: {
    individual: BibliographyEntry[]
    organizational: BibliographyEntry[]
  }
}

export const technologyAdoptionModelsSeries: SeriesStructure = {
  root: {
    title: 'The Complete Series: Technology Adoption Models',
    slug: '/technology-adoption-models',
  },
  branches: [
    {
      id: 'branch-1',
      title: "The User's Journey – Evolution of Individual Technology Acceptance & Use Models",
      slug: '/article-1-branch-introduction-the-users-journey',
      articles: [
        {
          id: 'article-1-1',
          title: 'Article 1.1: The Bedrock – Foundational Theories That Shaped Tech Acceptance',
          slug: '/article-1-1-the-bedrock-foundational-theories-that-shaped-tech-acceptance',
          status: 'published',
        },
        {
          id: 'article-1-2',
          title:
            'Article 1.2: The Game Changer – A Deep Dive into the Technology Acceptance Model (TAM)',
          slug: '/article-1-2-the-game-changer-a-deep-dive-into-the-technology-acceptance-model-tam',
          status: 'published',
        },
        {
          id: 'article-1-3',
          title:
            'Article 1.3: Expanding the Classic – The Evolution to TAM 2, TAM 3, and C-TAM-TPB',
          slug: '/article-1-3-expanding-the-classic-the-evolution-to-tam-2-tam-3-and-c-tam-tpb',
          status: 'published',
        },
        {
          id: 'article-1-4',
          title:
            'Article 1.4: The Grand Unification – The Unified Theory of Acceptance and Use of Technology (UTAUT)',
          slug: '/article-1-4-the-grand-unification-the-unified-theory-of-acceptance-and-use-of-technology-utaut',
          status: 'published',
        },
        {
          id: 'article-1-5',
          title: 'Article 1.5: Beyond the Office – UTAUT2, Consumer Context, and Modern Syntheses',
          slug: '/article-1-5-beyond-the-office-utaut2-consumer-context-and-modern-syntheses',
          status: 'published',
        },
        {
          id: 'article-1-6',
          title: 'Article 1.6: Context is King – Specialized Individual Adoption Models',
          slug: '/article-1-6-context-is-king-specialized-individual-adoption-models',
          status: 'published',
        },
        {
          id: 'article-1-7',
          title: 'Article 1.7: Are You Ready? The Role of Technology Readiness (TRI & TRAM)',
          slug: '/article-1-7-are-you-ready-the-role-of-technology-readiness-tri-and-tram',
          status: 'published',
        },
      ],
    },
    {
      id: 'branch-2',
      title:
        "The Organization's Playbook – Evolution of Organizational Technology Acceptance & Use Models",
      slug: '/article-2-branch-introduction-the-organizations-playbook',
      articles: [
        {
          id: 'article-2-1',
          title:
            'Article 2.1: The Strategic Lens – Foundational Theories for Organizational Adoption',
          slug: '/article-2-1-the-strategic-lens-foundational-theories-for-organizational-adoption',
          status: 'published',
        },
        {
          id: 'article-2-2',
          title: 'Article 2.2: From Chaos to Control – A Guide to Maturity Models',
          slug: '/article-2-2-from-chaos-to-control-a-guide-to-maturity-models',
          status: 'published',
        },
        {
          id: 'article-2-3',
          title: 'Article 2.3: Managing the Lifecycle – The Gartner Hype Cycle',
          slug: '/article-2-3-managing-the-lifecycle-the-gartner-hype-cycle',
          status: 'published',
        },
        {
          id: 'article-2-4',
          title: 'Article 2.4: The Blueprint for Enterprise – A Survey of Architecture Frameworks',
          slug: '/article-2-4-the-blueprint-for-enterprise-a-survey-of-architecture-frameworks',
          status: 'published',
        },
        {
          id: 'article-2-5',
          title: 'Article 2.5: The Modern Mandate – Frameworks for Cybersecurity and Risk',
          slug: '/article-2-5-the-modern-mandate-frameworks-for-cybersecurity-and-risk',
          status: 'published',
        },
        {
          id: 'article-2-6',
          title: 'Article 2.6: The Cloud Revolution – Prescriptive Adoption Frameworks',
          slug: '/article-2-6-the-cloud-revolution-prescriptive-adoption-frameworks',
          status: 'published',
        },
        {
          id: 'article-2-7',
          title: 'Article 2.7: The AI Frontier – Frameworks for Adopting AI, ML, and GenAI',
          slug: '/article-2-7-the-ai-frontier-frameworks-for-adopting-ai-ml-and-genai',
          status: 'published',
        },
      ],
    },
  ],
  bibliography: {
    title: 'Series Bibliography',
    slug: '/article-bibliography-comprehensive-series-bibliography',
  },
  bibliographyArticles: {
    individual: [
      {
        id: 'bib-1-1',
        title: 'Theory of Reasoned Action (TRA)',
        slug: '/bibliography-1-1-theory-of-reasoned-action-tra-fishbein-ajzen-1975',
      },
      {
        id: 'bib-1-2',
        title: 'Diffusion of Innovations',
        slug: '/bibliography-1-2-diffusion-of-innovations-rogers',
      },
      {
        id: 'bib-1-3',
        title: 'Social Cognitive Theory (SCT)',
        slug: '/bibliography-1-3-social-cognitive-theory-sct-bandura-1986',
      },
      {
        id: 'bib-1-4',
        title: 'Innovation Resistance',
        slug: '/bibliography-1-4-model-of-innovation-resistance-ram-sheth-1989',
      },
      {
        id: 'bib-1-5',
        title: 'Status Quo Bias',
        slug: '/bibliography-1-5-status-quo-bias-samuelson-zeckhauser-1988',
      },
      {
        id: 'bib-1-6',
        title: 'Technology Acceptance Model (TAM)',
        slug: '/bibliography-1-6-technology-acceptance-model-tam-davis-1989',
      },
      {
        id: 'bib-1-7',
        title: 'Theory of Planned Behavior (TPB)',
        slug: '/bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991',
      },
      {
        id: 'bib-1-8',
        title: 'Personal Computing Utilization',
        slug: '/bibliography-1-8-personal-computing-utilization-thompson-1991',
      },
      {
        id: 'bib-1-9',
        title: 'Motivation Framework',
        slug: '/bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992',
      },
      {
        id: 'bib-1-10',
        title: 'Decomposed TPB',
        slug: '/bibliography-1-10-decomposed-tpb-taylor-todd-1995',
      },
      {
        id: 'bib-1-11',
        title: 'Task-Technology Fit (TTF)',
        slug: '/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995',
      },
      {
        id: 'bib-1-12',
        title: 'Technology Readiness Index (TRI)',
        slug: '/bibliography-1-12-technology-readiness-index-tri-parasuraman-2000',
      },
      {
        id: 'bib-1-13',
        title: 'TAM2',
        slug: '/bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000',
      },
      {
        id: 'bib-1-14',
        title: 'Expectation-Confirmation Model (ECM)',
        slug: '/bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001',
      },
      {
        id: 'bib-1-15',
        title: 'UTAUT',
        slug: '/bibliography-1-15-unified-theory-utaut-venkatesh-2003',
      },
      {
        id: 'bib-1-16',
        title: 'Model of Adoption of Technology in Households (MATH)',
        slug: '/bibliography-1-16-math-venkatesh-brown-2001',
      },
      {
        id: 'bib-1-17',
        title: 'Value-Based Adoption',
        slug: '/bibliography-1-17-value-based-adoption-kim-2007',
      },
      {
        id: 'bib-1-18',
        title: 'Technology Readiness and Acceptance Model (TRAM)',
        slug: '/bibliography-1-18-tram-lin-2007',
      },
      {
        id: 'bib-1-19',
        title: 'TAM3',
        slug: '/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008',
      },
      { id: 'bib-1-20', title: 'UTAUT2', slug: '/bibliography-1-20-utaut2-venkatesh-2012' },
      {
        id: 'bib-1-21',
        title: 'TRI 2.0',
        slug: '/bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015',
      },
    ],
    organizational: [
      {
        id: 'bib-2-1',
        title: 'Resource-Based View (RBV)',
        slug: '/bibliography-2-1-resource-based-view-rbv-wernerfelt-1984',
      },
      {
        id: 'bib-2-2',
        title: 'VRIO Framework',
        slug: '/bibliography-2-2-vrio-framework-barney-1991',
      },
      {
        id: 'bib-2-3',
        title: 'Dynamic Capabilities',
        slug: '/bibliography-2-3-dynamic-capabilities-teece-1997',
      },
      {
        id: 'bib-2-4',
        title: 'Total Quality Management (TQM)',
        slug: '/bibliography-2-4-total-quality-management-tqm-deming-1982',
      },
      {
        id: 'bib-2-5',
        title: 'Capability Maturity Model (CMM)',
        slug: '/bibliography-2-5-capability-maturity-model-cmm-humphrey-1989',
      },
      {
        id: 'bib-2-6',
        title: 'TOE Framework',
        slug: '/bibliography-2-6-toe-framework-tornatzky-1990',
      },
      {
        id: 'bib-2-7',
        title: 'IT Implementation Research',
        slug: '/bibliography-2-7-it-implementation-research-cooper-zmud-1990',
      },
      {
        id: 'bib-2-8',
        title: 'Business Process Redesign (BPR)',
        slug: '/bibliography-2-8-business-process-redesign-davenport-short-1990',
      },
      {
        id: 'bib-2-9',
        title: 'Business Process Reengineering',
        slug: '/bibliography-2-9-business-process-reengineering-hammer-champy-1993',
      },
      {
        id: 'bib-2-10',
        title: 'Technical Architecture Framework for Information Management (TAFIM)',
        slug: '/bibliography-2-10-tafim-dod-1994',
      },
      {
        id: 'bib-2-11',
        title: 'Gartner Hype Cycle',
        slug: '/bibliography-2-11-gartner-hype-cycle-fenn-1995',
      },
      {
        id: 'bib-2-12',
        title: 'The Open Group Architecture Framework (TOGAF)',
        slug: '/bibliography-2-12-togaf-the-open-group-1995',
      },
      {
        id: 'bib-2-13',
        title: 'DoD Architecture Framework (DoDAF)',
        slug: '/bibliography-2-13-dodaf-dod-2003',
      },
      {
        id: 'bib-2-14',
        title: 'Capability Maturity Model Integration (CMMI)',
        slug: '/bibliography-2-14-cmmi-chrissis-2005',
      },
      {
        id: 'bib-2-15',
        title: 'IT Capability Maturity Framework (IT-CMF)',
        slug: '/bibliography-2-15-it-cmf-innovation-value-institute-2016',
      },
      { id: 'bib-2-16', title: 'AWS CAF for AI/ML', slug: '/bibliography-2-16-aws-caf-ai-2024' },
      {
        id: 'bib-2-17',
        title: 'AWS Enterprise Transformation',
        slug: '/bibliography-2-17-aws-etf-prescriptive-guidance-2024',
      },
      {
        id: 'bib-2-18',
        title: 'Microsoft Cloud Adoption Framework',
        slug: '/bibliography-2-18-microsoft-cloud-adoption-framework-2025',
      },
      {
        id: 'bib-2-19',
        title: 'Microsoft AI Adoption Framework',
        slug: '/bibliography-2-19-microsoft-ai-adoption-framework-2025',
      },
      {
        id: 'bib-2-20',
        title: 'Gartner Hype Cycle Methodology',
        slug: '/bibliography-2-20-gartner-hype-cycle-methodology-2025',
      },
      {
        id: 'bib-2-21',
        title: 'Diffusion of Innovations (Organizational)',
        slug: '/bibliography-2-21-diffusion-of-innovations-organizational-rogers-1962',
      },
    ],
  },
}
