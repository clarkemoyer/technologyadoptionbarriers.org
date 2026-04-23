import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Culminating Research Project Workflow | Making of TABS',
  description:
    'Cut of the TABS mind map focused on the Culminating Research Project (CRP) six-phase product-development workflow.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/culminating-research-project',
  },
}

const CulminatingResearchProjectPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Culminating Research Project Workflow</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the Culminating Research Project workflow - the
          six phases that move TABS from construct identification through survey instrument design,
          operationalisation, implementation, and public distribution. It renders the{' '}
          <Link
            href="/making-of-tabs/mind-maps/full-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            full mind map
          </Link>{' '}
          SVG with the viewport focused on this branch - pan, zoom, or double-click to reset back to
          the CRP framing.
        </p>
      </article>

      {/* Break out of the making-of-tabs max-w-4xl container so the cut has viewport-wide room. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip">
        <MindMapViewer
          src="/Svgs/mind-maps/full-mind-map.svg"
          alt="Culminating Research Project Workflow cut of the TABS mind map."
          ariaLabel="TABS mind map cut: Culminating Research Project Workflow"
          initialFocus={{ x: 5300, y: 700, w: 3700, h: 1100 }}
        />
      </div>
    </div>
  )
}

export default CulminatingResearchProjectPage
