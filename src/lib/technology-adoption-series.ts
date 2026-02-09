import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { normalizeQuotedTitle, slugify } from '@/lib/slugify'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '@/data/technology-adoption-teaching-series'

export type TechnologyAdoptionSeriesSlide = {
  number: number
  title: string
  segment: string
  contentMarkdown: string
}

export type TechnologyAdoptionSeriesResource = {
  id: string
  title: string
  segment: string
  contentMarkdown: string
}

export type TechnologyAdoptionSeriesNavItem = {
  id: string
  kind: 'overview' | 'resource' | 'slide'
  title: string
  href: string
}

const SERIES_DECK_PATH = path.join(
  process.cwd(),
  'content',
  'technology-adoption-series',
  '01-core-presentation-deck.md'
)

const SERIES_RESOURCES_DIR = path.join(process.cwd(), 'content', 'technology-adoption-series')

const pad2 = (value: number) => String(value).padStart(2, '0')

const normalizeSlideTitle = (rawTitle: string) => normalizeQuotedTitle(rawTitle)

const buildSegment = (slideNumber: number, slideTitle: string) => {
  const titleSlug = slugify(slideTitle)
  return `slide-${pad2(slideNumber)}-${titleSlug || `slide-${pad2(slideNumber)}`}`
}

const stripTrailingSeparator = (markdown: string) => markdown.replace(/\n---\n\s*$/, '').trim()

export async function getTechnologyAdoptionSeriesSlides(): Promise<
  TechnologyAdoptionSeriesSlide[]
> {
  const file = await readFile(SERIES_DECK_PATH, 'utf8')

  const slideHeadingRegex = /^###\s+Slide\s+(\d+)(?:\s+\(Optional\))?:\s*(.+?)\s*$/gm
  const matches = Array.from(file.matchAll(slideHeadingRegex))

  if (matches.length === 0) {
    throw new Error(
      'No slides found in technology adoption series deck. Expected headings like: "### Slide 1: ..."'
    )
  }

  const slides: TechnologyAdoptionSeriesSlide[] = matches.map((match, index) => {
    const number = Number(match[1])
    const rawTitle = match[2]
    const title = normalizeSlideTitle(rawTitle)

    const headingStart = match.index ?? 0
    const headingEnd = headingStart + match[0].length

    const nextHeadingStart = matches[index + 1]?.index ?? file.length

    const rawSlice = file.slice(headingEnd, nextHeadingStart)

    const contentMarkdown = stripTrailingSeparator(rawSlice)

    return {
      number,
      title,
      segment: buildSegment(number, title),
      contentMarkdown,
    }
  })

  // Sort defensively in case the markdown file is reordered.
  slides.sort((a, b) => a.number - b.number)

  return slides
}

export async function getTechnologyAdoptionSeriesSlideBySegment(segment: string) {
  const slides = await getTechnologyAdoptionSeriesSlides()
  return slides.find((slide) => slide.segment === segment) || null
}

export async function getTechnologyAdoptionSeriesResources(): Promise<
  TechnologyAdoptionSeriesResource[]
> {
  const resources: TechnologyAdoptionSeriesResource[] = []

  for (const resource of technologyAdoptionTeachingSeriesResources) {
    const filePath = path.join(SERIES_RESOURCES_DIR, resource.sourceFile)
    const contentMarkdown = (await readFile(filePath, 'utf8')).trim()

    resources.push({
      id: resource.id,
      title: resource.title,
      segment: resource.segment,
      contentMarkdown,
    })
  }

  return resources
}

export async function getTechnologyAdoptionSeriesResourceBySegment(segment: string) {
  const resources = await getTechnologyAdoptionSeriesResources()
  return resources.find((resource) => resource.segment === segment) || null
}

const normalizeHref = (href: string) => {
  const trimmed = href.trim()
  if (!trimmed) return ''
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash
}

export async function getTechnologyAdoptionSeriesNavItems(): Promise<
  TechnologyAdoptionSeriesNavItem[]
> {
  const rootSlug = technologyAdoptionTeachingSeries.root.slug

  const resources = await getTechnologyAdoptionSeriesResources()
  const slides = await getTechnologyAdoptionSeriesSlides()

  return [
    {
      id: 'overview',
      kind: 'overview',
      title: 'Series overview',
      href: rootSlug,
    },
    ...resources.map((resource) => ({
      id: `resource:${resource.segment}`,
      kind: 'resource' as const,
      title: resource.title,
      href: `${rootSlug}/${resource.segment}`,
    })),
    ...slides.map((slide) => ({
      id: `slide:${slide.number}`,
      kind: 'slide' as const,
      title: `Slide ${slide.number}: ${slide.title}`,
      href: `${rootSlug}/${slide.segment}`,
    })),
  ]
}

export async function getTechnologyAdoptionSeriesPrevNext(currentHref: string) {
  const normalizedCurrent = normalizeHref(currentHref)
  const items = await getTechnologyAdoptionSeriesNavItems()
  const normalizedItems = items.map((item) => ({ ...item, href: normalizeHref(item.href) }))

  const index = normalizedItems.findIndex((item) => item.href === normalizedCurrent)
  if (index === -1) return null

  return {
    prev: index > 0 ? normalizedItems[index - 1] : null,
    next: index < normalizedItems.length - 1 ? normalizedItems[index + 1] : null,
  }
}
