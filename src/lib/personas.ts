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
      'As a CEO, you set the strategic vision for technology adoption. Your perspective on organizational barriers and enablers is invaluable for understanding how technology decisions cascade throughout organizations.',
    whyItMatters: [
      'Your strategic perspective shapes how your organization perceives and addresses technology adoption challenges',
      'Understanding barriers at the executive level helps identify patterns in how C-suite leaders view organizational obstacles',
      'Your experience with digital transformation contributes to research on leadership perceptions across industries',
    ],
    whatYouGet: [
      'Contribute to research on how different C-suite roles perceive technology adoption barriers',
      'Access summary findings on common barriers identified by senior leaders',
      'Help advance understanding of leadership perspectives on organizational technology challenges',
      'Receive insights on patterns in how executives view adoption obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cfo',
    slug: 'cfo',
    title: 'Chief Financial Officer',
    shortTitle: 'CFO',
    description:
      'As a CFO, you understand the financial implications of technology investments. Your perspective on budgeting constraints and financial risk management is critical for understanding how financial leaders perceive technology adoption barriers.',
    whyItMatters: [
      'Financial considerations are often perceived as a primary barrier to technology adoption',
      'Your insights on budget allocation reveal how CFOs view investment trade-offs and constraints',
      'Understanding financial governance perspectives helps identify patterns in how financial leaders assess adoption challenges',
    ],
    whatYouGet: [
      'Contribute to research comparing how CFOs vs. other C-suite roles perceive technology barriers',
      'Access findings on financial barriers most commonly identified by senior leaders',
      'Help researchers understand differences in how financial vs. technical leaders view adoption obstacles',
      'Receive insights on patterns in executive perceptions of technology investment challenges',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cio',
    slug: 'cio',
    title: 'Chief Information Officer',
    shortTitle: 'CIO',
    description:
      'As a CIO, you lead technology strategy and implementation. Your frontline perspective on technical barriers, integration challenges, and organizational resistance provides crucial insights into how technical leaders perceive adoption obstacles.',
    whyItMatters: [
      'You bridge the gap between business strategy and technical execution, offering a unique perspective on barriers',
      'Your experience reveals how CIOs perceive technology implementation challenges differently than other executives',
      'Understanding IT infrastructure perspectives helps identify patterns in how technical leaders view adoption obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CIOs perceive barriers compared to other C-suite roles',
      'Access findings on technical barriers most commonly identified by IT leaders',
      'Help researchers understand differences in how technical vs. business leaders view adoption challenges',
      'Receive insights on patterns in how executives perceive technology governance obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'ciso',
    slug: 'ciso',
    title: 'Chief Information Security Officer',
    shortTitle: 'CISO',
    description:
      'As a CISO, security and compliance shape your technology decisions. Your perspective on risk management and balancing innovation with protection is essential for understanding how security leaders perceive adoption challenges.',
    whyItMatters: [
      'Security concerns are increasingly central to how organizations perceive technology adoption challenges',
      'Your perspective on risk tolerance reveals how CISOs view barriers differently than other executives',
      'Understanding security perspectives helps identify patterns in how security leaders assess adoption obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CISOs perceive barriers compared to other C-suite roles',
      'Access findings on security-related barriers most commonly identified by security leaders',
      'Help researchers understand differences in how security vs. business leaders view innovation challenges',
      'Receive insights on patterns in executive perceptions of security and compliance obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'coo',
    slug: 'coo',
    title: 'Chief Operating Officer',
    shortTitle: 'COO',
    description:
      'As a COO, you oversee operational efficiency and process integration. Your perspective on workflow disruption and operational readiness reveals how operations leaders perceive critical adoption barriers.',
    whyItMatters: [
      'Operational considerations shape how COOs perceive technology adoption challenges',
      'Your insights on process integration reveal how operations leaders view implementation obstacles differently',
      'Understanding operational perspectives helps identify patterns in how COOs assess change management barriers',
    ],
    whatYouGet: [
      'Contribute to research on how COOs perceive barriers compared to other C-suite roles',
      'Access findings on operational barriers most commonly identified by operations leaders',
      'Help researchers understand differences in how operational vs. technical leaders view adoption challenges',
      'Receive insights on patterns in executive perceptions of process transformation obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cmo',
    slug: 'cmo',
    title: 'Chief Marketing Officer',
    shortTitle: 'CMO',
    description:
      'As a CMO, you drive customer-facing technology and data-driven marketing. Your perspective on marketing technology and digital transformation reveals how marketing leaders perceive adoption challenges.',
    whyItMatters: [
      'Marketing technology perspectives reveal how CMOs view customer-facing adoption challenges',
      'Your insights on data integration show how marketing leaders perceive analytics barriers differently',
      'Understanding marketing perspectives helps identify patterns in how CMOs assess technology adoption obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CMOs perceive barriers compared to other C-suite roles',
      'Access findings on marketing technology barriers most commonly identified by marketing leaders',
      'Help researchers understand differences in how marketing vs. technical leaders view adoption challenges',
      'Receive insights on patterns in executive perceptions of customer technology obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cto',
    slug: 'cto',
    title: 'Chief Technology Officer',
    shortTitle: 'CTO',
    description:
      'As a CTO, you lead technology innovation and product development. Your perspective on emerging technologies and technical debt reveals how technology leaders perceive innovation barriers.',
    whyItMatters: [
      'Your role offers unique insights on how CTOs perceive the balance between innovation and stability',
      'Technical debt perspectives reveal how technology leaders view infrastructure barriers differently',
      'Understanding CTO perspectives helps identify patterns in how technology leaders assess innovation obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CTOs perceive barriers compared to other C-suite roles',
      'Access findings on innovation barriers most commonly identified by technology leaders',
      'Help researchers understand differences in how technical vs. business leaders view emerging technology challenges',
      'Receive insights on patterns in executive perceptions of technical debt and innovation obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cso',
    slug: 'cso',
    title: 'Chief Strategy Officer',
    shortTitle: 'CSO',
    description:
      'As a CSO, you align technology with business strategy. Your perspective on strategic planning and competitive positioning reveals how strategy leaders perceive technology adoption challenges.',
    whyItMatters: [
      'Strategic alignment perspectives are critical for understanding how CSOs view technology adoption',
      'Your insights on competitive dynamics reveal how strategy leaders perceive investment barriers differently',
      'Understanding strategic perspectives helps identify patterns in how CSOs assess technology governance obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CSOs perceive barriers compared to other C-suite roles',
      'Access findings on strategic barriers most commonly identified by strategy leaders',
      'Help researchers understand differences in how strategic vs. operational leaders view adoption challenges',
      'Receive insights on patterns in executive perceptions of technology alignment obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'chro',
    slug: 'chro',
    title: 'Chief Human Resources Officer',
    shortTitle: 'CHRO',
    description:
      'As a CHRO, you understand the people side of technology adoption. Your perspective on workforce readiness, training, and change resistance reveals how HR leaders perceive organizational barriers.',
    whyItMatters: [
      'People and culture perspectives are often critical to understanding perceived barriers to technology adoption',
      'Your insights on change management reveal how CHROs view workforce challenges differently than other executives',
      'Understanding HR perspectives helps identify patterns in how people leaders assess cultural and training obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CHROs perceive barriers compared to other C-suite roles',
      'Access findings on human factors barriers most commonly identified by HR leaders',
      'Help researchers understand differences in how people vs. technical leaders view adoption challenges',
      'Receive insights on patterns in executive perceptions of organizational culture and readiness obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'cro',
    slug: 'cro',
    title: 'Chief Revenue Officer',
    shortTitle: 'CRO',
    description:
      'As a CRO, you drive revenue growth through technology-enabled sales and customer success. Your perspective on sales technology reveals how revenue leaders perceive adoption barriers.',
    whyItMatters: [
      'Revenue technology perspectives reveal how CROs view customer-facing adoption challenges',
      'Your insights on sales enablement show how revenue leaders perceive technology barriers differently',
      'Understanding CRO perspectives helps identify patterns in how revenue leaders assess customer technology obstacles',
    ],
    whatYouGet: [
      'Contribute to research on how CROs perceive barriers compared to other C-suite roles',
      'Access findings on revenue technology barriers most commonly identified by revenue leaders',
      'Help researchers understand differences in how revenue vs. technical leaders view adoption challenges',
      'Receive insights on patterns in executive perceptions of sales and customer technology obstacles',
    ],
    surveyUrl: SURVEY_URL,
  },
  {
    id: 'other',
    slug: 'other',
    title: 'Other Senior Leadership Role',
    shortTitle: 'Other',
    description:
      'As a senior leader in your organization, your perspective on technology adoption barriers is valuable. Your unique role provides insights that help build a complete picture of how different leadership positions perceive organizational challenges.',
    whyItMatters: [
      'Technology adoption perspectives involve many stakeholders beyond traditional C-suite roles',
      'Your unique viewpoint adds depth to understanding how different leaders perceive organizational barriers',
      'Diverse leadership perspectives help identify perception patterns that might otherwise be missed',
    ],
    whatYouGet: [
      'Contribute to research on how different leadership roles perceive technology barriers',
      'Access findings on common barriers identified by senior leaders across various positions',
      'Help researchers understand the breadth of perspectives on technology adoption challenges',
      'Receive insights on patterns in how executives across different roles perceive adoption obstacles',
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
