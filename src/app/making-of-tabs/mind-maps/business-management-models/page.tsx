import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Business Management Models | Making of TABS',
  description:
    'Cut of the TABS literature review mind map focused on Business Management frameworks and models from roughly 1989 to 2023.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/business-management-models',
  },
}

const BusinessManagementModelsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Business Management Models</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the Business Management branch - strategic,
          operational, and change-management frameworks that shaped how organisations think about
          technology adoption from roughly 1989 through 2023. It renders the{' '}
          <Link
            href="/making-of-tabs/mind-maps/full-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            full mind map
          </Link>{' '}
          SVG with the viewport focused on this branch - pan, zoom, or double-click to reset back to
          the Business Management framing.
        </p>
      </article>

      {/* Break out of the making-of-tabs max-w-4xl container so the cut has viewport-wide room. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip">
        <MindMapViewer
          src="/Svgs/mind-maps/full-mind-map.svg"
          alt="Business Management Models cut of the TABS mind map."
          ariaLabel="TABS mind map cut: Business Management Models"
          initialFocus={{ x: 2900, y: 4500, w: 3700, h: 2200 }}
        />
      </div>
    </div>
  )
}

export default BusinessManagementModelsPage
