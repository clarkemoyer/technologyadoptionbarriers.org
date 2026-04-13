import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Microsoft Clarity Integration - Making of TABS',
  description:
    'How TABS integrates Microsoft Clarity for heatmaps and session recordings, with privacy-first consent gating, SPA route tracking, and cookie cleanup.',
  alternates: {
    canonical: '/making-of-tabs/integrations/microsoft-clarity',
  },
}

const MicrosoftClarityIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Microsoft Clarity</h1>
        <p className="mb-8 text-lg sm:text-xl text-gray-600 font-sans">
          Consent-gated behavioral analytics with heatmaps, session recordings, and SPA route
          tracking - all on the free tier.
        </p>

        {/* ── Why Clarity ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Why Microsoft Clarity?</h2>
          <p className="mb-4">
            Google Analytics tells us <em>how many</em> people visit and <em>which pages</em> they
            view, but it cannot show <em>how</em> they interact with those pages. Microsoft Clarity
            fills this gap with two features that are otherwise expensive or absent:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Heatmaps</strong> - aggregated click, scroll, and movement maps for every
              page, revealing which sections attract attention and which are skipped.
            </li>
            <li>
              <strong>Session recordings</strong> - anonymized replays of real visitor sessions,
              showing navigation paths, confusion points, and rage clicks.
            </li>
          </ul>
          <p className="mb-4">
            Clarity is completely free with no traffic caps, making it ideal for a nonprofit
            project. It runs alongside Google Analytics without conflict, each serving a distinct
            purpose: quantitative metrics (GA4) versus qualitative behavior (Clarity).
          </p>
        </section>

        {/* ── Consent-Gated Loading ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Consent-Gated Loading</h2>
          <p className="mb-4">
            Clarity is <strong>not</strong> loaded via Google Tag Manager. Instead, the cookie
            consent component dynamically injects the Clarity tracking script into{' '}
            <code>&lt;head&gt;</code> only after the visitor explicitly accepts{' '}
            <strong>Analytics</strong> cookies. This design ensures GDPR compliance by default.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>How Loading Works</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 text-sm font-sans">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 border-b">Step</th>
                    <th className="px-4 py-2 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b font-mono">1</td>
                    <td className="px-4 py-2 border-b">
                      Visitor arrives - no Clarity script is present on the page
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border-b font-mono">2</td>
                    <td className="px-4 py-2 border-b">
                      Cookie consent banner appears, offering <em>Analytics</em> and{' '}
                      <em>Marketing</em> toggle categories
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b font-mono">3</td>
                    <td className="px-4 py-2 border-b">
                      Visitor accepts Analytics → <code>loadMicrosoftClarity()</code> is called
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border-b font-mono">4</td>
                    <td className="px-4 py-2 border-b">
                      An inline <code>&lt;script&gt;</code> is appended to <code>&lt;head&gt;</code>{' '}
                      that bootstraps the Clarity SDK using the project ID from{' '}
                      <code>NEXT_PUBLIC_CLARITY_PROJECT_ID</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">5</td>
                    <td className="px-4 py-2">
                      Clarity starts recording and sending data to the dashboard
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">
              If the visitor later revokes Analytics consent, the component actively deletes
              Clarity&rsquo;s first-party cookies (<code>_clck</code> and <code>_clsk</code>) and
              the script is not reloaded until consent is granted again.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Cookie Categories</h3>
            <p className="mb-4">
              The consent UI groups third-party services into two categories. Clarity falls under{' '}
              <strong>Analytics</strong>, alongside Google Analytics:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 text-sm font-sans">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 border-b">Category</th>
                    <th className="px-4 py-2 border-b">Services</th>
                    <th className="px-4 py-2 border-b">Cookies</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">Analytics</td>
                    <td className="px-4 py-2 border-b">Google Analytics, Microsoft Clarity</td>
                    <td className="px-4 py-2 border-b">
                      <code>_ga</code>, <code>_gid</code>, <code>_clck</code>, <code>_clsk</code>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2">Marketing</td>
                    <td className="px-4 py-2">Meta Pixel</td>
                    <td className="px-4 py-2">
                      <code>_fbp</code>, <code>fr</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SPA Route Tracking ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>SPA Route Tracking</h2>
          <p className="mb-4">
            A static site exported from Next.js App Router behaves as a single-page application
            after the initial load - navigating between pages uses client-side routing, which means
            Clarity would record every page view as the landing page URL. To solve this, a dedicated{' '}
            <code>ClarityRouteTracker</code> component is rendered in the root layout.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>How It Works</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
              <li>
                The component uses <code>usePathname()</code> from <code>next/navigation</code> to
                listen for route changes.
              </li>
              <li>
                On each navigation, it calls{' '}
                <code>window.clarity(&apos;set&apos;, &apos;page&apos;, path)</code> to tell Clarity
                which page the visitor is now viewing.
              </li>
              <li>
                It prepends <code>NEXT_PUBLIC_BASE_PATH</code> to the pathname so the paths recorded
                in Clarity match the deployed URLs (important for GitHub Pages, which uses a
                repository-name prefix).
              </li>
              <li>
                If <code>window.clarity</code> does not exist (visitor declined consent), the
                component silently does nothing.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Render Position</h3>
            <p className="mb-4">
              <code>ClarityRouteTracker</code> renders <strong>before</strong> the main content in
              the root layout, ensuring it intercepts every navigation regardless of how deeply a
              component tree updates:
            </p>
            <div className="rounded-lg bg-gray-50 p-4 text-sm font-mono mb-4 whitespace-pre-wrap">
              {`<body>
  <GoogleTagManagerNoScript />
  <ClarityRouteTracker />   ← route tracking
  <Header />
  {children}
  <Footer />
  <CookieConsent />          ← injects Clarity script
</body>`}
            </div>
          </div>
        </section>

        {/* ── Testing ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Testing</h2>
          <p className="mb-4">
            The <code>ClarityRouteTracker</code> has a full Jest test suite that covers seven
            scenarios:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Basic rendering</strong> - the component returns <code>null</code> (no DOM
              output)
            </li>
            <li>
              <strong>Route call</strong> - verifies{' '}
              <code>window.clarity(&apos;set&apos;, &apos;page&apos;, &apos;/some-path&apos;)</code>{' '}
              is invoked with the current pathname
            </li>
            <li>
              <strong>Base path handling</strong> - when <code>NEXT_PUBLIC_BASE_PATH</code> is set,
              the path is prefixed correctly
            </li>
            <li>
              <strong>Root path</strong> - ensures <code>/</code> does not produce a double-slash
            </li>
            <li>
              <strong>Graceful degradation</strong> - no error is thrown when{' '}
              <code>window.clarity</code> is undefined (consent not granted)
            </li>
            <li>
              <strong>Route updates</strong> - re-rendering with a new pathname triggers a new
              Clarity call
            </li>
            <li>
              <strong>No double slashes</strong> - edge-case test for basePath + root pathname
            </li>
          </ul>
        </section>

        {/* ── Environment Variables ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Environment Variables</h2>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Variable</th>
                  <th className="px-4 py-2 border-b">Purpose</th>
                  <th className="px-4 py-2 border-b">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">NEXT_PUBLIC_CLARITY_PROJECT_ID</td>
                  <td className="px-4 py-2 border-b">
                    Clarity project identifier, injected into the tracking script
                  </td>
                  <td className="px-4 py-2 border-b font-mono">XXXXXXXXXX</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 font-mono">NEXT_PUBLIC_BASE_PATH</td>
                  <td className="px-4 py-2">
                    Prepended to pathnames sent to Clarity so recorded pages match deployed URLs
                  </td>
                  <td className="px-4 py-2 font-mono">&apos;&apos; (empty)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Lessons Learned ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Lessons Learned</h2>
          <ul className="list-disc pl-5 space-y-3 mb-6 font-sans text-base">
            <li>
              <strong>SPAs need manual route tracking.</strong> Without{' '}
              <code>ClarityRouteTracker</code>, every session shows the landing page for every page
              view. This is easy to miss because the behavior only becomes obvious after analyzing
              real sessions in the Clarity dashboard.
            </li>
            <li>
              <strong>GTM is not always the right loader.</strong> Loading Clarity through GTM would
              add complexity (container tag configuration, consent mode mapping) without benefit. A
              single <code>createElement(&apos;script&apos;)</code> call with dynamic consent gating
              is simpler and more transparent.
            </li>
            <li>
              <strong>Cookie cleanup matters.</strong> Deleting <code>_clck</code> and{' '}
              <code>_clsk</code> when consent is withdrawn demonstrates genuine GDPR respect rather
              than merely stopping the script.
            </li>
            <li>
              <strong>Free tier, no compromises.</strong> Clarity has no traffic limits, no feature
              restrictions, and no paid upgrade required. For a nonprofit research project, this is
              invaluable.
            </li>
          </ul>
        </section>

        {/* ── Related ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Related</h2>
          <ul className="list-disc pl-5 space-y-2 font-sans text-base">
            <li>
              <Link
                href="/making-of-tabs/integrations/google-analytics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Analytics Integration
              </Link>{' '}
              - quantitative impact measurement and the Verified Visitors methodology
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/cloudflare"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Cloudflare Integration
              </Link>{' '}
              - CDN, DNS, and security layer
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="text-blue-600 underline hover:text-blue-800"
              >
                All Technical Integrations
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

export default MicrosoftClarityIntegrationPage
