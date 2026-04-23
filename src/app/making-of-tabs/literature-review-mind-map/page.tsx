import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Literature Review Mind Map | Making of TABS',
  description:
    'Overview of the TABS literature review mind map - a Lucidspark-built map of the models, frameworks, and standards that shape technology adoption research, plus smaller zoomed-in cuts of each taxonomy branch.',
  alternates: {
    canonical: '/making-of-tabs/literature-review-mind-map',
  },
}

const MindMapOverviewPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Literature Review Mind Map</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            The TABS literature review mind map visualizes the full landscape of models, frameworks,
            and standards that underpin the Technology Adoption Barriers Survey. It was built in
            Lucidspark, exported as SVG, and is rendered here with a pan-and-zoom viewer so the
            whole taxonomy - spanning individual adoption theories, organizational frameworks, and
            the culminating research project workflow - stays readable at any scale.
          </p>
          <p className="mb-6">
            The full map is large and information-dense, so this sub-collection also breaks it into
            smaller, focused cuts. Each cut zooms into a single branch of the taxonomy so the
            relationships inside that branch can be studied on its own page.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Views</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Link
              href="/making-of-tabs/literature-review-mind-map/complex"
              className="block rounded-xl border border-blue-200 bg-blue-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-blue-900 mb-1">Full Map (Complex)</p>
              <p className="text-sm text-blue-800">
                The complete Lucidspark export with pan, zoom, and reset controls. Best for
                exploring how every branch connects.
              </p>
            </Link>
          </div>
          <p className="text-sm text-gray-600 italic">
            Individual branch cuts - for example, the individual-level adoption models, the
            organizational frameworks, and the culminating research project workflow - will be added
            to this collection as separate pages as they are carved out of the full map.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Source</h2>
          <p className="mb-4">
            The mind map originates in Lucidspark, where it is maintained as the canonical working
            document for the TABS literature review. The SVG exported from Lucidspark is committed
            to this repository and served as a static asset, so the views on this site always match
            the latest export.
          </p>
        </section>
      </article>
    </div>
  )
}

export default MindMapOverviewPage
