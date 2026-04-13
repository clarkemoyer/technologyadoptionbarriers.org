import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'AI Validity Checks - Making of TABS',
  description:
    'An overview of how we use advanced AI models to perform rigorous validity checks on our academic and organizational content.',
}

export default function Page() {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>AI Validity Checks</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            At Technology Adoption Barriers (TABS), ensuring the factual accuracy and academic rigor
            of our content is paramount. To achieve this at scale, we employ advanced Large Language
            Models (LLMs) to conduct exhaustive, read-only validity checks across our entire
            public-facing site.
          </p>
          <p className="mb-6">
            These AI Validity Checks are designed to audit our academic models, organizational
            frameworks, bibliographies, and general site copy. By leveraging the vast internal
            knowledge bases of models like Gemini 3.1 Pro, we can cross-reference our claims, dates,
            and author attributions against established literature with unprecedented speed and
            accuracy.
          </p>
          <h2 className={H2_CLASSES}>The Nature of the Review</h2>
          <p className="mb-4">
            The validity review process is strictly read-only. The AI is instructed to act as an
            independent auditor, scanning the codebase and extracting factual claims without making
            any modifications. The primary goal is to identify:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>False statements or misrepresentations of academic theories.</li>
            <li>Incorrect attributions of models to authors.</li>
            <li>Inaccurate publication dates or historical timelines.</li>
            <li>Formatting errors in APA citations and bibliographies.</li>
          </ul>
          <h2 className={H2_CLASSES}>The Prompt</h2>
          <p className="mb-4">
            To initiate these reviews, we use a highly specific prompt designed to constrain the
            AI&apos;s behavior and focus its analytical capabilities:
          </p>
          <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-700 mb-6 bg-gray-50 p-4 rounded-r-md">
            &quot;I want to do a full validity check on the public content on the site. I am looking
            for false statements and wrong academic findings or other errors. Don&apos;t make any
            changes; your goal is to find and present the factual errors in the content. Then we
            will address them one by one.&quot;
          </blockquote>
          <h2 className={H2_CLASSES}>Model Reviews</h2>
          <p className="mb-4">
            Below, you will find detailed reports from our AI validity checks, categorized by the
            model that performed the audit.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Link
              href="/making-of-tabs/ai-validity-checks/gemini-3-1-review"
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
            >
              <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
                Gemini 3.1 Pro Validity Review
              </h3>
              <p className="font-normal text-gray-700">
                A comprehensive 10+ page audit of all TABS content, verifying over 30 academic and
                organizational frameworks.
              </p>
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}
