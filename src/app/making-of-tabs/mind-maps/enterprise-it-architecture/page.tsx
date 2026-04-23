import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Enterprise & IT Architecture | Making of TABS',
  description:
    'Cut of the TABS literature review mind map focused on Enterprise and IT Architecture frameworks.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/enterprise-it-architecture',
  },
}

const EnterpriseItArchitecturePage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Enterprise & IT Architecture</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the Enterprise and IT Architecture branch - the
          architecture frameworks (Zachman, TOGAF, FEAF, and their kin) that structure how
          enterprises reason about technology stacks. It renders the{' '}
          <Link
            href="/making-of-tabs/mind-maps/full-mind-map"
            className="text-blue-600 underline hover:text-blue-800"
          >
            full mind map
          </Link>{' '}
          SVG with the viewport focused on this branch - pan, zoom, or double-click to reset back to
          the Enterprise & IT Architecture framing.
        </p>
      </article>

      {/* Break out of the making-of-tabs max-w-4xl container so the cut has viewport-wide room. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-x-clip">
        <MindMapViewer
          src="/Svgs/mind-maps/full-mind-map.svg"
          alt="Enterprise & IT Architecture cut of the TABS mind map."
          ariaLabel="TABS mind map cut: Enterprise & IT Architecture"
          initialFocus={{ x: 0, y: 4500, w: 2900, h: 2200 }}
        />
      </div>
    </div>
  )
}

export default EnterpriseItArchitecturePage
