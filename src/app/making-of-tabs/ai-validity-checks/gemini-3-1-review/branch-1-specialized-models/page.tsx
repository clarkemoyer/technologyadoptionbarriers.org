import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Specialized Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of specialized adoption models in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Specialized Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section covers specialized models that address specific contexts, such as task fit,
            mobile adoption, and individual personality traits.
          </p>
          <h2 className={H2_CLASSES}>Task-Technology Fit (TTF)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            Goodhue and Thompson&apos;s (1995) TTF model is accurately represented. The site
            correctly explains that technology will only be used if its capabilities match the
            demands of the task, moving beyond mere perception of usefulness to actual performance
            impact.
          </p>
          <h2 className={H2_CLASSES}>Technology Readiness Index (TRI & TRAM)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            Parasuraman&apos;s (2000) TRI and its integration with TAM (TRAM by Lin et al., 2007)
            were audited. The four dimensions of technology readiness - Optimism, Innovativeness,
            Discomfort, and Insecurity - are correctly defined. The site accurately portrays how
            personality traits influence technology acceptance.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Unified Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Strategic Models →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
