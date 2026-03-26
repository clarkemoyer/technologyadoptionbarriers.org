import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Where We Are Now: Baseline SEO Audit — Making of TABS',
  description:
    "A factual, transparent look at the Technology Adoption Barriers project's initial SEO metrics, technical gaps, and content discoverability challenges.",
  alternates: {
    canonical: '/making-of-tabs/seo/baseline-audit',
  },
}

const BaselineAuditPage = () => {
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
              Baseline Audit
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Where We Are Now: Baseline SEO Audit</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Before we can chart a course to maximum organic reach, we first must understand our
            starting line. In early 2026, we conducted a comprehensive review of our technical
            infrastructure, on-page SEO, and existing content gaps. The findings establish a
            baseline that is fully factual and transparent.
          </p>
        </section>

        {/* ── Technical & On-Page SEO ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>1. Technical & On-Page SEO Foundations</h2>
          <p className="mb-6">
            The foundation of our platform (built on Next.js) provides a solid starting point for
            performance and accessibility, but several organic optimization gaps remain.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Strengths</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                <li>
                  Core Web Vitals scores consistently rate above 90+ in Performance and
                  Accessibility.
                </li>
                <li>Static generation (GitHub Pages) ensures extremely fast initial page loads.</li>
                <li>
                  Valid XML sitemaps and proper canonical tagging are successfully implemented
                  across the primary application hierarchy.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <h3 className="font-bold text-gray-900 mb-2">Identified Gaps</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                <li>
                  Missing Schema.org structured data (e.g., <code>Organization</code>,{' '}
                  <code>Article</code>, <code>FAQPage</code>) severely limits rich snippet potential
                  in search engine results pages (SERPs).
                </li>
                <li>
                  Inconsistent metadata lengths: Actionable <code>description</code> tags are often
                  truncated or missing in secondary component pages.
                </li>
                <li>
                  Suboptimal Heading Hierarchy: While <code>&lt;h1&gt;</code> tags exist on most
                  pages, semantic nesting of <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code>{' '}
                  headings needs restructuring for crawler clarity.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Content & Keyword Gaps ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>2. Content Competitiveness & Keyword Disconnects</h2>
          <p className="mb-6">
            Even if a site is technically flawless, it cannot perform without answering the queries
            people are actually typing into search bars and conversational AI interfaces.
          </p>

          <p className="mb-6">
            Our keyword gap analysis revealed that while our foundational research targets
            high-value academic and enterprise keywords, our public-facing content currently
            operates in a vacuum, completely isolated from high-volume, long-tail search behavior.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Content Category
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Current State (Baseline)
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    The Disconnect
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Change Management</td>
                  <td className="p-3">
                    Mentions abstract &quot;sociological barriers&quot; deep within survey
                    methodologies.
                  </td>
                  <td className="p-3">
                    Zero visibility for highly searched &quot;change management strategies&quot; or
                    &quot;digital transformation frameworks&quot; queries.
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">C-Suite Pain Points</td>
                  <td className="p-3">
                    Strong demographic-specific breakdowns available within our persona guides.
                  </td>
                  <td className="p-3">
                    No distinct landing pages answering semantic queries like &quot;Why do
                    enterprise software rollouts fail?&quot;
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold">Academic Citations</td>
                  <td className="p-3">
                    Rigorous bibliography provided via PDF and isolated `/making-of-tabs` pages.
                  </td>
                  <td className="p-3">
                    Lack of deep-linked, semantically clustered &quot;hub&quot; articles to capture
                    academic intent queries.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Key Takeaways</h2>
          <p className="mb-6">
            Our baseline is exactly what you might expect from an academic/open-source research
            initiative: technically sound but completely oblivious to how the generalized market
            currently seeks out this information.
          </p>
          <p>
            With these factual gaps identified, we now have a clear direction for where we need to
            be.
          </p>
        </section>

        {/* ── Footer Nav ── */}
        <section className="pt-8 border-t border-gray-200 flex justify-end">
          <Link
            href="/making-of-tabs/seo/strategy"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            Next: Where We Need To Be
            <span className="ml-2">→</span>
          </Link>
        </section>
      </article>
    </main>
  )
}

export default BaselineAuditPage
