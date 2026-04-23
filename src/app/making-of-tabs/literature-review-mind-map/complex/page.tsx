import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/literature-review-mind-map/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Literature Review Mind Map - Full View | Making of TABS',
  description:
    'Interactive pan-and-zoom view of the full Technology Adoption Barriers Survey (TABS) literature review mind map, covering models, frameworks, standards, and the culminating research project workflow.',
  alternates: {
    canonical: '/making-of-tabs/literature-review-mind-map/complex',
  },
}

const MindMapComplexPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Literature Review Mind Map - Full View</h1>

        <p className="mb-6 text-gray-800">
          This is the complete TABS literature review mind map, exported from Lucidspark. Drag to
          pan, scroll or pinch to zoom, and double-click to return to the fitted view. Smaller
          zoomed-in cuts of each taxonomy branch are listed on the{' '}
          <Link
            href="/making-of-tabs/literature-review-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            mind map overview
          </Link>
          .
        </p>
      </article>

      {/* Break out of the making-of-tabs max-w-4xl container so the full map
          has viewport-wide room to render at a readable default zoom. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <MindMapViewer />
      </div>
    </div>
  )
}

export default MindMapComplexPage
