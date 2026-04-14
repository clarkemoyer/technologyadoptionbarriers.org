import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_OL_CLASSES,
} from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'
import ArticleTOC from '@/components/article-toc'

export const metadata: Metadata = {
  title: 'Comprehensive Series Bibliography: Foundations of Technology Adoption',
  description:
    'Definitive, exhaustive bibliography for the “Technology Adoption Models” series, covering individual user journeys and organizational playbooks with fully cited APA references.',
}

const BibliographyPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Comprehensive Series Bibliography: Foundations of Technology Adoption
        </h1>

        {/* Executive Summary */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Executive Summary</h2>
          <p className={PARAGRAPH_CLASSES}>
            This bibliography serves as the definitive, exhaustive scholarly record for the
            &ldquo;Technology Adoption Models&rdquo; series. It consolidates every intellectual
            foundation identified in the project&rsquo;s research database, bifurcated into the{' '}
            <strong>Individual User&rsquo;s Journey</strong> (Branch 1) and the{' '}
            <strong>Organization&rsquo;s Playbook</strong> (Branch 2).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For doctoral-level researchers, this document provides the complete longitudinal record
            of theory evolution, ensuring no seminal work from the source RIS datasets is omitted.
            For executive leadership, it establishes a high-fidelity audit trail for every framework
            and standard referenced in the strategic roadmap. Every entry is meticulously
            synchronized with the project&rsquo;s Zotero database, utilizing the exact persistent
            identifiers (URLs) and specific access dates (Y2 metadata) provided in the source files.
          </p>
        </section>

        {/* How to Use This Bibliography */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>How to Use This Bibliography</h2>
          <p className={PARAGRAPH_CLASSES}>
            To facilitate rapid navigation and deep verification, this document is structured into
            four distinct sections:
          </p>
          <ol className={BODY_OL_CLASSES}>
            <li>
              <strong>Individual Model Articles: </strong>New dedicated pages for each of the 21
              individual technology adoption models, featuring detailed histories, methodologies,
              and validation approaches. Click any model to explore in depth.
            </li>
            <li>
              <strong>Organizational Model Articles: </strong>New dedicated pages for the
              organizational-level frameworks (Branch 2: The Organization&rsquo;s Playbook),
              covering strategic and resource-based theories underpinning enterprise technology
              adoption. Click any framework to explore in depth.
            </li>
            <li>
              <strong>Inventory Dashboard (Quick Scan): </strong>Located immediately below, this
              section provides a high-level list of all unique titles and authors in a side-by-side
              comparison. Use this for a fast &ldquo;at-a-glance&rdquo; verification of the scope
              and coverage of each track.
            </li>
            <li>
              <strong>Detailed APA Reference Lists: </strong>Located further down, these sections
              provide the complete, APA-formatted citations for every entry, separated by track. Use
              these for academic referencing and verification of source authority.
            </li>
          </ol>
        </section>

        {/* Individual Model Articles */}
        <section className="mb-8 sm:mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
          <h2 id="individual-model-articles-new" className={H2_CLASSES}>
            📚 Individual Model Articles (New!)
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Each of the 21 individual technology adoption models now has its own dedicated article
            page. Click any model below to explore its history, methodology, validation, and impact
            on the field.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/bibliography-1-1-theory-of-reasoned-action-tra-fishbein-ajzen-1975"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">1. Theory of Reasoned Action</div>
              <div className="text-sm text-gray-600">Fishbein &amp; Ajzen (1975)</div>
            </Link>
            <Link
              href="/bibliography-1-2-diffusion-of-innovations-rogers"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">2. Diffusion of Innovations</div>
              <div className="text-sm text-gray-600">Rogers (1962/2003)</div>
            </Link>
            <Link
              href="/bibliography-1-3-social-cognitive-theory-sct-bandura-1986"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">3. Social Cognitive Theory</div>
              <div className="text-sm text-gray-600">Bandura (1986)</div>
            </Link>
            <Link
              href="/bibliography-1-4-model-of-innovation-resistance-ram-sheth-1989"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">4. Innovation Resistance</div>
              <div className="text-sm text-gray-600">Ram &amp; Sheth (1989)</div>
            </Link>
            <Link
              href="/bibliography-1-5-status-quo-bias-samuelson-zeckhauser-1988"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">5. Status Quo Bias</div>
              <div className="text-sm text-gray-600">Samuelson &amp; Zeckhauser (1988)</div>
            </Link>
            <Link
              href="/bibliography-1-6-technology-acceptance-model-tam-davis-1989"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">6. Technology Acceptance Model</div>
              <div className="text-sm text-gray-600">Davis (1989)</div>
            </Link>
            <Link
              href="/bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">7. Theory of Planned Behavior</div>
              <div className="text-sm text-gray-600">Ajzen (1991)</div>
            </Link>
            <Link
              href="/bibliography-1-8-personal-computing-acceptance-thompson-1991"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">8. Personal Computing Acceptance</div>
              <div className="text-sm text-gray-600">Thompson et al. (1991)</div>
            </Link>
            <Link
              href="/bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">9. Motivation Framework</div>
              <div className="text-sm text-gray-600">Davis et al. (1992)</div>
            </Link>
            <Link
              href="/bibliography-1-10-decomposed-tpb-taylor-todd-1995"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">10. Decomposed TPB</div>
              <div className="text-sm text-gray-600">Taylor &amp; Todd (1995)</div>
            </Link>
            <Link
              href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">11. Task-Technology Fit</div>
              <div className="text-sm text-gray-600">Goodhue &amp; Thompson (1995)</div>
            </Link>
            <Link
              href="/bibliography-1-12-technology-readiness-index-tri-parasuraman-2000"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">12. Technology Readiness Index</div>
              <div className="text-sm text-gray-600">Parasuraman (2000)</div>
            </Link>
            <Link
              href="/bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">13. TAM2</div>
              <div className="text-sm text-gray-600">Venkatesh &amp; Davis (2000)</div>
            </Link>
            <Link
              href="/bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">14. Expectation-Confirmation Model</div>
              <div className="text-sm text-gray-600">Bhattacherjee (2001)</div>
            </Link>
            <Link
              href="/bibliography-1-15-unified-theory-utaut-venkatesh-2003"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">15. UTAUT</div>
              <div className="text-sm text-gray-600">Venkatesh et al. (2003)</div>
            </Link>
            <Link
              href="/bibliography-1-16-math-venkatesh-brown-2001"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">16. MATH</div>
              <div className="text-sm text-gray-600">Venkatesh &amp; Brown (2001)</div>
            </Link>
            <Link
              href="/bibliography-1-17-value-based-adoption-kim-2007"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">17. Value-Based Adoption</div>
              <div className="text-sm text-gray-600">Kim et al. (2007)</div>
            </Link>
            <Link
              href="/bibliography-1-18-tram-lin-2007"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">18. TRAM</div>
              <div className="text-sm text-gray-600">Lin et al. (2007)</div>
            </Link>
            <Link
              href="/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">19. TAM3</div>
              <div className="text-sm text-gray-600">Venkatesh &amp; Bala (2008)</div>
            </Link>
            <Link
              href="/bibliography-1-20-utaut2-venkatesh-2012"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">20. UTAUT2</div>
              <div className="text-sm text-gray-600">Venkatesh et al. (2012)</div>
            </Link>
            <Link
              href="/bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-blue-600">21. TRI 2.0</div>
              <div className="text-sm text-gray-600">Parasuraman &amp; Colby (2015)</div>
            </Link>
          </div>
        </section>

        {/* Organizational Model Articles */}
        <section className="mb-8 sm:mb-12 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
          <h2 id="organizational-model-articles-new" className={H2_CLASSES}>
            🏢 Organizational Model Articles (New!)
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Each of the organizational-level frameworks in Branch 2 (The Organization&rsquo;s
            Playbook) now has its own dedicated article page. Click any framework below to explore
            its history, strategic applications, and relevance to enterprise technology adoption.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/bibliography-2-1-resource-based-view-rbv-wernerfelt-1984"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">1. Resource-Based View (RBV)</div>
              <div className="text-sm text-gray-600">Wernerfelt (1984)</div>
            </Link>
            <Link
              href="/bibliography-2-2-vrio-framework-barney-1991"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">2. VRIO Framework</div>
              <div className="text-sm text-gray-600">Barney (1991)</div>
            </Link>
            <Link
              href="/bibliography-2-3-dynamic-capabilities-teece-1997"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">3. Dynamic Capabilities Framework</div>
              <div className="text-sm text-gray-600">Teece, Pisano, &amp; Shuen (1997)</div>
            </Link>
            <Link
              href="/bibliography-2-4-total-quality-management-tqm-deming-1982"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">4. Total Quality Management (TQM)</div>
              <div className="text-sm text-gray-600">Deming (1982)</div>
            </Link>
            <Link
              href="/bibliography-2-5-capability-maturity-model-cmm-humphrey-1989"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">5. Capability Maturity Model (CMM)</div>
              <div className="text-sm text-gray-600">Humphrey (1989)</div>
            </Link>
            <Link
              href="/bibliography-2-6-toe-framework-tornatzky-1990"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                6. Technology-Organization-Environment (TOE) Framework
              </div>
              <div className="text-sm text-gray-600">
                Tornatzky, Fleischer &amp; Chakrabarti (1990)
              </div>
            </Link>
            <Link
              href="/bibliography-2-7-it-implementation-research-cooper-zmud-1990"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">7. IT Implementation Research</div>
              <div className="text-sm text-gray-600">Cooper &amp; Zmud (1990)</div>
            </Link>
            <Link
              href="/bibliography-2-8-business-process-redesign-davenport-short-1990"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">8. Business Process Redesign (BPR)</div>
              <div className="text-sm text-gray-600">Davenport &amp; Short (1990)</div>
            </Link>
            <Link
              href="/bibliography-2-9-business-process-reengineering-hammer-champy-1993"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                9. Business Process Reengineering (BPR)
              </div>
              <div className="text-sm text-gray-600">Hammer &amp; Champy (1993)</div>
            </Link>
            <Link
              href="/bibliography-2-10-tafim-dod-1994"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">10. TAFIM</div>
              <div className="text-sm text-gray-600">U.S. DoD (1994)</div>
            </Link>
            <Link
              href="/bibliography-2-11-gartner-hype-cycle-fenn-1995"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">11. Gartner Hype Cycle</div>
              <div className="text-sm text-gray-600">Fenn &amp; Gartner (1995)</div>
            </Link>
            <Link
              href="/bibliography-2-12-togaf-the-open-group-1995"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">12. TOGAF</div>
              <div className="text-sm text-gray-600">The Open Group (1995)</div>
            </Link>
            <Link
              href="/bibliography-2-13-dodaf-dod-2003"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">13. DoDAF</div>
              <div className="text-sm text-gray-600">U.S. DoD (2003)</div>
            </Link>
            <Link
              href="/bibliography-2-14-cmmi-chrissis-2005"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                14. Capability Maturity Model Integration (CMMI)
              </div>
              <div className="text-sm text-gray-600">Chrissis, Konrad &amp; Shrum (2005)</div>
            </Link>
            <Link
              href="/bibliography-2-15-it-cmf-innovation-value-institute-2016"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                15. IT Capability Maturity Framework (IT-CMF)
              </div>
              <div className="text-sm text-gray-600">Innovation Value Institute (2016)</div>
            </Link>
            <Link
              href="/bibliography-2-16-aws-caf-ai-2024"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                16. AWS Cloud Adoption Framework for AI/ML (CAF-AI)
              </div>
              <div className="text-sm text-gray-600">Amazon Web Services (2024)</div>
            </Link>
            <Link
              href="/bibliography-2-17-aws-etf-prescriptive-guidance-2024"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                17. AWS Enterprise Transformation Framework (ETF)
              </div>
              <div className="text-sm text-gray-600">Amazon Web Services (2024)</div>
            </Link>
            <Link
              href="/bibliography-2-18-microsoft-cloud-adoption-framework-2025"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                18. Microsoft Cloud Adoption Framework for Azure (CAF)
              </div>
              <div className="text-sm text-gray-600">Microsoft (2025)</div>
            </Link>
            <Link
              href="/bibliography-2-19-microsoft-ai-adoption-framework-2025"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                19. Microsoft AI Adoption Framework
              </div>
              <div className="text-sm text-gray-600">Microsoft (2025)</div>
            </Link>
            <Link
              href="/bibliography-2-20-gartner-hype-cycle-methodology-2025"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">20. Gartner Hype Cycle Methodology</div>
              <div className="text-sm text-gray-600">Gartner (2025)</div>
            </Link>
            <Link
              href="/bibliography-2-21-diffusion-of-innovations-organizational-rogers-1962"
              className="block p-3 bg-white rounded border border-gray-300 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-green-700">
                21. Diffusion of Innovations (Organizational)
              </div>
              <div className="text-sm text-gray-600">Rogers (1962)</div>
            </Link>
          </div>
        </section>

        {/* Inventory Dashboard */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Inventory Dashboard</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                    Track 1: The Individual User&rsquo;s Journey (n=21)
                    <br />
                    <span className="text-xs font-normal">
                      Verified against Individual RIS export.
                    </span>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                    Track 2: The Organization&rsquo;s Playbook (n=21)
                    <br />
                    <span className="text-xs font-normal">Verified against Org RIS export.</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Ajzen (1991) - The theory of planned behavior
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Alexander Wöhlke et al. (2024) - AWS Cloud Adoption Framework (AI/ML)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Bandura (1986) - Social foundations of thought and action
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Barney (1991) - Firm Resources and Sustained Competitive Advantage
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Bhattacherjee (2001) - Understanding information systems continuance
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Chrissis, Konrad, &amp; Shrum (2003) - CMMI: Guidelines
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Brown &amp; Venkatesh (2005) - Model of Adoption of Technology in Households
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Cooper &amp; Zmud (1990) - IT Implementation Research
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Davis (1989) - Perceived Usefulness, Perceived Ease of Use...
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Davenport &amp; Short (1990) - The New Industrial Engineering
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Davis, Bagozzi, &amp; Warshaw (1992) - Extrinsic and Intrinsic Motivation...
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Deming (1982) - Quality, productivity, and competitive position
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Fishbein &amp; Ajzen (1975) - Belief, attitude, intention, and behavior
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Fenn (1995) - When to Leap on the Hype Cycle
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Goodhue &amp; Thompson (1995) - Task-Technology Fit
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Gartner (2025) - Hype Cycle Research Methodology
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Kim, Chan, &amp; Gupta (2007) - Value-based Adoption of Mobile Internet
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Gladwell &amp; Watson (2024) - AWS Prescriptive Guidance
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Lin, Shih, &amp; Sher (2007) - Integrating technology readiness (TRAM)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Hammer &amp; Champy (1993) - Reengineering the corporation
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Parasuraman (2000) - Technology readiness index (TRI)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Humphrey (1989) - Managing the software process
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Parasuraman &amp; Colby (2015) - TRI 2.0
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Innovation Value Institute (2016) - IT Capability Maturity Framework (IT-CMF)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Ram (1987) - Model of Innovation Resistance
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Rogers (1962) - Diffusion of innovations
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Rogers (1962) - Diffusion of innovations
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Sumner (2025, April) - Microsoft AI adoption
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Samuelson &amp; Zeckhauser (1988) - Status Quo Bias
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Sumner &amp; Microsoft (2025) - Microsoft Cloud Adoption Framework
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Taylor &amp; Todd (1995) - Understanding Information Technology Usage
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Teece, Pisano, &amp; Shuen (1997) - Dynamic capabilities
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Thompson, Higgins, &amp; Howell (1991) - Personal Computing (MPCU)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    The Open Group (1995) - TOGAF
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh &amp; Bala (2008) - TAM 3
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Tornatzky, Fleischer, &amp; Chakrabarti (1990) - The processes of technological
                    innovation
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh &amp; Davis (2000) - TAM 2
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    U.S. DoD (1994) - TAFIM Version 3.0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh et al. (2003) - UTAUT
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    U.S. DoD (2003) - DoDAF Version 1.0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh et al. (2012) - UTAUT 2
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Wernerfelt (1984) - A Resource-based View of the Firm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Track 1 References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Detailed APA Reference List: Track 1 (Individual)</h2>
          <div className="space-y-4">
            <p className="pl-8 -indent-8">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes, 50</em>(2), 179-211.
              https://doi.org/10.1016/0749-5978(91)90020-T
            </p>
            <p className="pl-8 -indent-8">
              Bandura, A. (1986).{' '}
              <em>Social foundations of thought and action: A social cognitive theory</em>.
              Prentice-Hall.
            </p>
            <p className="pl-8 -indent-8">
              Bhattacherjee, A. (2001). Understanding information systems continuance: An
              expectation-confirmation model. <em>MIS Quarterly, 25</em>(3), 351-370.
            </p>
            <p className="pl-8 -indent-8">
              Brown, S. A., &amp; Venkatesh, V. (2005). Model of Adoption of Technology in
              Households: A Baseline Model Test and Extension Incorporating Household Life Cycle.{' '}
              <em>MIS Quarterly, 29</em>(3), 399-426. https://doi.org/10.2307/25148690
            </p>
            <p className="pl-8 -indent-8">
              Davis, F. D. (1989). Perceived Usefulness, Perceived Ease of Use, and User Acceptance
              of Information Technology. <em>MIS Quarterly, 13</em>(3), 319-340.
              https://doi.org/10.2307/249008
            </p>
            <p className="pl-8 -indent-8">
              Davis, F. D., Bagozzi, R. P., &amp; Warshaw, P. R. (1992). Extrinsic and Intrinsic
              Motivation to Use Computers in the Workplace.{' '}
              <em>Journal of Applied Social Psychology, 22</em>(14), 1111-1132.
              https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
            </p>
            <p className="pl-8 -indent-8">
              Fishbein, M., &amp; Ajzen, I. (1975).{' '}
              <em>
                Belief, attitude, intention, and behavior: An introduction to theory and research
              </em>
              . Addison-Wesley Pub. Co.
            </p>
            <p className="pl-8 -indent-8">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-Technology Fit and Individual
              Performance. <em>MIS Quarterly, 19</em>(2), 213-236. https://doi.org/10.2307/249689
            </p>
            <p className="pl-8 -indent-8">
              Kim, H.-W., Chan, H. C., &amp; Gupta, S. (2007). Value-based Adoption of Mobile
              Internet: An empirical investigation. <em>Decision Support Systems, 43</em>(1),
              111-126. https://doi.org/10.1016/j.dss.2005.05.009
            </p>
            <p className="pl-8 -indent-8">
              Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (2007). Integrating technology readiness
              into technology acceptance: The TRAM model. <em>Psychology &amp; Marketing, 24</em>
              (7), 641-657. https://doi.org/10.1002/mar.20177
            </p>
            <p className="pl-8 -indent-8">
              Parasuraman, A. (2000). Technology readiness index (TRI): A multiple-item scale to
              measure readiness to embrace new technologies. <em>Journal of Service Research, 2</em>
              (4), 307-320.
            </p>
            <p className="pl-8 -indent-8">
              Parasuraman, A., &amp; Colby, C. L. (2015). An Updated and Streamlined Technology
              Readiness Index: TRI 2.0. <em>Journal of Service Research, 18</em>(1), 59-74.
              https://doi.org/10.1177/1094670514539730
            </p>
            <p className="pl-8 -indent-8">
              Ram, S. (1987). A MODEL OF INNOVATION RESISTANCE.{' '}
              <em>Advances in Consumer Research, 14</em>(1), 208-212.
            </p>
            <p className="pl-8 -indent-8">
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </p>
            <p className="pl-8 -indent-8">
              Samuelson, W., &amp; Zeckhauser, R. (1988). Status Quo Bias in Decision Making.{' '}
              <em>Journal of Risk and Uncertainty, 1</em>(1), 7-59.
            </p>
            <p className="pl-8 -indent-8">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding Information Technology Usage: A
              Test of Competing Models. <em>Information Systems Research, 6</em>(2), 144-176.
              https://doi.org/10.1287/isre.6.2.144
            </p>
            <p className="pl-8 -indent-8">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal Computing:
              Toward a Conceptual Model of Utilization. <em>MIS Quarterly, 15</em>(1), 125.
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., &amp; Bala, H. (2008). Technology Acceptance Model 3 and a Research
              Agenda on Interventions. <em>Decision Sciences, 39</em>(2), 273-315.
              https://doi.org/10.1111/j.1540-5915.2008.00192.x
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., &amp; Davis, F. D. (2000). A Theoretical Extension of the Technology
              Acceptance Model: Four Longitudinal Field Studies. <em>Management Science, 46</em>
              (2), 186-204.
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User Acceptance
              of Information Technology: Toward a Unified View. <em>MIS Quarterly, 27</em>
              (3), 425-478. https://doi.org/10.2307/30036540
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., Thong, J. Y. L., &amp; Xu, X. (2012). Consumer Acceptance and Use of
              Information Technology: Extending the Unified Theory of Acceptance and Use of
              Technology. <em>MIS Quarterly, 36</em>(1), 157-178. https://doi.org/10.2307/41410412
            </p>
          </div>
        </section>

        {/* Track 2 References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Detailed APA Reference List: Track 2 (Organization)</h2>
          <div className="space-y-4">
            <p className="pl-8 -indent-8">
              Alexander Wöhlke, Nitin, P., Lachlan, I., Shane, M., Spoorthy, C., Chris, B., Anushka,
              K., &amp; Madhan Raj, M. S. (2024). <em>AWS Cloud Adoption Framework: AI/ML Lens</em>.
              Amazon Web Services.
              https://docs.aws.amazon.com/whitepapers/latest/aws-caf-for-ai-ml/aws-caf-for-ai-ml.html
            </p>
            <p className="pl-8 -indent-8">
              Barney, J. (1991). Firm Resources and Sustained Competitive Advantage.{' '}
              <em>Journal of Management, 17</em>(1), 99-120.
              https://doi.org/10.1177/014920639101700108
            </p>
            <p className="pl-8 -indent-8">
              Chrissis, M. B., Konrad, M., &amp; Shrum, S. (2003).{' '}
              <em>CMMI: Guidelines for process integration and product improvement</em>.
              Addison-Wesley.
            </p>
            <p className="pl-8 -indent-8">
              Cooper, R. B., &amp; Zmud, R. W. (1990). Information Technology Implementation
              Research: A Technological Diffusion Approach. <em>Management Science, 36</em>(2),
              123-139. https://doi.org/10.1287/mnsc.36.2.123
            </p>
            <p className="pl-8 -indent-8">
              Davenport, T. H., &amp; Short, J. E. (1990). The New Industrial Engineering:
              Information Technology and Business Process Redesign. <em>Sloan Management Review</em>
              , Summer 1990, 11-27.
            </p>
            <p className="pl-8 -indent-8">
              Deming, W. E. (1982). <em>Quality, productivity, and competitive position</em>.
              Massachusetts Institute of Technology, Center for Advanced Engineering Study.
            </p>
            <p className="pl-8 -indent-8">
              Fenn, J. (1995). <em>When to Leap on the Hype Cycle</em>. Gartner.
            </p>
            <p className="pl-8 -indent-8">
              Gartner. (2025). <em>Hype Cycle Research Methodology</em>. Gartner.
              https://www.gartner.com/en/research/methodologies/gartner-hype-cycle
            </p>
            <p className="pl-8 -indent-8">
              Gladwell, B., &amp; Watson, J. (2024).{' '}
              <em>
                AWS Prescriptive Guidance: Migration and modernization strategy for Microsoft
                workloads
              </em>
              . Amazon Web Services.
              https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-microsoft-workloads/migration-microsoft-workloads.html
            </p>
            <p className="pl-8 -indent-8">
              Hammer, M., &amp; Champy, J. (1993).{' '}
              <em>Reengineering the corporation: A manifesto for business revolution</em>.
              HarperBusiness.
            </p>
            <p className="pl-8 -indent-8">
              Humphrey, W. S. (1989). <em>Managing the software process</em>. Addison-Wesley.
            </p>
            <p className="pl-8 -indent-8">
              Innovation Value Institute. (2016).{' '}
              <em>IT Capability Maturity Framework (IT-CMF), 2nd Edition</em>. Van Haren Publishing.
            </p>
            <p className="pl-8 -indent-8">
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </p>
            <p className="pl-8 -indent-8">
              Sumner, M. (2025, April). <em>Microsoft AI adoption and security best practices</em>.
              Microsoft. Retrieved January 15, 2025, from
              https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/innovate/ai/
            </p>
            <p className="pl-8 -indent-8">
              Sumner, M., &amp; Microsoft. (2025).{' '}
              <em>Microsoft Cloud Adoption Framework for Azure</em>. Microsoft. Retrieved January
              15, 2025, from https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/
            </p>
            <p className="pl-8 -indent-8">
              Teece, D. J., Pisano, G., &amp; Shuen, A. (1997). Dynamic capabilities and strategic
              management. <em>Strategic Management Journal, 18</em>(7), 509-533.
              https://doi.org/10.1002/smj.882
            </p>
            <p className="pl-8 -indent-8">
              The Open Group. (1995). <em>TOGAF</em>. The Open Group.
              https://www.opengroup.org/togaf
            </p>
            <p className="pl-8 -indent-8">
              Tornatzky, L. G., Fleischer, M., &amp; Chakrabarti, A. K. (1990).{' '}
              <em>The processes of technological innovation</em>. Lexington Books.
            </p>
            <p className="pl-8 -indent-8">
              U.S. Department of Defense. (1994).{' '}
              <em>
                Technical Architecture Framework for Information Management (TAFIM), Version 3.0
              </em>
              . Defense Information Systems Agency.
            </p>
            <p className="pl-8 -indent-8">
              U.S. Department of Defense. (2003).{' '}
              <em>DoD Architecture Framework (DoDAF), Version 1.0</em>. Department of Defense.
            </p>
            <p className="pl-8 -indent-8">
              Wernerfelt, B. (1984). A Resource-based View of the Firm.{' '}
              <em>Strategic Management Journal, 5</em>(2), 171-180.
              https://doi.org/10.1002/smj.4250050207
            </p>
          </div>
        </section>

        <SeriesNavigation className="mt-6" />
      </article>
      <ArticleTOC />
    </main>
  )
}

export default BibliographyPage
