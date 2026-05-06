import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Methodology: Gemini 3.1 Review - Making of TABS',
  description: 'The methodology used by Gemini 3.1 Pro to audit the TABS content.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/methodology',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Methodology: Gemini 3.1 Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            To ensure a thorough and unbiased audit, Gemini 3.1 Pro employed a systematic
            methodology to extract, analyze, and verify the content across the TABS repository.
          </p>
          <h2 className={H2_CLASSES}>1. Content Extraction</h2>
          <p className="mb-4">
            The first phase involved reading the core content files directly from the source code.
            This included:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>
              <strong>Article Pages:</strong> Extracting the text from all{' '}
              <code>src/app/article-*</code> directories, covering both Branch 1 (Individual
              User&apos;s Journey) and Branch 2 (Organization&apos;s Playbook).
            </li>
            <li>
              <strong>Data Files:</strong> Analyzing <code>src/data/barriers.ts</code>,{' '}
              <code>impact.json</code>, <code>qualtrics-metrics.json</code>, and{' '}
              <code>disposition-summary.json</code> to ensure data integrity.
            </li>
            <li>
              <strong>Bibliographies:</strong> Reviewing the comprehensive series bibliography and
              individual article citations.
            </li>
          </ul>
          <h2 className={H2_CLASSES}>2. Verification via Pattern Matching</h2>
          <p className="mb-4">
            Given the massive volume of text, Gemini 3.1 Pro utilized advanced search techniques,
            including <code>grep_search</code> and PowerShell&apos;s <code>Select-String</code>, to
            rapidly isolate academic citations. By searching for patterns like{' '}
            <code>&quot;19|20&quot;</code> (representing publication years), the model could
            efficiently extract and cross-reference all author attributions and dates without
            exceeding context windows.
          </p>
          <h2 className={H2_CLASSES}>3. Cross-Referencing</h2>
          <p className="mb-4">
            Extracted claims were then cross-referenced against Gemini 3.1 Pro&apos;s internal
            knowledge base of peer-reviewed literature, industry standards, and historical records.
            The model specifically looked for:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Anachronisms (e.g., citing a model before it was invented).</li>
            <li>Misattributions (e.g., crediting the wrong author for a framework).</li>
            <li>
              Conceptual inaccuracies (e.g., misrepresenting the core constructs of TAM or TOGAF).
            </li>
          </ul>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Back to Review Overview
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Psychological Models →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
