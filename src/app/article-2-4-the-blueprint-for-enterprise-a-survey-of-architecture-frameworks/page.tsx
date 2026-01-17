import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 2.4: The Blueprint for Enterprise — Architecture Frameworks (Coming Soon)',
  description:
    'Coming soon: a survey of enterprise architecture frameworks and how they support planning, governance, and adoption at scale.',
}

const Article24Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 2.4: The Blueprint for Enterprise – A Survey of Architecture Frameworks
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article24Page
