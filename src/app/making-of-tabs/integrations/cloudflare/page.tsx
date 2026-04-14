import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Cloudflare Integration - Making of TABS',
  description:
    'How TABS uses Cloudflare as the DNS, CDN, SSL, and security layer in front of GitHub Pages - including caching strategy, performance optimizations, and security headers.',
  alternates: {
    canonical: '/making-of-tabs/integrations/cloudflare',
  },
}

const CloudflareIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Cloudflare</h1>
        <p className="mb-8 text-lg sm:text-xl text-gray-600 font-sans">
          DNS, global CDN, SSL termination, and security headers - all on the Free plan, sitting
          between visitors and the GitHub Pages origin.
        </p>

        {/* ── Architecture ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Architecture</h2>
          <p className="mb-4">
            The TABS site is statically exported by Next.js and hosted on GitHub Pages. Cloudflare
            sits in front of GitHub Pages as a reverse proxy - all traffic to{' '}
            <code>technologyadoptionbarriers.org</code> flows through Cloudflare&rsquo;s edge
            network before reaching the origin:
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-sm font-mono mb-6 whitespace-pre-wrap">
            {`Visitor → Cloudflare Edge (270+ cities)
       → DNS resolution + DDoS protection
       → SSL/TLS termination
       → CDN cache check
       → Security headers injection
       → GitHub Pages origin (static files)`}
          </div>
          <p className="mb-4">
            The Next.js application itself has <strong>no awareness of Cloudflare</strong>. There
            are no Cloudflare Workers, no <code>wrangler.toml</code>, no edge functions. Cloudflare
            is a purely infrastructure-level integration configured entirely through the Cloudflare
            dashboard.
          </p>
        </section>

        {/* ── DNS ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>DNS Configuration</h2>
          <p className="mb-4">
            The domain&rsquo;s nameservers are delegated to Cloudflare. All DNS records have{' '}
            <strong>Proxy status = Proxied</strong> (orange cloud), meaning traffic is routed
            through Cloudflare&rsquo;s network rather than directly to GitHub:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Type</th>
                  <th className="px-4 py-2 border-b">Name</th>
                  <th className="px-4 py-2 border-b">Content</th>
                  <th className="px-4 py-2 border-b">Proxy</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['A', '@', '185.199.108.153', 'Proxied'],
                  ['A', '@', '185.199.109.153', 'Proxied'],
                  ['A', '@', '185.199.110.153', 'Proxied'],
                  ['A', '@', '185.199.111.153', 'Proxied'],
                  ['CNAME', 'www', '<username>.github.io', 'Proxied'],
                ].map(([type, name, content, proxy], i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2 border-b font-mono">{type}</td>
                    <td className="px-4 py-2 border-b font-mono">{name}</td>
                    <td className="px-4 py-2 border-b font-mono">{content}</td>
                    <td className="px-4 py-2 border-b">{proxy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            The four A records point to GitHub Pages&rsquo; load-balanced IP addresses. The{' '}
            <code>www</code> CNAME redirects to the apex domain. A corresponding{' '}
            <code>public/CNAME</code> file in the repository tells GitHub Pages which custom domain
            to serve.
          </p>
        </section>

        {/* ── CDN & Caching ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>CDN &amp; Caching Strategy</h2>
          <p className="mb-4">
            Cloudflare&rsquo;s Free plan provides 3 Page Rules, all of which are allocated to TABS
            with a tiered caching strategy:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Priority</th>
                  <th className="px-4 py-2 border-b">URL Pattern</th>
                  <th className="px-4 py-2 border-b">Edge TTL</th>
                  <th className="px-4 py-2 border-b">Browser TTL</th>
                  <th className="px-4 py-2 border-b">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b font-mono">1</td>
                  <td className="px-4 py-2 border-b">
                    <code>*/_next/static/*</code>
                  </td>
                  <td className="px-4 py-2 border-b">1 month</td>
                  <td className="px-4 py-2 border-b">1 year</td>
                  <td className="px-4 py-2 border-b">
                    Content-hashed immutable assets - filename changes on rebuild
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono">2</td>
                  <td className="px-4 py-2 border-b">
                    <code>*/Images/*</code>, <code>*/Svgs/*</code>
                  </td>
                  <td className="px-4 py-2 border-b">1 month</td>
                  <td className="px-4 py-2 border-b">1 year</td>
                  <td className="px-4 py-2 border-b">Static images and SVGs rarely change</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">3</td>
                  <td className="px-4 py-2">
                    <code>*.html</code>
                  </td>
                  <td className="px-4 py-2">1 hour</td>
                  <td className="px-4 py-2">1 hour</td>
                  <td className="px-4 py-2">
                    HTML pages update on deployment - short TTL for freshness
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm font-sans mb-6">
            <p className="font-semibold text-blue-900 mb-1">Expected performance gains</p>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Cache hit ratio: 70-90% for static assets</li>
              <li>TTFB improvement: 30-50% from CDN proximity</li>
              <li>LCP improvement: 15-30%</li>
              <li>Bandwidth savings: 40-60%</li>
            </ul>
          </div>
        </section>

        {/* ── SSL/TLS ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>SSL/TLS</h2>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Setting</th>
                  <th className="px-4 py-2 border-b">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b">Encryption mode</td>
                  <td className="px-4 py-2 border-b">
                    <strong>Full (strict)</strong> - end-to-end encryption, GitHub Pages certificate
                    validated
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b">Minimum TLS version</td>
                  <td className="px-4 py-2 border-b">TLS 1.2</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b">Always Use HTTPS</td>
                  <td className="px-4 py-2 border-b">
                    Enabled - HTTP requests redirected to HTTPS
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2">Automatic HTTPS Rewrites</td>
                  <td className="px-4 py-2">
                    Enabled - rewrites mixed-content <code>http://</code> links in responses
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            The <strong>Full (strict)</strong> mode is critical: it means Cloudflare validates the
            origin server&rsquo;s SSL certificate (issued by GitHub to <code>*.github.io</code>),
            preventing man-in-the-middle attacks between Cloudflare and GitHub Pages.
          </p>
        </section>

        {/* ── Performance ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Performance Optimizations</h2>
          <p className="mb-4">
            Several Cloudflare features are enabled to improve page load times, all available on the
            Free plan:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Feature</th>
                  <th className="px-4 py-2 border-b">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b">Auto Minify (JS/CSS/HTML)</td>
                  <td className="px-4 py-2 border-b">10-30% smaller file sizes</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b">Brotli Compression</td>
                  <td className="px-4 py-2 border-b">
                    Better compression ratio than Gzip for text-based assets
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b">Early Hints (103)</td>
                  <td className="px-4 py-2 border-b">
                    Preloads critical resources before the full response arrives
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b">HTTP/3 (QUIC)</td>
                  <td className="px-4 py-2 border-b">
                    Faster connection establishment and reduced latency
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">0-RTT Connection Resumption</td>
                  <td className="px-4 py-2">Zero round-trip reconnection for returning visitors</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Security Headers ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Security Headers</h2>
          <p className="mb-4">
            Cloudflare Transform Rules inject security headers on every response. These headers are
            configured in the Cloudflare dashboard (not in the application code) and apply
            consistently to all pages:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-sm font-sans">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Header</th>
                  <th className="px-4 py-2 border-b">Value</th>
                  <th className="px-4 py-2 border-b">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b font-mono text-xs">X-Content-Type-Options</td>
                  <td className="px-4 py-2 border-b font-mono text-xs">nosniff</td>
                  <td className="px-4 py-2 border-b">Prevent MIME-type sniffing</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono text-xs">X-Frame-Options</td>
                  <td className="px-4 py-2 border-b font-mono text-xs">SAMEORIGIN</td>
                  <td className="px-4 py-2 border-b">Prevent clickjacking</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b font-mono text-xs">X-XSS-Protection</td>
                  <td className="px-4 py-2 border-b font-mono text-xs">1; mode=block</td>
                  <td className="px-4 py-2 border-b">Legacy XSS filter</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border-b font-mono text-xs">Referrer-Policy</td>
                  <td className="px-4 py-2 border-b font-mono text-xs">
                    strict-origin-when-cross-origin
                  </td>
                  <td className="px-4 py-2 border-b">Control referer leakage</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">Permissions-Policy</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    geolocation=(), microphone=(), camera=()
                  </td>
                  <td className="px-4 py-2">Disable sensitive browser APIs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── DDoS & WAF ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>DDoS Protection</h2>
          <p className="mb-4">
            Cloudflare&rsquo;s proxy provides built-in DDoS mitigation at no cost. Because the TABS
            site is a statically exported Next.js application, the attack surface is inherently
            small:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>No server-side logic</strong> - there are no API routes, no database queries,
              and no dynamic rendering to overwhelm
            </li>
            <li>
              <strong>High cacheability</strong> - most requests are served from Cloudflare&rsquo;s
              edge cache without reaching the origin
            </li>
            <li>
              <strong>CDN absorption</strong> - even under heavy load, Cloudflare&rsquo;s global
              network absorbs the traffic across 270+ points of presence
            </li>
          </ul>
          <p className="mb-4">
            A Web Application Firewall (WAF) evaluation is on the long-term security roadmap. For a
            static site, the Free plan&rsquo;s managed rules and DDoS protection provide a strong
            baseline.
          </p>
        </section>

        {/* ── What Cloudflare Doesn't Do ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>What Cloudflare Does Not Do</h2>
          <p className="mb-4">
            To keep the architecture simple, several Cloudflare features are intentionally{' '}
            <strong>not used</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Cloudflare Workers / Pages</strong> - the site is deployed via GitHub Pages,
              not Cloudflare Pages. Cloudflare Pages is recommended as a future option for PR
              preview deployments.
            </li>
            <li>
              <strong>Cloudflare Analytics</strong> - analytics are handled by Google Analytics and
              Microsoft Clarity, which provide richer behavioral data
            </li>
            <li>
              <strong>Cloudflare Access / Zero Trust</strong> - the site is fully public with no
              restricted areas
            </li>
            <li>
              <strong>Email routing</strong> - email is handled outside Cloudflare
            </li>
          </ul>
        </section>

        {/* ── Lessons Learned ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Lessons Learned</h2>
          <ul className="list-disc pl-5 space-y-3 mb-6 font-sans text-base">
            <li>
              <strong>The Free plan is genuinely sufficient.</strong> Between 3 Page Rules, 10
              Transform Rules, unlimited bandwidth, and global CDN - the Free tier covers everything
              a static nonprofit site needs.
            </li>
            <li>
              <strong>Full (strict) SSL is non-negotiable.</strong> Using &quot;Flexible&quot; or
              &quot;Full&quot; encryption modes would leave the connection between Cloudflare and
              GitHub Pages unverified. &quot;Full (strict)&quot; validates the origin certificate
              and provides genuine end-to-end encryption.
            </li>
            <li>
              <strong>Tiered caching avoids stale pages.</strong> Giving HTML files a 1-hour TTL
              means deployments propagate quickly, while hashed static assets can be cached
              aggressively without ever serving stale content.
            </li>
            <li>
              <strong>Security headers belong at the edge.</strong> Injecting headers via Cloudflare
              Transform Rules means they apply to every response - including error pages and
              redirects - without relying on application-level middleware that a static export
              cannot provide.
            </li>
          </ul>
        </section>

        {/* ── Related ── */}
        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Related</h2>
          <ul className="list-disc pl-5 space-y-2 font-sans text-base">
            <li>
              <Link
                href="/making-of-tabs/integrations/github"
                className="text-blue-600 underline hover:text-blue-800"
              >
                GitHub Integration
              </Link>{' '}
              - CI/CD, deployment, and the GitHub Pages origin
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/google-analytics"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Analytics Integration
              </Link>{' '}
              - impact measurement that runs through Cloudflare&rsquo;s proxy
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations/microsoft-clarity"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Microsoft Clarity Integration
              </Link>{' '}
              - behavioral analytics that also passes through the CDN
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

export default CloudflareIntegrationPage
