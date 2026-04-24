import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Standards & Regulations | Making of TABS',
  description:
    'Cut of the TABS literature review mind map focused on the standards and regulations families that govern IT adoption.',
  alternates: {
    canonical: '/making-of-tabs/mind-maps/standards-regulations',
  },
}

const StandardsRegulationsPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Standards & Regulations</h1>

        <p className="mb-6 text-gray-800">
          This cut of the TABS mind map zooms into the Standards and Regulations branch - the
          families of standards and compliance regimes (COBIT, ITIL, ISO/IEC 20000 and 27001, PCI
          DSS, CMM/CMMI, Microsoft frameworks, and U.S. federal cybersecurity) that constrain how
          technology gets adopted. It is served from{' '}
          <code>/Svgs/mind-maps/standards-regulations.svg</code>, which currently contains a rough
          viewBox crop of the{' '}
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
        src="/Svgs/mind-maps/standards-regulations.svg"
        alt="Standards & Regulations cut of the TABS mind map."
        ariaLabel="TABS mind map cut: Standards & Regulations"
      />
    </div>
  )
}

export default StandardsRegulationsPage
