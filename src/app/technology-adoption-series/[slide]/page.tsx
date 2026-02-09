import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import { assetPath } from '@/lib/assetPath'
import {
  getTechnologyAdoptionSeriesSlideBySegment,
  getTechnologyAdoptionSeriesSlides,
} from '@/lib/technology-adoption-series'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'

type MarkdownNode =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'image'; alt: string; src: string; title?: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'pre'; text: string }

const resolveImageSrc = (src: string) => {
  const trimmed = src.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return assetPath(trimmed)
  return trimmed
}

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'em'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; label: string }

const tokenizeInline = (input: string): InlineToken[] => {
  const tokens: InlineToken[] = []

  let i = 0
  while (i < input.length) {
    const remaining = input.slice(i)

    // Inline code
    if (remaining.startsWith('`')) {
      const end = remaining.indexOf('`', 1)
      if (end > 0) {
        tokens.push({ type: 'code', value: remaining.slice(1, end) })
        i += end + 1
        continue
      }
    }

    // Bold
    if (remaining.startsWith('**')) {
      const end = remaining.indexOf('**', 2)
      if (end > 1) {
        tokens.push({ type: 'strong', value: remaining.slice(2, end) })
        i += end + 2
        continue
      }
    }

    // Italic
    if (remaining.startsWith('*') && !remaining.startsWith('**')) {
      const end = remaining.indexOf('*', 1)
      if (end > 0) {
        tokens.push({ type: 'em', value: remaining.slice(1, end) })
        i += end + 1
        continue
      }
    }

    // Link
    if (remaining.startsWith('[')) {
      const closeLabel = remaining.indexOf(']')
      const openHref = closeLabel >= 0 ? remaining.indexOf('(', closeLabel) : -1
      const closeHref = openHref >= 0 ? remaining.indexOf(')', openHref) : -1
      if (closeLabel > 0 && openHref === closeLabel + 1 && closeHref > openHref + 1) {
        const label = remaining.slice(1, closeLabel)
        const href = remaining.slice(openHref + 1, closeHref)
        tokens.push({ type: 'link', href, label })
        i += closeHref + 1
        continue
      }
    }

    // Plain text (consume until next special char)
    const nextSpecial = remaining.search(/[`*\[]/)
    if (nextSpecial === -1) {
      tokens.push({ type: 'text', value: remaining })
      break
    }

    if (nextSpecial > 0) {
      tokens.push({ type: 'text', value: remaining.slice(0, nextSpecial) })
      i += nextSpecial
      continue
    }

    tokens.push({ type: 'text', value: remaining[0] })
    i += 1
  }

  return tokens
}

const renderInline = (text: string): ReactNode => {
  const tokens = tokenizeInline(text)

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'text') return <span key={idx}>{token.value}</span>
        if (token.type === 'strong') return <strong key={idx}>{token.value}</strong>
        if (token.type === 'em') return <em key={idx}>{token.value}</em>
        if (token.type === 'code') {
          return (
            <code key={idx} className="rounded bg-gray-100 px-1 py-0.5 text-[0.95em]">
              {token.value}
            </code>
          )
        }

        const isExternal = /^https?:\/\//i.test(token.href)
        return (
          <Link
            key={idx}
            href={token.href}
            className="text-blue-700 hover:underline"
            {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          >
            {token.label}
          </Link>
        )
      })}
    </>
  )
}

const splitSections = (markdown: string) => {
  const lines = markdown.split(/\r?\n/)
  const content: string[] = []
  const speakerNotes: string[] = []
  const transition: string[] = []

  let section: 'content' | 'speaker' | 'transition' = 'content'

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^\*\*Speaker Notes:\*\*\s*$/i.test(trimmed)) {
      section = 'speaker'
      continue
    }

    if (/^\*\*Transition:\*\*\s*$/i.test(trimmed)) {
      section = 'transition'
      continue
    }

    if (section === 'content') content.push(line)
    if (section === 'speaker') speakerNotes.push(line)
    if (section === 'transition') transition.push(line)
  }

  return {
    content: content.join('\n').trim(),
    speakerNotes: speakerNotes.join('\n').trim(),
    transition: transition.join('\n').trim(),
  }
}

const parseSimpleMarkdown = (markdown: string): MarkdownNode[] => {
  const lines = markdown.split(/\r?\n/)
  const nodes: MarkdownNode[] = []

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

    // Code fence
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/```/g, '').trim() || undefined
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i += 1
      }
      // Skip closing fence
      if (i < lines.length) i += 1
      nodes.push({ type: 'code', lang, code: codeLines.join('\n').trimEnd() })
      continue
    }

    // Markdown tables
    if (trimmed.includes('|') && /^\|?.*\|.*\|?$/.test(trimmed)) {
      const headerLine = trimmed
      const separatorLine = lines[i + 1]?.trim() || ''

      if (separatorLine && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(separatorLine)) {
        const readCells = (row: string) =>
          row
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim())

        const header = readCells(headerLine)
        const rows: string[][] = []

        i += 2
        while (i < lines.length) {
          const row = lines[i].trim()
          if (!row || !row.includes('|')) break
          rows.push(readCells(row))
          i += 1
        }

        nodes.push({ type: 'table', header, rows })
        continue
      }

      // Fallback: treat as preformatted (ASCII diagrams)
      const tableLines: string[] = [line]
      i += 1
      while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim()) {
        tableLines.push(lines[i])
        i += 1
      }
      nodes.push({ type: 'pre', text: tableLines.join('\n').trimEnd() })
      continue
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      nodes.push({ type: 'blockquote', lines: quoteLines })
      continue
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      nodes.push({ type: 'ul', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      nodes.push({ type: 'ol', items })
      continue
    }

    // Paragraph (consume until blank line)
    const paragraphLines: string[] = [trimmed]
    i += 1
    while (i < lines.length && lines[i].trim()) {
      paragraphLines.push(lines[i].trim())
      i += 1
    }
    nodes.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return nodes
}

const RenderMarkdownNodes = ({ nodes }: { nodes: MarkdownNode[] }) => {
  return (
    <div className="space-y-4">
      {nodes.map((node, idx) => {
        if (node.type === 'heading') {
          const Tag = node.level === 2 ? 'h2' : node.level === 3 ? 'h3' : 'h4'
          const className =
            node.level === 2
              ? 'text-[22px] font-bold text-gray-900'
              : node.level === 3
                ? 'text-[18px] font-bold text-gray-900'
                : 'text-[16px] font-semibold text-gray-900'

          return (
            <Tag key={idx} className={className}>
              {renderInline(node.text)}
            </Tag>
          )
        }

        if (node.type === 'paragraph') {
          return (
            <p key={idx} className="font-sans">
              {renderInline(node.text)}
            </p>
          )
        }

        if (node.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2 font-sans">
              {node.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }

        if (node.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-2 font-sans">
              {node.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }

        if (node.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="rounded border border-gray-200 bg-gray-50 p-4 text-gray-800"
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
          return <hr key={idx} className="border-gray-200" />
        }

        if (node.type === 'image') {
          const src = resolveImageSrc(node.src)
          return (
            <figure key={idx} className="rounded border border-gray-200 bg-gray-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={node.alt} className="mx-auto max-h-[520px] w-auto max-w-full" />
              {node.title ? (
                <figcaption className="mt-2 text-sm text-gray-600 text-center">
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
                    {node.header.map((cell, cellIdx) => (
                      <th
                        key={cellIdx}
                        scope="col"
                        className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900"
                      >
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {node.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 ? 'bg-white' : 'bg-gray-50/30'}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border-b border-gray-200 px-3 py-2 align-top">
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
          return (
            <pre
              key={idx}
              className="overflow-x-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm"
            >
              <code>{node.code}</code>
            </pre>
          )
        }

        return (
          <pre
            key={idx}
            className="overflow-x-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm whitespace-pre-wrap"
          >
            {node.text}
          </pre>
        )
      })}
    </div>
  )
}

export const dynamic = 'force-static'

type PageProps = {
  params: Promise<{ slide: string }>
}

export async function generateStaticParams() {
  const slides = await getTechnologyAdoptionSeriesSlides()
  return slides.map((slide) => ({ slide: slide.segment }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slide: segment } = await params
  const slide = await getTechnologyAdoptionSeriesSlideBySegment(segment)
  if (!slide) return {}

  return {
    title: `Slide ${slide.number}: ${slide.title} — Technology Adoption Teaching Series`,
    description: `Technology Adoption Teaching Series — Slide ${slide.number}: ${slide.title}.`,
  }
}

export default async function TechnologyAdoptionSeriesSlidePage({ params }: PageProps) {
  const { slide: segment } = await params

  const slides = await getTechnologyAdoptionSeriesSlides()
  const slide = slides.find((s) => s.segment === segment) || null
  if (!slide) notFound()

  const currentIndex = slides.findIndex((s) => s.segment === segment)
  const prev = currentIndex > 0 ? slides[currentIndex - 1] : null
  const next =
    currentIndex >= 0 && currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null

  const sections = splitSections(slide.contentMarkdown)
  const contentNodes = parseSimpleMarkdown(sections.content)
  const notesNodes = sections.speakerNotes ? parseSimpleMarkdown(sections.speakerNotes) : []
  const transitionNodes = sections.transition ? parseSimpleMarkdown(sections.transition) : []

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/technology-adoption-series" className="text-blue-700 hover:underline">
            Technology Adoption Teaching Series
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span aria-current="page">Slide {slide.number}</span>
        </nav>

        <h1 className={H1_CLASSES}>
          Slide {slide.number}: {slide.title}
        </h1>

        <TeachingSeriesNavigation />

        <section className="mb-10">
          <h2 className="text-[20px] font-bold text-gray-900 mb-4">Slide content</h2>
          <RenderMarkdownNodes nodes={contentNodes} />
        </section>

        {notesNodes.length ? (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Speaker notes</h2>
            <RenderMarkdownNodes nodes={notesNodes} />
          </section>
        ) : null}

        {transitionNodes.length ? (
          <section className="mb-10">
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">Transition</h2>
            <RenderMarkdownNodes nodes={transitionNodes} />
          </section>
        ) : null}

        <nav
          className="mt-10 pt-6 border-t border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Slide navigation"
        >
          <div className="text-sm">
            <span className="font-semibold text-gray-900">Previous:</span>{' '}
            {prev ? (
              <Link
                href={`/technology-adoption-series/${prev.segment}`}
                className="text-blue-700 hover:underline"
              >
                Slide {prev.number}: {prev.title}
              </Link>
            ) : (
              <span className="text-gray-600">None</span>
            )}
          </div>

          <div className="text-sm">
            <span className="font-semibold text-gray-900">Next:</span>{' '}
            {next ? (
              <Link
                href={`/technology-adoption-series/${next.segment}`}
                className="text-blue-700 hover:underline"
              >
                Slide {next.number}: {next.title}
              </Link>
            ) : (
              <span className="text-gray-600">None</span>
            )}
          </div>
        </nav>
      </article>
    </main>
  )
}
