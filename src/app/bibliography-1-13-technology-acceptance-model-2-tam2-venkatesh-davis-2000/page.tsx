import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: Technology Acceptance Model 2 (TAM2) – Venkatesh & Davis (2000)',
  description:
    'Deep dive into Technology Acceptance Model Extension (TAM2) Primary by Viswanath Venkatesh and Fred D. Davis Year of Publication: (2000), exploring its foundational contributions to technology adoption research.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Technology Acceptance Model 2 (TAM2) – Venkatesh & Davis (2000)
        </h1>

        {/* Model Identification */}
        <section className="mb-8 sm:mb-12 bg-gray-50 p-6 rounded-lg">
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Technology Acceptance Model Extension (TAM2) Primary
            </p>
            <p>
              <strong>Authors:</strong> Viswanath Venkatesh and Fred D. Davis Year of Publication:
            </p>
            <p>
              <strong>Publication Date:</strong> 2000
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono">
              Venkatesh, V ., & Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. Management Science , 46(2),
              186-204.
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
