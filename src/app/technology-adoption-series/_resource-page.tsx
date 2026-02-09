import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'
import { parseSimpleMarkdown, RenderMarkdownNodes } from '@/lib/simple-markdown'
import {
  getTechnologyAdoptionSeriesResourceBySegment,
  getTechnologyAdoptionSeriesResources,
} from '@/lib/technology-adoption-series'

export const dynamic = 'force-static'

export async function TechnologyAdoptionSeriesResourcePage({ segment }: { segment: string }) {
  const resource = await getTechnologyAdoptionSeriesResourceBySegment(segment)
  if (!resource) notFound()

  const resources = await getTechnologyAdoptionSeriesResources()
  const index = resources.findIndex((r) => r.segment === resource.segment)
  const prev = index > 0 ? resources[index - 1] : null
  const next = index >= 0 && index < resources.length - 1 ? resources[index + 1] : null

  const nodes = parseSimpleMarkdown(resource.contentMarkdown)

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/technology-adoption-series" className="text-blue-700 hover:underline">
            Technology Adoption Teaching Series
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span aria-current="page">{resource.title}</span>
        </nav>

        <h1 className={H1_CLASSES}>{resource.title}</h1>

        <section className="mb-10">
          <RenderMarkdownNodes nodes={nodes} />
        </section>

        <nav
          aria-label="Resource navigation"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-6"
        >
          <div className="flex items-center gap-3">
            {prev ? (
              <Link
                href={`/technology-adoption-series/${prev.segment}`}
                className="inline-flex items-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                Previous: {prev.title}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded border border-gray-200 px-3 py-2 text-sm text-gray-400">
                Previous
              </span>
            )}

            {next ? (
              <Link
                href={`/technology-adoption-series/${next.segment}`}
                className="inline-flex items-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                Next: {next.title}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded border border-gray-200 px-3 py-2 text-sm text-gray-400">
                Next
              </span>
            )}
          </div>

          <Link
            href="/technology-adoption-series"
            className="text-sm text-blue-700 hover:underline"
          >
            Back to series overview
          </Link>
        </nav>

        <TeachingSeriesNavigation className="mt-10" />
      </article>
    </main>
  )
}
