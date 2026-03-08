import Link from 'next/link'
import type { ReactNode } from 'react'

import { assetPath } from '@/lib/assetPath'

export type MarkdownNode =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: MarkdownListItem[] }
  | { type: 'ol'; items: MarkdownListItem[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'visual'; description: string }
  | { type: 'image'; alt: string; src: string; title?: string }
  | {
      type: 'table'
      headers: string[]
      rows: string[][]
    }
  | { type: 'code'; lang: string; code: string }
  | { type: 'pre'; text: string }

export type MarkdownListItem = {
  text: string
  children?: MarkdownNode[]
}

type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'em'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'link'; label: string; href: string }

export const tokenizeInline = (value: string | null | undefined): InlineToken[] => {
  const tokens: InlineToken[] = []
  let remaining = value ?? ''

  while (remaining.length) {
    const codeMatch = remaining.match(/`([^`]+)`/)
    const linkMatch = remaining.match(/\[([^\]]+)]\(([^)]+)\)/)
    const strongMatch = remaining.match(/\*\*([^*]+)\*\*/)
    const emMatchAsterisk = remaining.match(/\*([^*]+)\*/)
    // Underscore emphasis: boundary-safe (no lookbehind) for older Safari.
    // Group 1 = optional leading non-word char, group 2 = emphasis content.
    const rawUnderscore = remaining.match(/(^|[^\w])_([^_]+)_([^\w]|$)/)

    type InlineMatch = {
      kind: InlineToken['kind']
      index: number
      consumed: number
      value: string
      label?: string
      href?: string
    }

    const matches: InlineMatch[] = [
      codeMatch && {
        kind: 'code' as const,
        index: codeMatch.index ?? 0,
        consumed: codeMatch[0].length,
        value: codeMatch[1],
      },
      linkMatch && {
        kind: 'link' as const,
        index: linkMatch.index ?? 0,
        consumed: linkMatch[0].length,
        value: linkMatch[1],
        label: linkMatch[1],
        href: linkMatch[2],
      },
      strongMatch && {
        kind: 'strong' as const,
        index: strongMatch.index ?? 0,
        consumed: strongMatch[0].length,
        value: strongMatch[1],
      },
      emMatchAsterisk && {
        kind: 'em' as const,
        index: emMatchAsterisk.index ?? 0,
        consumed: emMatchAsterisk[0].length,
        value: emMatchAsterisk[1],
      },
      rawUnderscore && {
        kind: 'em' as const,
        index: (rawUnderscore.index ?? 0) + rawUnderscore[1].length,
        consumed: rawUnderscore[2].length + 2, // _content_
        value: rawUnderscore[2],
      },
    ].filter(Boolean) as InlineMatch[]

    if (matches.length === 0) {
      tokens.push({ kind: 'text', value: remaining })
      break
    }

    matches.sort((a, b) => a.index - b.index)
    const next = matches[0]

    if (next.index > 0) {
      tokens.push({ kind: 'text', value: remaining.slice(0, next.index) })
      remaining = remaining.slice(next.index)
      continue
    }

    if (next.kind === 'code') {
      tokens.push({ kind: 'code', value: next.value })
      remaining = remaining.slice(next.consumed)
      continue
    }

    if (next.kind === 'link') {
      tokens.push({ kind: 'link', label: next.label!, href: next.href! })
      remaining = remaining.slice(next.consumed)
      continue
    }

    if (next.kind === 'strong') {
      tokens.push({ kind: 'strong', value: next.value })
      remaining = remaining.slice(next.consumed)
      continue
    }

    if (next.kind === 'em') {
      tokens.push({ kind: 'em', value: next.value })
      remaining = remaining.slice(next.consumed)
      continue
    }

    tokens.push({ kind: 'text', value: remaining })
    break
  }

  return tokens
}

const renderInline = (value: string | null | undefined) => {
  const tokens = tokenizeInline(value)
  return tokens.map((t, idx) => {
    if (t.kind === 'text') return <span key={idx}>{t.value}</span>
    if (t.kind === 'code')
      return (
        <code key={idx} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.95em]">
          {t.value}
        </code>
      )
    if (t.kind === 'strong')
      return (
        <strong key={idx} className="font-semibold">
          {t.value}
        </strong>
      )
    if (t.kind === 'em')
      return (
        <em key={idx} className="italic">
          {t.value}
        </em>
      )
    if (t.kind === 'link') {
      const href = t.href
      const isExternal = /^https?:\/\//i.test(href)
      return isExternal ? (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline"
        >
          {t.label}
        </a>
      ) : (
        <Link key={idx} href={href} className="text-blue-700 hover:underline">
          {t.label}
        </Link>
      )
    }

    // All InlineToken kinds are handled above; this satisfies the exhaustive check.
    const _exhaustive: never = t
    return _exhaustive
  })
}

export const parseSimpleMarkdown = (markdown: string): MarkdownNode[] => {
  const lines = markdown.split(/\r?\n/)
  const nodes: MarkdownNode[] = []

  const getIndent = (value: string) => {
    const match = value.match(/^\s*/)
    return match ? match[0].length : 0
  }

  const getListStart = (
    value: string
  ):
    | {
        kind: 'ul'
        indent: number
        marker: 'dash' | 'dot' | 'o'
        text: string
      }
    | {
        kind: 'ol'
        indent: number
        text: string
      }
    | null => {
    const indent = getIndent(value)
    const leftTrimmed = value.trimStart()

    const ulMarker = getUlMarker(leftTrimmed)
    if (ulMarker) {
      return {
        kind: 'ul',
        indent,
        marker: ulMarker,
        text: stripUlMarker(leftTrimmed, ulMarker),
      }
    }

    const olMatch = leftTrimmed.match(/^(\d+)\.\s+(.+)$/)
    if (olMatch) {
      return { kind: 'ol', indent, text: olMatch[2] }
    }

    return null
  }

  const parseListBlock = (
    startIndex: number,
    start: NonNullable<ReturnType<typeof getListStart>>
  ): { node: Extract<MarkdownNode, { type: 'ul' | 'ol' }>; nextIndex: number } => {
    let cursor = startIndex
    const items: MarkdownListItem[] = []

    const parseUnindentedOSubBullets = (): MarkdownNode | null => {
      const childItems: MarkdownListItem[] = []
      while (cursor < lines.length) {
        const candidate = getListStart(lines[cursor])
        if (!candidate) break
        if (candidate.kind !== 'ul') break
        if (candidate.indent !== start.indent) break
        if (candidate.marker !== 'o') break

        childItems.push({ text: candidate.text })
        cursor += 1
      }

      if (!childItems.length) return null
      return { type: 'ul', items: childItems }
    }

    while (cursor < lines.length) {
      const current = getListStart(lines[cursor])
      if (!current) break
      if (current.kind !== start.kind) break
      if (current.indent !== start.indent) break

      const item: MarkdownListItem = { text: current.text }
      cursor += 1

      // Capture nested lists and continuation lines for this item.
      while (cursor < lines.length) {
        const raw = lines[cursor]
        if (!raw.trim()) {
          cursor += 1
          continue
        }

        const nextIndent = getIndent(raw)
        const nextStart = getListStart(raw)

        if (nextIndent > start.indent && nextStart) {
          const parsed = parseListBlock(cursor, nextStart)
          item.children = [...(item.children ?? []), parsed.node]
          cursor = parsed.nextIndex
          continue
        }

        if (nextIndent > start.indent && !nextStart) {
          item.text = `${item.text} ${raw.trim()}`
          cursor += 1
          continue
        }

        break
      }

      items.push(item)

      // Deck-style outline heuristic:
      // When a list item ends with ':' and the next list items are unindented
      // `o ...` bullets, treat them as a nested sub-list.
      if (start.kind === 'ul' && item.text.trim().endsWith(':') && cursor < lines.length) {
        const next = getListStart(lines[cursor])
        if (next && next.kind === 'ul' && next.indent === start.indent && next.marker === 'o') {
          const sub = parseUnindentedOSubBullets()
          if (sub) item.children = [...(item.children ?? []), sub]
        }
      }
    }

    const node: Extract<MarkdownNode, { type: 'ul' | 'ol' }> =
      start.kind === 'ul'
        ? { type: 'ul', items }
        : {
            type: 'ol',
            items,
          }

    return { node, nextIndex: cursor }
  }

  const getUlMarker = (value: string): 'dash' | 'dot' | 'o' | null => {
    if (/^[-*]\s+/.test(value)) return 'dash'
    if (/^•\s+/.test(value)) return 'dot'
    if (/^o\s+/.test(value)) return 'o'
    return null
  }

  const stripUlMarker = (value: string, marker: NonNullable<ReturnType<typeof getUlMarker>>) => {
    if (marker === 'dash') return value.replace(/^[-*]\s+/, '')
    if (marker === 'dot') return value.replace(/^•\s+/, '')
    return value.replace(/^o\s+/, '')
  }

  const isStartOfTable = (lineIndex: number) => {
    if (lineIndex < 0 || lineIndex >= lines.length) return false
    const current = lines[lineIndex].trim()
    if (!current.includes('|')) return false
    const next = lines[lineIndex + 1]?.trim()
    if (!next) return false
    return Boolean(next.match(/^\|?\s*[-: ]+\|/))
  }

  const isBlockStart = (lineIndex: number) => {
    if (lineIndex < 0 || lineIndex >= lines.length) return false
    const value = lines[lineIndex].trim()
    if (!value) return true

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(value)) return true
    if (/^(#{2,4})\s+(.+)$/.test(value)) return true
    if (/^\*\*(.+?)\*\*$/.test(value)) return true
    if (/^\*\*Visual:\*\*\s*(.+)\s*$/i.test(value)) return true
    if (/^!\[(.*?)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)\s*$/.test(value)) return true
    if (/^```(\w+)?\s*$/.test(value)) return true
    if (value.startsWith('>')) return true
    if (isStartOfTable(lineIndex)) return true
    if (getUlMarker(value)) return true
    if (/^\d+\.\s+/.test(value)) return true

    return false
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      nodes.push({ type: 'hr' })
      i += 1
      continue
    }

    // ATX headings
    const headingMatch = trimmed.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3 | 4
      nodes.push({ type: 'heading', level, text: headingMatch[2].trim() })
      i += 1
      continue
    }

    // Bold-only lines (common in the deck): treat as headings
    const boldLineMatch = trimmed.match(/^\*\*(.+?)\*\*$/)
    if (boldLineMatch) {
      nodes.push({ type: 'heading', level: 3, text: boldLineMatch[1].trim() })
      i += 1
      continue
    }

    // Visual marker: render as a dedicated visual node (the live page will generate the visual)
    const visualMatch = trimmed.match(/^\*\*Visual:\*\*\s*(.+)\s*$/i)
    if (visualMatch) {
      nodes.push({ type: 'visual', description: visualMatch[1].trim() })
      i += 1

      // Consume the immediate diagram block after the marker (code fence or table),
      // since we render an actual visual component instead.
      while (i < lines.length && !lines[i].trim()) i += 1

      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i += 1
        while (i < lines.length && !lines[i].trim().startsWith('```')) i += 1
        if (i < lines.length) i += 1
      } else if (i < lines.length && lines[i].trim().includes('|')) {
        // Consume markdown table block if present
        while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim()) i += 1
      }

      continue
    }

    // Image-only line
    const imageMatch = trimmed.match(/^!\[(.*?)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)\s*$/)
    if (imageMatch) {
      nodes.push({
        type: 'image',
        alt: imageMatch[1] || 'Image',
        src: imageMatch[2],
        title: imageMatch[3] || undefined,
      })
      i += 1
      continue
    }

    // Fenced code block
    const fenceMatch = trimmed.match(/^```(\w+)?\s*$/)
    if (fenceMatch) {
      const lang = fenceMatch[1] || ''
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i += 1
      }
      // Consume closing fence
      if (i < lines.length) i += 1
      nodes.push({ type: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const qLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        qLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      nodes.push({ type: 'blockquote', lines: qLines })
      continue
    }

    // Table (simple pipe table)
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|?\s*[-: ]+\|/)
    ) {
      const headerLine = trimmed
      const separatorLine = lines[i + 1].trim()
      const headerCells = headerLine
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)

      if (separatorLine) {
        i += 2
        const rows: string[][] = []
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
          const rowCells = lines[i]
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean)
          rows.push(rowCells)
          i += 1
        }

        nodes.push({ type: 'table', headers: headerCells, rows })
        continue
      }
    }

    // Pipe blocks that are not a real markdown table (common in ASCII diagrams)
    if (trimmed.includes('|') && !isStartOfTable(i)) {
      const tableLines: string[] = [line]
      i += 1
      while (i < lines.length && lines[i].trim() && lines[i].includes('|') && !isStartOfTable(i)) {
        tableLines.push(lines[i])
        i += 1
      }
      nodes.push({ type: 'pre', text: tableLines.join('\n').trimEnd() })
      continue
    }

    // Lists (indentation-aware, supports nested lists)
    const listStart = getListStart(line)
    if (listStart) {
      const parsed = parseListBlock(i, listStart)
      nodes.push(parsed.node)
      i = parsed.nextIndex
      continue
    }

    // Paragraph (consume until blank line)
    const paragraphLines: string[] = [trimmed]
    i += 1
    while (i < lines.length && lines[i].trim() && !isBlockStart(i)) {
      paragraphLines.push(lines[i].trim())
      i += 1
    }
    nodes.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return nodes
}

const resolveImageSrc = (src: string) => {
  const trimmed = src.trim()
  if (!trimmed) return trimmed

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('data:')) return trimmed

  if (trimmed.startsWith('/')) {
    return assetPath(trimmed)
  }

  return assetPath(`/${trimmed}`)
}

export function RenderMarkdownNodes({
  nodes,
  renderVisual,
  renderCodeBlock,
  compact,
  variant,
}: {
  nodes: MarkdownNode[]
  renderVisual?: (description: string) => ReactNode
  renderCodeBlock?: (node: Extract<MarkdownNode, { type: 'code' }>) => ReactNode | null
  compact?: boolean
  variant?: 'article' | 'presentation'
}) {
  const isPresentation = variant === 'presentation'

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {nodes.map((node, idx) => {
        if (node.type === 'heading') {
          const Tag = node.level === 2 ? 'h2' : node.level === 3 ? 'h3' : 'h4'
          const className =
            node.level === 2
              ? isPresentation
                ? 'text-[26px] sm:text-[30px] font-bold text-slate-50'
                : 'text-[22px] sm:text-[26px] font-bold text-gray-900'
              : node.level === 3
                ? isPresentation
                  ? 'text-[20px] sm:text-[22px] font-bold text-slate-50'
                  : 'text-[18px] sm:text-[20px] font-bold text-gray-900'
                : isPresentation
                  ? 'text-[18px] font-semibold text-slate-50'
                  : 'text-[16px] font-semibold text-gray-900'

          return (
            <Tag key={idx} className={`${className} font-sans`}>
              {renderInline(node.text)}
            </Tag>
          )
        }

        if (node.type === 'paragraph') {
          return (
            <p
              key={idx}
              className={
                isPresentation
                  ? 'text-[18px] sm:text-[20px] text-slate-200 leading-relaxed font-sans'
                  : 'text-gray-800 leading-relaxed font-sans'
              }
            >
              {renderInline(node.text)}
            </p>
          )
        }

        if (node.type === 'ul') {
          return (
            <ul
              key={idx}
              className={
                isPresentation
                  ? 'list-disc pl-5 space-y-1.5 font-sans text-[18px] sm:text-[20px] text-slate-200'
                  : 'list-disc pl-5 space-y-2 font-sans'
              }
            >
              {node.items.map((item, itemIdx) => (
                <li key={`${idx}-${itemIdx}`}>
                  {renderInline(item.text)}
                  {item.children?.length ? (
                    <div className="mt-2">
                      <RenderMarkdownNodes
                        nodes={item.children}
                        renderVisual={renderVisual}
                        renderCodeBlock={renderCodeBlock}
                        compact
                        variant={variant}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )
        }

        if (node.type === 'ol') {
          return (
            <ol
              key={idx}
              className={
                isPresentation
                  ? 'list-decimal pl-5 space-y-1.5 font-sans text-[18px] sm:text-[20px] text-slate-200'
                  : 'list-decimal pl-5 space-y-2 font-sans'
              }
            >
              {node.items.map((item, itemIdx) => (
                <li key={`${idx}-${itemIdx}`}>
                  {renderInline(item.text)}
                  {item.children?.length ? (
                    <div className="mt-2">
                      <RenderMarkdownNodes
                        nodes={item.children}
                        renderVisual={renderVisual}
                        renderCodeBlock={renderCodeBlock}
                        compact
                        variant={variant}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          )
        }

        if (node.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className={
                isPresentation
                  ? 'rounded border border-slate-700 bg-slate-900/30 p-4 text-slate-200'
                  : 'rounded border border-gray-200 bg-gray-50 p-4 text-gray-800'
              }
            >
              <div className="space-y-2">
                {node.lines.map((line, lineIdx) => (
                  <p key={lineIdx} className="font-sans">
                    {renderInline(line)}
                  </p>
                ))}
              </div>
            </blockquote>
          )
        }

        if (node.type === 'hr') {
          return (
            <hr key={idx} className={isPresentation ? 'border-slate-700' : 'border-gray-200'} />
          )
        }

        if (node.type === 'visual') {
          if (renderVisual) {
            return <div key={idx}>{renderVisual(node.description)}</div>
          }

          return (
            <section
              key={idx}
              className="rounded border border-gray-200 bg-gray-50 p-4"
              aria-label="Visual"
            >
              <div className="text-sm font-semibold text-gray-900 mb-1">Visual</div>
              <div className="text-sm text-gray-700">{node.description}</div>
            </section>
          )
        }

        if (node.type === 'image') {
          const src = resolveImageSrc(node.src)
          return (
            <figure
              key={idx}
              className={
                isPresentation
                  ? 'rounded border border-slate-700 bg-slate-900/30 p-3'
                  : 'rounded border border-gray-200 bg-gray-50 p-3'
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={node.alt} className="mx-auto max-h-[520px] w-auto max-w-full" />
              {node.title ? (
                <figcaption
                  className={
                    isPresentation
                      ? 'mt-2 text-sm text-slate-300 text-center'
                      : 'mt-2 text-sm text-gray-600 text-center'
                  }
                >
                  {node.title}
                </figcaption>
              ) : null}
            </figure>
          )
        }

        if (node.type === 'table') {
          return (
            <div key={idx} className="overflow-x-auto rounded border border-gray-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {node.headers.map((h) => (
                      <th
                        key={h}
                        className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900"
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {node.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="bg-white">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="border-b border-gray-200 px-3 py-2 text-gray-800"
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        if (node.type === 'code') {
          const custom = renderCodeBlock?.(node)
          if (custom) return <div key={idx}>{custom}</div>

          return (
            <pre
              key={idx}
              className="rounded border border-gray-200 bg-gray-950 text-gray-100 p-4 overflow-x-auto"
            >
              <code className="text-sm">{node.code}</code>
            </pre>
          )
        }

        if (node.type === 'pre') {
          return (
            <pre
              key={idx}
              className="rounded border border-gray-200 bg-gray-50 p-4 overflow-x-auto"
            >
              <code className="text-sm text-gray-800">{node.text}</code>
            </pre>
          )
        }

        return null
      })}
    </div>
  )
}
