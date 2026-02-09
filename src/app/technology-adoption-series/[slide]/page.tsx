import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ARTICLE_CLASSES, H1_CLASSES } from '@/lib/articleStyles'
import {
  getTechnologyAdoptionSeriesSlideBySegment,
  getTechnologyAdoptionSeriesSlides,
} from '@/lib/technology-adoption-series'
import TeachingSeriesNavigation from '@/components/teaching-series-navigation'

type MarkdownNode =
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'pre'; text: string }

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

    // Tables or ASCII diagrams: keep as preformatted
    if (trimmed.includes('|') && /^\|?.*\|.*\|?$/.test(trimmed)) {
      const tableLines: string[] = [line]
      i += 1
      while (i < lines.length && lines[i].trim().includes('|')) {
        tableLines.push(lines[i])
        i += 1
      }
      nodes.push({ type: 'pre', text: tableLines.join('\n').trimEnd() })
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
        if (node.type === 'paragraph') {
          return (
            <p key={idx} className="font-sans">
              {node.text}
            </p>
          )
        }

        if (node.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2 font-sans">
              {node.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }

        if (node.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-2 font-sans">
              {node.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
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
