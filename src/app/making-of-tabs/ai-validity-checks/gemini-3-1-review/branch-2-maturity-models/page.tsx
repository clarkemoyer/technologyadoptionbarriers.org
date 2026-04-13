import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Maturity Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of maturity models and hype cycles in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Maturity Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section audits the frameworks used to assess organizational maturity and the
            lifecycle of emerging technologies.
          </p>
          <h2 className={H2_CLASSES}>Capability Maturity Model Integration (CMMI)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site accurately describes CMMI&apos;s origins with the Software Engineering
            Institute (SEI) at Carnegie Mellon University. The five maturity levels (Initial,
            Managed, Defined, Quantitatively Managed, Optimizing) are correctly defined and
            sequenced.
          </p>
          <h2 className={H2_CLASSES}>Gartner Hype Cycle</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The review confirmed the accuracy of the Gartner Hype Cycle description. The five phases
            - Innovation Trigger, Peak of Inflated Expectations, Trough of Disillusionment, Slope of
            Enlightenment, and Plateau of Productivity - are factually correct and align with
            Gartner&apos;s official methodology.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Strategic Models
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Enterprise Architecture →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
