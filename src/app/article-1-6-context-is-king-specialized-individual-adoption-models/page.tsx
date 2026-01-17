import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 1.6: Context is King — Specialized Individual Adoption Models (Coming Soon)',
  description:
    'Coming soon: specialized models that explain individual adoption in specific contexts, beyond general-purpose acceptance frameworks.',
}

const Article16Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.6: Context is King – Specialized Individual Adoption Models
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article16Page
