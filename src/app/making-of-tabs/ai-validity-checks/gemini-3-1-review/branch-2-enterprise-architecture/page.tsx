import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Enterprise Architecture Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of enterprise architecture frameworks in TABS.',
  alternates: {
    canonical:
      '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
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
    </div>
  )
}
