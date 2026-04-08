import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sociological Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of sociological models in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models',
  },
}

export default function Page() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link
                href="/making-of-tabs/ai-validity-checks"
                className="hover:text-blue-600 hover:underline"
              >
                AI Validity Checks
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link
                href="/making-of-tabs/ai-validity-checks/gemini-3-1-review"
                className="hover:text-blue-600 hover:underline"
              >
                Gemini 3.1 Review
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Branch 1 Sociological Models
            </li>
          </ol>
        </nav>
        <h1 className={H1_CLASSES}>Sociological Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section covers the validity check of sociological models that explain how
            technology spreads through populations and how social environments influence individual
            behavior.
          </p>
          <h2 className={H2_CLASSES}>Diffusion of Innovations (DOI)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The review verified the attribution of DOI to Everett Rogers (1962). The site accurately
            describes the five adopter categories (Innovators, Early Adopters, Early Majority, Late
            Majority, Laggards) and the five attributes of innovations (Relative Advantage,
            Compatibility, Complexity, Trialability, Observability). The historical context of its
            origins in agricultural sociology is correctly stated.
          </p>
          <h2 className={H2_CLASSES}>Social Cognitive Theory (SCT)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            Albert Bandura&apos;s (1986) Social Cognitive Theory was audited for accuracy. The site
            correctly emphasizes the concept of &quot;reciprocal determinism&quot; - the dynamic
            interaction between personal, behavioral, and environmental factors. The application of
            SCT to computer self-efficacy (Compeau & Higgins, 1995) is also factually correct.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Psychological Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Unified Models →
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}
