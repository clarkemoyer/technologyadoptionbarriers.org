export interface MakingOfTabsItem {
  title: string
  href: string
  children?: MakingOfTabsItem[]
}

export const makingOfTabsSeries: MakingOfTabsItem[] = [
  { title: 'Making of TABS', href: '/making-of-tabs' },
  {
    title: 'AI-Assisted Development',
    href: '/making-of-tabs/ai-assisted-development',
  },
  {
    title: 'Content Architecture',
    href: '/making-of-tabs/content-architecture',
  },
  {
    title: 'Development Workflow',
    href: '/making-of-tabs/development-workflow',
  },
  { title: 'Data Analysis', href: '/making-of-tabs/data-analysis' },
  {
    title: 'Reproducible Analysis',
    href: '/making-of-tabs/reproducible-analysis',
  },
  {
    title: 'Automation Infrastructure',
    href: '/making-of-tabs/automation-infrastructure',
  },
  { title: 'Open Source', href: '/making-of-tabs/open-source' },
  { title: 'SEO', href: '/making-of-tabs/seo' },
  { title: 'Accessibility', href: '/making-of-tabs/accessibility' },
  {
    title: 'Technical Integrations',
    href: '/making-of-tabs/integrations',
    children: [
      { title: 'Cloudflare', href: '/making-of-tabs/integrations/cloudflare' },
      { title: 'GitHub', href: '/making-of-tabs/integrations/github' },
    ],
  },
  { title: 'CMO Survey', href: '/making-of-tabs/cmo-survey' },
  {
    title: 'AI Validity Checks',
    href: '/making-of-tabs/ai-validity-checks',
  },
  { title: 'TABS Presentation', href: '/making-of-tabs/tabs-presentation' },
]

export function flattenMakingOfTabsSeries(): Array<{
  title: string
  href: string
}> {
  const result: Array<{ title: string; href: string }> = []
  function walk(items: MakingOfTabsItem[]) {
    for (const item of items) {
      result.push({ title: item.title, href: item.href })
      if (item.children) walk(item.children)
    }
  }
  walk(makingOfTabsSeries)
  return result
}
