import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The CMO Survey: Inspiring TABS',
  description:
    'Learn how The CMO Survey has influenced and inspired the Technology Adoption Barriers Survey (TABS) methodology, design, and longitudinal research approach.',
}

const CMOSurveyPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The CMO Survey: Inspiring TABS</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            The Technology Adoption Barriers Survey (TABS) draws significant inspiration from one of
            the most successful longitudinal research initiatives in business:{' '}
            <em>The CMO Survey</em>. Since 2008, The CMO Survey has provided invaluable insights
            into marketing trends, spending patterns, and strategic priorities, serving as a trusted
            benchmark for marketing leaders worldwide.
          </p>
          <p className="mb-6">
            This page explores how The CMO Survey&apos;s proven methodology, longitudinal approach,
            and commitment to open access have shaped the development and vision of TABS.
          </p>
        </section>

        <section className="mb-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Facts: The CMO Survey</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Timeline</h3>
              <ul className="space-y-2 text-gray-800">
                <li>
                  <strong>Launched:</strong> 2008
                </li>
                <li>
                  <strong>Frequency:</strong> Biannual (February &amp; August)
                </li>
                <li>
                  <strong>Total Surveys:</strong> 30+ editions over 15+ years
                </li>
                <li>
                  <strong>Respondents:</strong> 10,000+ marketing leaders surveyed
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Impact &amp; Reach</h3>
              <ul className="space-y-2 text-gray-800">
                <li>
                  <strong>Citation Count:</strong> 1,000+ academic citations
                </li>
                <li>
                  <strong>Media Coverage:</strong> Wall Street Journal, Forbes, Bloomberg
                </li>
                <li>
                  <strong>Industries:</strong> B2B, B2C, Product &amp; Service sectors
                </li>
                <li>
                  <strong>Website:</strong>{' '}
                  <a
                    href="https://cmosurvey.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    cmosurvey.org
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>About The CMO Survey</h2>
          <p className="mb-4">
            <em>The CMO Survey</em> is a long-running research initiative that collects and
            disseminates the opinions of top marketing executives to predict the future of markets,
            track marketing excellence, and improve the value of marketing in firms and in society.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Key Characteristics</h3>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>
                <strong>Longitudinal Design:</strong> Conducted biannually since 2008, creating a
                rich time-series dataset that tracks marketing trends and evolution over more than
                15 years.
              </li>
              <li>
                <strong>Leadership Focus:</strong> Targets C-suite marketing executives (CMOs, VPs
                of Marketing) who make strategic decisions affecting their organizations.
              </li>
              <li>
                <strong>Open Access:</strong> All findings are freely available to the public,
                democratizing access to critical business intelligence.
              </li>
              <li>
                <strong>Academic Rigor:</strong> Backed by leading business schools and
                peer-reviewed research methodologies, ensuring credibility and reliability.
              </li>
              <li>
                <strong>Industry Impact:</strong> Has become the go-to benchmark for marketing
                spending, strategy, and performance across sectors and industries.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Research Topics</h3>
            <p className="mb-4">
              The CMO Survey addresses a comprehensive range of topics relevant to marketing
              leadership:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>Marketing spending and budget allocation</li>
              <li>Digital marketing adoption and social media usage</li>
              <li>Marketing analytics and performance measurement</li>
              <li>Economic outlook and business confidence</li>
              <li>Customer experience and engagement strategies</li>
              <li>Innovation and technology adoption in marketing</li>
            </ul>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>How The CMO Survey Influenced TABS</h2>
          <p className="mb-6">
            TABS aims to replicate The CMO Survey&apos;s success in the technology sector, bringing
            the same rigor, longitudinal approach, and open-access philosophy to understanding
            technology adoption barriers. Here&apos;s how The CMO Survey has directly influenced our
            work:
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>1. Longitudinal Methodology</h3>
            <p className="mb-4">
              Just as The CMO Survey tracks marketing trends over time, TABS is designed as a
              repeatable, annual survey that will build a comprehensive dataset on technology
              adoption barriers across multiple years. This long-term perspective allows us to:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>Identify emerging trends and shifting barriers</li>
              <li>Track the evolution of organizational readiness</li>
              <li>Measure the impact of technological innovation on adoption patterns</li>
              <li>Provide year-over-year comparisons for benchmarking</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>2. Leadership-Centric Approach</h3>
            <p className="mb-4">
              The CMO Survey demonstrates the value of gathering insights directly from
              decision-makers. TABS follows this model by targeting senior leadership roles (CIOs,
              CTOs, VPs of Technology, IT Directors) who shape their organizations&apos; technology
              strategies. This focus ensures that our data reflects:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>Strategic perspectives rather than operational details</li>
              <li>Organizational priorities and resource allocation decisions</li>
              <li>Executive-level barriers and constraints</li>
              <li>Decision-making frameworks used by technology leaders</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>3. Open Access and Democratization</h3>
            <p className="mb-4">
              One of The CMO Survey&apos;s most impactful features is its commitment to making all
              findings freely available. This open-access model has democratized marketing
              intelligence, benefiting small businesses, academics, and consultants who might not
              otherwise afford premium research. TABS embraces this same philosophy:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>All survey results will be published openly on our website</li>
              <li>Raw data (anonymized) will be made available for academic research</li>
              <li>No paywalls or subscription fees will restrict access to insights</li>
              <li>Community contributions and interpretations will be encouraged</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>4. Academic Foundation</h3>
            <p className="mb-4">
              The CMO Survey is developed and maintained by a consortium of top business schools,
              lending it credibility and ensuring methodological rigor. Similarly, TABS is grounded
              in established academic frameworks:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>
                Survey design informed by Technology Acceptance Model (TAM) and
                Technology-Organization-Environment (TOE) framework
              </li>
              <li>Questions validated through pilot testing and expert review</li>
              <li>Data analysis following peer-reviewed statistical methodologies</li>
              <li>Findings intended for publication in academic journals</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>5. Industry Benchmarking</h3>
            <p className="mb-4">
              The CMO Survey has become the definitive benchmark for marketing performance and
              spending. TABS aspires to achieve similar status in the technology adoption space,
              providing:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>Cross-industry comparisons of adoption barriers</li>
              <li>Sector-specific insights (e.g., healthcare, finance, manufacturing)</li>
              <li>Organization size and maturity benchmarks</li>
              <li>Geographic and cultural adoption pattern differences</li>
            </ul>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Key Differences and Adaptations</h2>
          <p className="mb-4">
            While TABS draws heavily from The CMO Survey model, we have adapted the approach to
            address the unique challenges of technology adoption research:
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Technology-Specific Focus</h3>
            <p className="mb-4">
              Unlike the broad marketing landscape covered by The CMO Survey, TABS zeroes in on
              technology adoption barriers, organizational readiness, and capability maturity. This
              specialized focus allows us to provide deeper insights into:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800">
              <li>Specific barriers (cost, complexity, security concerns, cultural resistance)</li>
              <li>Technology lifecycle stages (evaluation, pilot, deployment, optimization)</li>
              <li>Infrastructure and technical debt challenges</li>
              <li>Digital transformation maturity models</li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Broader Leadership Perspective</h3>
            <p className="mb-4">
              While The CMO Survey focuses on marketing executives, TABS includes a wider range of
              technology leadership roles (CIO, CTO, CISO, VP Engineering, VP IT) to capture the
              diverse perspectives that influence technology adoption decisions.
            </p>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Rapid Technology Evolution</h3>
            <p className="mb-4">
              Technology evolves faster than many other business domains. TABS is designed to be
              agile, with the ability to incorporate questions about emerging technologies (AI,
              quantum computing, edge computing) as they become relevant to organizational strategy.
            </p>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Building on a Proven Model</h2>
          <p className="mb-4">
            The CMO Survey has demonstrated that longitudinal, leadership-focused, open-access
            research can have profound impact on business practice and academic understanding. By
            following its proven methodology while adapting to the unique needs of technology
            adoption research, TABS aims to provide similar value to:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2 text-gray-800">
            <li>Technology leaders seeking to benchmark their organizations</li>
            <li>Consultants advising clients on digital transformation</li>
            <li>Academics studying technology adoption and innovation diffusion</li>
            <li>Vendors understanding market barriers to their solutions</li>
            <li>Policymakers shaping technology-related regulations and incentives</li>
          </ul>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>CMO Survey vs TABS: Side-by-Side Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Aspect
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    The CMO Survey
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">TABS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium">Launch Year</td>
                  <td className="border border-gray-300 px-4 py-3">2008</td>
                  <td className="border border-gray-300 px-4 py-3">2024</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Frequency</td>
                  <td className="border border-gray-300 px-4 py-3">Biannual (Feb &amp; Aug)</td>
                  <td className="border border-gray-300 px-4 py-3">Annual</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium">Target Audience</td>
                  <td className="border border-gray-300 px-4 py-3">CMOs, VPs of Marketing</td>
                  <td className="border border-gray-300 px-4 py-3">
                    CIOs, CTOs, VPs of Technology, IT Directors
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">Primary Focus</td>
                  <td className="border border-gray-300 px-4 py-3">
                    Marketing spending, strategy, performance
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Technology adoption barriers, readiness, maturity
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    Data Access Model
                  </td>
                  <td className="border border-gray-300 px-4 py-3">Open Access (Free)</td>
                  <td className="border border-gray-300 px-4 py-3">Open Access (Free)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    Academic Foundation
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Duke, Northwestern, other top business schools
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Penn State Smeal, TAM/TOE framework
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    Longitudinal Design
                  </td>
                  <td className="border border-gray-300 px-4 py-3">✓ 15+ years of trend data</td>
                  <td className="border border-gray-300 px-4 py-3">
                    ✓ Year-over-year comparisons planned
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
          <ul className="space-y-3 text-gray-800">
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span>
                <strong>Proven Track Record:</strong> The CMO Survey&apos;s 15+ year success
                demonstrates that longitudinal, open-access research can become an industry standard
                and trusted benchmark.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span>
                <strong>Leadership Insights Matter:</strong> Surveying C-suite executives provides
                strategic perspectives that operational surveys cannot capture, making the data more
                valuable for decision-makers.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span>
                <strong>Open Access Drives Impact:</strong> Making all findings freely available
                democratizes access to critical intelligence and expands the research&apos;s reach
                and influence.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span>
                <strong>Academic Rigor Builds Credibility:</strong> Grounding surveys in established
                frameworks and peer-reviewed methodologies ensures reliability and trust among
                academics and practitioners alike.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span>
                <strong>TABS Adapts the Model:</strong> While following The CMO Survey&apos;s proven
                approach, TABS tailors it for technology adoption research with broader C-suite
                coverage and agility for rapid tech evolution.
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Learn More</h2>
          <p className="mb-4">
            To explore The CMO Survey and see the model that inspired TABS, visit their website at{' '}
            <a
              href="https://cmosurvey.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              cmosurvey.org
            </a>
            .
          </p>
          <p className="mb-4">
            For more information about how TABS implements these principles, explore our other
            resources:
          </p>
          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/making-of-tabs"
            >
              The Making of TABS
            </Link>
            <Link
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/making-of-tabs/tabs-presentation"
            >
              TABS Presentation
            </Link>
            <Link
              className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              href="/technology-adoption-models"
            >
              Technology Adoption Models
            </Link>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            This page is part of our commitment to transparency about TABS methodology and
            influences. It will be updated as our research evolves.
          </p>
        </section>
      </article>
    </main>
  )
}

export default CMOSurveyPage
