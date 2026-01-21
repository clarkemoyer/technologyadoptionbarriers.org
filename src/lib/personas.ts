/**
 * Persona configuration for TABS survey landing pages
 * Maps to Q1_Role choices in the Qualtrics instrument
 */

export interface PersonaConfig {
  id: string
  slug: string
  title: string
  shortTitle: string
  description: string
  whyItMatters: string[]
  whatYouGet: string[]
  surveyUrl: string
}

export const SURVEY_URL = 'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'

export const personas: PersonaConfig[] = [
  {
    id: 'ceo',
    slug: 'ceo',
    title: 'Chief Executive Officer',
    shortTitle: 'CEO',
    description:
      'As a CEO, you set the strategic vision for technology adoption. Your insights on organizational barriers and enablers are invaluable for understanding how technology decisions cascade throughout organizations.',
    whyItMatters: [
      'Your strategic perspective shapes how organizations approach technology adoption',
      'Understanding barriers at the executive level helps identify systemic organizational issues',
      'Your experience with digital transformation informs best practices across industries',
    ],
    whatYouGet: [
      'Benchmark your organization against industry peers on technology adoption maturity',
      'Access aggregated insights on common barriers facing C-suite leaders',
      'Receive summary reports on technology adoption trends and patterns',
      'Contribute to advancing organizational technology research',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cfo',
    slug: 'cfo',
    title: 'Chief Financial Officer',
    shortTitle: 'CFO',
    description:
      'As a CFO, you understand the financial implications of technology investments. Your perspective on ROI, budgeting constraints, and financial risk management is critical for understanding technology adoption barriers.',
    whyItMatters: [
      'Financial considerations are often the primary barrier to technology adoption',
      'Your insights on budget allocation and cost-benefit analysis inform investment decisions',
      'Understanding financial governance helps identify funding model improvements',
    ],
    whatYouGet: [
      'Benchmark financial technology adoption practices against industry standards',
      'Insights on how peer organizations justify and fund technology initiatives',
      'Data-driven perspectives on technology ROI and value realization',
      'Access to research findings on financial barriers to adoption',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cio',
    slug: 'cio',
    title: 'Chief Information Officer',
    shortTitle: 'CIO',
    description:
      'As a CIO, you lead technology strategy and implementation. Your frontline experience with technical barriers, integration challenges, and organizational resistance provides crucial insights into adoption obstacles.',
    whyItMatters: [
      'You bridge the gap between business strategy and technical execution',
      'Your experience reveals the reality of technology implementation vs. vendor promises',
      'Understanding IT infrastructure barriers helps improve enterprise architecture decisions',
    ],
    whatYouGet: [
      'Benchmark your technology stack and capabilities against similar organizations',
      'Insights on common technical barriers and proven workarounds',
      'Data on technology adoption patterns across different organizational contexts',
      'Access to research on effective IT governance and change management',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'ciso',
    slug: 'ciso',
    title: 'Chief Information Security Officer',
    shortTitle: 'CISO',
    description:
      'As a CISO, security and compliance shape your technology decisions. Your insights on risk management, security barriers, and balancing innovation with protection are essential for understanding secure adoption.',
    whyItMatters: [
      'Security concerns are increasingly central to technology adoption decisions',
      'Your perspective on risk tolerance and compliance requirements shapes organizational policies',
      'Understanding security barriers helps balance innovation with protection',
    ],
    whatYouGet: [
      'Benchmark security maturity and risk management practices',
      'Insights on how organizations balance security requirements with innovation',
      'Data on common security-related adoption barriers and mitigation strategies',
      'Access to research on effective security governance frameworks',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'coo',
    slug: 'coo',
    title: 'Chief Operating Officer',
    shortTitle: 'COO',
    description:
      'As a COO, you oversee operational efficiency and process integration. Your perspective on workflow disruption, operational readiness, and process change management reveals critical adoption barriers.',
    whyItMatters: [
      'Operational considerations often determine technology adoption success or failure',
      'Your insights on process integration reveal real-world implementation challenges',
      'Understanding operational barriers helps improve change management strategies',
    ],
    whatYouGet: [
      'Benchmark operational technology maturity and process optimization',
      'Insights on successful operational integration strategies',
      'Data on common operational barriers and proven solutions',
      'Access to research on effective operational transformation',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cmo',
    slug: 'cmo',
    title: 'Chief Marketing Officer',
    shortTitle: 'CMO',
    description:
      'As a CMO, you drive customer-facing technology and data-driven marketing. Your experience with marketing technology stacks, customer data platforms, and digital transformation provides valuable insights.',
    whyItMatters: [
      'Marketing technology adoption directly impacts customer experience and revenue',
      'Your perspective on data integration and analytics barriers is crucial',
      'Understanding marketing tech barriers helps improve customer engagement strategies',
    ],
    whatYouGet: [
      'Benchmark marketing technology capabilities and data maturity',
      'Insights on effective marketing technology stack integration',
      'Data on common martech adoption barriers and solutions',
      'Access to research on digital marketing transformation',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cto',
    slug: 'cto',
    title: 'Chief Technology Officer',
    shortTitle: 'CTO',
    description:
      'As a CTO, you lead technology innovation and product development. Your insights on emerging technologies, technical debt, and innovation barriers are essential for understanding technology evolution.',
    whyItMatters: [
      'Your role balances innovation with operational stability',
      'Technical debt and infrastructure limitations often constrain adoption',
      'Understanding innovation barriers helps accelerate technology evolution',
    ],
    whatYouGet: [
      'Benchmark technology innovation capabilities and technical maturity',
      'Insights on managing technical debt while driving innovation',
      'Data on emerging technology adoption patterns and barriers',
      'Access to research on effective technology innovation strategies',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cso',
    slug: 'cso',
    title: 'Chief Strategy Officer',
    shortTitle: 'CSO',
    description:
      'As a CSO, you align technology with business strategy. Your perspective on strategic planning, competitive positioning, and long-term technology roadmaps provides crucial insights.',
    whyItMatters: [
      'Strategic alignment is critical for successful technology adoption',
      'Your insights on competitive dynamics inform technology investment priorities',
      'Understanding strategic barriers helps improve technology governance',
    ],
    whatYouGet: [
      'Benchmark strategic technology planning and governance practices',
      'Insights on aligning technology investments with business strategy',
      'Data on strategic barriers to technology adoption',
      'Access to research on effective technology strategy development',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'chro',
    slug: 'chro',
    title: 'Chief Human Resources Officer',
    shortTitle: 'CHRO',
    description:
      'As a CHRO, you understand the people side of technology adoption. Your insights on workforce readiness, training, change resistance, and organizational culture are critical for successful adoption.',
    whyItMatters: [
      'People and culture are often the biggest barriers to technology adoption',
      'Your perspective on change management and training reveals adoption challenges',
      'Understanding workforce barriers helps improve adoption strategies',
    ],
    whatYouGet: [
      'Benchmark organizational change capability and digital literacy',
      'Insights on effective training and change management strategies',
      'Data on human factors in technology adoption success',
      'Access to research on organizational culture and technology readiness',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cro',
    slug: 'cro',
    title: 'Chief Revenue Officer',
    shortTitle: 'CRO',
    description:
      'As a CRO, you drive revenue growth through technology-enabled sales and customer success. Your perspective on revenue technology, sales enablement, and customer data integration is valuable.',
    whyItMatters: [
      'Revenue technology directly impacts business growth and customer relationships',
      'Your insights on sales technology adoption reveal critical business barriers',
      'Understanding revenue tech barriers helps improve customer-facing capabilities',
    ],
    whatYouGet: [
      'Benchmark revenue technology maturity and sales enablement capabilities',
      'Insights on effective revenue technology integration',
      'Data on barriers to sales and customer technology adoption',
      'Access to research on revenue-driven technology strategies',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'other',
    slug: 'other',
    title: 'Other Senior Leadership Role',
    shortTitle: 'Other',
    description:
      'As a senior leader in your organization, regardless of your specific title, your perspective on technology adoption barriers is valuable. Your unique role provides insights that help build a complete picture of organizational challenges.',
    whyItMatters: [
      'Technology adoption involves many stakeholders beyond traditional C-suite roles',
      'Your unique perspective adds depth to our understanding of organizational barriers',
      'Diverse leadership insights help identify barriers that might otherwise be missed',
    ],
    whatYouGet: [
      'Benchmark your organization against industry peers',
      'Access insights on common barriers facing organizational leaders',
      'Receive summary reports on technology adoption trends',
      'Contribute to comprehensive organizational technology research',
    ],
    surveyUrl: SURVEY_URL,
  },
]

/**
 * Get persona by slug
 */
export function getPersonaBySlug(slug: string): PersonaConfig | undefined {
  return personas.find((p) => p.slug === slug)
}

/**
 * Get all persona slugs for static generation
 */
export function getPersonaSlugs(): string[] {
  return personas.map((p) => p.slug)
}
