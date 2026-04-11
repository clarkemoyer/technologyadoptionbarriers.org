import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import { MakingOfTabsNav } from '@/components/making-of-tabs-nav'

export const metadata: Metadata = {
  title: 'Bibliography & Citations Review — Making of TABS',
  description: 'Gemini 3.1 Pro validity check of the TABS comprehensive bibliography.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/bibliography-and-citations',
  },
}

export default function Page() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <MakingOfTabsNav>
        <article className={ARTICLE_CLASSES}>
          <h1 className={H1_CLASSES}>Bibliography & Citations Review</h1>

          <section className="mb-10 text-gray-800">
            <p className="mb-6">
              A critical component of the validity check was ensuring the accuracy of the academic
              citations and the comprehensive series bibliography.
            </p>
            <h2 className={H2_CLASSES}>Citation Accuracy</h2>
            <p className="mb-4">
              <strong>Verification Status:</strong>{' '}
              <span className="text-green-600 font-bold">Verified Accurate</span>
            </p>
            <p className="mb-4">
              Gemini 3.1 Pro cross-referenced dozens of citations across the site. The review
              confirmed that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Author names are spelled correctly and listed in the proper order.</li>
              <li>Publication years match the original seminal papers.</li>
              <li>Journal titles, volume numbers, and issue numbers are accurate.</li>
              <li>
                The APA formatting style is consistently applied across all bibliography pages.
              </li>
            </ul>
            <h2 className={H2_CLASSES}>Data Integrity</h2>
            <p className="mb-4">
              In addition to academic citations, the review audited the static data files (
              <code>barriers.ts</code>, <code>impact.json</code>). The data structures were found to
              be valid, and the categorization of barriers aligns logically with the theoretical
              frameworks discussed in the articles.
            </p>
            <div className="mt-8 flex justify-between">
              <Link
                href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks"
                className="text-blue-600 hover:underline font-medium"
              >
                ← Previous: Cloud & AI Frameworks
              </Link>
              <Link
                href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/conclusion"
                className="text-blue-600 hover:underline font-medium"
              >
                Next: Conclusion →
              </Link>
            </div>
          </section>
        </article>
      </MakingOfTabsNav>
    </main>
  )
}
