import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 1.2: The Game Changer — A Deep Dive into TAM (Coming Soon)',
  description:
    'Coming soon: a deep dive into the Technology Acceptance Model (TAM) and what drives perceived usefulness, ease of use, and adoption.',
}

const Article12Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.2: The Game Changer – A Deep Dive into the Technology Acceptance Model (TAM)
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article12Page
