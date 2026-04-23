import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Project, Program & Risk Management | Making of TABS',
  description:
    'Cut of the TABS literature review mind map focused on project, program, and risk management frameworks.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/project-program-risk-management',
  },
}

const ProjectProgramRiskManagementPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Project, Program & Risk Management</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the Project, Program, and Risk Management branch
          - the delivery and risk frameworks (PMBOK, PRINCE2, risk management standards) that sit
          between strategy and execution. It is served from{' '}
          <code>/Svgs/mind-maps/project-program-risk-management.svg</code>, which currently contains
          a rough viewBox crop of the{' '}
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

      {/* Break out of the making-of-tabs max-w-4xl container so the cut has viewport-wide room. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip">
        <MindMapViewer
          src="/Svgs/mind-maps/project-program-risk-management.svg"
          alt="Project, Program & Risk Management cut of the TABS mind map."
          ariaLabel="TABS mind map cut: Project, Program & Risk Management"
        />
      </div>
    </div>
  )
}

export default ProjectProgramRiskManagementPage
