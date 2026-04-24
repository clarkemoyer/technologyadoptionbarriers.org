import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'IT & IT Management Models | Making of TABS',
  description:
    'Cut of the TABS literature review mind map focused on IT and IT management models from roughly 1989 to 2023.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/it-management-models',
  },
}

const ItManagementModelsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>IT & IT Management Models</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the IT and IT Management branch - the models and
          theories that describe how technology is adopted, governed, and managed inside the IT
          function. It is served from <code>/Svgs/mind-maps/it-management-models.svg</code>, which
          currently contains a rough viewBox crop of the{' '}
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
        src="/Svgs/mind-maps/it-management-models.svg"
        alt="IT & IT Management Models cut of the TABS mind map."
        ariaLabel="TABS mind map cut: IT & IT Management Models"
      />
    </div>
  )
}

export default ItManagementModelsPage
