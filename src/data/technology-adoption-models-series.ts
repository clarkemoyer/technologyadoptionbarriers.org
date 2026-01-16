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
}

export interface SeriesBranch {
  id: string
  title: string
  slug: string
  articles: SeriesArticle[]
}

export interface SeriesStructure {
  root: {
    title: string
    slug: string
  }
  branches: SeriesBranch[]
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
        },
        {
          id: 'article-1-2',
          title:
            'Article 1.2: The Game Changer – A Deep Dive into the Technology Acceptance Model (TAM)',
          slug: '/article-1-2-the-game-changer-a-deep-dive-into-the-technology-acceptance-model-tam',
        },
        {
          id: 'article-1-3',
          title:
            'Article 1.3: Expanding the Classic – The Evolution to TAM 2, TAM 3, and C-TAM-TPB',
          slug: '/article-1-3-expanding-the-classic-the-evolution-to-tam-2-tam-3-and-c-tam-tpb',
        },
        {
          id: 'article-1-4',
          title:
            'Article 1.4: The Grand Unification – The Unified Theory of Acceptance and Use of Technology (UTAUT)',
          slug: '/article-1-4-the-grand-unification-the-unified-theory-of-acceptance-and-use-of-technology-utaut',
        },
        {
          id: 'article-1-5',
          title: 'Article 1.5: Beyond the Office – UTAUT2, Consumer Context, and Modern Syntheses',
          slug: '/article-1-5-beyond-the-office-utaut2-consumer-context-and-modern-syntheses',
        },
        {
          id: 'article-1-6',
          title: 'Article 1.6: Context is King – Specialized Individual Adoption Models',
          slug: '/article-1-6-context-is-king-specialized-individual-adoption-models',
        },
        {
          id: 'article-1-7',
          title: 'Article 1.7: Are You Ready? The Role of Technology Readiness (TRI & TRAM)',
          slug: '/article-1-7-are-you-ready-the-role-of-technology-readiness-tri-and-tram',
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
        },
        {
          id: 'article-2-2',
          title: 'Article 2.2: From Chaos to Control – A Guide to Maturity Models',
          slug: '/article-2-2-from-chaos-to-control-a-guide-to-maturity-models',
        },
        {
          id: 'article-2-3',
          title: 'Article 2.3: Managing the Lifecycle – The Gartner Hype Cycle',
          slug: '/article-2-3-managing-the-lifecycle-the-gartner-hype-cycle',
        },
        {
          id: 'article-2-4',
          title: 'Article 2.4: The Blueprint for Enterprise – A Survey of Architecture Frameworks',
          slug: '/article-2-4-the-blueprint-for-enterprise-a-survey-of-architecture-frameworks',
        },
        {
          id: 'article-2-5',
          title: 'Article 2.5: The Modern Mandate – Frameworks for Cybersecurity and Risk',
          slug: '/article-2-5-the-modern-mandate-frameworks-for-cybersecurity-and-risk',
        },
        {
          id: 'article-2-6',
          title: 'Article 2.6: The Cloud Revolution – Prescriptive Adoption Frameworks',
          slug: '/article-2-6-the-cloud-revolution-prescriptive-adoption-frameworks',
        },
        {
          id: 'article-2-7',
          title: 'Article 2.7: The AI Frontier – Frameworks for Adopting AI, ML, and GenAI',
          slug: '/article-2-7-the-ai-frontier-frameworks-for-adopting-ai-ml-and-genai',
        },
      ],
    },
  ],
}
