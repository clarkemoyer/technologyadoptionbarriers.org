'use client'

import React, { useState, useMemo, useCallback } from 'react'
import conceptMappingData from '@/data/concept-mapping-simple.json'
import { LiaSearchSolid } from 'react-icons/lia'
import { RxCross2 } from 'react-icons/rx'

/**
 * Concept Mapping Simple Component
 *
 * Renders the TABS (Simple) concept mapping table with all 57 survey items,
 * section color coding, search, filtering, and CSV export.
 */

type RowData = (typeof conceptMappingData.rows)[number]

/** Section definitions with exact Excel color coding */
const SECTIONS = [
  { key: 'A', label: 'Section A: Demographics', bg: '#D9E2F3', text: '#1f3864' },
  {
    key: 'B',
    label: 'Section B: Perceived Technology Adoption Barriers',
    bg: '#FFF2CC',
    text: '#7f6000',
  },
  {
    key: 'C',
    label: 'Section C: Perceived Organizational Technology Readiness',
    bg: '#FCE4D6',
    text: '#833c0b',
  },
  {
    key: 'D',
    label: 'Section D: Perceived Maturity of Organizational Capabilities',
    bg: '#E2EFDA',
    text: '#375623',
  },
  { key: 'E', label: 'Section E: Final Thoughts & Feedback', bg: '#F2F2F2', text: '#404040' },
] as const

const headers = conceptMappingData.headers
const rows: RowData[] = conceptMappingData.rows

/** Determine which section a row belongs to */
function getSection(row: RowData): (typeof SECTIONS)[number] | undefined {
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

/** Max characters shown before truncation */
const TRUNCATE_LENGTH = 120

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
        className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
        aria-label={expanded ? `Collapse ${header} cell` : `Expand ${header} cell`}
      >
        {expanded ? '[less]' : '[more]'}
      </button>
    </span>
  )
}

function exportCsv() {
  const csvHeaders = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')
  const csvRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h as keyof RowData] ?? ''
        return `"${String(val).replace(/"/g, '""')}"`
      })
      .join(',')
  )
  const csv = [csvHeaders, ...csvRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'concept-mapping-simple.csv'
  link.click()
  URL.revokeObjectURL(url)
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
              <button
                key={s.key}
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
              <button
                onClick={exportCsv}
                className="px-4 py-2 bg-tabs-teal text-white text-sm font-medium rounded-lg hover:bg-tabs-teal-deep transition-colors"
                aria-label="Download concept mapping data as CSV"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white"
          role="region"
          aria-label="Concept mapping data table"
          tabIndex={0}
        >
          <table className="w-max min-w-full text-sm border-collapse">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={header}
                    scope="col"
                    className={`sticky top-0 z-20 bg-tabs-navy text-white text-left px-3 py-3 font-semibold text-xs border-b border-gray-300 whitespace-nowrap ${
                      i === 0 ? 'sticky left-0 z-30' : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, rowIdx) => {
                  const section = getSection(row)
                  return (
                    <tr
                      key={rowIdx}
                      className="hover:brightness-95 transition-all border-b border-gray-100"
                      style={section ? { backgroundColor: section.bg } : undefined}
                    >
                      {headers.map((header, colIdx) => {
                        const val = String(row[header as keyof RowData] ?? '')
                        return (
                          <td
                            key={header}
                            className={`px-3 py-2.5 align-top text-xs leading-relaxed max-w-[350px] ${
                              colIdx === 0 ? 'sticky left-0 z-10 font-medium' : ''
                            }`}
                            style={
                              colIdx === 0 && section ? { backgroundColor: section.bg } : undefined
                            }
                          >
                            <ExpandableCell value={val} header={header} />
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
