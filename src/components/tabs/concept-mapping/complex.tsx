'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import conceptMappingData from '@/data/concept-mapping-complex.json'
import { SECTIONS, type SectionDef } from '@/data/concept-mapping-colors'
import { LiaSearchSolid } from 'react-icons/lia'
import { RxCross2 } from 'react-icons/rx'
import { Tooltip } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { barriers } from '@/data/barriers'
import { readinessItems } from '@/data/readiness'
import { maturityItems } from '@/data/maturity'
import DownloadButtons from './download-buttons'

/**
 * Concept Mapping Complex Component
 *
 * Renders the TABS (Complex) concept mapping view with accordion panels,
 * item cards, scale visualizations, citation copy, RIS download,
 * cross-reference linking, attention-check callouts, and global search.
 */

type RowData = (typeof conceptMappingData.rows)[number]

const headers = conceptMappingData.headers
const rows: RowData[] = conceptMappingData.rows

/* ── Helpers ────────────────────────────────────────────────────────── */

/** Determine which section a row belongs to */
function getSection(row: RowData): SectionDef | undefined {
  const sectionValue = row['Section / Primary Construct']
  return SECTIONS.find((s) => sectionValue.startsWith(s.label.split(':')[0] + ':'))
}

/** Extract the short item code (e.g. "B1", "D_AC") from the composite field. */
function getItemCode(row: RowData): string {
  const raw = row['Item Code / Variable Name']
  return raw.split('/')[0].trim()
}

/** Check if this is an attention-check row */
function isAttentionCheck(row: RowData): boolean {
  const code = getItemCode(row)
  return code.endsWith('_AC')
}

/**
 * Normalize a raw RIS Citation string from the dataset.
 * Multi-entry values use `\n||\n` as a record separator, which is not valid
 * in the RIS format. This strips the separator and joins records with a
 * standard blank line so reference managers can import the file correctly.
 */
function normalizeRis(raw: string): string {
  return raw
    .split(/\n\|\|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join('\n\n')
}

/** Check if a string looks like a URL */
function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

/** Matches item codes like A1-E99, A_AC, B_Top3 in cross-reference text. */
const ITEM_CODE_RE = /\b([A-E]\d{1,2}|[A-E]_(?:AC|Top3))\b/gi

/** Parse cross-reference text for item codes (e.g. "B1", "B_Top3"). */
function parseItemRefs(text: string): string[] {
  if (!text) return []
  const matches = text.match(ITEM_CODE_RE)
  return matches ? [...new Set(matches.map((m) => m.toUpperCase()))] : []
}

/** Generate an anchor id for a row */
function anchorId(row: RowData): string {
  return `item-${getItemCode(row).replace(/\s/g, '')}`
}

/* ── Scale Parsing ──────────────────────────────────────────────────── */

interface ScaleInfo {
  type: 'barrier' | 'readiness' | 'maturity' | 'other'
  points: string[]
  hasDontKnow: boolean
}

function parseScale(raw: string): ScaleInfo {
  if (raw.startsWith('5-point Barrier Severity:')) {
    const rest = raw.replace('5-point Barrier Severity:', '').trim()
    const parts = rest.split('+').map((s) => s.trim())
    const hasDontKnow = parts.some((p) => /don.t know/i.test(p))
    const points = parts[0]
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    return { type: 'barrier', points, hasDontKnow }
  }
  if (raw.startsWith('5-point Readiness/Capability:')) {
    const rest = raw.replace('5-point Readiness/Capability:', '').trim()
    const parts = rest.split('+').map((s) => s.trim())
    const hasDontKnow = parts.some((p) => /don.t know/i.test(p))
    const points = parts[0]
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    return { type: 'readiness', points, hasDontKnow }
  }
  if (raw.startsWith('5-level Maturity:')) {
    const rest = raw.replace('5-level Maturity:', '').trim()
    const parts = rest.split('+').map((s) => s.trim())
    const hasDontKnow = parts.some((p) => /don.t know/i.test(p))
    const points = parts[0]
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    return { type: 'maturity', points, hasDontKnow }
  }
  return { type: 'other', points: [], hasDontKnow: false }
}

/* ── Sub-Components ─────────────────────────────────────────────────── */

/** Short descriptions for each section, shown as tooltip icons on section headers */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  A: 'Section A captures respondent demographics (role, organization size, industry, profit model). Used for subgroup analysis across all constructs.',
  B: 'Section B measures the perceived severity of 18 technology adoption barriers using a 5-point scale (Not a barrier → Extreme barrier), plus a forced-choice Top 3 selection.',
  C: 'Section C assesses perceived organizational technology readiness across 17 dimensions (e.g., leadership vision, culture, infrastructure, data governance) using a 5-point capability scale.',
  D: 'Section D evaluates perceived organizational maturity across 8 IT capability domains using a 5-level maturity model (Ad Hoc → Optimized).',
  E: 'Section E collects open-ended qualitative feedback about technology adoption experiences.',
}

/** Visual scale rendering */
function ScaleVisualization({ scale }: { scale: ScaleInfo }) {
  if (scale.type === 'other' || scale.points.length === 0) return null

  const colorMap: Record<string, string[]> = {
    barrier: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
    readiness: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
    maturity: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
  }
  const colors = colorMap[scale.type] ?? []

  return (
    <div className="mt-2">
      <div
        className="flex gap-1 items-end"
        role="img"
        aria-label={`${scale.points.length}-point scale`}
      >
        {scale.points.map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="w-full rounded-t"
              style={{
                backgroundColor: colors[i] ?? '#94a3b8',
                height: `${12 + i * 6}px`,
              }}
            />
            <span className="text-[10px] leading-tight text-center mt-1 text-gray-600 break-words">
              {label}
            </span>
          </div>
        ))}
        {scale.hasDontKnow && (
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-full rounded-t bg-gray-300" style={{ height: '10px' }} />
            <span className="text-[10px] leading-tight text-center mt-1 text-gray-400">
              Don&apos;t Know
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Copy-to-clipboard button */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be unavailable */
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={label}
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  )
}

/** RIS download button */
function RisDownloadButton({ ris, itemCode }: { ris: string; itemCode: string }) {
  const handleDownload = useCallback(() => {
    const normalized = normalizeRis(ris)
    const blob = new Blob([normalized], { type: 'application/x-research-info-systems' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${itemCode.replace(/\s+/g, '_')}.ris`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 100)
  }, [ris, itemCode])

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Download RIS citation for ${itemCode}`}
    >
      ⬇ RIS
    </button>
  )
}

/** External link badge */
function LinkBadge({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors break-all"
    >
      🔗 {url.length > 60 ? url.slice(0, 57) + '…' : url}
    </a>
  )
}

/** Cross-reference link */
function CrossRefLink({ code, onNavigate }: { code: string; onNavigate: (code: string) => void }) {
  return (
    <button
      onClick={() => onNavigate(code)}
      className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors mr-1 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={`Navigate to item ${code}`}
    >
      → {code}
    </button>
  )
}

/** Field row within an item card */
function FieldRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="py-2 sm:grid sm:grid-cols-[200px_1fr] gap-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 sm:mt-0 text-sm text-gray-800 break-words">
        {children ?? (value || <span className="text-gray-400">-</span>)}
      </dd>
    </div>
  )
}

/** Single item card */
function ItemCard({
  row,
  section,
  highlightedId,
  onNavigate,
}: {
  row: RowData
  section: SectionDef | undefined
  highlightedId: string | null
  onNavigate: (code: string) => void
}) {
  const code = getItemCode(row)
  const id = anchorId(row)
  const ac = isAttentionCheck(row)
  const scale = parseScale(row['Scale Type / Response Options'])
  const crossRefs = parseItemRefs(row['Relationship to Other Items'])
  const sourceLink = row['Source Link (URL/DOI)']
  const apaCitation = row['APA Citation (Full)']
  const risCitation = row['RIS Citation']
  const isHighlighted = highlightedId === id

  // Look up tooltip data for barrier, readiness, or maturity items
  const sectionLabel = row['Section / Primary Construct']
  const surveyItemText = row['Survey Item (Question Text)']
  const tooltipItem = (() => {
    if (sectionLabel.includes('Technology Adoption Barriers')) {
      return barriers.find(
        (b) => b.description.trim().toLowerCase() === surveyItemText.trim().toLowerCase()
      )
    }
    if (sectionLabel.includes('Readiness')) {
      return readinessItems.find(
        (r) => r.description.trim().toLowerCase() === surveyItemText.trim().toLowerCase()
      )
    }
    if (sectionLabel.includes('Maturity')) {
      return maturityItems.find(
        (m) => m.description.trim().toLowerCase() === surveyItemText.trim().toLowerCase()
      )
    }
    return undefined
  })()

  return (
    <article
      id={id}
      className={`rounded-lg border p-4 sm:p-5 mb-4 scroll-mt-32 transition-all duration-500 ${
        isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
      } ${ac ? 'border-amber-400 bg-amber-50/50' : 'border-gray-200 bg-white'}`}
      aria-label={`Item ${code}`}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="inline-block px-2 py-0.5 text-xs font-bold rounded"
          style={section ? { backgroundColor: section.bg, color: section.text } : undefined}
        >
          {code}
        </span>
        <span className="text-xs text-gray-500">{row['Variable Type']}</span>
        {ac && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-200 text-amber-900">
            ⚠ Attention Check
          </span>
        )}
      </div>

      {/* Question text (always visible) */}
      <div className="flex items-start gap-1.5 mb-3">
        <h4 className="text-base font-semibold text-gray-900 leading-snug flex-1">
          {row['Survey Item (Question Text)']}
        </h4>
        {tooltipItem && (
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
        )}
      </div>

      {ac && (
        <div className="mb-3 p-2 rounded bg-amber-100 text-amber-900 text-xs font-medium">
          Expected answer: <strong>{row['Scale Type / Response Options']}</strong>
        </div>
      )}

      {/* 14 of 15 fields as definition-list (Survey Item rendered as card heading above) */}
      <dl>
        <FieldRow label="Section / Primary Construct" value={row['Section / Primary Construct']} />
        <FieldRow label="Sub-Construct / Grouping" value={row['Sub-Construct / Grouping']} />
        <FieldRow label="Measurement Objective" value={row['Measurement Objective']} />
        <FieldRow label="Item Code / Variable Name" value={row['Item Code / Variable Name']} />
        <FieldRow label="Variable Type" value={row['Variable Type']} />
        <FieldRow label="Theoretical Grounding" value={row['Theoretical Grounding (Source)']} />
        <FieldRow label="APA Citation">
          {apaCitation && apaCitation !== 'N/A' ? (
            <span>
              {apaCitation}
              <CopyButton text={apaCitation} label={`Copy APA citation for ${code}`} />
            </span>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </FieldRow>
        <FieldRow label="RIS Citation">
          {risCitation && risCitation !== 'N/A' ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                {normalizeRis(risCitation)}
              </span>
              <RisDownloadButton ris={risCitation} itemCode={code} />
            </span>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </FieldRow>
        <FieldRow label="Source Link">
          {sourceLink && sourceLink !== 'N/A' ? (
            <span className="flex flex-wrap gap-1">
              {sourceLink
                .split('||')
                .map((part) => part.trim())
                .filter(Boolean)
                .map((trimmed, i) =>
                  isUrl(trimmed) ? (
                    <LinkBadge key={i} url={trimmed} />
                  ) : (
                    <span key={i} className="text-sm text-gray-800">
                      {trimmed}
                    </span>
                  )
                )}
            </span>
          ) : sourceLink === 'N/A' ? (
            <span className="text-gray-500">N/A</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </FieldRow>
        <FieldRow label="Scale Type / Response Options">
          <span>{row['Scale Type / Response Options']}</span>
          <ScaleVisualization scale={scale} />
        </FieldRow>
        <FieldRow label="Qualtrics QID / Export Tag" value={row['Qualtrics QID / Export Tag']} />
        <FieldRow label="Relationship to Other Items">
          {row['Relationship to Other Items'] ? (
            <span>
              <span className="block mb-1">{row['Relationship to Other Items']}</span>
              {crossRefs.length > 0 && (
                <span className="flex flex-wrap">
                  {crossRefs.map((ref) => (
                    <CrossRefLink key={ref} code={ref} onNavigate={onNavigate} />
                  ))}
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </FieldRow>
        <FieldRow label="Zotero Key(s)" value={row['Zotero Key(s)']} />
        <FieldRow label="Zotero Status" value={row['Zotero Status']} />
      </dl>
    </article>
  )
}

/* ── Main Component ─────────────────────────────────────────────────── */

const ConceptMappingComplex = () => {
  const [searchQuery, setSearchQuery] = useState('')
  /** Track collapsed sections - empty Set means all expanded by default. */
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Group rows by section key */
  const sectionGroups = useMemo(() => {
    const groups: { section: SectionDef; rows: RowData[] }[] = []
    const map = new Map<string, RowData[]>()

    for (const row of rows) {
      const sec = getSection(row)
      if (!sec) continue
      let arr = map.get(sec.key)
      if (!arr) {
        arr = []
        map.set(sec.key, arr)
        groups.push({ section: sec, rows: arr })
      }
      arr.push(row)
    }
    return groups
  }, [])

  /** Filter rows by search query */
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return sectionGroups
    const query = searchQuery.toLowerCase()
    return sectionGroups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((row) =>
          headers.some((h) => {
            const val = row[h as keyof RowData] ?? ''
            return String(val).toLowerCase().includes(query)
          })
        ),
      }))
      .filter((g) => g.rows.length > 0)
  }, [searchQuery, sectionGroups])

  const totalFiltered = useMemo(
    () => filteredGroups.reduce((n, g) => n + g.rows.length, 0),
    [filteredGroups]
  )

  const filteredRows = useMemo(() => filteredGroups.flatMap((g) => g.rows), [filteredGroups])

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => setCollapsedSections(new Set()), [])
  const collapseAll = useCallback(
    () => setCollapsedSections(new Set(SECTIONS.map((s) => s.key))),
    []
  )

  /** Navigate to a referenced item */
  const navigateToItem = useCallback(
    (code: string) => {
      // Find the row that matches this code
      const target = rows.find((r) => {
        const c = getItemCode(r)
        return c.toUpperCase() === code.toUpperCase()
      })
      if (!target) return

      const id = anchorId(target)

      // Ensure the target section is expanded
      const sec = getSection(target)
      if (sec && collapsedSections.has(sec.key)) {
        setCollapsedSections((prev) => {
          const next = new Set(prev)
          next.delete(sec.key)
          return next
        })
      }

      // Scroll after a tick (give time for expansion)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightedId(id)
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
          highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 3000)
        }
      }, 100)
    },
    [collapsedSections]
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  return (
    <section
      className="w-full py-12 bg-gray-50 print:py-4"
      aria-label="Concept Mapping Complex View"
    >
      <div className="w-[95%] mx-auto max-w-5xl">
        {/* Controls */}
        <div className="mb-8 space-y-4 print:hidden">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LiaSearchSolid className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search all fields…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-full shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              aria-label="Search concept mapping items"
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

          {/* Summary + controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-gray-500">
              {totalFiltered} of {rows.length} items
            </span>
            <div className="flex items-center gap-3">
              <DownloadButtons
                headers={headers}
                data={filteredRows.map((row) =>
                  Object.fromEntries(headers.map((h) => [h, row[h as keyof RowData] ?? '']))
                )}
                filenameBase="concept-mapping-complex"
                label="concept mapping data"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                aria-label="Expand all sections"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                aria-label="Collapse all sections"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Section Accordion Panels */}
        {filteredGroups.map(({ section, rows: sectionRows }) => {
          const isCollapsed = collapsedSections.has(section.key)
          return (
            <div key={section.key} className="mb-6 print:mb-4 print:break-inside-avoid">
              {/* Section header: toggle button + info tooltip */}
              <div
                className="flex items-stretch rounded-t-lg overflow-hidden print:rounded-none"
                style={{ backgroundColor: section.bg }}
              >
                <button
                  onClick={() => toggleSection(section.key)}
                  className="flex-1 flex items-center justify-between px-5 py-4 text-left font-bold transition-colors"
                  style={{ color: section.text }}
                  aria-expanded={!isCollapsed}
                  aria-controls={`section-panel-${section.key}`}
                >
                  <span className="text-lg">
                    {section.label}{' '}
                    <span className="font-normal text-sm opacity-75">
                      ({sectionRows.length} item{sectionRows.length !== 1 ? 's' : ''})
                    </span>
                  </span>
                  <span
                    className="text-xl transition-transform duration-200 print:hidden"
                    style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
                {SECTION_DESCRIPTIONS[section.key] && (
                  <div className="flex items-center px-3 print:hidden">
                    <Tooltip
                      content={<span className="text-xs">{SECTION_DESCRIPTIONS[section.key]}</span>}
                      triggerAriaLabel={`About ${section.label}`}
                    >
                      <Info
                        className="w-4 h-4 cursor-help opacity-70 hover:opacity-100"
                        style={{ color: section.text }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>

              {/* Panel content */}
              <div
                id={`section-panel-${section.key}`}
                role="region"
                aria-label={`${section.label} items`}
                className={`border-x border-b border-gray-200 rounded-b-lg px-4 py-4 print:block ${
                  isCollapsed ? 'hidden print:block' : ''
                }`}
              >
                {sectionRows.map((row) => (
                  <ItemCard
                    key={getItemCode(row)}
                    row={row}
                    section={section}
                    highlightedId={highlightedId}
                    onNavigate={navigateToItem}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No items match your search.{' '}
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline"
              aria-label="Clear search query"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ConceptMappingComplex
