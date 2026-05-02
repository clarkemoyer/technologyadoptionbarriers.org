export interface MakingOfTabsItem {
  title: string
  href: string
  /** When true, item is a non-navigable grouping header (excluded from prev/next) */
  isGroup?: boolean
  children?: MakingOfTabsItem[]
}

export const makingOfTabsSeries: MakingOfTabsItem[] = [
  { title: 'Making of TABS', href: '/making-of-tabs' },
  { title: 'Content Architecture', href: '/making-of-tabs/content-architecture' },
  { title: 'Development Workflow', href: '/making-of-tabs/development-workflow' },
  { title: 'Automation Infrastructure', href: '/making-of-tabs/automation-infrastructure' },
  { title: 'Accessibility', href: '/making-of-tabs/accessibility' },
  {
    title: 'Open Source & Community',
    href: '/making-of-tabs/open-source',
    children: [
      {
        title: 'Research Value',
        href: '/making-of-tabs/open-source/research-value',
      },
    ],
  },
  { title: 'TABS Presentation', href: '/making-of-tabs/tabs-presentation' },
  {
    title: 'AI-Assisted Development',
    href: '/making-of-tabs/ai-assisted-development',
    children: [
      {
        title: 'The Overnight Shift',
        href: '/making-of-tabs/ai-assisted-development/overnight-shift',
      },
      {
        title: 'The Squash Merge Incident',
        href: '/making-of-tabs/ai-assisted-development/squash-merge-incident',
      },
      {
        title: 'The 50-Reviewer Process',
        href: '/making-of-tabs/ai-assisted-development/50-reviewer-process',
      },
    ],
  },
  {
    title: 'AI Validity Checks',
    href: '/making-of-tabs/ai-validity-checks',
    children: [
      {
        title: 'Gemini 3.1 Review',
        href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review',
        children: [
          {
            title: 'Methodology',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/methodology',
          },
          {
            title: 'Psychological Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models',
          },
          {
            title: 'Sociological Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models',
          },
          {
            title: 'Specialized Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models',
          },
          {
            title: 'Unified Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models',
          },
          {
            title: 'Cloud & AI Frameworks',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks',
          },
          {
            title: 'Enterprise Architecture',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture',
          },
          {
            title: 'Maturity Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models',
          },
          {
            title: 'Strategic Models',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models',
          },
          {
            title: 'Bibliography & Citations',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/bibliography-and-citations',
          },
          {
            title: 'Conclusion',
            href: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/conclusion',
          },
        ],
      },
    ],
  },
  {
    title: 'Technical Integrations',
    href: '/making-of-tabs/integrations',
    children: [
      { title: 'Cloudflare', href: '/making-of-tabs/integrations/cloudflare' },
      { title: 'GitHub', href: '/making-of-tabs/integrations/github' },
      { title: 'Google Analytics', href: '/making-of-tabs/integrations/google-analytics' },
      { title: 'Google Jules', href: '/making-of-tabs/integrations/google-jules' },
      { title: 'Microsoft Clarity', href: '/making-of-tabs/integrations/microsoft-clarity' },
      { title: 'Prolific', href: '/making-of-tabs/integrations/prolific' },
      { title: 'Qualtrics', href: '/making-of-tabs/integrations/qualtrics' },
    ],
  },
  {
    title: 'SEO Transparency',
    href: '/making-of-tabs/seo',
  },
  {
    title: 'Mind Maps',
    href: '/making-of-tabs/mind-maps',
    children: [
      {
        title: 'Full Mind Map',
        href: '/making-of-tabs/mind-maps/full-mind-map',
      },
      {
        title: 'Business Management Models',
        href: '/making-of-tabs/mind-maps/business-management-models',
      },
      {
        title: 'IT & IT Management Models',
        href: '/making-of-tabs/mind-maps/it-management-models',
      },
      {
        title: 'Enterprise & IT Architecture',
        href: '/making-of-tabs/mind-maps/enterprise-it-architecture',
      },
      {
        title: 'Project, Program & Risk Management',
        href: '/making-of-tabs/mind-maps/project-program-risk-management',
      },
      {
        title: 'Standards & Regulations',
        href: '/making-of-tabs/mind-maps/standards-regulations',
      },
      {
        title: 'TABS Project Operations',
        href: '/making-of-tabs/mind-maps/tabs-project-operations',
      },
      {
        title: 'Culminating Research Project',
        href: '/making-of-tabs/mind-maps/culminating-research-project',
      },
    ],
  },
  { title: 'CMO Survey Inspiration', href: '/making-of-tabs/cmo-survey' },
]

export function flattenMakingOfTabsSeries(): Array<{
  title: string
  href: string
}> {
  const result: Array<{ title: string; href: string }> = []
  function walk(items: MakingOfTabsItem[]) {
    for (const item of items) {
      if (!item.isGroup) {
        result.push({ title: item.title, href: item.href })
      }
      if (item.children) walk(item.children)
    }
  }
  walk(makingOfTabsSeries)
  return result
}
