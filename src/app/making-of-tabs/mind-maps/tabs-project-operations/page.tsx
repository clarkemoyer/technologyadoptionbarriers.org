import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'TABS Project Operations | Making of TABS',
  description:
    'Cut of the TABS mind map focused on the operational side of the TABS project itself - the website, content, and partnership infrastructure.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/tabs-project-operations',
  },
}

const TabsProjectOperationsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>TABS Project Operations</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the TABS Project Operations branch - the
          operational side of the TABS project itself (website infrastructure and compliance,
          content strategy, and partnership fostering) as distinct from the literature review
          taxonomy. It renders the{' '}
          <Link
            href="/making-of-tabs/mind-maps/full-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            full mind map
          </Link>{' '}
          SVG with the viewport focused on this branch - pan, zoom, or double-click to reset back to
          the TABS Project Operations framing.
        </p>
      </article>

      {/* Break out of the making-of-tabs max-w-4xl container so the cut has viewport-wide room. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip">
        <MindMapViewer
          src="/Svgs/mind-maps/full-mind-map.svg"
          alt="TABS Project Operations cut of the TABS mind map."
          ariaLabel="TABS mind map cut: TABS Project Operations"
          initialFocus={{ x: 7400, y: 0, w: 2800, h: 1600 }}
        />
      </div>
    </div>
  )
}

export default TabsProjectOperationsPage
