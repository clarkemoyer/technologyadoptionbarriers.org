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
                The complete Lucidspark export covering every branch - best for exploring how the
                whole taxonomy connects.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/business-management-models"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">Business Management Models</p>
              <p className="text-sm text-slate-700">
                Strategic, operational, and change-management frameworks (~1989-2023).
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/it-management-models"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">IT &amp; IT Management Models</p>
              <p className="text-sm text-slate-700">
                Technology adoption, governance, and IT-function management models.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/enterprise-it-architecture"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">Enterprise &amp; IT Architecture</p>
              <p className="text-sm text-slate-700">
                Architecture frameworks (Zachman, TOGAF, FEAF) that structure enterprise tech
                stacks.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/project-program-risk-management"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">
                Project, Program &amp; Risk Management
              </p>
              <p className="text-sm text-slate-700">
                Delivery and risk frameworks (PMBOK, PRINCE2) between strategy and execution.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/standards-regulations"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">Standards &amp; Regulations</p>
              <p className="text-sm text-slate-700">
                COBIT, ITIL, ISO/IEC 20000, ISO/IEC 27001, PCI DSS, CMM/CMMI, Microsoft, U.S.
                federal cybersecurity.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/tabs-project-operations"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">TABS Project Operations</p>
              <p className="text-sm text-slate-700">
                Website infrastructure, content strategy, and partnership fostering for the TABS
                project itself.
              </p>
            </Link>
            <Link
              href="/making-of-tabs/mind-maps/culminating-research-project"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md"
            >
              <p className="font-bold text-slate-900 mb-1">Culminating Research Project</p>
              <p className="text-sm text-slate-700">
                The six-phase workflow: conceptualisation, deconstruction, design,
                operationalisation, implementation, distribution.
              </p>
            </Link>
          </div>
          <p className="text-sm text-gray-600 italic">
            Each branch cut renders the full Lucidspark SVG with the viewport focused on that
            cluster - pan, zoom, or double-click to reset back to the branch framing, or open the
            full map for an unconstrained view.
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
