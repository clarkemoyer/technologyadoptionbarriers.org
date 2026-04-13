import Link from 'next/link'
import summaryData from '@/data/concept-mapping-summary.json'
import { Tooltip } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import DownloadButtons from './download-buttons'

interface SectionRow {
  section: string
  questionType: string
  substantiveItems: number
  attentionChecks: number | null
  scaleMethod: string
  color: string
  colorLabel: string
}

const data = summaryData as {
  title: string
  quickStats: {
    totalItems: number
    substantiveItems: number
    attentionChecks: number
    sections: number
    mappedFields: number
  }
  columns: string[]
  sections: SectionRow[]
  totals: { substantiveItems: number; attentionChecks: number }
  revisionNotes: (string | { date: string; note: string })[]
}

/** Descriptions shown in quick-stat tooltips */
const QUICK_STAT_DESCRIPTIONS: Record<string, string> = {
  'Total Items':
    'The total number of items (questions) in the survey, including both substantive items and attention checks.',
  Substantive:
    'Substantive items are the core research questions designed to measure constructs. Excludes attention checks.',
  'Attention Checks':
    'Attention check items verify respondent engagement. They have a single objectively correct answer and are excluded from construct analysis.',
  Sections:
    'The number of major survey sections (A through E), each measuring a distinct theoretical construct.',
  'Mapped Fields':
    'The number of metadata fields documented for each survey item in the concept mapping (e.g., variable name, scale, theoretical grounding, APA citation).',
}

/** Descriptions shown in table column header tooltips */
const COLUMN_HEADER_DESCRIPTIONS: Record<string, string> = {
  Section: 'The major survey section and the primary construct or topic it measures.',
  'Question Type':
    'The format used to present questions (e.g., Matrix, Multiple Choice, Multi-Select, Text Entry).',
  'Substantive Items':
    'The number of core research items in this section, excluding attention checks.',
  'Attention Checks':
    'The number of attention check items embedded in this section to verify respondent engagement.',
  'Scale / Method':
    'The response scale or measurement method used for items in this section (e.g., 5-point Barrier Severity scale, 5-level Maturity scale).',
}

export default function ConceptMappingSummary() {
  const { quickStats, sections, totals, revisionNotes } = data

  return (
    <div className="space-y-8">
      {/* Quick Stats Bar */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        role="list"
        aria-label="Survey quick statistics"
      >
        {[
          { label: 'Total Items', value: quickStats.totalItems },
          { label: 'Substantive', value: quickStats.substantiveItems },
          { label: 'Attention Checks', value: quickStats.attentionChecks },
          { label: 'Sections', value: quickStats.sections },
          { label: 'Mapped Fields', value: quickStats.mappedFields },
        ].map((stat) => (
          <div
            key={stat.label}
            role="listitem"
            className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-tabs-navy">{stat.value}</p>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              {stat.label}
              {QUICK_STAT_DESCRIPTIONS[stat.label] && (
                <Tooltip
                  content={<span className="text-xs">{QUICK_STAT_DESCRIPTIONS[stat.label]}</span>}
                  triggerAriaLabel={`About ${stat.label}`}
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Links */}
      <nav aria-label="Concept mapping views" className="flex flex-wrap gap-3">
        <Link
          href="/concept-mapping/summary"
          className="inline-flex items-center rounded-md bg-tabs-teal px-4 py-2 text-sm font-semibold text-white shadow-sm"
          aria-current="page"
        >
          Summary
        </Link>
        {/* Note: /concept-mapping/simple and /concept-mapping/complex routes are
            introduced in separate PRs. These links will resolve once those PRs merge. */}
        <Link
          href="/concept-mapping/simple"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Simple View
        </Link>
        <Link
          href="/concept-mapping/complex"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Complex View
        </Link>
      </nav>

      {/* Structure Table Card */}
      <section aria-labelledby="structure-heading">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 id="structure-heading" className="text-lg font-bold text-gray-900">
              Survey Structure
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="TABS V2 survey structure">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-700 sm:px-6">
                    Section
                    <Tooltip
                      content={
                        <span className="text-xs">{COLUMN_HEADER_DESCRIPTIONS['Section']}</span>
                      }
                      triggerAriaLabel="About the Section column"
                    >
                      <Info className="inline w-3.5 h-3.5 ml-1 text-gray-400 hover:text-gray-600 cursor-help align-middle" />
                    </Tooltip>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-700 sm:px-6">
                    Question Type
                    <Tooltip
                      content={
                        <span className="text-xs">
                          {COLUMN_HEADER_DESCRIPTIONS['Question Type']}
                        </span>
                      }
                      triggerAriaLabel="About the Question Type column"
                    >
                      <Info className="inline w-3.5 h-3.5 ml-1 text-gray-400 hover:text-gray-600 cursor-help align-middle" />
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-gray-700 sm:px-6"
                  >
                    Substantive Items
                    <Tooltip
                      content={
                        <span className="text-xs">
                          {COLUMN_HEADER_DESCRIPTIONS['Substantive Items']}
                        </span>
                      }
                      triggerAriaLabel="About the Substantive Items column"
                    >
                      <Info className="inline w-3.5 h-3.5 ml-1 text-gray-400 hover:text-gray-600 cursor-help align-middle" />
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-gray-700 sm:px-6"
                  >
                    Attention Checks
                    <Tooltip
                      content={
                        <span className="text-xs">
                          {COLUMN_HEADER_DESCRIPTIONS['Attention Checks']}
                        </span>
                      }
                      triggerAriaLabel="About the Attention Checks column"
                    >
                      <Info className="inline w-3.5 h-3.5 ml-1 text-gray-400 hover:text-gray-600 cursor-help align-middle" />
                    </Tooltip>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-700 sm:px-6">
                    Scale / Method
                    <Tooltip
                      content={
                        <span className="text-xs">
                          {COLUMN_HEADER_DESCRIPTIONS['Scale / Method']}
                        </span>
                      }
                      triggerAriaLabel="About the Scale / Method column"
                    >
                      <Info className="inline w-3.5 h-3.5 ml-1 text-gray-400 hover:text-gray-600 cursor-help align-middle" />
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sections.map((row) => (
                  <tr key={row.section} className="hover:bg-gray-50">
                    <td className="px-4 py-3 sm:px-6">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
                          style={{ backgroundColor: row.color }}
                          aria-label={`${row.colorLabel} section indicator`}
                          role="img"
                        />
                        <span className="font-medium text-gray-900">{row.section}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 sm:px-6">{row.questionType}</td>
                    <td className="px-4 py-3 text-right text-gray-900 sm:px-6">
                      {row.substantiveItems}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 sm:px-6">
                      {row.attentionChecks != null ? row.attentionChecks : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 sm:px-6">{row.scaleMethod}</td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td className="px-4 py-3 text-gray-900 sm:px-6">TOTAL SUBSTANTIVE</td>
                  <td className="px-4 py-3 sm:px-6" />
                  <td className="px-4 py-3 text-right text-gray-900 sm:px-6">
                    {totals.substantiveItems}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 sm:px-6">
                    {totals.attentionChecks}
                  </td>
                  <td className="px-4 py-3 sm:px-6" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Download */}
      <div className="flex justify-end">
        <DownloadButtons
          headers={[
            'Section',
            'Question Type',
            'Substantive Items',
            'Attention Checks',
            'Scale / Method',
          ]}
          data={sections.map((row) => ({
            Section: row.section,
            'Question Type': row.questionType,
            'Substantive Items': row.substantiveItems,
            'Attention Checks': row.attentionChecks,
            'Scale / Method': row.scaleMethod,
          }))}
          filenameBase="concept-mapping-summary"
          label="survey structure summary"
        />
      </div>

      {/* Revision Notes Card */}
      <section aria-labelledby="revision-notes-heading">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 id="revision-notes-heading" className="mb-4 text-lg font-bold text-gray-900">
            Revision Notes
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
            {revisionNotes.map((item, i) => {
              const noteText = typeof item === 'string' ? item : item.note
              const dateStr = typeof item === 'string' ? null : item.date
              return (
                <li key={i}>
                  {noteText}
                  {dateStr && <span className="ml-2 text-gray-500">({dateStr})</span>}
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}
