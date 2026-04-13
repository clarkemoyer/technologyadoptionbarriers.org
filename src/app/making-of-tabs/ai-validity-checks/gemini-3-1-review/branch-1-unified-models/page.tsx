import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Unified Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of unified adoption models in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Unified Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section details the audit of unified models, which attempt to synthesize previous
            theories into comprehensive frameworks.
          </p>
          <h2 className={H2_CLASSES}>Unified Theory of Acceptance and Use of Technology (UTAUT)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site correctly attributes UTAUT to Venkatesh, Morris, Davis, and Davis (2003). The
            review confirmed that the site accurately lists the four core determinants of intention
            and usage: Performance Expectancy, Effort Expectancy, Social Influence, and Facilitating
            Conditions. The moderating variables (Gender, Age, Experience, Voluntariness of Use) are
            also correctly identified.
          </p>
          <h2 className={H2_CLASSES}>UTAUT2</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The extension of UTAUT to consumer contexts (Venkatesh, Thong, & Xu, 2012) was verified.
            The addition of Hedonic Motivation, Price Value, and Habit as new constructs is
            factually accurate and aligns with the original 2012 publication.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Sociological Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Specialized Models →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
