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
          operationalisation, implementation, and public distribution. It is served from{' '}
          <code>/Svgs/mind-maps/culminating-research-project.svg</code>, which currently contains a
          rough viewBox crop of the{' '}
          <Link
            href="/making-of-tabs/mind-maps/full-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            full mind map
          </Link>
          . The file will be replaced with a dedicated Lucidspark export for this cluster as soon as
          one is available.
        </p>
      </article>

      <MindMapViewer
        src="/Svgs/mind-maps/culminating-research-project.svg"
        alt="Culminating Research Project Workflow cut of the TABS mind map."
        ariaLabel="TABS mind map cut: Culminating Research Project Workflow"
      />
    </div>
  )
}

export default CulminatingResearchProjectPage
