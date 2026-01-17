import React from 'react'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
const Article26Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 2.6: The Cloud Revolution – Prescriptive Adoption Frameworks
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article26Page
