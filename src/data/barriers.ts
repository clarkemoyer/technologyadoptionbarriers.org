export type Barrier = {
  id: string
  name: string
  description: string
  category: 'financial' | 'technical' | 'organizational' | 'psychological'
  examples?: string[]
}

// Technology Adoption Barriers based on research from live site
// Source: https://technologyadoptionbarriers.org/barriers/
export const barriers: Barrier[] = [
  {
    id: 'cost',
    name: 'Cost',
    description:
      'Financial constraints including expenses for acquiring, implementing, and maintaining new technologies. This encompasses hardware, software, training, and ongoing support costs.',
    category: 'financial',
    examples: [
      'High upfront investment required',
      'Training and certification costs',
      'Ongoing maintenance and subscription fees',
      'Infrastructure upgrade expenses',
    ],
  },
  {
    id: 'lack-of-awareness',
    name: 'Lack of Awareness or Understanding',
    description:
      'Insufficient knowledge about available technologies or their potential benefits. Often due to inadequate information, marketing, or educational resources.',
    category: 'organizational',
    examples: [
      'Not knowing about available solutions',
      'Misunderstanding technology capabilities',
      'Insufficient market education',
      'Poor communication of benefits',
    ],
  },
  {
    id: 'fear-of-change',
    name: 'Fear of Change',
    description:
      'Resistance to altering existing routines or learning new skills. Particularly common in established organizations and among individuals comfortable with current processes.',
    category: 'psychological',
    examples: [
      'Comfort with existing workflows',
      'Anxiety about learning curves',
      'Concern about job security',
      'Reluctance to abandon familiar tools',
    ],
  },
  {
    id: 'complexity',
    name: 'Complexity',
    description:
      'Technology perceived as too complicated or difficult to learn and use. High complexity can lead to hesitation, slow adoption, or complete rejection.',
    category: 'technical',
    examples: [
      'Steep learning curve',
      'Complex user interfaces',
      'Difficult configuration processes',
      'Overwhelming feature sets',
    ],
  },
  {
    id: 'compatibility',
    name: 'Compatibility Issues',
    description:
      'New technologies may not integrate smoothly with existing systems, requiring substantial changes, upgrades, or workarounds.',
    category: 'technical',
    examples: [
      'Legacy system integration challenges',
      'Data migration difficulties',
      'API incompatibilities',
      'Platform-specific limitations',
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Limitations',
    description:
      'Lack of supporting infrastructure such as reliable internet connectivity, modern hardware, or adequate IT support.',
    category: 'technical',
    examples: [
      'Inadequate bandwidth or connectivity',
      'Outdated hardware requirements',
      'Insufficient IT resources',
      'Geographic infrastructure gaps',
    ],
  },
  {
    id: 'skill-gap',
    name: 'Skill Gap',
    description:
      'Rapid technological advancement may outpace the ability to acquire necessary skills, making it difficult for organizations and individuals to keep up.',
    category: 'organizational',
    examples: [
      'Insufficient training programs',
      'Fast-moving technology landscape',
      'Limited access to expertise',
      'Certification requirements',
    ],
  },
  {
    id: 'security-concerns',
    name: 'Security Concerns',
    description:
      'New technologies often introduce new security risks and compliance challenges that must be carefully evaluated and mitigated.',
    category: 'technical',
    examples: [
      'Data privacy concerns',
      'Cybersecurity vulnerabilities',
      'Regulatory compliance requirements',
      'Risk of data breaches',
    ],
  },
  {
    id: 'stakeholder-buy-in',
    name: 'Stakeholder Buy-in',
    description:
      'Difficulty in securing support and commitment from employees, management, or other key stakeholders for technology adoption initiatives.',
    category: 'organizational',
    examples: [
      'Management resistance',
      'Employee pushback',
      'Lack of executive sponsorship',
      'Competing organizational priorities',
    ],
  },
  {
    id: 'clear-objectives',
    name: 'Lack of Clear Objectives',
    description:
      'Absence of well-defined goals and success metrics for technology adoption, leading to confusion, misalignment, and failed implementations.',
    category: 'organizational',
    examples: [
      'Undefined success criteria',
      'Misaligned expectations',
      'No measurement framework',
      'Unclear ROI targets',
    ],
  },
]

// Barrier categories for filtering and organization
export const barrierCategories = [
  { id: 'financial', name: 'Financial', description: 'Cost and budget-related barriers' },
  { id: 'technical', name: 'Technical', description: 'Technology and infrastructure challenges' },
  {
    id: 'organizational',
    name: 'Organizational',
    description: 'Process, training, and knowledge barriers',
  },
  {
    id: 'psychological',
    name: 'Psychological',
    description: 'Change resistance and fear-related barriers',
  },
] as const
