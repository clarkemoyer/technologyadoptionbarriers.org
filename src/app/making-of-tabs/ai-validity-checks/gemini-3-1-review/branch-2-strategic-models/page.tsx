import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Strategic Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of strategic organizational models in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Strategic Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            Moving to Branch 2 (Organization&apos;s Playbook), this section reviews the strategic
            frameworks used to understand technology adoption at the enterprise level.
          </p>
          <h2 className={H2_CLASSES}>Technology-Organization-Environment (TOE) Framework</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            Tornatzky and Fleischer&apos;s (1990) TOE framework is correctly described. The site
            accurately breaks down the three contexts - Technological, Organizational, and
            Environmental - that influence the process by which an organization adopts and
            implements technological innovations.
          </p>
          <h2 className={H2_CLASSES}>Resource-Based View (RBV) & VRIO</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site correctly attributes RBV to Wernerfelt (1984) and Barney (1991). The VRIO
            framework (Value, Rarity, Imitability, Organization) is accurately presented as a tool
            for evaluating whether a firm&apos;s technological resources provide a sustained
            competitive advantage.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Specialized Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Maturity Models →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
