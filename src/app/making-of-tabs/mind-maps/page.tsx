import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Mind Maps | Making of TABS',
  description:
    'Gallery of TABS mind maps - Lucidspark-built visualizations of the models, frameworks, and standards that shape technology adoption research, plus smaller zoomed-in cuts of each taxonomy branch.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps',
  },
}

const MindMapsOverviewPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Mind Maps</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This collection holds the interactive mind maps that sit behind the Technology Adoption
            Barriers Survey. Each map is built in Lucidspark, exported as SVG, and rendered on its
            own page with a pan-and-zoom viewer so the full taxonomy stays readable at any scale.
          </p>
          <p className="mb-6">
            The full literature review map is large and information-dense, so this collection also
            grows with smaller zoomed-in cuts. Each cut focuses on a single branch of the taxonomy
            and lives as its own page alongside the full map.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Available Maps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Link
              href="/making-of-tabs/mind-maps/full-mind-map"
              className="block rounded-xl border border-blue-200 bg-blue-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-blue-900 mb-1">Full Mind Map</p>
              <p className="text-sm text-blue-800">
                The complete Lucidspark export covering Business Management, IT, Enterprise
                Architecture, Project/Program/Risk Management, Standards &amp; Regulations, Website
                Operations, and the Culminating Research Project workflow.
              </p>
            </Link>
          </div>
          <p className="text-sm text-gray-600 italic">
            Branch-specific cuts carved out of the full map will join this gallery as separate
            pages. Planned cuts: Business Management Models, IT &amp; IT Management Models,
            Enterprise &amp; IT Architecture, Project/Program/Risk Management, Standards &amp;
            Regulations, TABS Project Operations, and the Culminating Research Project workflow.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Source</h2>
          <p className="mb-4">
            Each map originates in Lucidspark, where it is maintained as the canonical working
            document. The SVG exported from Lucidspark is committed to this repository and served as
            a static asset, so the views on this site always match the latest export.
          </p>
        </section>
      </article>
    </div>
  )
}

export default MindMapsOverviewPage
