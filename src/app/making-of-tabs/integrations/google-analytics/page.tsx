import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Google Analytics Integration - Making of TABS',
  description:
    'How TABS uses Google Analytics 4 for impact measurement, including the Verified Visitors methodology that filters out CI/Playwright test traffic to report accurate production visitor counts.',
  alternates: {
    canonical: '/making-of-tabs/integrations/google-analytics',
  },
}

const GoogleAnalyticsIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Google Analytics Integration</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Google Analytics 4 (GA4) tracks how researchers, participants, and the public interact
            with the TABS website. Understanding real visitor behavior is critical for an academic
            research project - it helps us measure dissemination impact, identify which content
            resonates, and report meaningful engagement numbers to stakeholders.
          </p>
          <p className="mb-6">
            This page explains how we integrate with GA4, how our automated reporting works, and -
            most importantly - the methodology behind our{' '}
            <strong>&quot;Verified Visitors&quot;</strong> metric, which filters out test and
            automation traffic to surface only genuine human visitors.
          </p>
        </section>

        {/* ── How GA4 is integrated ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How GA4 Is Integrated</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Tag Management</h3>
            <p className="mb-4">
              GA4 is deployed through <strong>Google Tag Manager (GTM)</strong>, which loads on
              every page via the root layout. GTM acts as a container for all analytics tags,
              allowing us to manage tracking without modifying application code. The GA4 measurement
              ID is configured inside the GTM container, not hardcoded in the site source.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Privacy &amp; Consent</h3>
            <p className="mb-4">
              A cookie consent banner gates all analytics tracking. When a visitor first arrives,
              GTM loads but analytics tags are suppressed until the visitor grants consent. If
              consent is granted, a <code>consent_update</code> event is pushed to{' '}
              <code>window.dataLayer</code>, enabling GA4, Microsoft Clarity, and Meta Pixel. If
              consent is declined, no tracking cookies are set and no analytics data is collected.
            </p>
            <p className="mb-4">
              This approach respects visitor privacy while providing aggregate, anonymized insights
              for measuring research impact.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Data API &amp; Service Account</h3>
            <p className="mb-4">
              To programmatically access GA4 data, we use the{' '}
              <a
                href="https://developers.google.com/analytics/devguides/reporting/data/v1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Analytics Data API v1
              </a>
              . A service account authenticates with a private key stored as a GitHub Actions secret
              in the <code>google-prod</code> environment. The service account has read-only access
              to the GA4 property - it cannot modify tracking configuration or delete data.
            </p>
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="mb-2 font-semibold">Key environment values</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <code>GA_PROPERTY_ID</code> - The GA4 property identifier
                </li>
                <li>
                  <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> - Service account email
                </li>
                <li>
                  <code>GOOGLE_PRIVATE_KEY</code> - Service account private key (secret)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Automated Reporting ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Daily Reporting</h2>

          <p className="mb-4">
            A GitHub Actions workflow (<code>ga-report.yml</code>) runs daily at 00:00 UTC. It
            fetches a 28-day rolling window of analytics data and produces two outputs:
          </p>

          <ol className="mb-6 list-decimal space-y-3 pl-6">
            <li>
              <strong>Detailed JSON report</strong> - Saved to <code>reports/</code> with per-page
              breakdowns, user counts, sessions, and engagement rates. This archive provides a
              longitudinal record of site performance.
            </li>
            <li>
              <strong>Public impact stats</strong> - Written to <code>src/data/impact.json</code>,
              which is imported by the homepage and media page to display live metrics like active
              users, page views, and verified visitors. These numbers update automatically when the
              workflow runs.
            </li>
          </ol>

          <p className="mb-4">
            A companion script emails a formatted summary to the project team, including top pages,
            engagement trends, and the verified visitor count.
          </p>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
            <p className="font-semibold mb-1">Workflow trigger</p>
            <p>
              The workflow can also be triggered manually via <code>workflow_dispatch</code>. Manual
              runs include additional diagnostic output (channel and hostname breakdowns) that is
              suppressed during scheduled runs to keep logs clean and avoid exposing detailed
              analytics data unnecessarily.
            </p>
          </div>
        </section>

        {/* ── The Verified Visitors Problem ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>The Verified Visitors Methodology</h2>

          <p className="mb-6">
            This section documents the most significant analytics challenge we encountered and how
            we solved it. It serves as a case study in why raw analytics numbers can be deeply
            misleading for projects that use automated testing.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>The Problem: Inflated Numbers</h3>
            <p className="mb-4">
              When we first displayed analytics on the site, we showed <strong>Page Views</strong>{' '}
              (65,930) as a measure of engagement. This number seemed impressive but didn&apos;t
              feel right - the project was relatively new and hadn&apos;t received that level of
              organic attention.
            </p>
            <p className="mb-4">
              Switching to <strong>Active Users</strong> (23,766) didn&apos;t help - the number was
              still far too high. The question was: where was all this traffic coming from?
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Root Cause: Automated Testing Traffic</h3>
            <p className="mb-4">
              Investigation via the GA4 Data API revealed the answer. By breaking down active users
              by <code>hostName</code>, we discovered:
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th className="py-2 pr-4 font-semibold">Hostname</th>
                    <th className="py-2 pr-4 font-semibold">Active Users</th>
                    <th className="py-2 font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">localhost</td>
                    <td className="py-2 pr-4">21,318</td>
                    <td className="py-2">99.6%</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="py-2 pr-4 font-mono text-xs">technologyadoptionbarriers.org</td>
                    <td className="py-2 pr-4">82</td>
                    <td className="py-2">0.4%</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">(other)</td>
                    <td className="py-2 pr-4">1</td>
                    <td className="py-2">&lt;0.01%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-4">
              <strong>99.6% of all recorded traffic came from localhost.</strong> This traffic was
              generated by:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Playwright E2E tests</strong> - The CI/CD pipeline runs full end-to-end
                tests using real Chromium browsers against a local preview server. Because the tests
                execute in real browsers, GTM and GA4 tags fire normally, creating real GA4
                sessions.
              </li>
              <li>
                <strong>AI coding agents</strong> - Multiple AI tools use Playwright to browse and
                validate the site during development, each generating distinct browser sessions.
              </li>
              <li>
                <strong>Local development</strong> - Developer sessions on{' '}
                <code>localhost:3000</code> also trigger GA4 tracking.
              </li>
            </ul>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 mb-4">
              <p className="font-semibold mb-1">Key insight</p>
              <p>
                Unlike traditional bot traffic that might have unusual user agents or patterns,
                Playwright E2E tests run in real Chromium with real JavaScript execution. They are
                indistinguishable from human traffic to GA4 - they just happen to be on{' '}
                <code>localhost</code> instead of the production domain.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>The Solution: Hostname Filtering</h3>
            <p className="mb-4">
              The fix is straightforward: filter by hostname. Since all legitimate visitor traffic
              arrives at <code>technologyadoptionbarriers.org</code>, we extract only the production
              hostname row from the GA4 hostname breakdown.
            </p>

            <div className="rounded-lg bg-gray-50 p-4 text-sm mb-4">
              <p className="mb-2 font-semibold">How it works</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  The daily report script queries GA4 for <code>activeUsers</code> broken down by{' '}
                  <code>hostName</code>.
                </li>
                <li>
                  The script finds the row where <code>hostName</code> equals{' '}
                  <code>technologyadoptionbarriers.org</code>.
                </li>
                <li>
                  That row&apos;s <code>activeUsers</code> value becomes the{' '}
                  <strong>Verified Visitors</strong> metric.
                </li>
                <li>
                  The number is saved to <code>src/data/impact.json</code> as{' '}
                  <code>verifiedVisitors</code> and displayed on the site.
                </li>
              </ol>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Why Not Use GA4 Filters?</h3>
            <p className="mb-4">
              GA4 offers both property-level data filters and API-level <code>dimensionFilter</code>{' '}
              parameters. We attempted three different approaches to filter at the API level:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6">
              <li>
                <code>dimensionFilter</code> with <code>inListFilter</code> on <code>hostName</code>{' '}
                - filter was silently ignored
              </li>
              <li>
                <code>dimensionFilter</code> with <code>stringFilter</code> on <code>hostName</code>{' '}
                - filter was silently ignored
              </li>
              <li>
                Adding <code>hostName</code> as a dimension alongside the filter - still returned
                localhost rows
              </li>
            </ol>
            <p className="mb-4">
              The GA4 Data API&apos;s <code>dimensionFilter</code> does not reliably apply when
              using <code>metricAggregations: TOTAL</code> without row-level dimensions. Rather than
              continue debugging an opaque API behavior, we adopted the pragmatic approach: fetch
              the breakdown, filter in JavaScript.
            </p>
            <p className="mb-4">
              A property-level filter in the GA4 admin console could also work, but would
              permanently exclude localhost data from all reports, which is undesirable for
              debugging and development monitoring.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>What &quot;Verified Visitors&quot; Means</h3>
            <p className="mb-4">
              The <strong>Verified Visitors</strong> metric represents:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Active users</strong> as defined by GA4 (users who had an engaged session or
                first visit within the reporting period)
              </li>
              <li>
                <strong>On the production hostname only</strong> (
                <code>technologyadoptionbarriers.org</code>)
              </li>
              <li>
                <strong>28-day rolling window</strong> (matching the report period)
              </li>
            </ul>
            <p className="mb-4">It explicitly excludes:</p>
            <ul className="mb-4 list-disc space-y-2 pl-6">
              <li>
                <code>localhost</code> traffic (Playwright tests, AI agents, local dev)
              </li>
              <li>Staging or preview deployment traffic</li>
              <li>Any other non-production hostname</li>
            </ul>

            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-900">
              <p className="font-semibold mb-1">Transparency note</p>
              <p>
                This metric does <em>not</em> apply additional channel or source filtering. Some
                automated visitors (e.g., bots that visit the production domain) may still be
                included. We chose not to over-filter because it is better to slightly overcount
                real visitors than to accidentally exclude legitimate human traffic from organic
                search, social media, or direct links.
              </p>
            </div>
          </div>
        </section>

        {/* ── Lessons Learned ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Lessons Learned</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>1. Automated Tests Create Real Analytics</h3>
            <p className="mb-4">
              If your CI/CD pipeline runs E2E tests in real browsers (Playwright, Cypress, Selenium)
              against a site that has analytics tags, those tests will generate real analytics data.
              This is not a bug - it&apos;s expected behavior. Plan for it from day one by either
              excluding localhost at the property level or filtering in your reporting pipeline.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>2. GA4 API Filters Have Quirks</h3>
            <p className="mb-4">
              The GA4 Data API&apos;s <code>dimensionFilter</code> parameter does not always behave
              as documented, especially when combined with <code>metricAggregations</code> and no
              row-level dimensions. If you encounter filter issues, fetch the full breakdown and
              filter in your application code. It&apos;s more explicit and debuggable.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>3. Always Show Your Methodology</h3>
            <p className="mb-4">
              Raw analytics numbers without context are meaningless at best, misleading at worst.
              This page exists because we believe in transparency - if we display a number on the
              site, we should explain exactly how it was derived and what it does and does not
              represent.
            </p>
          </div>
        </section>

        {/* ── Related ── */}
        <section className="mb-8 text-gray-800">
          <h2 className={H2_CLASSES}>Related</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Technical Integrations overview
              </Link>
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/qualtrics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Qualtrics Integration
              </Link>{' '}
              - survey engine and API workflows
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/prolific"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Prolific Integration
              </Link>{' '}
              - participant recruitment methodology
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page documents the analytics methodology as of February 2026. The verified visitors
            approach was developed iteratively during issue #333 of the TABS project.
          </p>
        </section>
      </article>
    </div>
  )
}

export default GoogleAnalyticsIntegrationPage
