import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Key Findings — TABS Results',
  description:
    'Forthcoming inferential statistics, regression models, factor analysis, and hypothesis tests from the Technology Adoption Barriers Survey.',
  alternates: {
    canonical: '/results/findings',
  },
}

const FindingsPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/results" className="hover:text-blue-600 hover:underline">
                Results
              </Link>
              <span className="mx-2" aria-hidden="true">
                &rsaquo;
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Key Findings
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Key Findings</h1>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            This page will present the inferential statistical results from the Technology Adoption
            Barriers Survey, including regression models, factor analysis, and hypothesis tests.
            These analyses are currently in progress and will be published here as they are
            completed.
          </p>
        </section>

        {/* ── Coming Soon ── */}
        <section className="mb-12 text-gray-800">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4 text-gray-300" aria-hidden="true">
              &#9670;
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">
              Inferential Analysis Coming Soon
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6 font-sans text-base">
              The TABS research team is currently conducting inferential analyses including
              regression modeling, exploratory factor analysis, and hypothesis testing. Results will
              be published here with full transparency into methods and code.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Regression Models
              </span>
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Factor Analysis
              </span>
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Hypothesis Tests
              </span>
              <span className="inline-block bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600">
                Effect Sizes
              </span>
            </div>
          </div>
        </section>

        {/* ── Available Results ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Available Results</h2>
          <p className={PARAGRAPH_CLASSES}>
            While inferential analyses are in progress, the following descriptive and psychometric
            results are already available:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <Link
              href="/results/descriptive"
              className="block rounded-xl border border-green-200 bg-green-50 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <h3 className="text-base font-semibold text-green-900 mb-1">
                Descriptive Statistics
              </h3>
              <p className="text-sm text-green-800">
                Grand means, standard deviations, and inter-construct correlations for all three
                constructs.
              </p>
            </Link>
            <Link
              href="/results/reliability"
              className="block rounded-xl border border-purple-200 bg-purple-50 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <h3 className="text-base font-semibold text-purple-900 mb-1">Scale Reliability</h3>
              <p className="text-sm text-purple-800">
                Cronbach&rsquo;s alpha across all five sample definitions, demonstrating excellent
                internal consistency.
              </p>
            </Link>
            <Link
              href="/results/sensitivity"
              className="block rounded-xl border border-rose-200 bg-rose-50 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <h3 className="text-base font-semibold text-rose-900 mb-1">Sensitivity Analysis</h3>
              <p className="text-sm text-rose-800">
                Every metric computed across five sample definitions to demonstrate robustness.
              </p>
            </Link>
            <Link
              href="/results/sample"
              className="block rounded-xl border border-blue-200 bg-blue-50 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <h3 className="text-base font-semibold text-blue-900 mb-1">
                Sample &amp; Demographics
              </h3>
              <p className="text-sm text-blue-800">
                Sample sizes and participant demographics across all sample definitions.
              </p>
            </Link>
          </div>
        </section>

        {/* ── Subscribe ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Subscribe for Updates</h2>
          <p className={PARAGRAPH_CLASSES}>
            Want to be notified when the full findings are published? Visit our Get Involved page to
            learn how you can stay connected with the TABS project and receive updates on new
            results.
          </p>
          <Link
            href="/get-involved"
            className="inline-flex items-center px-6 py-3 bg-tabs-teal-deep text-white rounded-lg hover:bg-teal-800 transition-colors font-sans text-sm font-medium"
          >
            Get Involved
          </Link>
        </section>

        {/* ── Back Link ── */}
        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <Link href="/results" className="text-blue-600 hover:underline">
              &larr; Back to Results Overview
            </Link>
          </p>
        </section>
      </article>
    </main>
  )
}

export default FindingsPage
