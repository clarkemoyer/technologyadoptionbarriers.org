import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Where We Need To Be: SEO Strategy — Making of TABS',
  description:
    'The strategic roadmap for transforming the Technology Adoption Barriers project from an isolated academic repository into an authoritative organic resource.',
  alternates: {
    canonical: '/making-of-tabs/seo/strategy',
  },
}

const StrategyRoadmapPage = () => {
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
            <li>
              <Link href="/making-of-tabs/seo" className="hover:text-blue-600 hover:underline">
                SEO Benchmarking
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Strategy Roadmap
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Where We Need To Be: Strategy Roadmap</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Drawing directly from our{' '}
            <Link
              href="/making-of-tabs/seo/baseline-audit"
              className="text-blue-600 hover:underline"
            >
              baseline audit
            </Link>
            , we have formulated a strict, phased roadmap designed to establish the TABS project as
            the preeminent, authoritative resource on enterprise technology resistance.
          </p>
          <p className="mb-6">
            In a post-search generative AI landscape, discoverability relies equally on structured
            data (helping language models understand context) and topical clusters (earning
            traditional algorithmic trust).
          </p>
        </section>

        {/* ── Pillar 1 ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>1. Establishing Topical Authority Clusters</h2>
          <p className="mb-6">
            Currently, our extensive research sits in large, monolithic structures (like the
            comprehensive survey models). To capture targeted organic queries, we need semantic{' '}
            <em>hub-and-spoke</em> clusters around primary industry challenges:
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Hub: Change Management Resistance</h3>
              <p className="text-sm text-gray-700">
                Create dedicated pages dissecting <em>why</em> end-users reject software
                (Psychological vs. Workflow disruption), linking directly into the deeper
                socio-technical survey models.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Hub: Executive SaaS Purchasing Flaws</h3>
              <p className="text-sm text-gray-700">
                Spin off executive-focused briefs discussing vendor over-promising and the
                &quot;Silver Bullet Fallacy,&quot; anchoring these firmly to our CMO data and
                persona guides.
              </p>
            </div>
          </div>
        </section>

        {/* ── Pillar 2 ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>2. Conversational AI Optimization (AIO)</h2>
          <p className="mb-6">
            As Large Language Models (LLMs) increasingly mediate search behavior, raw keyword
            density matters less than semantic context and factual formatting. Our roadmap
            specifically targets AI-driven search paradigms:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-700">
            <li>
              <strong>Schema.org Implementation:</strong> Widespread deployment of `Article`,
              `FAQPage`, and generalized `Organization` structured data elements across all Next.js
              layouts.
            </li>
            <li>
              <strong>Q&amp;A Formatting:</strong> Structuring page sub-headers explicitly as the
              conversational questions potential researchers are asking (e.g.,{' '}
              <em>
                &quot;What are the most common psychological barriers to enterprise software?&quot;
              </em>
              ).
            </li>
            <li>
              <strong>Factual Density:</strong> Prioritizing quantitative lists, markdown tables,
              and unambiguous statistics (like our live Qualtrics metrics) that LLMs reliably scrape
              and synthesize.
            </li>
          </ul>
        </section>

        {/* ── Pillar 3 ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>3. The Technical Polish</h2>
          <p className="mb-6">
            While Next.js provides excellent foundational speed, we will implement the following
            mechanical optimizations iteratively throughout Q3 and Q4 2026:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-700">
            <li>
              Rewrite and standardize all static meta descriptions to exactly 150-160 characters.
            </li>
            <li>
              Establish strict canonical URL enforcement across trailing slashes to prevent
              duplicate indexing anomalies.
            </li>
            <li>
              Generate dynamic internal reference linking (automating cross-links between persona
              guides and exact survey findings).
            </li>
          </ul>
        </section>

        {/* ── Footer Nav ── */}
        <section className="pt-8 border-t border-gray-200 flex justify-between">
          <Link
            href="/making-of-tabs/seo/baseline-audit"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <span className="mr-2">←</span>
            Prev: Where We Are Now
          </Link>
          <Link
            href="/making-of-tabs/seo/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            Next: Performance Dashboard
            <span className="ml-2">→</span>
          </Link>
        </section>
      </article>
    </main>
  )
}

export default StrategyRoadmapPage
