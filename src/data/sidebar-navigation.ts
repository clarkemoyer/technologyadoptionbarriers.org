/**
 * Sidebar Navigation — Single source of truth for all site navigation.
 *
 * Replaces nav data previously scattered across:
 * - header/index.tsx (inline menuItems)
 * - results-series.ts (results section tree)
 * - making-of-tabs-series.ts (making-of-tabs section tree)
 * - persona-navigation.ts (see-yourself personas)
 * - technology-adoption-models-series.ts (models mega-menu)
 * - technology-adoption-teaching-series.ts (teaching mega-menu)
 */

import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '@/data/technology-adoption-teaching-series'
import { resultsSeries, type ResultsSeriesItem } from '@/data/results-series'
import { makingOfTabsSeries, type MakingOfTabsItem } from '@/data/making-of-tabs-series'
import { personaNavigation } from '@/data/persona-navigation'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SidebarLink {
  title: string
  href: string
}

export interface SidebarGroup {
  title: string
  links: SidebarLink[]
}

export interface SidebarSection {
  id: string
  label: string
  icon: string
  /** When set, clicking the top-level item navigates directly (e.g. Home). */
  href?: string
  groups: SidebarGroup[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resultsToGroups(items: ResultsSeriesItem[]): SidebarGroup[] {
  const crp2026 = items.find((i) => i.title === 'CRP 2026')
  const fullDataset = items.find((i) => i.title === 'TABS Full Dataset')

  const crpLinks: SidebarLink[] = [
    { title: 'CRP Overview & Download', href: '/results/crp-2026' },
    ...(crp2026?.children?.map((c) => ({ title: c.title, href: c.href })) ?? []),
  ]

  const liveLinks: SidebarLink[] = [
    { title: 'Results Overview', href: '/results' },
    ...(fullDataset?.children?.map((c) => ({ title: c.title, href: c.href })) ?? []),
  ]

  const dashboardLinks: SidebarLink[] = items
    .filter((i) => !i.children && i.href !== '/results')
    .map((i) => ({ title: i.title, href: i.href }))

  return [
    { title: 'CRP 2026 Dataset', links: crpLinks },
    { title: 'Live Results (Updated Daily)', links: liveLinks },
    { title: 'Dashboards & Comparisons', links: dashboardLinks },
  ]
}

function makingOfTabsToGroups(items: MakingOfTabsItem[]): SidebarGroup[] {
  const howWeBuiltIt: SidebarLink[] = []
  const aiInTabs: SidebarLink[] = []
  const integrations: SidebarLink[] = []
  const dataAnalysis: SidebarLink[] = []
  const seo: SidebarLink[] = []
  const presentations: SidebarLink[] = []

  for (const item of items) {
    const link: SidebarLink = { title: item.title, href: item.href }

    if (
      [
        '/making-of-tabs',
        '/making-of-tabs/content-architecture',
        '/making-of-tabs/development-workflow',
        '/making-of-tabs/automation-infrastructure',
        '/making-of-tabs/accessibility',
        '/making-of-tabs/open-source',
      ].includes(item.href)
    ) {
      howWeBuiltIt.push(link)
    } else if (item.href.startsWith('/making-of-tabs/ai-')) {
      aiInTabs.push(link)
      if (item.children) {
        for (const child of item.children) {
          aiInTabs.push({ title: child.title, href: child.href })
          if (child.children) {
            for (const gc of child.children) {
              aiInTabs.push({ title: gc.title, href: gc.href })
            }
          }
        }
      }
    } else if (item.href.startsWith('/making-of-tabs/integrations')) {
      integrations.push(link)
      if (item.children) {
        for (const child of item.children) {
          integrations.push({ title: child.title, href: child.href })
        }
      }
    } else if (item.href.startsWith('/making-of-tabs/seo')) {
      seo.push(link)
    } else if (item.href.startsWith('/making-of-tabs/tabs-presentation')) {
      presentations.push(link)
    }
  }

  return [
    { title: 'How We Built It', links: howWeBuiltIt },
    { title: 'AI in TABS', links: aiInTabs },
    { title: 'Technical Integrations', links: integrations },
    { title: 'SEO & Transparency', links: seo },
    { title: 'Presentations', links: presentations },
  ].filter((g) => g.links.length > 0)
}

function modelsToGroups(): SidebarGroup[] {
  const series = technologyAdoptionModelsSeries
  const overview: SidebarLink[] = [{ title: 'Series Overview', href: series.root.slug }]

  const branch1Links: SidebarLink[] = [
    { title: series.branches[0].title.split('–')[0].trim(), href: series.branches[0].slug },
    ...series.branches[0].articles.map((a) => ({
      title: a.title.replace(/^Article \d+\.\d+: /, ''),
      href: a.slug,
    })),
  ]

  const branch2Links: SidebarLink[] = [
    { title: series.branches[1].title.split('–')[0].trim(), href: series.branches[1].slug },
    ...series.branches[1].articles.map((a) => ({
      title: a.title.replace(/^Article \d+\.\d+: /, ''),
      href: a.slug,
    })),
  ]

  const bibLinks: SidebarLink[] = series.bibliography
    ? [{ title: 'Series Bibliography', href: series.bibliography.slug }]
    : []

  return [
    { title: 'Series Overview', links: overview },
    { title: "Branch 1: The User's Journey", links: branch1Links },
    { title: "Branch 2: The Organization's Playbook", links: branch2Links },
    { title: 'Bibliography', links: bibLinks },
  ].filter((g) => g.links.length > 0)
}

function teachingToGroups(): SidebarGroup[] {
  const series = technologyAdoptionTeachingSeries
  const resources = technologyAdoptionTeachingSeriesResources
  const baseSlug = series.root.slug

  const groups: SidebarGroup[] = series.parts.map((part) => {
    const coreSlides = part.slides.filter((s) => !s.isOptional)
    return {
      title: part.title,
      links: coreSlides.map((s) => ({
        title: `Slide ${s.number}: ${s.title}`,
        href: `${baseSlug}/${s.segment}`,
      })),
    }
  })

  const backupSlides = series.parts.flatMap((p) => p.slides.filter((s) => s.isOptional))
  if (backupSlides.length > 0) {
    groups.push({
      title: 'Backup Slides',
      links: backupSlides.map((s) => ({
        title: `Slide ${s.number}: ${s.title}`,
        href: `${baseSlug}/${s.segment}`,
      })),
    })
  }

  if (resources.length > 0) {
    groups.push({
      title: 'Resources',
      links: resources.map((r) => ({
        title: r.title,
        href: `${baseSlug}/${r.segment}`,
      })),
    })
  }

  groups.unshift({
    title: 'Series Overview',
    links: [{ title: 'Teaching Series Overview', href: baseSlug }],
  })

  return groups
}

function surveyToGroups(): SidebarGroup[] {
  const personas = personaNavigation

  return [
    {
      title: 'Barriers',
      links: [
        { title: 'All Barriers', href: '/barriers' },
        { title: 'Barrier Quotes', href: '/barriers/quotes' },
        { title: 'Survey Statistics', href: '/barriers/survey-stats' },
      ],
    },
    {
      title: 'See Yourself',
      links: [
        { title: personas.root.title, href: personas.root.path },
        ...personas.columns.individuals.links.map((l) => ({
          title: l.label,
          href: l.path,
        })),
        ...personas.columns.organizations.links.map((l) => ({
          title: l.label,
          href: l.path,
        })),
      ],
    },
    {
      title: 'Concept Mapping',
      links: [
        { title: 'Simple Concept Map', href: '/concept-mapping/simple' },
        { title: 'Complex Concept Map', href: '/concept-mapping/complex' },
        { title: 'Summary', href: '/concept-mapping/summary' },
      ],
    },
  ]
}

function aboutToGroups(): SidebarGroup[] {
  return [
    {
      title: 'About TABS',
      links: [
        { title: 'FAQ', href: '/faq' },
        { title: 'Media & Appearances', href: '/media' },
        { title: 'Get Involved', href: '/get-involved' },
        { title: 'Privacy Policy', href: '/privacy-policy' },
        { title: 'Cookie Policy', href: '/cookie-policy' },
        { title: 'Terms of Service', href: '/terms-of-service' },
        { title: 'Contribution Policy', href: '/contribution-policy' },
        { title: 'Security Acknowledgements', href: '/security-acknowledgements' },
        { title: 'Vulnerability Disclosure', href: '/vulnerability-disclosure-policy' },
      ],
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Exported navigation tree                                           */
/* ------------------------------------------------------------------ */

export const sidebarSections: SidebarSection[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    href: '/',
    groups: [],
  },
  {
    id: 'survey',
    label: 'Survey',
    icon: '📋',
    groups: surveyToGroups(),
  },
  {
    id: 'results',
    label: 'Results',
    icon: '📊',
    groups: resultsToGroups(resultsSeries),
  },
  {
    id: 'models',
    label: 'Models',
    icon: '📚',
    groups: modelsToGroups(),
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: '🎓',
    groups: teachingToGroups(),
  },
  {
    id: 'making-of-tabs',
    label: 'Making of TABS',
    icon: '🔧',
    groups: makingOfTabsToGroups(makingOfTabsSeries),
  },
  {
    id: 'about',
    label: 'About',
    icon: 'ℹ️',
    groups: aboutToGroups(),
  },
]

/**
 * Given a pathname, return the sidebar section ID that matches.
 */
export function getActiveSectionId(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/'

  if (p === '/') return 'home'
  if (
    p.startsWith('/barriers') ||
    p.startsWith('/start') ||
    p.startsWith('/for-organizations') ||
    p.startsWith('/concept-mapping')
  )
    return 'survey'
  if (p.startsWith('/results')) return 'results'
  if (
    p.startsWith('/technology-adoption-models') ||
    p.startsWith('/article-') ||
    p.startsWith('/bibliography-')
  )
    return 'models'
  if (p.startsWith('/technology-adoption-series')) return 'teaching'
  if (p.startsWith('/making-of-tabs')) return 'making-of-tabs'
  if (
    [
      '/faq',
      '/media',
      '/get-involved',
      '/privacy-policy',
      '/cookie-policy',
      '/terms-of-service',
      '/contribution-policy',
      '/security-acknowledgements',
      '/vulnerability-disclosure-policy',
    ].includes(p)
  )
    return 'about'

  return 'home'
}
