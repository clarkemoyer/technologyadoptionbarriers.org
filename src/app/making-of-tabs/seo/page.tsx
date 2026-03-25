import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SEO Transparency — Making of TABS',
  description:
    'Our public roadmap and factual baseline for improving the organic discoverability of the Technology Adoption Barriers project in an evolving search landscape.',
  alternates: {
    canonical: '/making-of-tabs/seo',
  },
}

const SEOTransparencyPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              SEO Benchmarking & Transparency
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>SEO Transparency</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Establishing organic discoverability is a critical phase for the{' '}
            <strong>Technology Adoption Boundaries Substrate (TABS)</strong> project. In an era
            where post-search generative AI and traditional search engines shape how non-profit
            research is found, ensuring our rigorous data is easily accessible is paramount.
          </p>
          <p className="mb-6">
            Search Engine Optimization (SEO) is often treated as a secretive marketing discipline.
            However, in alignment with our open-source and open-data philosophy, we treat SEO as an
            infrastructural transparency issue. We are publishing our baseline findings, keyword
            gaps, and technical roadmap publicly so researchers and other non-profits can learn from
            our journey.
          </p>
        </section>

        {/* ── Navigation Cards ── */}
        <section className="mb-12">
          <h2 className={H2_CLASSES}>Explore Our SEO Journey</h2>
          <p className="mb-6 text-gray-800">
            Dive into the factual data and strategic trajectory of our organic reach optimization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Audit */}
            <Link
              href="/making-of-tabs/seo/baseline-audit"
              className="group block p-6 border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-500 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                  Where We Are Now
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                A factual look at our initial baseline metrics, keyword gaps, and the results of our
                comprehensive technical on-page SEO audit.
              </p>
            </Link>

            {/* Strategy Roadmap */}
            <Link
              href="/making-of-tabs/seo/strategy"
              className="group block p-6 border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-500 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                  Where We Need To Be
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                Our strategic roadmap for establishing topical authority, improving metadata
                consistency, and securing long-term organic reach.
              </p>
            </Link>

            {/* Dashboard */}
            <Link
              href="/making-of-tabs/seo/dashboard"
              className="group block p-6 border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-500 hover:shadow-md transition-all duration-300 md:col-span-2"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tabs-teal text-white flex items-center justify-center font-bold text-lg">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-tabs-teal">
                  SEO Performance Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                A static snapshot of our ongoing SEO metrics and technical health benchmarks.
              </p>
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}

export default SEOTransparencyPage
