import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Enterprise Architecture Review',
  description: 'Gemini 3.1 Pro validity check of enterprise architecture frameworks in TABS.',
  alternates: {
    canonical:
      '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture',
  },
}

export default function Page() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="text-blue-700 hover:underline">
                Making of TABS
              </Link>
            </li>
            <li aria-hidden="true" className="px-1">
              /
            </li>
            <li>
              <Link
                href="/making-of-tabs/ai-validity-checks"
                className="text-blue-700 hover:underline"
              >
                AI Validity Checks
              </Link>
            </li>
            <li aria-hidden="true" className="px-1">
              /
            </li>
            <li>
              <Link
                href="/making-of-tabs/ai-validity-checks/gemini-3-1-review"
                className="text-blue-700 hover:underline"
              >
                Gemini 3.1 Review
              </Link>
            </li>
            <li aria-hidden="true" className="px-1">
              /
            </li>
            <li aria-current="page" className="font-medium text-gray-900">
              Branch 2 Enterprise Architecture
            </li>
          </ol>
        </nav>
        <h1 className={H1_CLASSES}>Enterprise Architecture Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section reviews the validity of the enterprise architecture frameworks discussed on
            the site, which guide large-scale IT transformations.
          </p>
          <h2 className={H2_CLASSES}>The Open Group Architecture Framework (TOGAF)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site correctly identifies TOGAF as a standard maintained by The Open Group. The
            description of the Architecture Development Method (ADM) and its cyclical nature is
            factually sound. The historical connection to the Department of Defense&apos;s TAFIM is
            also accurately noted.
          </p>
          <h2 className={H2_CLASSES}>Cybersecurity Frameworks (NIST CSF & RMF)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The National Institute of Standards and Technology (NIST) frameworks are accurately
            represented. The core functions of the CSF (Identify, Protect, Detect, Respond, Recover)
            are correctly listed, and the distinction between the CSF (voluntary guidance) and the
            RMF (mandatory for federal systems) is properly explained.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Maturity Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Cloud & AI Frameworks →
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}
