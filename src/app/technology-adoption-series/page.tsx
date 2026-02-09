import type { Metadata } from 'next'
import Link from 'next/link'

import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import { assetPath } from '@/lib/assetPath'
import { parseSimpleMarkdown } from '@/lib/simple-markdown'
import { slugify } from '@/lib/slugify'
import {
  TechnologyAdoptionSeriesSlideMarkdown,
  splitTechnologyAdoptionSeriesSlideSections,
} from '@/components/technology-adoption-series/slide-render'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '@/data/technology-adoption-teaching-series'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'

export const metadata: Metadata = {
  title: 'Technology Adoption Teaching Series — Overview',
  description:
    'A practical, slide-by-slide teaching series on technology adoption: definitions, frameworks, lifecycle planning, and adoption success patterns.',
}

export const dynamic = 'force-static'

export default async function TechnologyAdoptionSeriesPage() {
  const { root, parts } = technologyAdoptionTeachingSeries
  const slides = await getTechnologyAdoptionSeriesSlides()

  const coreSlides = slides.filter((slide) => slide.number <= 16)
  const optionalSlides = slides.filter((slide) => slide.number > 16)

  const anchorForSlide = (slideNumber: number, title: string) => {
    const suffix = slideNumber >= 17 ? `-optional-${slugify(title)}` : ''
    return `slide-${slideNumber}${suffix}`
  }

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Technology Adoption Teaching Series</h1>

        <section className="mt-6 mb-10" aria-label="Embedded slide deck">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <iframe
              title="Technology Adoption Teaching Series slide deck"
              src={assetPath('/technology-adoption-series/presentation')}
              className="h-full w-full"
              loading="lazy"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/technology-adoption-series/presentation"
              className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Open fullscreen slide deck
            </Link>
            <span className="text-sm text-gray-600">(Tip: click inside deck for keys)</span>
          </div>
        </section>

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

        <section className="mb-10" aria-label="Slide-by-slide content">
          <h2 className={H2_CLASSES}>Slide-by-slide reference</h2>
          <p className="mb-6 text-gray-700">
            Each slide below is rendered from the same source content as the full-screen deck. Use
            this section when you want to read, search, or link to specific slide content.
          </p>

          <div className="space-y-10">
            {coreSlides.map((slide) => {
              const sections = splitTechnologyAdoptionSeriesSlideSections(slide.contentMarkdown)
              const contentNodes = parseSimpleMarkdown(sections.content)
              const speakerNodes = sections.speakerNotes
                ? parseSimpleMarkdown(sections.speakerNotes)
                : []
              const transitionNodes = sections.transition
                ? parseSimpleMarkdown(sections.transition)
                : []

              return (
                <section
                  key={slide.segment}
                  id={anchorForSlide(slide.number, slide.title)}
                  className="scroll-mt-24"
                  aria-label={`Slide ${slide.number}: ${slide.title}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      Slide {slide.number}: {slide.title}
                    </h3>
                    <Link
                      href={`${root.slug}/${slide.segment}`}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Open slide page
                    </Link>
                  </div>

                  <div className="mt-4">
                    <TechnologyAdoptionSeriesSlideMarkdown
                      nodes={contentNodes}
                      slideNumber={slide.number}
                    />
                  </div>

                  {speakerNodes.length ? (
                    <details className="mt-6 rounded border border-gray-200 bg-gray-50">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
                        Speaker notes
                      </summary>
                      <div className="px-4 pb-4">
                        <TechnologyAdoptionSeriesSlideMarkdown
                          nodes={speakerNodes}
                          slideNumber={slide.number}
                        />
                      </div>
                    </details>
                  ) : null}

                  {transitionNodes.length ? (
                    <details className="mt-4 rounded border border-gray-200 bg-gray-50">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
                        Transition
                      </summary>
                      <div className="px-4 pb-4">
                        <TechnologyAdoptionSeriesSlideMarkdown
                          nodes={transitionNodes}
                          slideNumber={slide.number}
                        />
                      </div>
                    </details>
                  ) : null}
                </section>
              )
            })}

            {optionalSlides.length ? (
              <details className="rounded border border-gray-200 bg-gray-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                  Optional deep dives (Slides 17–24)
                </summary>
                <div className="mt-6 space-y-10">
                  {optionalSlides.map((slide) => {
                    const sections = splitTechnologyAdoptionSeriesSlideSections(
                      slide.contentMarkdown
                    )
                    const contentNodes = parseSimpleMarkdown(sections.content)
                    const speakerNodes = sections.speakerNotes
                      ? parseSimpleMarkdown(sections.speakerNotes)
                      : []
                    const transitionNodes = sections.transition
                      ? parseSimpleMarkdown(sections.transition)
                      : []

                    return (
                      <section
                        key={slide.segment}
                        id={anchorForSlide(slide.number, slide.title)}
                        className="scroll-mt-24"
                        aria-label={`Slide ${slide.number}: ${slide.title}`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            Slide {slide.number}: {slide.title}{' '}
                            <span className="text-gray-600">(Optional)</span>
                          </h3>
                          <Link
                            href={`${root.slug}/${slide.segment}`}
                            className="text-sm text-blue-700 hover:underline"
                          >
                            Open slide page
                          </Link>
                        </div>

                        <div className="mt-4">
                          <TechnologyAdoptionSeriesSlideMarkdown
                            nodes={contentNodes}
                            slideNumber={slide.number}
                          />
                        </div>

                        {speakerNodes.length ? (
                          <details className="mt-6 rounded border border-gray-200 bg-white">
                            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
                              Speaker notes
                            </summary>
                            <div className="px-4 pb-4">
                              <TechnologyAdoptionSeriesSlideMarkdown
                                nodes={speakerNodes}
                                slideNumber={slide.number}
                              />
                            </div>
                          </details>
                        ) : null}

                        {transitionNodes.length ? (
                          <details className="mt-4 rounded border border-gray-200 bg-white">
                            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-900">
                              Transition
                            </summary>
                            <div className="px-4 pb-4">
                              <TechnologyAdoptionSeriesSlideMarkdown
                                nodes={transitionNodes}
                                slideNumber={slide.number}
                              />
                            </div>
                          </details>
                        ) : null}
                      </section>
                    )
                  })}
                </div>
              </details>
            ) : null}
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
