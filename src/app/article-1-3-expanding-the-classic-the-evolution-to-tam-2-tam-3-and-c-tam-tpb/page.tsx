import React from 'react'
import type { Metadata } from 'next'

import SeriesNavigation from '@/components/series-navigation'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Article 1.3: Expanding the Classic — TAM2, TAM3, and C-TAM-TPB (Coming Soon)',
  description:
    'Coming soon: how TAM evolved through TAM2, TAM3, and C-TAM-TPB to incorporate social influence, experience, and behavioral control.',
}

const Article13Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.3: Expanding the Classic – The Evolution to TAM 2, TAM 3, and C-TAM-TPB
        </h1>
        <p className="text-[20px] text-gray-600">Coming soon</p>
        <SeriesNavigation />
      </article>
    </main>
  )
}

export default Article13Page
