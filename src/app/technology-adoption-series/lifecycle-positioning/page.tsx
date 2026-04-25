import type { Metadata } from 'next'
import Link from 'next/link'

import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import { assetPath } from '@/lib/assetPath'
import { parseSimpleMarkdown } from '@/lib/simple-markdown'
import {
  TechnologyAdoptionSeriesSlideMarkdown,
  splitTechnologyAdoptionSeriesSlideSections,
} from '@/components/technology-adoption-series/slide-render'
import { getTechnologyAdoptionSeriesSlides } from '@/lib/technology-adoption-series'
import {
  LIFECYCLE_SLIDE_SET,
  LIFECYCLE_SLIDE_NUMBERS,
  LIFECYCLE_SLIDE_DESCRIPTIONS,
} from './constants'

export const metadata: Metadata = {
  title: 'Technology Lifecycle Positioning - Focused Briefing',
  description:
    'A focused lifecycle-positioning briefing: adoption foundations, the dual-curve target zone, transition signals, and decision lenses across hardware, supply chain, and AI/ML.',
}

export const dynamic = 'force-static'

export default async function LifecyclePositioningPage() {
  const allSlides = await getTechnologyAdoptionSeriesSlides()
  const order: Record<number, number> = Object.fromEntries(
    LIFECYCLE_SLIDE_NUMBERS.map((number, idx) => [number, idx])
  )
  const slides = allSlides
    .filter((s) => LIFECYCLE_SLIDE_SET.has(s.number))
    .sort((a, b) => (order[a.number] ?? 999) - (order[b.number] ?? 999))

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Technology Lifecycle Positioning</h1>

        <p className="mb-4 text-lg text-gray-700">
          Where a technology sits in its lifecycle - from bleeding edge to end of support - shapes
          every decision about adoption, architecture, and investment. This focused deck moves from
          adoption foundations to the dual-curve target zone, then applies clear decision lenses to
          hardware, supply chain, and AI/ML examples.
        </p>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong>Estimated time:</strong> ~30 minutes for presentation, ~45 minutes with
            discussion.
          </span>
        </div>

        <section className="mt-6 mb-10" aria-label="Embedded lifecycle positioning presentation">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold text-slate-400">
                  Loading presentation…
                </div>
                <div className="h-1 w-32 mx-auto overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan-500/60" />
                </div>
              </div>
            </div>
            <iframe
              title="Technology Lifecycle Positioning presentation"
              src={assetPath('/technology-adoption-series/lifecycle-positioning/presentation')}
              className="relative z-10 h-full w-full"
              loading="lazy"
              allow="fullscreen"
              allowFullScreen
            />
          </div>

          <div className="mt-4 grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/technology-adoption-series/lifecycle-positioning/presentation"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM2 2.75A.75.75 0 012.75 2h4.5a.75.75 0 010 1.5H4.56l3.22 3.22a.75.75 0 01-1.06 1.06L3.5 4.56v2.69a.75.75 0 01-1.5 0v-4.5zm14.5 0a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5z" />
                </svg>
                Launch Standard (HD)
              </Link>
              <Link
                href="/technology-adoption-series/lifecycle-positioning/presentation/4k"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM2 2.75A.75.75 0 012.75 2h4.5a.75.75 0 010 1.5H4.56l3.22 3.22a.75.75 0 01-1.06 1.06L3.5 4.56v2.69a.75.75 0 01-1.5 0v-4.5zm14.5 0a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5z" />
                </svg>
                Launch High-Res (4K)
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Use arrow keys or swipe to navigate &middot; Press{' '}
              <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                ?
              </kbd>{' '}
              for all shortcuts
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className={H2_CLASSES}>Included slides</h2>
          <p className="mb-4 text-gray-700">
            This focused presentation includes {LIFECYCLE_SLIDE_NUMBERS.length} slides drawn from
            the full teaching series, covering lifecycle positioning with emphasis on transition
            signals and practical decision-making.
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            {slides.map((slide) => (
              <li key={slide.number}>
                <Link
                  href={`#slide-${slide.number}`}
                  className="text-blue-700 hover:underline font-medium"
                >
                  Slide {slide.number}: {slide.title}
                </Link>
                {LIFECYCLE_SLIDE_DESCRIPTIONS[slide.number] ? (
                  <span className="text-gray-600">
                    {' '}
                    - {LIFECYCLE_SLIDE_DESCRIPTIONS[slide.number]}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10" aria-label="Slide-by-slide content">
          <h2 className={H2_CLASSES}>Slide-by-slide reference</h2>
          <div className="space-y-10">
            {slides.map((slide) => {
              const sections = splitTechnologyAdoptionSeriesSlideSections(slide.contentMarkdown)
              const contentNodes = parseSimpleMarkdown(sections.content)

              return (
                <section
                  key={slide.segment}
                  id={`slide-${slide.number}`}
                  className="scroll-mt-24"
                  aria-label={`Slide ${slide.number}: ${slide.title}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      Slide {slide.number}: {slide.title}
                    </h3>
                    <Link
                      href={`/technology-adoption-series/${slide.segment}`}
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
                </section>
              )
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className={H2_CLASSES}>Context</h2>
          <p className="text-gray-700">
            These slides are part of the{' '}
            <Link
              href="/technology-adoption-series"
              className="text-blue-700 hover:underline font-medium"
            >
              Technology Adoption Teaching Series
            </Link>
            , a 35-slide deck covering adoption definitions, strategic frameworks, lifecycle
            planning, and success patterns. This focused page extracts the lifecycle positioning
            topic and presents it as a compact briefing for workshops, leadership updates, and
            self-study.
          </p>
        </section>
      </article>
    </main>
  )
}
