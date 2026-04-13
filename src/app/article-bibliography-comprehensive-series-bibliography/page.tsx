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
import bibliographyData from '@/data/bibliography.json'

// ─── APA citation helpers ───────────────────────────────────────────────────

interface BibAuthor {
  lastName: string
  firstName: string
  name: string
  creatorType: string
}

interface BibItem {
  key: string
  itemType: string
  title: string
  authors: BibAuthor[]
  year: string
  doi: string
  url: string
  journal: string
  volume: string
  issue: string
  pages: string
  publisher: string
  place: string
  abstract: string
  accessDate: string
  edition: string
  versionNumber: string
  inventoryDisplay: string
}

function formatAuthorName(a: BibAuthor): string {
  if (a.name) return a.name
  const last = a.lastName || ''
  const first = a.firstName || ''
  return first ? `${last}, ${first}` : last
}

function formatApaAuthors(authors: BibAuthor[]): string {
  if (authors.length === 0) return ''
  const names = authors.map(formatAuthorName)
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1]
}

function ApaReference({ item }: { item: BibItem }) {
  const authorStr = formatApaAuthors(item.authors)
  const yearPart = item.year ? `(${item.year})` : ''
  const doiLink = item.doi ? `https://doi.org/${item.doi}` : ''
  const link = doiLink || item.url || ''

  const renderLink = (href: string) =>
    href ? (
      <>
        {' '}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {href}
        </a>
      </>
    ) : null

  if (item.itemType === 'journalArticle') {
    // Author(s) (year). Title. *Journal, Vol*(Issue), pages. doi
    const volIssue = item.volume
      ? item.issue
        ? `${item.volume}(${item.issue})`
        : item.volume
      : item.issue || ''
    return (
      <p className="pl-8 -indent-8">
        {authorStr} {yearPart}. {item.title}.{' '}
        {item.journal && (
          <>
            <em>
              {item.journal}
              {volIssue ? `, ${volIssue}` : ''}
            </em>
            {item.pages ? `, ${item.pages}` : ''}.
          </>
        )}
        {renderLink(link)}
      </p>
    )
  }

  if (item.itemType === 'book') {
    // Author(s) (year). *Title*. Publisher.
    return (
      <p className="pl-8 -indent-8">
        {authorStr} {yearPart}. <em>{item.title}</em>.{item.publisher ? ` ${item.publisher}.` : ''}
        {renderLink(link)}
      </p>
    )
  }

  // report, webpage, or anything else
  // Author(s) (year). *Title*. Publisher. URL or Retrieved date, from URL
  const retrievedPart =
    item.itemType === 'webpage' && item.accessDate
      ? ` Retrieved ${item.accessDate}, from ${link}`
      : null

  return (
    <p className="pl-8 -indent-8">
      {authorStr} {yearPart}. <em>{item.title}</em>.{item.publisher ? ` ${item.publisher}.` : ''}
      {retrievedPart ?? renderLink(link)}
    </p>
  )
}

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

        <SeriesNavigation className="mt-6" />

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
              <strong>Individual Model Articles:</strong> New dedicated pages for each of the 21
              individual technology adoption models, featuring detailed histories, methodologies,
              and validation approaches. Click any model to explore in depth.
            </li>
            <li>
              <strong>Organizational Model Articles:</strong> New dedicated pages for the
              organizational-level frameworks (Branch 2: The Organization&rsquo;s Playbook),
              covering strategic and resource-based theories underpinning enterprise technology
              adoption. Click any framework to explore in depth.
            </li>
            <li>
              <strong>Inventory Dashboard (Quick Scan):</strong> Located immediately below, this
              section provides a high-level list of all unique titles and authors in a side-by-side
              comparison. Use this for a fast &ldquo;at-a-glance&rdquo; verification of the scope
              and coverage of each track.
            </li>
            <li>
              <strong>Detailed APA Reference Lists:</strong> Located further down, these sections
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
                  {bibliographyData.tracks.map((track) => (
                    <th
                      key={track.id}
                      className="border border-gray-300 px-3 py-2 text-left font-bold"
                    >
                      {track.name} (n={track.items.length})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(...bibliographyData.tracks.map((t) => t.items.length)),
                }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {bibliographyData.tracks.map((track) => (
                      <td key={track.id} className="border border-gray-300 px-3 py-2">
                        {track.items[rowIdx]?.inventoryDisplay ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* APA Reference Lists — one section per track */}
        {bibliographyData.tracks.map((track) => (
          <section key={track.id} className={SECTION_CLASSES}>
            <h2 className={H2_CLASSES}>Detailed APA Reference List: {track.name}</h2>
            <div className="space-y-4">
              {(track.items as BibItem[]).map((item) => (
                <ApaReference key={item.key} item={item} />
              ))}
            </div>
          </section>
        ))}
        <SeriesNavigation className="mt-6" />
      </article>
      <ArticleTOC />
    </main>
  )
}

export default BibliographyPage
