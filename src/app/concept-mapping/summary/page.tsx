import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import ConceptMappingSummary from '@/components/tabs/concept-mapping/summary'

export const metadata: Metadata = {
  title: 'Concept Mapping Summary | TABS',
  description:
    'TABS V2 survey structure summary showing section counts, question types, scale methods, and revision notes from the verified concept mapping.',
}

export default function ConceptMappingSummaryPage() {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-gray-50">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          TABS Survey Structure Summary - V2
          <span className="mt-2 block text-base font-normal text-gray-500 sm:text-lg">
            From Qualtrics QSF Export, March 2026
          </span>
        </h1>

        <ConceptMappingSummary />
      </article>
    </main>
  )
}
