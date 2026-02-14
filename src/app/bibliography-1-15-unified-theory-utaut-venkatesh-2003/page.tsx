import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title:
    'Bibliography: Unified Theory of Acceptance and Use of Technology (UTAUT) – Venkatesh et al. (2003)',
  description:
    'Deep dive into Unified Theory of Acceptance and Use of Technology by Viswanath Venkatesh, Michael G. Morris, (2003), exploring its foundational contributions to technology adoption research.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Unified Theory of Acceptance and Use of Technology (UTAUT) – Venkatesh et al. (2003)
        </h1>

        {/* Model Identification */}
        <section className="mb-8 sm:mb-12 bg-gray-50 p-6 rounded-lg">
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Unified Theory of Acceptance and Use of Technology
            </p>
            <p>
              <strong>Authors:</strong> Viswanath Venkatesh, Michael G. Morris,
            </p>
            <p>
              <strong>Publication Date:</strong> 2003
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono"></p>
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
