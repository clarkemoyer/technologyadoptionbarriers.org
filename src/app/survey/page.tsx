import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Survey - TABS',
  description:
    'Overview of the Technology Adoption Barriers Survey (TABS) instrument. The 18 barriers, 17 readiness items, and 8 maturity dimensions, plus the persona explorer and concept mapping that show how the items group into theoretical constructs.',
  alternates: {
    canonical: '/survey',
  },
}

/**
 * Static prose for the search index. The /survey landing is a navigation hub,
 * so this single template literal lets the auto-extractor index meaningful
 * tokens instead of pulling fragments from the dynamic Link components.
 */
export const SEARCH_CONTENT = `The TABS survey instrument has three top-level views: the 18-item Barriers scale (with quotes and the live response funnel), the See Yourself persona explorer that mirrors the survey back to individuals and organizations, and the Concept Mapping pages that show how items group into theoretical constructs synthesized from CMMI, IT-CMF, COBIT, DREAMY, and the technology adoption literature.`

const SECTIONS = [
  {
    title: 'Barriers',
    description:
      'The 18-item Barriers scale is the core measurement instrument. Browse the full list with definitions, read participant quotes that motivate each item, or open the live Response Funnel to see how Qualtrics submissions flow through the daily disposition pipeline.',
    links: [
      { label: 'All 18 Barriers', href: '/barriers' },
      { label: 'Barrier Quotes', href: '/barriers/quotes' },
      { label: 'Response Funnel', href: '/results/survey-stats' },
    ],
  },
  {
    title: 'See Yourself',
    description:
      'Persona pages mirror the survey back to two audiences. The Individuals view (CIO, CTO, COO, etc.) shows how each role typically scores and which barriers tend to dominate. The Organizations view does the same for SMB, Enterprise, For-Profit, Non-Profit, and Government segments.',
    links: [
      { label: 'See Yourself overview', href: '/start' },
      { label: 'Individuals', href: '/start' },
      { label: 'Organizations', href: '/for-organizations' },
    ],
  },
  {
    title: 'Concept Mapping',
    description:
      'Concept maps show how the 43 survey items group into theoretical constructs synthesized from CMMI v2.0, IT-CMF, COBIT 2019, DREAMY, and the technology adoption literature. The Summary tab gives the headline grouping; the Simple and Complex tabs trade compactness for full theoretical detail.',
    links: [
      { label: 'Summary', href: '/concept-mapping/summary' },
      { label: 'Simple Concept Map', href: '/concept-mapping/simple' },
      { label: 'Complex Concept Map', href: '/concept-mapping/complex' },
    ],
  },
] as const

export default function SurveyLandingPage() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>The TABS Survey</h1>

        <section className="mb-10 text-gray-800">
          <p className={PARAGRAPH_CLASSES}>
            The Technology Adoption Barriers Survey (TABS) is a 43-item instrument that measures
            three constructs: the perceived strength of 18 organizational barriers to technology
            adoption, the 17-item Readiness/Capability index, and the 8-dimension Maturity profile.
            Participants also pick the three barriers they consider most pressing in a forced-choice
            ranking that complements the continuous Likert scores.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This page is the entry point to the three views of the instrument: the canonical barrier
            list, the persona explorer, and the concept maps that ground each item in the published
            literature. To take the survey itself, use the &quot;Take the TABS&quot; button in the
            site header.
          </p>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mb-10 text-gray-800">
            <h2 className={H2_CLASSES}>{section.title}</h2>
            <p className={PARAGRAPH_CLASSES}>{section.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Where the live results live</h2>
          <p className={PARAGRAPH_CLASSES}>
            Survey-instrument pages on this site describe the items themselves; the analytical
            results from the rolling Prolific sample and the frozen CRP-2026 dataset live under the{' '}
            <Link className="text-blue-700 underline" href="/results">
              Results
            </Link>{' '}
            section. The two areas are kept separate so that someone reviewing the instrument is not
            forced to read the data first, and someone reviewing the data is not forced to re-derive
            the instrument.
          </p>
          <h3 className={H3_CLASSES}>Quick links</h3>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>
              <Link className="text-blue-700 underline" href="/results/top-barriers">
                Live: Top 3 Barriers (forced-choice ranking)
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/results/crp-2026/top-barriers">
                Frozen CRP 2026: Top 3 Barriers (N=200)
              </Link>
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/making-of-tabs/data-analysis">
                Methodology: how the analyses are computed
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </main>
  )
}
