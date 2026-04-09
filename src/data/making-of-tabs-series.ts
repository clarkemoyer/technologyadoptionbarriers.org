export interface MakingOfTabsItem {
  title: string
  href: string
  children?: MakingOfTabsItem[]
}

export const makingOfTabsSeries: MakingOfTabsItem[] = [
  { title: 'Making of TABS', href: '/making-of-tabs' },
  {
    title: 'Technical Integrations',
    href: '/making-of-tabs/integrations',
    children: [{ title: 'Cloudflare', href: '/making-of-tabs/integrations/cloudflare' }],
  },
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
