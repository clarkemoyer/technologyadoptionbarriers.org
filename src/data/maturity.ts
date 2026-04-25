export type MaturityItem = {
  id: string
  name: string
  /**
   * Must match the exact Survey Item (Question Text) in concept-mapping-simple.json
   * so that the tooltip lookup by description works correctly.
   */
  description: string
  category:
    | 'financial-value-management'
    | 'innovation-strategic-capability'
    | 'process-operational-management'
    | 'data-analytics-governance'
    | 'risk-resilience'
    | 'strategy-architecture'
    | 'workforce-talent'
    | 'change-adoption-leadership'
  examples?: string[]
}

// Perceived Maturity of Organizational Capabilities - Official TABS Survey Items
// Source: TABS Survey Section D (https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO)
export const maturityItems: MaturityItem[] = [
  {
    id: 'it-investment-value',
    name: 'IT Investment & Value Management',
    description:
      "IT Investment & Value Management: How mature is your organization's approach to selecting, managing, and realizing value from IT investments, ensuring clear alignment with strategic objectives and mission impact?",
    category: 'financial-value-management',
    examples: [
      'Business cases are required for all significant IT investments',
      'Benefits realization reviews assess whether investments delivered expected value',
      'IT portfolio management prioritizes initiatives by strategic impact',
      'Total cost of ownership is calculated before approving technology purchases',
    ],
  },
  {
    id: 'it-innovation',
    name: 'IT-Enabled Organizational Innovation',
    description:
      "IT-Enabled Organizational Innovation: How mature is your organization's capability to systematically identify, explore, and leverage technology for driving organizational innovation, developing new services/products, or achieving significant operational/mission improvements?",
    category: 'innovation-strategic-capability',
    examples: [
      'A structured process exists to scan for and evaluate emerging technologies',
      'Technology-enabled innovation labs or pilot programs are established',
      'Staff are incentivized to propose technology-driven improvements',
      'Innovation outcomes are tracked and linked to mission impact metrics',
    ],
  },
  {
    id: 'process-management',
    name: 'Organizational Process Management & Standardization',
    description:
      'Organizational Process Management & Standardization: How mature is the consistency, standardization, effectiveness, and integration of key organizational processes (e.g., project management, service delivery, operational workflows) that are critical for technology adoption and sustained performance?',
    category: 'process-operational-management',
    examples: [
      'Project management methodology (e.g., PMI, Agile) is used consistently across the organization',
      'Process documentation is maintained and updated with each change',
      'Service delivery standards are defined, measured, and regularly reviewed',
      'Cross-functional process integration reduces handoff delays and rework',
    ],
  },
  {
    id: 'data-governance-analytics',
    name: 'Data Governance & Analytics for Decision-Making',
    description:
      "Data Governance & Analytics for Decision-Making: How mature is your organization's approach to governing its data assets, ensuring data quality, and utilizing data analytics and business intelligence to inform strategic and operational decision-making and drive improvements?",
    category: 'data-analytics-governance',
    examples: [
      'A data governance council oversees data standards and stewardship',
      'Executive dashboards powered by real-time analytics guide strategic decisions',
      'Data quality scorecards are reviewed monthly by data stewards',
      'Predictive models inform program planning and resource allocation',
    ],
  },
  {
    id: 'tech-risk-resilience',
    name: 'Technology Risk & Resilience Management',
    description:
      "Technology Risk & Resilience Management: How mature is your organization's integrated approach to identifying, assessing, proactively managing, and governing technology-related risks (including cybersecurity, data privacy, vendor risks, and operational disruptions) to ensure business resilience and compliance?",
    category: 'risk-resilience',
    examples: [
      'A formal enterprise risk register includes technology-specific risks',
      'Cybersecurity assessments are conducted at least annually using a recognized framework',
      'Business continuity and disaster recovery plans are tested and updated regularly',
      'Vendor risk assessments are performed before onboarding new technology partners',
    ],
  },
  {
    id: 'strategic-it-planning',
    name: 'Strategic IT Planning & Enterprise Architecture',
    description:
      "Strategic IT Planning & Enterprise Architecture: How mature are the processes for developing, communicating, governing, and adapting an overall IT strategy and enterprise architecture that are dynamically aligned with and support the organization's overarching mission, goals, and evolving needs?",
    category: 'strategy-architecture',
    examples: [
      'A multi-year IT strategic plan is aligned with the organizational strategic plan',
      'Enterprise architecture principles guide technology selection and integration decisions',
      'IT strategy is reviewed and updated annually with leadership input',
      'Technology roadmaps communicate planned investments across the organization',
    ],
  },
  {
    id: 'workforce-capability',
    name: 'Workforce Capability & Talent Development',
    description:
      "Workforce Capability & Talent Development: How mature is your organization's systematic approach to planning for, attracting, developing, retaining, and managing personnel with the necessary skills, competencies, and roles to effectively implement, manage, support, and leverage technology?",
    category: 'workforce-talent',
    examples: [
      'Technology competency frameworks define required skills for all IT-related roles',
      'Succession plans address gaps for critical technology positions',
      'Learning and development budgets support ongoing technology upskilling',
      'Retention strategies target key technical and digital talent',
    ],
  },
  {
    id: 'change-leadership',
    name: 'Change Leadership & Adoption Management',
    description:
      "Change Leadership & Adoption Management: How mature is your organization's capability to effectively lead and manage the complex organizational, cultural, and human aspects of change associated with significant technology adoption, digital transformation initiatives, and new ways of working?",
    category: 'change-adoption-leadership',
    examples: [
      'Dedicated change management resources are assigned to major technology projects',
      'Stakeholder engagement strategies address resistance proactively',
      'Adoption metrics measure utilization and satisfaction post-deployment',
      'Leadership visibly models and champions adoption of new technologies',
    ],
  },
]

// Maturity categories for filtering and organization
export const maturityCategories = [
  {
    id: 'financial-value-management',
    name: 'Financial & Value Management',
    description: 'IT investment selection, portfolio management, and benefits realization',
  },
  {
    id: 'innovation-strategic-capability',
    name: 'Innovation & Strategic Capability',
    description: 'Technology-enabled innovation and new service/product development',
  },
  {
    id: 'process-operational-management',
    name: 'Process & Operational Management',
    description: 'Consistency, standardization, and integration of key organizational processes',
  },
  {
    id: 'data-analytics-governance',
    name: 'Data & Analytics Governance',
    description: 'Data asset governance, quality assurance, and analytics for decision-making',
  },
  {
    id: 'risk-resilience',
    name: 'Risk & Resilience',
    description:
      'Integrated management of technology-related risks including cybersecurity and business continuity',
  },
  {
    id: 'strategy-architecture',
    name: 'Strategy & Architecture',
    description: 'IT strategic planning and enterprise architecture aligned with mission',
  },
  {
    id: 'workforce-talent',
    name: 'Workforce & Talent',
    description: 'Systematic approach to developing and retaining technology-capable personnel',
  },
  {
    id: 'change-adoption-leadership',
    name: 'Change & Adoption Leadership',
    description: 'Leading organizational and cultural change to support technology adoption',
  },
] as const
