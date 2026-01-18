import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'The Making of TABS',
  description:
    'A behind-the-scenes look at the tools, services, and processes used to create and maintain the Technology Adoption Barriers Survey (TABS).',
}

const MakingOfTabsPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
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
            This page provides an overview of the &quot;stack&quot;—the collection of technologies
            and methodologies—we employ to bring TABS to life. From the survey instrument itself to
            the analytics that help us understand our audience, every component plays a critical
            role.
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
              specific criteria—such as job seniority and industry sector—ensuring that our data
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
              To understand how researchers and participants interact with our findings, we utilize
              <strong>Google Analytics 4</strong>. This provides us with aggregate, privacy-safe
              insights into traffic sources, popular content, and user engagement, helping us refine
              our dissemination strategy.
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

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This &quot;Making of&quot; section is a living document, updated as our toolset and
            methodologies evolve.
          </p>
        </section>
      </article>
    </main>
  )
}

export default MakingOfTabsPage
