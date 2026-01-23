import { personas } from '@/lib/personas'

export interface NavLink {
  label: string
  path: string
  isExternal?: boolean
}

export interface NavSection {
  title: string
  path?: string // Optional main link for the section title
  links: NavLink[]
}

export interface PersonaNavigationStructure {
  root: {
    title: string
    path: string
  }
  columns: {
    individuals: NavSection
    organizations: NavSection
  }
}

export const personaNavigation: PersonaNavigationStructure = {
  root: {
    title: 'See Yourself in the Survey',
    path: '/start',
  },
  columns: {
    individuals: {
      title: 'For Individual Leaders',
      path: '/start',
      links: personas.map((persona) => ({
        label: `${persona.title} (${persona.shortTitle})`,
        path: `/start/${persona.slug}`,
      })),
    },
    organizations: {
      title: 'For Organizations',
      path: '/for-organizations',
      links: [
        { label: 'YPO - Chief Executives', path: 'https://www.ypo.org/', isExternal: true },
        {
          label: 'FEI - Financial Executives',
          path: 'https://www.financialexecutives.org/',
          isExternal: true,
        },
        { label: 'IMA - Management Accountants', path: 'https://www.imanet.org', isExternal: true },
        { label: '(ISC)² - Cybersecurity', path: 'https://www.isc2.org', isExternal: true },
        { label: 'ISACA - IT Governance', path: 'https://www.isaca.org', isExternal: true },
        { label: 'ASCM - COO/Supply Chain', path: 'https://www.ascm.org/', isExternal: true },
        { label: 'AMA - Marketing', path: 'https://www.ama.org/', isExternal: true },
        { label: 'SHRM - Human Resources', path: 'https://www.shrm.org/', isExternal: true },
        {
          label: 'Pavilion - Revenue/CRO',
          path: 'https://www.joinpavilion.com/',
          isExternal: true,
        },
        {
          label: 'IASP - Strategy',
          path: 'https://www.strategyassociation.org/',
          isExternal: true,
        },
      ],
    },
  },
}
