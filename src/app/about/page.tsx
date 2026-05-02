import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, PARAGRAPH_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'About TABS',
  description:
    'About the Technology Adoption Barriers Survey (TABS): research project, dissertation context, and the policies that govern participation, data, and contribution.',
  alternates: {
    canonical: '/about',
  },
}

/**
 * Static prose for the search index. The /about landing is a navigation hub
 * to the policy and meta pages, so a single template literal keeps the
 * extracted tokens meaningful.
 */
export const SEARCH_CONTENT = `TABS, the Technology Adoption Barriers Survey, is an open-science research project conducted by Clarke Moyer at the Penn State Smeal College of Business as part of the DBA program. The site hosts the survey instrument, the rolling Prolific dataset, the frozen CRP-2026 dataset that the dissertation cites, and all analysis code. The About area covers the FAQ, media appearances, get-involved options, and the seven policy pages that govern participation, data handling, and security disclosure.`

const POLICY_LINKS = [
  {
    label: 'FAQ',
    href: '/faq',
    desc: 'Common questions about the instrument, the data, and the dissertation.',
  },
  {
    label: 'Media & Appearances',
    href: '/media',
    desc: 'Articles, podcasts, and conference appearances featuring TABS.',
  },
  {
    label: 'Get Involved',
    href: '/get-involved',
    desc: 'Volunteer, suggest items, or request access to the underlying datasets.',
  },
  {
    label: 'Privacy Policy',
    href: '/privacy-policy',
    desc: 'What we collect, how it is stored, and what we never store.',
  },
  {
    label: 'Cookie Policy',
    href: '/cookie-policy',
    desc: 'The minimal cookie footprint of this site.',
  },
  {
    label: 'Terms of Service',
    href: '/terms-of-service',
    desc: 'Site usage and content licensing.',
  },
  {
    label: 'Contribution Policy',
    href: '/contribution-policy',
    desc: 'How outside contributions to the codebase or instrument are handled.',
  },
  {
    label: 'Security Acknowledgements',
    href: '/security-acknowledgements',
    desc: 'Researchers who reported issues responsibly.',
  },
  {
    label: 'Vulnerability Disclosure',
    href: '/vulnerability-disclosure-policy',
    desc: 'How to report a security issue safely.',
  },
] as const

export default function AboutLandingPage() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>About TABS</h1>

        <section className="mb-10 text-gray-800">
          <p className={PARAGRAPH_CLASSES}>
            The Technology Adoption Barriers Survey (TABS) is an open-science research project
            measuring the obstacles that prevent organizations from realizing the value of new
            technology. The instrument captures three constructs in 43 items: 18 barriers, 17
            readiness/capability indicators, and 8 maturity dimensions, plus a forced-choice top-3
            ranking.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            TABS was designed by Clarke Moyer at the Penn State Smeal College of Business as part of
            the Doctor of Business Administration (DBA) program. The frozen CRP 2026 dataset (N=200)
            is the snapshot the dissertation cites; the rolling live Prolific sample on{' '}
            <Link className="text-blue-700 underline" href="/results">
              /results
            </Link>{' '}
            keeps growing toward N=500. All analysis code, the public dataset, and per-platform
            verification bundles for SPSS, Minitab, and Python live in the GitHub repository.
          </p>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Quick paths</h2>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>
              <Link className="text-blue-700 underline" href="/survey">
                Survey
              </Link>{' '}
              - the instrument itself: 18 barriers, 17 readiness items, 8 maturity dimensions, plus
              persona views and concept maps.
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/results">
                Results
              </Link>{' '}
              - live and frozen analytical results, with an insight-first walkthrough.
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/making-of-tabs">
                Making of TABS
              </Link>{' '}
              - the technical pipeline, AI agents, daily workflow, and reproducibility.
            </li>
            <li>
              <Link className="text-blue-700 underline" href="/technology-adoption-models">
                Technology Adoption Models
              </Link>{' '}
              - the literature foundation that informed the instrument.
            </li>
          </ul>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>About this project</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {POLICY_LINKS.map((p) => (
              <li
                key={p.href}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100"
              >
                <Link href={p.href} className="block text-base font-semibold text-gray-900">
                  {p.label}
                </Link>
                <p className="mt-1 text-sm text-gray-700">{p.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10 text-gray-800">
          <h2 className={H2_CLASSES}>Contact</h2>
          <p className={PARAGRAPH_CLASSES}>
            For research questions, dataset requests, or media inquiries:{' '}
            <a
              className="text-blue-700 underline"
              href="mailto:contact@technologyadoptionbarriers.org"
            >
              contact@technologyadoptionbarriers.org
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  )
}
