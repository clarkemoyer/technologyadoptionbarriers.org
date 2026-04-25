export type ReadinessItem = {
  id: string
  name: string
  /**
   * Must match the exact Survey Item (Question Text) in concept-mapping-simple.json
   * so that the tooltip lookup by description works correctly.
   */
  description: string
  category:
    | 'strategic-leadership-governance'
    | 'culture-change-readiness'
    | 'workforce-skills-readiness'
    | 'infrastructure-technology-readiness'
    | 'data-analytics-readiness'
    | 'process-operational-readiness'
    | 'financial-readiness'
  examples?: string[]
}

// Perceived Organizational Technology Readiness - Official TABS Survey Items
// Source: TABS Survey Section C (https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO)
export const readinessItems: ReadinessItem[] = [
  // Strategic Leadership & Governance
  {
    id: 'leader-vision-clarity',
    name: 'Leader Vision Clarity',
    description:
      "Clarity and communication of the leadership's vision for technology adoption and digital transformation.",
    category: 'strategic-leadership-governance',
    examples: [
      'Leaders regularly communicate a clear technology roadmap to all staff',
      'Digital transformation goals are tied to mission objectives and shared broadly',
      'C-suite actively champions specific technology adoption initiatives',
      'Technology vision is reviewed and updated at least annually',
    ],
  },
  {
    id: 'strategic-alignment',
    name: 'Strategic Alignment',
    description:
      'Alignment of technology strategy with overall organizational goals and mission objectives.',
    category: 'strategic-leadership-governance',
    examples: [
      'IT investments are evaluated against strategic plan priorities',
      'Technology projects require documented alignment with mission outcomes',
      'Budget allocation for technology reflects strategic priorities',
      'Cross-functional teams review technology decisions against organizational goals',
    ],
  },
  {
    id: 'it-governance-effectiveness',
    name: 'IT Governance Effectiveness',
    description:
      'Effectiveness of IT governance structures in guiding technology decisions and investments.',
    category: 'strategic-leadership-governance',
    examples: [
      'A formal IT steering committee reviews major technology proposals',
      'Clear policies define who can approve technology purchases',
      'Technology decisions involve both technical and business stakeholders',
      'Post-implementation reviews evaluate whether IT investments delivered value',
    ],
  },

  // Culture & Change Readiness
  {
    id: 'culture-openness',
    name: 'Culture Openness',
    description:
      'Openness of the organizational culture to embracing change and new ways of working.',
    category: 'culture-change-readiness',
    examples: [
      'Employees proactively suggest new tools or process improvements',
      'Leadership celebrates experimentation even when pilots fail',
      'Cross-department collaboration on technology projects is common',
      'Feedback loops exist to gather staff perspectives on new systems',
    ],
  },
  {
    id: 'innovation-support',
    name: 'Innovation Support',
    description:
      'Extent to which innovation and experimentation with technology are encouraged and supported.',
    category: 'culture-change-readiness',
    examples: [
      'Dedicated time or budget is set aside for technology pilots',
      'Staff can propose and test new tools without lengthy approval chains',
      'Innovation outcomes are recognized and rewarded',
      'Leadership shares examples of successful internal innovation broadly',
    ],
  },
  {
    id: 'change-management-maturity',
    name: 'Change Management Maturity',
    description: 'Maturity of change management processes to support technology transitions.',
    category: 'culture-change-readiness',
    examples: [
      'Formal change management plans accompany major technology rollouts',
      'Stakeholder impact assessments are conducted before deployment',
      'Communication plans address employee concerns during transitions',
      'Post-adoption support teams help staff adapt to new systems',
    ],
  },

  // Workforce & Skills Readiness
  {
    id: 'tech-skills-availability',
    name: 'Technical Skills Availability',
    description:
      'Availability of personnel with the necessary technical skills to implement and manage new technologies.',
    category: 'workforce-skills-readiness',
    examples: [
      'In-house staff can administer and maintain key technology platforms',
      'Specialized roles (e.g., data analysts, cloud architects) exist within the organization',
      'Skills gap analyses are conducted when evaluating new technologies',
      'Succession planning includes technical role coverage',
    ],
  },
  {
    id: 'training-effectiveness',
    name: 'Training Effectiveness',
    description: 'Effectiveness of training programs in preparing employees for new technologies.',
    category: 'workforce-skills-readiness',
    examples: [
      'Training is role-specific and tied to job tasks rather than generic',
      'Learning progress and competency are measured after training',
      'Refresher sessions and ongoing learning resources are available',
      'Training is scheduled to accommodate all affected staff',
    ],
  },

  // Infrastructure & Technology Readiness
  {
    id: 'infrastructure-adequacy',
    name: 'Infrastructure Adequacy',
    description:
      'Adequacy and scalability of the current IT infrastructure (network, cloud, hardware).',
    category: 'infrastructure-technology-readiness',
    examples: [
      'Network bandwidth supports cloud-based applications across all sites',
      'Hardware refresh cycles keep devices capable of running current software',
      'Cloud infrastructure can be scaled quickly to meet demand spikes',
      'Disaster recovery infrastructure is tested and documented',
    ],
  },
  {
    id: 'system-compatibility',
    name: 'System Compatibility',
    description:
      'Compatibility and interoperability between new technologies and existing systems.',
    category: 'infrastructure-technology-readiness',
    examples: [
      'APIs or integration layers connect core systems to new tools',
      'Data migration between legacy and modern platforms is well-documented',
      'Technology vendors are vetted for compatibility with existing stack',
      'Integration testing is required before production deployment',
    ],
  },
  {
    id: 'tech-support-availability',
    name: 'Technical Support Availability',
    description: 'Availability and responsiveness of technical support for technology users.',
    category: 'infrastructure-technology-readiness',
    examples: [
      'Help desk response times meet defined SLAs',
      'After-hours support exists for critical systems',
      'Self-service knowledge base covers common issues',
      'Dedicated support resources are available during major rollouts',
    ],
  },

  // Data & Analytics Readiness
  {
    id: 'data-governance-maturity',
    name: 'Data Governance Maturity',
    description: 'Maturity of data governance policies and practices.',
    category: 'data-analytics-readiness',
    examples: [
      'Data ownership is clearly assigned across organizational units',
      'Data classification policies dictate handling of sensitive information',
      'A data governance committee reviews policies at least annually',
      'Audit trails track data access and modifications',
    ],
  },
  {
    id: 'data-quality',
    name: 'Data Quality',
    description:
      'Overall quality and reliability of organizational data used for decision-making and AI/ML models.',
    category: 'data-analytics-readiness',
    examples: [
      'Data validation rules prevent incorrect entries at the source',
      'Regular data quality audits identify and resolve inconsistencies',
      'Duplicate records are systematically identified and merged',
      'Data lineage is documented so analysts understand data origins',
    ],
  },
  {
    id: 'analytics-capability',
    name: 'Analytics Capability',
    description: "Organization's capability in data analytics and leveraging data for insights.",
    category: 'data-analytics-readiness',
    examples: [
      'Staff can generate standard reports and dashboards without IT assistance',
      'Predictive analytics or machine learning is used for operational decisions',
      'Data literacy training is provided across non-technical departments',
      'Analytics outcomes directly inform strategic planning and budget decisions',
    ],
  },

  // Process & Operational Readiness
  {
    id: 'process-maturity',
    name: 'Process Maturity',
    description:
      'Maturity and efficiency of business processes potentially impacted by new technology.',
    category: 'process-operational-readiness',
    examples: [
      'Core workflows are documented and followed consistently',
      'Process improvements are measured and tracked over time',
      'Technology is evaluated against current and future process needs',
      'Process owners are involved in technology selection and deployment',
    ],
  },
  {
    id: 'monitoring-effectiveness',
    name: 'Monitoring Effectiveness',
    description:
      'Effectiveness of processes for monitoring technology performance and user satisfaction.',
    category: 'process-operational-readiness',
    examples: [
      'System uptime and performance dashboards are reviewed regularly',
      'User satisfaction surveys are conducted after technology rollouts',
      'Incident response processes are defined and tested',
      'KPIs for technology adoption are tracked and reported to leadership',
    ],
  },

  // Financial Readiness
  {
    id: 'financial-budget-adequacy',
    name: 'Financial Budget Adequacy',
    description:
      'Adequacy of financial budget allocated for strategic technology adoption and innovation.',
    category: 'financial-readiness',
    examples: [
      'A dedicated technology budget line exists separate from operational IT costs',
      'Multi-year budgeting accommodates the full lifecycle cost of new systems',
      'Emergency funds are available for unplanned technology needs',
      'ROI frameworks are used to justify and prioritize technology investments',
    ],
  },
]

// Readiness categories for filtering and organization
export const readinessCategories = [
  {
    id: 'strategic-leadership-governance',
    name: 'Strategic Leadership & Governance',
    description: 'Leadership vision clarity, strategic alignment, and IT governance',
  },
  {
    id: 'culture-change-readiness',
    name: 'Culture & Change Readiness',
    description: 'Organizational openness, innovation support, and change management maturity',
  },
  {
    id: 'workforce-skills-readiness',
    name: 'Workforce & Skills Readiness',
    description: 'Technical skills availability and training program effectiveness',
  },
  {
    id: 'infrastructure-technology-readiness',
    name: 'Infrastructure & Technology Readiness',
    description: 'IT infrastructure adequacy, system compatibility, and technical support',
  },
  {
    id: 'data-analytics-readiness',
    name: 'Data & Analytics Readiness',
    description: 'Data governance maturity, data quality, and analytics capability',
  },
  {
    id: 'process-operational-readiness',
    name: 'Process & Operational Readiness',
    description: 'Business process maturity and technology performance monitoring',
  },
  {
    id: 'financial-readiness',
    name: 'Financial Readiness',
    description: 'Budget adequacy for strategic technology adoption and innovation',
  },
] as const
