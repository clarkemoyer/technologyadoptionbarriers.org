import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import { assetPath } from '@/lib/assetPath'

export const metadata: Metadata = {
  title: 'TABS Presentation | The Making of TABS',
  description:
    'Interactive TABS presentation slides, embedded for easy viewing and sharing from the Making of TABS section.',
}

const TabsPresentationEmbedPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>TABS Presentation</h1>

        <p className="mb-6 text-gray-800">
          This is the interactive TABS presentation (8 slides). Use arrow keys or the on-screen
          controls to navigate.
        </p>

        <div className="mb-4 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            href={assetPath('/tabs-presentation')}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open full-screen
          </a>
          <Link
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            href="/making-of-tabs"
          >
            Back to The Making of TABS
          </Link>
          <Link
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            href="/"
          >
            Back to Home
          </Link>
        </div>

        <section className="mt-8">
          <h2 className={H2_CLASSES}>Embedded Presentation</h2>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <iframe
              title="TABS Presentation"
              src={assetPath('/tabs-presentation')}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Tip: click inside the presentation before using keyboard navigation.
          </p>
        </section>
      </article>
    </main>
  )
}

export default TabsPresentationEmbedPage
