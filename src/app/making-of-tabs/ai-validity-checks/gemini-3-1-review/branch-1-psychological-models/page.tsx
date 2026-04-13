import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Psychological Models Review - Making of TABS',
  description: 'Gemini 3.1 Pro validity check of foundational psychological models in TABS.',
  alternates: {
    canonical: '/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models',
  },
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Psychological Models Review</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This section details the validity check performed on the foundational psychological
            models presented in Branch 1 of the TABS series. These models form the bedrock of our
            understanding of individual technology adoption.
          </p>
          <h2 className={H2_CLASSES}>Theory of Reasoned Action (TRA)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The review confirmed that TRA is correctly attributed to Martin Fishbein and Icek Ajzen
            (1975). The core constructs - Attitude Toward Behavior and Subjective Norm leading to
            Behavioral Intention - are accurately described. The site correctly notes TRA&apos;s
            origins in social psychology rather than technology specifically.
          </p>
          <h2 className={H2_CLASSES}>Theory of Planned Behavior (TPB)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            The site accurately attributes TPB to Icek Ajzen (1985, 1991) as an extension of TRA.
            The addition of the &quot;Perceived Behavioral Control&quot; construct is correctly
            identified as the key differentiator, addressing situations where individuals lack
            complete volitional control over their behavior.
          </p>
          <h2 className={H2_CLASSES}>Technology Acceptance Model (TAM)</h2>
          <p className="mb-4">
            <strong>Verification Status:</strong>{' '}
            <span className="text-green-600 font-bold">Verified Accurate</span>
          </p>
          <p className="mb-4">
            Fred Davis&apos;s (1989) seminal Technology Acceptance Model was rigorously checked. The
            site correctly identifies Perceived Usefulness (PU) and Perceived Ease of Use (PEOU) as
            the primary determinants of technology acceptance. The historical context of TAM
            adapting TRA specifically for information systems is factually sound.
          </p>
          <div className="mt-8 flex justify-between">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/methodology"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Previous: Methodology
            </Link>
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models"
              className="text-blue-600 hover:underline font-medium"
            >
              Next: Sociological Models →
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
