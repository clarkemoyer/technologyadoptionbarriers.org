import React from 'react'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
const Article23Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Article 2.3: Managing the Lifecycle – The Gartner Hype Cycle</h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article23Page
