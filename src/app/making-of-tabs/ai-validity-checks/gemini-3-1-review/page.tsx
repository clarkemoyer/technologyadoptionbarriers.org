import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Gemini 3.1 Validity Review - Making of TABS',
  description:
    'The comprehensive validity review conducted by Gemini 3.1 Pro on the TABS public content.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Gemini 3.1 Validity Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            In February 2026, we commissioned Gemini 3.1 Pro to conduct a full, read-only validity
            check of the Technology Adoption Barriers (TABS) website. The objective was to
            rigorously audit our extensive library of academic models, organizational frameworks,
            and bibliographical data.
          </p>
          <p className="mb-6">
            This review spans over 10 detailed sections, breaking down the verification of
            psychological models, sociological theories, enterprise architecture frameworks, and
            more. Gemini 3.1 Pro utilized its advanced reasoning and vast training data to
            cross-reference our claims against established academic literature.
          </p>
          <h2 className={H2_CLASSES}>Review Sections</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/methodology"
              className="text-blue-600 hover:underline font-medium"
            >
              1. Methodology
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              2. Psychological Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              3. Sociological Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models"
              className="text-blue-600 hover:underline font-medium"
            >
              4. Unified Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models"
              className="text-blue-600 hover:underline font-medium"
            >
              5. Specialized Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models"
              className="text-blue-600 hover:underline font-medium"
            >
              6. Strategic Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models"
              className="text-blue-600 hover:underline font-medium"
            >
              7. Maturity Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture"
              className="text-blue-600 hover:underline font-medium"
            >
              8. Enterprise Architecture
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks"
              className="text-blue-600 hover:underline font-medium"
            >
              9. Cloud & AI Frameworks
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/bibliography-and-citations"
              className="text-blue-600 hover:underline font-medium"
            >
              10. Bibliography & Citations
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/conclusion"
              className="text-blue-600 hover:underline font-medium"
            >
              11. Conclusion
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
