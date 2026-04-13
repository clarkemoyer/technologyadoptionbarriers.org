import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
import { assetPath } from '@/lib/assetPath'
export const metadata: Metadata = {
  title: 'The Making of TABS',
  description:
    'A behind-the-scenes look at the tools, services, and processes used to create and maintain the Technology Adoption Barriers Survey (TABS).',
}

const MakingOfTabsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The Making of TABS</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            The Technology Adoption Barriers Survey (TABS) is more than just a questionnaire; it is
            a comprehensive research initiative supported by a robust technical ecosystem. Building
            and maintaining a platform that ensures data integrity, user privacy, and high
            availability requires a suite of specialized tools and services.
          </p>
          <p className="mb-6">
            This page provides an overview of the &quot;stack&quot; - the collection of technologies
            and methodologies - we employ to bring TABS to life. From the survey instrument itself
            to the analytics that help us understand our audience, every component plays a critical
            role.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>AI Validity Checks</h2>
          <p className="mb-4">
            To ensure the highest level of factual accuracy and academic rigor, we employ advanced
            Large Language Models (LLMs) to conduct exhaustive, read-only validity checks across our
            entire public-facing site.
          </p>
          <div className="mb-4">
            <Link
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/making-of-tabs/ai-validity-checks"
            >
              View AI Validity Checks
            </Link>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>TABS Presentation</h2>
          <p className="mb-4">
            We maintain an interactive presentation that explains the project mission, key
            challenges, and roadmap. You can view it here, or open it full-screen.
          </p>

          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/making-of-tabs/tabs-presentation"
            >
              View presentation page
            </Link>
            <a
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href={assetPath('/tabs-presentation')}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open full-screen
            </a>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <iframe
              title="TABS Presentation"
              src={assetPath('/tabs-presentation')}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Tip: click inside the presentation before using keyboard navigation.
          </p>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>The Survey Instrument</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Qualtrics</h3>
            <p className="mb-4">
              At the core of our research is <strong>Qualtrics</strong>, a premier experience
              management platform. We chose Qualtrics for its sophisticated logic capabilities,
              enterprise-grade security, and versatile data export options. It allows us to
              construct complex question pathways that adapt to the respondent&apos;s role and
              industry, ensuring that every participant sees only the questions relevant to them.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Prolific</h3>
            <p className="mb-4">
              To reach a diverse and representative sample of organizational leaders, we partner
              with <strong>Prolific</strong>. Unlike traditional survey panels, Prolific specializes
              in high-quality academic research. It enables us to pre-screen participants based on
              specific criteria - such as job seniority and industry sector - ensuring that our data
              reflects the true voice of decision-makers.
            </p>
          </div>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Web Architecture & Deployment</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Next.js & React</h3>
            <p className="mb-4">
              This website is built using <strong>Next.js</strong>, a React framework that offers
              optimal performance and search engine optimization (SEO). By rendering pages on the
              server and generating static content, we ensure that the site loads instantly for
              users around the globe, regardless of their device or connection speed.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>GitHub Pages & Actions</h3>
            <p className="mb-4">
              We leverage the power of <strong>GitHub</strong> not just for code storage, but for
              the entire deployment lifecycle. Using <strong>GitHub Actions</strong>, we have
              automated our Continuous Integration/Continuous Deployment (CI/CD) pipeline. Every
              change to the codebase is automatically tested, built, and deployed to{' '}
              <strong>GitHub Pages</strong>, ensuring a stable and verified release process.
            </p>
          </div>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Analytics & Integrity</h2>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Google Analytics 4 (GA4)</h3>
            <p className="mb-4">
              To understand how researchers and participants interact with our findings, we utilize{' '}
              <strong>Google Analytics 4</strong>. This provides us with aggregate, privacy-safe
              insights into traffic sources, popular content, and user engagement, helping us refine
              our dissemination strategy.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Google Search Console (GSC)</h3>
            <p className="mb-4">
              To monitor our organic search visibility and ensure technical SEO health, we leverage
              the <strong>Google Search Console API</strong>. Daily automated workflows fetch
              impression data, keyword positioning, and click-through rates, flagging any
              algorithmic regressions immediately.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Google Tag Manager (GTM)</h3>
            <p className="mb-4">
              <strong>Google Tag Manager</strong> acts as the command center for our analytic tags.
              It allows us to manage and deploy marketing and measurement tags without modifying the
              code. This abstraction layer improves site performance and gives us the agility to add
              or update tracking tools as needed.
            </p>
          </div>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Technical Integrations &amp; Workflows</h2>
          <p className="mb-4">
            Behind the scenes, TABS relies on automated workflows that connect Qualtrics, Prolific,
            and Google Analytics via GitHub Actions. These integrations handle everything from
            survey creation and participant routing to daily analytics reporting.
          </p>
          <Link
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            href="/making-of-tabs/integrations"
          >
            View technical integrations
          </Link>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How We Build</h2>
          <p className="mb-6">
            These pages document the methods, tools, and values behind the TABS project.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'AI-Assisted Development',
                href: '/making-of-tabs/ai-assisted-development',
                desc: 'The 3-agent setup (Copilot, Jules, Claude) and workflows we use to build and maintain the site.',
                border: 'border-purple-200',
                bg: 'bg-purple-50',
                titleColor: 'text-purple-900',
                textColor: 'text-purple-800',
              },
              {
                title: 'Development Workflow',
                href: '/making-of-tabs/development-workflow',
                desc: 'CI/CD pipeline, automated operations, and how code reaches production.',
                border: 'border-blue-200',
                bg: 'bg-blue-50',
                titleColor: 'text-blue-900',
                textColor: 'text-blue-800',
              },
              {
                title: 'Accessibility',
                href: '/making-of-tabs/accessibility',
                desc: 'Automated testing, WCAG AA compliance, and inclusive design practices.',
                border: 'border-green-200',
                bg: 'bg-green-50',
                titleColor: 'text-green-900',
                textColor: 'text-green-800',
              },
              {
                title: 'Open Source & Community',
                href: '/making-of-tabs/open-source',
                desc: 'Apache 2.0 licensing, community health files, and contribution workflow.',
                border: 'border-orange-200',
                bg: 'bg-orange-50',
                titleColor: 'text-orange-900',
                textColor: 'text-orange-800',
              },
              {
                title: 'Content Architecture',
                href: '/making-of-tabs/content-architecture',
                desc: '149+ static pages, data-driven content, SEO, and responsive design.',
                border: 'border-amber-200',
                bg: 'bg-amber-50',
                titleColor: 'text-amber-900',
                textColor: 'text-amber-800',
              },
              {
                title: 'Results & Data',
                href: '/results',
                desc: 'Survey results, descriptive statistics, scale reliability, sensitivity analysis, and open data.',
                border: 'border-rose-200',
                bg: 'bg-rose-50',
                titleColor: 'text-rose-900',
                textColor: 'text-rose-800',
              },
              {
                title: 'SEO Benchmarking',
                href: '/making-of-tabs/seo',
                desc: 'Our public baseline, keyword gaps, strategy roadmap, and live performance dashboard.',
                border: 'border-teal-200',
                bg: 'bg-teal-50',
                titleColor: 'text-teal-900',
                textColor: 'text-teal-800',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`block rounded-xl border ${card.border} ${card.bg} p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
              >
                <h3 className={`text-base font-semibold ${card.titleColor} mb-1`}>{card.title}</h3>
                <p className={`text-sm ${card.textColor}`}>{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Looking for survey results, descriptive statistics, or scale reliability? Visit the{' '}
            <Link href="/results" className="text-blue-600 hover:underline font-medium">
              Results
            </Link>{' '}
            section.
          </p>
          <p className="text-sm text-gray-600 italic">
            This &quot;Making of&quot; section is a living document, updated as our toolset and
            methodologies evolve.
          </p>
        </section>
      </article>
    </div>
  )
}

export default MakingOfTabsPage
