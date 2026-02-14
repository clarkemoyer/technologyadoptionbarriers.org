import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: Technology Acceptance Model 3 (TAM3) – Venkatesh & Bala (2008)',
  description:
    'Deep dive into Technology Acceptance Model 3 (TAM3) Primary Authors: by Viswanath Venkatesh and Hillol Bala Year of Publication:  2008 Research (2008), exploring its foundational contributions to technology adoption research.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Technology Acceptance Model 3 (TAM3) – Venkatesh & Bala (2008)
        </h1>

        {/* Model Identification */}
        <section className="mb-8 sm:mb-12 bg-gray-50 p-6 rounded-lg">
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Technology Acceptance Model 3 (TAM3) Primary Authors:
            </p>
            <p>
              <strong>Authors:</strong> Viswanath Venkatesh and Hillol Bala Year of Publication:
              2008 Research
            </p>
            <p>
              <strong>Publication Date:</strong> 2008
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono">
              Venkatesh, V ., & Bala, H. (2008). Technology Acceptance Model 3 and a research agenda
              on interventions. MIS Quarterly, 32(1), 157- 178.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="mb-8 sm:mb-12">
          <p className="mt-8 text-sm italic text-gray-600">
            Note: This article provides an overview based on the comprehensive literature review.
            Readers are encouraged to consult the original publication for complete details.
          </p>
        </section>

        {/* Navigation */}
        <section className="mt-12 pt-6 border-t border-gray-200">
          <a
            href="/article-bibliography-comprehensive-series-bibliography"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Complete Bibliography
          </a>
        </section>
      </article>
    </main>
  )
}

export default BibliographyArticlePage
