import React from 'react'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
const Article22Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 2.2: From Chaos to Control – A Guide to Maturity Models
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article22Page
