export type Barrier = {
  id: string
  name: string
  description: string
  category:
    | 'organizational-cultural'
    | 'resource-skill'
    | 'strategic-operational'
    | 'risk-trust-external'
  examples?: string[]
}

// Technology Adoption Barriers - Official TABS Survey Questions
// Source: TABS Survey (https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO)
// Question: "Which of the following barriers to technology adoption does your organization face?"
export const barriers: Barrier[] = [
  // Organizational & Cultural Resistance
  {
    id: 'resistance-to-change',
    name: 'Resistance to Change',
    description: 'Resistance to change among employees or middle management.',
    category: 'organizational-cultural',
  },
  {
    id: 'risk-averse-culture',
    name: 'Risk-Averse Culture',
    description:
      'Organizational culture that discourages risk-taking or experimentation with new technologies.',
    category: 'organizational-cultural',
  },

  // Resource & Skill Deficiencies
  {
    id: 'insufficient-skills',
    name: 'Insufficient Skills or Expertise',
    description:
      'Insufficient skills or expertise within the workforce to utilize new technologies effectively.',
    category: 'resource-skill',
  },
  {
    id: 'inadequate-training',
    name: 'Inadequate Training Programs',
    description: 'Inadequate training programs for new technologies.',
    category: 'resource-skill',
  },
  {
    id: 'high-cost',
    name: 'High Cost',
    description: 'High cost associated with acquiring or implementing new technologies.',
    category: 'resource-skill',
  },
  {
    id: 'inadequate-infrastructure',
    name: 'Inadequate IT Infrastructure',
    description:
      'Inadequate IT infrastructure (e.g., network, storage, computing power) to support new technologies.',
    category: 'resource-skill',
  },

  // Strategic & Operational Challenges
  {
    id: 'lack-of-leadership-support',
    name: 'Lack of Leadership Support',
    description:
      'Lack of support or clear vision from top leadership (including the board, e.g., governing body, oversight committee).',
    category: 'strategic-operational',
  },
  {
    id: 'legacy-integration',
    name: 'Legacy System Integration',
    description: 'Difficulty integrating new technologies with existing legacy systems.',
    category: 'strategic-operational',
  },
  {
    id: 'demonstrating-value',
    name: 'Difficulty Demonstrating Value',
    description:
      'Difficulty demonstrating clear value (e.g., mission impact, public value, cost-effectiveness) for new technology investments.',
    category: 'strategic-operational',
  },
  {
    id: 'no-clear-strategy',
    name: 'Lack of Clear Strategy',
    description: 'Lack of a clear strategy or roadmap for technology adoption.',
    category: 'strategic-operational',
  },
  {
    id: 'insufficient-governance',
    name: 'Insufficient Governance',
    description: 'Insufficient governance processes for selecting and managing new technologies.',
    category: 'strategic-operational',
  },
  {
    id: 'workflow-disruption',
    name: 'Workflow Disruption',
    description: 'New technologies disrupting existing workflows or processes significantly.',
    category: 'strategic-operational',
  },

  // Risk, Trust, & External Factors
  {
    id: 'cybersecurity-concerns',
    name: 'Cybersecurity Concerns',
    description: 'Concerns about cybersecurity risks associated with new technologies.',
    category: 'risk-trust-external',
  },
  {
    id: 'data-privacy-concerns',
    name: 'Data Privacy Concerns',
    description: 'Concerns about data privacy compliance related to new technologies.',
    category: 'risk-trust-external',
  },
  {
    id: 'lack-of-trust',
    name: 'Lack of Trust',
    description: 'Lack of trust in the reliability or performance of new technologies or vendors.',
    category: 'risk-trust-external',
  },
  {
    id: 'regulatory-uncertainty',
    name: 'Regulatory Uncertainty',
    description: 'Uncertainty or complexity related to regulatory requirements.',
    category: 'risk-trust-external',
  },
  {
    id: 'external-pressure',
    name: 'External Pressure Without Readiness',
    description:
      'Pressure to adopt technology due to external factors (e.g., mandates, public expectations, peer agency actions), without adequate internal readiness.',
    category: 'risk-trust-external',
  },
  {
    id: 'unreliable-vendors',
    name: 'Difficulty Finding Reliable Vendors',
    description: 'Difficulty finding reliable technology vendors or partners.',
    category: 'risk-trust-external',
  },
]

// Barrier categories for filtering and organization
export const barrierCategories = [
  {
    id: 'organizational-cultural',
    name: 'Organizational & Cultural Resistance',
    description: 'Resistance to change and risk-averse organizational culture',
  },
  {
    id: 'resource-skill',
    name: 'Resource & Skill Deficiencies',
    description: 'Skills, training, cost, and infrastructure limitations',
  },
  {
    id: 'strategic-operational',
    name: 'Strategic & Operational Challenges',
    description: 'Leadership, integration, governance, and strategic planning issues',
  },
  {
    id: 'risk-trust-external',
    name: 'Risk, Trust, & External Factors',
    description: 'Security, privacy, trust, regulatory, and external pressure concerns',
  },
] as const
