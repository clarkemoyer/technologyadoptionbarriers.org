'use client'

import React, { useState, useMemo, useCallback } from 'react'
import conceptMappingData from '@/data/concept-mapping-simple.json'
import { SECTIONS, type SectionDef } from '@/data/concept-mapping-colors'
import { LiaSearchSolid } from 'react-icons/lia'
import { RxCross2 } from 'react-icons/rx'
import { Tooltip } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import {
  SECTION_DESCRIPTIONS,
  COLUMN_DESCRIPTIONS,
  resolveTooltipItem,
} from '@/data/concept-mapping-tooltips'
import DownloadButtons from './download-buttons'

/**
 * Concept Mapping Simple Component
 *
 * Renders the TABS (Simple) concept mapping table with all 57 survey items,
 * section color coding, search, filtering, and CSV export.
 */

type RowData = (typeof conceptMappingData.rows)[number]

const headers = conceptMappingData.headers
const rows: RowData[] = conceptMappingData.rows

/** Determine which section a row belongs to */
function getSection(row: RowData): SectionDef | undefined {
  const sectionValue = row['Section / Primary Construct']
  return SECTIONS.find((s) => sectionValue.startsWith(s.label.split(':')[0] + ':'))
}

/** Check if a cell value looks like a URL */
function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

/** Columns that tend to have long text and should support expand */
const EXPANDABLE_COLUMNS = new Set([
  'Survey Item (Question Text)',
  'Scale Type / Response Options',
  'APA Citation (Full)',
  'Measurement Objective',
  'Relationship to Other Items',
])

/**
 * Column max-widths so sparse columns (e.g. RIS Citation, mostly N/A) shrink
 * and content-heavy columns get more space. Applied via inline style.
 */
const COLUMN_MAX_WIDTHS: Partial<Record<(typeof conceptMappingData.headers)[number], string>> = {
  'RIS Citation': '70px',
  'Source Link (URL/DOI)': '90px',
  'Variable Type': '100px',
  'Item Code / Variable Name': '120px',
  'Qualtrics QID / Export Tag': '140px',
}

/** Max characters shown before truncation */
const TRUNCATE_LENGTH = 120

/**
 * NOTE: Each ExpandableCell instance carries its own useState hook, which means
 * O(rows * expandable-columns) state atoms. For the current 57-row dataset this
 * is negligible, but if the table grows significantly consider lifting expand
 * state into the parent via a Set<string> keyed by row+column to reduce overhead.
 */
function ExpandableCell({ value, header }: { value: string; header: string }) {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = EXPANDABLE_COLUMNS.has(header) && value.length > TRUNCATE_LENGTH

  if (!value) {
    return <span className="text-gray-400">—</span>
  }

  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all hover:text-blue-800"
      >
        {value}
      </a>
    )
  }

  if (!shouldTruncate) {
    return <span>{value}</span>
  }

  return (
    <span>
      {expanded ? value : value.slice(0, TRUNCATE_LENGTH) + '…'}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        aria-label={expanded ? `Collapse ${header} cell` : `Expand ${header} cell`}
      >
        {expanded ? '[less]' : '[more]'}
      </button>
    </span>
  )
}

const ConceptMappingSimple = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const section = getSection(row)
      const matchesSection = activeSection ? section?.key === activeSection : true
      if (!matchesSection) return false

      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return headers.some((h) => {
        const val = row[h as keyof RowData] ?? ''
        return String(val).toLowerCase().includes(query)
      })
    })
  }, [searchQuery, activeSection])

  const handleSectionClick = useCallback(
    (key: string) => {
      setActiveSection(activeSection === key ? null : key)
    },
    [activeSection]
  )

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setActiveSection(null)
  }, [])

  return (
    <section className="w-full py-12 bg-gray-50" aria-label="Concept Mapping Table">
      <div className="w-[95%] mx-auto max-w-[1800px]">
        {/* Controls: Search + Section Filters + Export */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LiaSearchSolid className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search all columns…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-full shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              aria-label="Search concept mapping table"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search query"
              >
                <RxCross2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Section Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1">
                <button
                  onClick={() => handleSectionClick(s.key)}
                  className="px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium"
                  style={
                    activeSection === s.key
                      ? { backgroundColor: s.bg, borderColor: s.text, color: s.text }
                      : { backgroundColor: 'white', borderColor: '#d1d5db', color: '#374151' }
                  }
                  aria-label={`Filter by ${s.label}${activeSection === s.key ? ', currently selected' : ''}`}
                >
                  {s.label}
                </button>
                {SECTION_DESCRIPTIONS[s.key] && (
                  <Tooltip
                    content={<span className="text-xs">{SECTION_DESCRIPTIONS[s.key]}</span>}
                    triggerAriaLabel={`About ${s.label}`}
                  >
                    <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                )}
              </span>
            ))}
          </div>

          {/* Active filter summary + Export */}
          <div className="flex items-center justify-between">
            <div>
              {(activeSection || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-red-500 underline transition-colors"
                  aria-label="Clear all search and section filters"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredRows.length} of {rows.length} items
              </span>
              <DownloadButtons
                headers={headers}
                data={filteredRows.map((row) =>
                  Object.fromEntries(headers.map((h) => [h, row[h as keyof RowData] ?? '']))
                )}
                filenameBase="concept-mapping-simple"
                label="concept mapping data"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <p id="table-scroll-hint" className="sr-only">
          Use arrow keys or swipe to scroll the table horizontally.
        </p>
        <div
          className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white"
          role="region"
          aria-label="Concept mapping data table"
          aria-describedby="table-scroll-hint"
          tabIndex={0}
        >
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={header}
                    scope="col"
                    className={`sticky top-0 z-20 bg-tabs-navy text-white text-left px-3 py-3 font-semibold text-xs border-b border-gray-300 whitespace-normal min-w-[100px] max-w-[250px] leading-snug ${
                      i === 0 ? 'sticky left-0 z-30' : ''
                    }`}
                    style={
                      COLUMN_MAX_WIDTHS[header]
                        ? { maxWidth: COLUMN_MAX_WIDTHS[header], minWidth: 'auto' }
                        : undefined
                    }
                  >
                    {header}
                    {COLUMN_DESCRIPTIONS[header] && (
                      <Tooltip
                        content={<span className="text-xs">{COLUMN_DESCRIPTIONS[header]}</span>}
                        triggerAriaLabel={`About the ${header} column`}
                      >
                        <Info className="inline w-3 h-3 ml-1 opacity-70 hover:opacity-100 cursor-help align-middle" />
                      </Tooltip>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => {
                  const section = getSection(row)

                  // Resolve tooltip item using precomputed lookup maps (O(1) per row)
                  const rowTooltipItem = resolveTooltipItem(
                    String(row['Section / Primary Construct']),
                    String(row['Survey Item (Question Text)'] ?? '')
                  )

                  return (
                    <tr
                      key={row['Item Code / Variable Name']}
                      className="hover:brightness-95 transition-all border-b border-gray-100"
                      style={section ? { backgroundColor: section.bg } : undefined}
                    >
                      {headers.map((header, colIdx) => {
                        const val = String(row[header as keyof RowData] ?? '')

                        // Check if this specific cell should render the tooltip
                        const tooltipItem =
                          header === 'Survey Item (Question Text)' ? rowTooltipItem : undefined

                        return (
                          <td
                            key={header}
                            className={`px-3 py-2.5 align-top text-xs leading-relaxed max-w-[350px] ${
                              colIdx === 0 ? 'sticky left-0 z-10 font-medium' : ''
                            }`}
                            style={Object.assign(
                              {},
                              colIdx === 0 && section ? { backgroundColor: section.bg } : undefined,
                              COLUMN_MAX_WIDTHS[header as keyof typeof COLUMN_MAX_WIDTHS]
                                ? {
                                    maxWidth:
                                      COLUMN_MAX_WIDTHS[header as keyof typeof COLUMN_MAX_WIDTHS],
                                  }
                                : undefined
                            )}
                          >
                            {tooltipItem ? (
                              <div className="flex items-start gap-1.5">
                                <div>
                                  <ExpandableCell value={val} header={header} />
                                </div>
                                <Tooltip
                                  content={
                                    <div className="space-y-2 text-left">
                                      <div className="font-bold text-sm border-b border-gray-600 pb-1">
                                        {tooltipItem.name}
                                      </div>
                                      {tooltipItem.examples && tooltipItem.examples.length > 0 && (
                                        <ul className="list-disc pl-4 text-xs text-gray-200 mt-1 space-y-1">
                                          {tooltipItem.examples.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  }
                                  triggerAriaLabel={`View examples for ${tooltipItem.name}`}
                                >
                                  <Info className="w-4 h-4 text-blue-500 hover:text-blue-700 mt-0.5 flex-shrink-0 cursor-help" />
                                </Tooltip>
                              </div>
                            ) : (
                              <ExpandableCell value={val} header={header} />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={headers.length} className="text-center py-12 text-gray-500">
                    No items match your search.{' '}
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:underline"
                      aria-label="Clear all search and section filters"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ConceptMappingSimple
