import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Content Architecture - Making of TABS',
  description:
    'How the TABS site is organized - 149+ statically generated pages, data-driven content, SEO strategy, responsive design, and the static export approach.',
  alternates: {
    canonical: '/making-of-tabs/content-architecture',
  },
}

const ContentArchitecturePage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Content Architecture</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            What started as a single-page site has grown into 149+ statically generated pages
            covering research articles, teaching materials, bibliography entries, organizational
            resources, and project documentation. This page explains how we organize that content,
            keep it maintainable, and ensure it performs well at scale.
          </p>
        </section>

        {/* ── Static Export ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Static Export Architecture</h2>
          <p className="mb-6">
            TABS uses Next.js with{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
              output: &apos;export&apos;
            </code>{' '}
            - every page is pre-rendered to static HTML at build time. There is no server. The
            entire site is a collection of HTML, CSS, and JavaScript files hosted on GitHub Pages.
          </p>

          <h3 className={H3_CLASSES}>Why Static Export?</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Performance</strong> - pages load instantly from a CDN with no server
              round-trip
            </li>
            <li>
              <strong>Security</strong> - no server to compromise; the attack surface is minimal
            </li>
            <li>
              <strong>Cost</strong> - GitHub Pages hosting is free for open source projects
            </li>
            <li>
              <strong>Reliability</strong> - no database, no server processes, no downtime
            </li>
            <li>
              <strong>Simplicity</strong> - deployment is copying files; rollback is redeploying a
              previous build
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Trade-offs</h3>
          <p className="mb-4">Static export means we cannot use some Next.js features:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              No API routes - external APIs (Qualtrics, Prolific) are called from GitHub Actions
              workflows instead
            </li>
            <li>
              No server-side rendering - all data must be available at build time or fetched
              client-side
            </li>
            <li>
              No Next.js Image optimization - we use standard{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;img&gt;</code> tags with
              the <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">assetPath()</code>{' '}
              helper
            </li>
          </ul>
        </section>

        {/* ── Site Organization ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Site Organization</h2>
          <p className="mb-6">
            Content is organized into logical sections, each with a distinct purpose:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Section</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Pages</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Research Articles',
                    '16',
                    'Two branches of original research (8 articles each)',
                  ],
                  ['Bibliography', '24', 'Auto-generated citation pages for referenced works'],
                  ['Teaching Series', '8+', 'Presentation viewer, handouts, workshop materials'],
                  ['Making of TABS', '10+', 'How the site is built and maintained'],
                  ['Organizational Resources', '5', 'Role-specific guides for leaders'],
                  ['Persona Pages', '11', 'Dynamic routing based on user role'],
                  ['Policy Pages', '6', 'Legal and compliance documents'],
                  ['Core Pages', '5+', 'Homepage, barriers, get involved, media, survey'],
                ].map(([section, pages, purpose]) => (
                  <tr key={section} className="border-b border-gray-100">
                    <td className="p-3 font-medium">{section}</td>
                    <td className="p-3 text-center">{pages}</td>
                    <td className="p-3 text-gray-600">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Data-Driven Content ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Data-Driven Content</h2>
          <p className="mb-6">
            Repetitive content is stored as structured data in{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/data/</code> and rendered
            by reusable components. This prevents duplication and makes bulk updates
            straightforward:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Team members</strong> - JSON files in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/data/team/</code>,
              aggregated by <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">team.ts</code>
            </li>
            <li>
              <strong>FAQs</strong> - JSON files in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/data/faqs/</code>,
              aggregated by <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">faqs.ts</code>
            </li>
            <li>
              <strong>Testimonials</strong> - JSON files in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                src/data/testimonials/
              </code>
            </li>
            <li>
              <strong>Impact metrics</strong> - live data in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/data/impact.json</code>,
              updated by the daily Google Analytics workflow
            </li>
            <li>
              <strong>Survey response funnel</strong> - Qualtrics response counts in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                src/data/qualtrics-metrics.json
              </code>{' '}
              and the Prolific submission funnel in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                src/data/disposition-summary.json
              </code>
              , both surfaced on /results/survey-stats
            </li>
            <li>
              <strong>Article series</strong> - navigation ordering and metadata in{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                technology-adoption-models-series.ts
              </code>
            </li>
          </ul>
        </section>

        {/* ── SEO ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>SEO Strategy</h2>
          <p className="mb-6">
            Every page is optimized for search engines through several mechanisms:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Kebab-case URLs</strong> - all route folders use hyphens (
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">/privacy-policy</code>, not{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">/PrivacyPolicy</code>
              ), following{' '}
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/url-structure"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google&apos;s recommendation
              </a>
            </li>
            <li>
              <strong>Metadata on every page</strong> - title, description, and canonical URL via
              Next.js Metadata API
            </li>
            <li>
              <strong>Dynamic sitemap</strong> - generated at build time with all 149+ routes,
              correct change frequencies, and priorities
            </li>
            <li>
              <strong>Robots.txt</strong> - programmatically generated to allow search engine
              crawling
            </li>
            <li>
              <strong>Semantic HTML</strong> - proper heading hierarchy (h1 → h2 → h3), landmark
              regions, and structured content
            </li>
            <li>
              <strong>Canonical URLs</strong> - prevent duplicate content between custom domain and
              GitHub Pages deployment
            </li>
          </ul>
        </section>

        {/* ── Responsive Design ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Responsive Design</h2>
          <p className="mb-6">
            The site uses a mobile-first responsive design approach with Tailwind CSS:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Mobile-first</strong> - base styles target mobile; breakpoints add desktop
              enhancements
            </li>
            <li>
              <strong>Breakpoints</strong> -{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">sm</code> (640px),{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">md</code> (768px),{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">lg</code> (1024px),{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">xl</code> (1280px)
            </li>
            <li>
              <strong>Mobile navigation</strong> - slide-out panel with overlay, replacing the
              desktop dropdown menu
            </li>
            <li>
              <strong>Flexible grids</strong> - content reflows from single column (mobile) to
              multi-column (desktop)
            </li>
            <li>
              <strong>Touch targets</strong> - buttons and links have minimum 44×44px touch areas on
              mobile
            </li>
          </ul>
        </section>

        {/* ── Shared Styles ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Shared Style System</h2>
          <p className="mb-6">
            With 16 research articles and 24 bibliography pages, visual consistency is essential.
            The{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
              src/lib/articleStyles.ts
            </code>{' '}
            module exports shared Tailwind class constants used across all article-style pages:
          </p>

          <div className="mb-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code>{`import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES }
  from '@/lib/articleStyles'

// Every article page uses the same base classes:
<article className={ARTICLE_CLASSES}>
  <h1 className={H1_CLASSES}>Page Title</h1>
  <h2 className={H2_CLASSES}>Section Heading</h2>
</article>`}</code>
            </pre>
          </div>

          <p className="mb-6">
            This means a single change to{' '}
            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">articleStyles.ts</code>{' '}
            updates the typography, spacing, and layout of every article and bibliography page
            simultaneously.
          </p>
        </section>

        {/* ── Dual Deployment ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Dual Deployment</h2>
          <p className="mb-6">The site is deployed to two locations simultaneously:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Custom Domain</h3>
              <p className="text-sm text-gray-600 mb-2">technologyadoptionbarriers.org</p>
              <p className="text-sm text-gray-500">No basePath - assets at root</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900 mb-1">GitHub Pages</h3>
              <p className="text-sm text-gray-600 mb-2">&lt;username&gt;.github.io/&lt;repo&gt;/</p>
              <p className="text-sm text-gray-500">Requires basePath via NEXT_PUBLIC_BASE_PATH</p>
            </div>
          </div>

          <p className="mb-6">
            The <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">assetPath()</code> helper
            in <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">src/lib/assetPath.ts</code>{' '}
            automatically prepends the correct basePath to all asset URLs, making images and other
            static resources work in both environments.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">149 pages, zero servers, one build step.</p>
        </section>
      </article>
    </div>
  )
}

export default ContentArchitecturePage
