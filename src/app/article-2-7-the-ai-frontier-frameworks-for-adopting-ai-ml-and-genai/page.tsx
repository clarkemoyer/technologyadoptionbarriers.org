import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 2.7: The AI Frontier — Frameworks for Adopting AI/ML/GenAI (Coming Soon)',
  description:
    'Coming soon: organizational frameworks for adopting AI, ML, and GenAI, including governance, risk, and capability building.',
}

const Article27Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 2.7: The AI Frontier – Frameworks for Adopting AI, ML, and GenAI
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article27Page
