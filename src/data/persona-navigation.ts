import { personas } from '@/lib/personas'

export interface NavLink {
  label: string
  path: string
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
        label: persona.title,
        path: `/start/${persona.slug}`,
      })),
    },
    organizations: {
      title: 'For Organizations',
      path: '/for-organizations',
      links: [
        { label: 'Technology Leaders', path: '/for-organizations/technology-leaders' },
        { label: 'Executive Leaders', path: '/for-organizations/executive-leaders' },
        { label: 'Finance Leaders', path: '/for-organizations/finance-leaders' },
        { label: 'Operations Leaders', path: '/for-organizations/operations-leaders' },
      ],
    },
  },
}
