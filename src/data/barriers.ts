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
    examples: [
      'Employees preferring familiar tools over new systems',
      'Middle managers blocking digital transformation initiatives',
      'Staff avoiding training on new platforms',
      'Teams reverting to old processes despite new technology availability',
    ],
  },
  {
    id: 'risk-averse-culture',
    name: 'Risk-Averse Culture',
    description:
      'Organizational culture that discourages risk-taking or experimentation with new technologies.',
    category: 'organizational-cultural',
    examples: [
      'Strict approval processes that slow innovation',
      'Punishing failed pilot projects instead of learning from them',
      'Requiring extensive proof before trying new solutions',
      'Leadership emphasizing stability over innovation',
    ],
  },

  // Resource & Skill Deficiencies
  {
    id: 'insufficient-skills',
    name: 'Insufficient Skills or Expertise',
    description:
      'Insufficient skills or expertise within the workforce to utilize new technologies effectively.',
    category: 'resource-skill',
    examples: [
      'Lack of data science expertise for AI implementation',
      'No in-house cloud architecture knowledge',
      'Limited cybersecurity specialists on staff',
      'Shortage of developers familiar with modern frameworks',
    ],
  },
  {
    id: 'inadequate-training',
    name: 'Inadequate Training Programs',
    description: 'Inadequate training programs for new technologies.',
    category: 'resource-skill',
    examples: [
      'One-time training sessions with no follow-up',
      "Generic courses that don't address specific organizational needs",
      'No time allocated for staff to learn new systems',
      'Training materials outdated or poorly designed',
    ],
  },
  {
    id: 'high-cost',
    name: 'High Cost',
    description: 'High cost associated with acquiring or implementing new technologies.',
    category: 'resource-skill',
    examples: [
      'Expensive software licensing fees',
      'High upfront investment in infrastructure',
      'Costly migration from legacy systems',
      'Budget constraints limiting technology upgrades',
    ],
  },
  {
    id: 'inadequate-infrastructure',
    name: 'Inadequate IT Infrastructure',
    description:
      'Inadequate IT infrastructure (e.g., network, storage, computing power) to support new technologies.',
    category: 'resource-skill',
    examples: [
      'Slow network speeds preventing cloud adoption',
      'Outdated servers unable to handle modern applications',
      'Insufficient data storage capacity',
      'Limited bandwidth for remote work technologies',
    ],
  },

  // Strategic & Operational Challenges
  {
    id: 'lack-of-leadership-support',
    name: 'Lack of Leadership Support',
    description:
      'Lack of support or clear vision from top leadership (including the board, e.g., governing body, oversight committee).',
    category: 'strategic-operational',
    examples: [
      'Board not prioritizing technology investments',
      'Executives unclear about digital transformation goals',
      'Limited C-suite engagement in technology decisions',
      'Leadership focusing on short-term results over long-term tech strategy',
    ],
  },
  {
    id: 'legacy-integration',
    name: 'Legacy System Integration',
    description: 'Difficulty integrating new technologies with existing legacy systems.',
    category: 'strategic-operational',
    examples: [
      'Old database systems incompatible with modern APIs',
      'Custom-built legacy software without documentation',
      'Mainframe systems difficult to connect with cloud services',
      "Multiple siloed systems that don't communicate",
    ],
  },
  {
    id: 'demonstrating-value',
    name: 'Difficulty Demonstrating Value',
    description:
      'Difficulty demonstrating clear value (e.g., mission impact, public value, cost-effectiveness) for new technology investments.',
    category: 'strategic-operational',
    examples: [
      'Hard to quantify ROI for emerging technologies',
      'Long time horizon before benefits materialize',
      'Intangible benefits difficult to measure',
      'Stakeholders demanding proof before investing',
    ],
  },
  {
    id: 'no-clear-strategy',
    name: 'Lack of Clear Strategy',
    description: 'Lack of a clear strategy or roadmap for technology adoption.',
    category: 'strategic-operational',
    examples: [
      'Ad-hoc technology purchases without overall plan',
      'No defined priorities for technology initiatives',
      'Competing visions among different departments',
      'Reactive technology decisions instead of proactive planning',
    ],
  },
  {
    id: 'insufficient-governance',
    name: 'Insufficient Governance',
    description: 'Insufficient governance processes for selecting and managing new technologies.',
    category: 'strategic-operational',
    examples: [
      'No formal process for evaluating new technology vendors',
      'Unclear roles and responsibilities for technology decisions',
      'Lack of oversight on technology project progress',
      'No standard criteria for technology selection',
    ],
  },
  {
    id: 'workflow-disruption',
    name: 'Workflow Disruption',
    description: 'New technologies disrupting existing workflows or processes significantly.',
    category: 'strategic-operational',
    examples: [
      'New system requiring complete process redesign',
      'Technology changes interfering with daily operations',
      'Temporary productivity loss during transitions',
      'Disruption to established team collaboration patterns',
    ],
  },

  // Risk, Trust, & External Factors
  {
    id: 'cybersecurity-concerns',
    name: 'Cybersecurity Concerns',
    description: 'Concerns about cybersecurity risks associated with new technologies.',
    category: 'risk-trust-external',
    examples: [
      'Vulnerability to ransomware attacks',
      'Data breach risks with cloud storage',
      'Concerns about third-party vendor security',
      'Increased attack surface from IoT devices',
    ],
  },
  {
    id: 'data-privacy-concerns',
    name: 'Data Privacy Concerns',
    description: 'Concerns about data privacy compliance related to new technologies.',
    category: 'risk-trust-external',
    examples: [
      'GDPR compliance requirements for European data',
      'HIPAA regulations for healthcare technology',
      'Data residency requirements across jurisdictions',
      'Consent management for AI and analytics tools',
    ],
  },
  {
    id: 'lack-of-trust',
    name: 'Lack of Trust',
    description: 'Lack of trust in the reliability or performance of new technologies or vendors.',
    category: 'risk-trust-external',
    examples: [
      'Concerns about vendor stability and longevity',
      'Uncertainty about technology maturity',
      'Past negative experiences with similar technologies',
      'Vendor lock-in fears',
    ],
  },
  {
    id: 'regulatory-uncertainty',
    name: 'Regulatory Uncertainty',
    description: 'Uncertainty or complexity related to regulatory requirements.',
    category: 'risk-trust-external',
    examples: [
      'Evolving regulations around AI and automation',
      'Unclear compliance requirements for new technologies',
      'Conflicting regulations across different jurisdictions',
      'Potential future regulatory changes affecting technology choices',
    ],
  },
  {
    id: 'external-pressure',
    name: 'External Pressure Without Readiness',
    description:
      'Pressure to adopt technology due to external factors (e.g., mandates, public expectations, peer agency actions), without adequate internal readiness.',
    category: 'risk-trust-external',
    examples: [
      'Government mandates requiring digital services',
      'Customer expectations for mobile apps and online portals',
      'Competitive pressure from peers adopting new technologies',
      'Public demand for transparency through technology',
    ],
  },
  {
    id: 'unreliable-vendors',
    name: 'Difficulty Finding Reliable Vendors',
    description: 'Difficulty finding reliable technology vendors or partners.',
    category: 'risk-trust-external',
    examples: [
      'Limited vendors with expertise in specialized domains',
      'Vendors lacking experience with similar organizations',
      'Poor track record of vendor support and service',
      'Challenges finding vendors meeting security requirements',
    ],
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
