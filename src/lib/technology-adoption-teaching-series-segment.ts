import { slugify } from '@/lib/slugify'

const pad2 = (value: number) => String(value).padStart(2, '0')

export const buildTeachingSeriesSlideId = (slideNumber: number) => `slide-${pad2(slideNumber)}`

export const buildTeachingSeriesSlideSegment = (slideNumber: number, slideTitle: string) => {
  const titleSlug = slugify(slideTitle)
  const slidePrefix = buildTeachingSeriesSlideId(slideNumber)

  return `${slidePrefix}-${titleSlug || slidePrefix}`
}
