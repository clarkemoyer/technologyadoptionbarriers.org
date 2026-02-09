import type { Metadata } from 'next'
import Link from 'next/link'

import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '@/data/technology-adoption-teaching-series'

export const metadata: Metadata = {
  title: 'Technology Adoption Teaching Series — Overview',
  description:
    'A practical, slide-by-slide teaching series on technology adoption: definitions, frameworks, lifecycle planning, and adoption success patterns.',
}

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPage() {
  const { root, parts } = technologyAdoptionTeachingSeries

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Technology Adoption Teaching Series</h1>

        <p className="mb-6">
          This series turns the presentation deck into a set of standalone articles. Each page is
          one “slide” worth of content, expanded into a readable reference you can share, link to,
          and revisit.
        </p>

        <section className="mb-10">
          <h2 className={H2_CLASSES}>Series index</h2>
          <div className="space-y-6">
            {parts.map((part) => (
              <section key={part.id} aria-label={part.title}>
                <h3 className="font-bold text-gray-900">{part.title}</h3>
                <ol className="mt-2 list-decimal pl-6 space-y-2">
                  {part.slides.map((slide) => (
                    <li key={slide.id}>
                      <Link
                        href={`${root.slug}/${slide.segment}`}
                        className="text-blue-700 hover:underline"
                      >
                        Slide {slide.number}: {slide.title}
                        {slide.isOptional ? (
                          <span className="text-gray-600"> (Optional)</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className={H2_CLASSES}>Resources</h2>
          <p className="mb-4 text-gray-700">
            Supporting materials for facilitators and participants.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            {technologyAdoptionTeachingSeriesResources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`${root.slug}/${resource.segment}`}
                  className="text-blue-700 hover:underline"
                >
                  {resource.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <TeachingSeriesNavigation />

        <p className="text-sm text-gray-600">
          Tip: Use the Previous/Next links on each slide page to read straight through.
        </p>
      </article>
    </main>
  )
}
