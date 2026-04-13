import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Cloud & AI Frameworks Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of modern cloud and AI adoption frameworks in TABS.',
  alternates: {
    canonical:
      '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Cloud & AI Frameworks Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section audits the most contemporary frameworks on the site, focusing on Cloud and
            Artificial Intelligence adoption.
          </p>
          <h2 className={H2_CLASSES}>Cloud Adoption Frameworks (AWS CAF & Microsoft CAF)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site accurately describes both the AWS Cloud Adoption Framework and the Microsoft
            Cloud Adoption Framework for Azure. The specific perspectives (e.g., Business, People,
            Governance, Platform, Security, Operations for AWS) and methodologies (Strategy, Plan,
            Ready, Adopt, Govern, Manage for Microsoft) are factually correct and reflect current
            vendor documentation.
          </p>
          <h2 className={H2_CLASSES}>NIST AI Risk Management Framework (AI RMF)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The recently released NIST AI RMF (2023) is accurately summarized. The four core
            functions - Govern, Map, Measure, and Manage - are correctly identified, and the
            framework&apos;s focus on trustworthiness characteristics (validity, reliability,
            safety, security, privacy, fairness) is factually sound.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Enterprise Architecture
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/bibliography-and-citations"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Bibliography & Citations →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
