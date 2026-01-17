import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 1.7: Are You Ready? — Technology Readiness (TRI & TRAM) (Coming Soon)',
  description:
    'Coming soon: how Technology Readiness (TRI) and TRAM explain optimism, innovativeness, discomfort, and insecurity in adoption decisions.',
}

const Article17Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.7: Are You Ready? The Role of Technology Readiness (TRI & TRAM)
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article17Page
