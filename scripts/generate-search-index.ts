#!/usr/bin/env node

/**
 * Generate search index from all site pages.
 *
 * Dynamically discovers every page.tsx under src/app/, extracts the Next.js
 * `metadata` (title + description) via regex, and pulls visible text from the
 * JSX return block.  Dynamic routes ([role], [slide]) are expanded from their
 * data sources so every URL that appears in the sitemap is searchable.
 *
 * Run:  npx tsx scripts/generate-search-index.ts
 * Wired into the build via the "prebuild" npm script.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { faqs } from '../src/data/faqs'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '../src/data/technology-adoption-teaching-series'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchItem {
  id: string
  url: string
  title: string
  description: string
  content: string
  category: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a stable ID from a URL path (avoids noisy diffs when pages are added). */
function stableId(urlPath: string): string {
  return urlPath === '/' ? 'page-home' : urlPath.replace(/^\//, '').replace(/[/#]/g, '-')
}

/** Truncate content to a reasonable size for the JSON index. */
function truncateContent(content: string, maxLength = 800): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

/** Derive a human-readable category from a URL path. */
function categorize(urlPath: string): string {
  if (urlPath === '/') return 'Home'
  if (urlPath.startsWith('/results')) return 'Results'
  if (urlPath.startsWith('/making-of-tabs')) return 'Making of TABS'
  if (urlPath.startsWith('/for-organizations')) return 'For Organizations'
  if (urlPath.startsWith('/technology-adoption-series')) return 'Teaching Series'
  if (urlPath.startsWith('/technology-adoption-models')) return 'Adoption Models'
  if (urlPath.startsWith('/concept-mapping')) return 'Concept Mapping'
  if (urlPath.startsWith('/article-')) return 'Article Series'
  if (urlPath.startsWith('/bibliography-')) return 'Bibliography'
  if (urlPath.startsWith('/start')) return 'See Yourself'
  if (urlPath.startsWith('/barriers')) return 'Barriers'
  if (
    [
      '/privacy-policy',
      '/terms-of-service',
      '/cookie-policy',
      '/contribution-policy',
      '/vulnerability-disclosure-policy',
      '/security-acknowledgements',
    ].includes(urlPath)
  )
    return 'Legal'
  return 'General'
}

/**
 * Returns `true` when `text` already ends with terminal punctuation
 * (`.`, `!`, `?`, `:`, `;`, em-dash, or en-dash), optionally
 * followed by closing quotes/brackets/parentheses.
 *
 * Used to decide whether a `'. '` separator is needed between content
 * segments in the search index - prevents double-period artifacts like
 * `(TABS)..` while preserving intentional punctuation (`U.S.`, `Ph.D.`).
 *
 * @example
 * endsWithTerminalPunctuation('Hello.')   // true
 * endsWithTerminalPunctuation('Hello!"')  // true
 * endsWithTerminalPunctuation('Title:')   // true
 * endsWithTerminalPunctuation('Hello')    // false
 */
export function endsWithTerminalPunctuation(text: string): boolean {
  return /[.!?:;\u2014\u2013][)\]}'"\u2018\u2019\u201C\u201D\u00BB]*$/.test(text.trimEnd())
}

/**
 * Joins pre-trimmed content segments with appropriate separators.
 *
 * Only inserts `'. '` when the preceding segment does **not** already end
 * with terminal punctuation; otherwise uses a plain `' '`.  Collapses
 * internal whitespace and trims the result.
 */
export function joinSegments(segments: string[]): string {
  return segments
    .filter((s) => s.trim().length > 0)
    .reduce((acc, seg, i) => {
      const trimmedSeg = seg.trim()
      if (i === 0) return trimmedSeg
      const trimmed = acc.trimEnd()
      const separator = endsWithTerminalPunctuation(trimmed) ? ' ' : '. '
      return trimmed + separator + trimmedSeg
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Metadata + content extraction
// ---------------------------------------------------------------------------

/**
 * Extract the static `export const metadata` object from a page source file.
 * Returns { title, description } or nulls when not found.
 *
 * Uses a string-aware brace-counter to scope extraction to the `export const
 * metadata = { ... }` block so nested objects like `openGraph.title` are never
 * accidentally matched in place of the top-level title.
 */
function extractStaticMetadata(source: string): {
  title: string | null
  description: string | null
  robotsIndexFalse: boolean
} {
  let title: string | null = null
  let description: string | null = null
  let robotsIndexFalse = false

  // Locate `export const metadata = {` (with optional `: TypeAnnotation`)
  const exportMatch = source.match(/export\s+const\s+metadata\s*(?::\s*[\w.]+\s*)?\s*=\s*\{/)
  if (!exportMatch || exportMatch.index === undefined) {
    return { title, description, robotsIndexFalse }
  }

  // Walk the source from the opening `{`, respecting string boundaries,
  // to find the matching closing `}`.
  const blockStart = exportMatch.index + exportMatch[0].length - 1
  let depth = 0
  let inString: "'" | '"' | '`' | null = null
  let escaped = false
  let blockEnd = -1

  for (let i = blockStart; i < source.length; i++) {
    const ch = source[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inString) inString = null
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch as "'" | '"' | '`'
      continue
    }

    if (ch === '{') {
      depth++
      continue
    }

    if (ch === '}') {
      depth--
      if (depth === 0) {
        blockEnd = i
        break
      }
    }
  }

  if (blockEnd === -1) return { title, description, robotsIndexFalse }

  const metadataBlock = source.slice(blockStart, blockEnd + 1)

  // Match title - backreference ensures apostrophes inside the string are kept
  const titleMatch = metadataBlock.match(/(?:^|[,{]\s*)title:\s*(['"`])([\s\S]*?)\1/)
  if (titleMatch) title = titleMatch[2].replace(/\s+/g, ' ').trim()

  // Match description - may span multiple lines
  const descMatch = metadataBlock.match(/(?:^|[,{]\s*)description:\s*\n?\s*(['"`])([\s\S]*?)\1/)
  if (descMatch) description = descMatch[2].replace(/\s+/g, ' ').trim()

  // Detect robots: { index: false } — skip redirect stubs and noindex pages
  if (/robots\s*:\s*\{[^}]*\bindex\s*:\s*false\b/.test(metadataBlock)) {
    robotsIndexFalse = true
  }

  return { title, description, robotsIndexFalse }
}

/**
 * Best-effort extraction of visible text from a TSX file.
 *
 * Strategy: find the JSX return block, strip JSX tags / attributes / imports /
 * code, and keep only the text content that a visitor would see.
 */
function extractVisibleText(source: string): string {
  // Isolate the JSX returned by the component.
  // Try `return (...)` first (non-greedy), then fall back to `return <...>`.
  const returnParenMatch = source.match(/return\s*\(\s*([\s\S]*?)\)\s*\}/)
  const returnTagMatch = !returnParenMatch ? source.match(/return\s*(<[\s\S]*?>)\s*\}/) : null
  const jsx = returnParenMatch?.[1] ?? returnTagMatch?.[1] ?? ''

  let text = jsx
    // Remove {/* comments */}
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // Remove JSX expressions - handle nested braces by repeated passes
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    // Remove React fragments: <> and </>
    .replace(/<\/?>/g, ' ')
    // Remove self-closing tags: <Component ... />
    .replace(/<[A-Za-z][^>]*\/>/g, ' ')
    // Remove opening/closing tags but keep inner text
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    // Remove residual JSX prop patterns (word="value", word={, word= bare)
    .replace(/\b\w+="[^"]*"/g, ' ')
    .replace(/\b\w+=\{/g, ' ')
    .replace(
      /\b(?:id|className|style|aria-\w+|role|onClick|onChange|onFocus|onKeyDown|onMouseEnter|href|src|alt|ref|key|type|name|value|placeholder|autoComplete|dangerouslySetInnerHTML)=/g,
      ' '
    )
    // Remove JS method calls and dot-notation (e.g. .toFixed, val.toString, obj.prop)
    // but NOT common file extensions (e.g. business-management-models.svg) which are
    // meaningful content text and should survive into the search index.
    .replace(
      /\.(?:toFixed|toString|indexOf|map|filter|reduce|forEach|concat|slice|join|replace|match|split|trim|push|length|includes|find|some|every|keys|values|entries)\b/g,
      ' '
    )
    .replace(
      /\b\w+\.(?!(?:svg|png|jpg|jpeg|gif|webp|pdf|tsx?|jsx?|json|css|html?|md|txt)\b)\w+/g,
      ' '
    )
    // Remove residual angle-bracket fragments, parens, brackets noise
    .replace(/[<>(){}[\]]/g, ' ')
    // Remove remaining HTML entities
    .replace(/&[a-z]+;/g, ' ')
    // Strip email addresses to avoid centralizing scrapeable contact details
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, ' ')
    // Strip phone numbers (optional country code, various separators)
    .replace(/\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // Remove single-char fragments and common JSX/CSS/JS artifacts via stopWords.
  // Keep meaningful 2-char terms like AI, ML, UX, HR, IT, etc.
  const stopWords = new Set([
    // CSS/Tailwind noise
    'px',
    'py',
    'pt',
    'pb',
    'pl',
    'pr',
    'mt',
    'mb',
    'ml',
    'mr',
    'sm',
    'md',
    'lg',
    'xl',
    'bg',
    'flex',
    'block',
    'grid',
    'gap',
    'w-full',
    'h-full',
    // JSX/HTML attribute names
    'href',
    'src',
    'alt',
    'div',
    'span',
    'ref',
    'className',
    'onClick',
    'onChange',
    // JS keywords (NB: 'from' is intentionally omitted – it appears as an English
    // preposition in JSX text, and import statements are outside the return block)
    'true',
    'false',
    'null',
    'undefined',
    'const',
    'let',
    'var',
    'return',
    'function',
    'import',
    'export',
    'async',
    'await',
    'new',
    'this',
    // Common leaked JS identifiers
    'filter',
    'reduce',
    'forEach',
    'toString',
    'toFixed',
    'indexOf',
    'push',
    'concat',
    'slice',
    'join',
    'replace',
    'match',
    'split',
    'trim',
    'Record',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'props',
    'children',
    'params',
    'key',
    'index',
  ])
  const words = text.split(' ').filter((w) => w.length > 1 && !stopWords.has(w))
  return words.join(' ')
}

// ---------------------------------------------------------------------------
// Page discovery
// ---------------------------------------------------------------------------

/**
 * Recursively find all page.tsx files under a directory.
 */
async function findPageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await findPageFiles(fullPath)))
    } else if (entry.name === 'page.tsx') {
      results.push(fullPath)
    }
  }

  return results
}

/**
 * Convert a page.tsx file path to a URL path.
 * e.g. src/app/results/descriptive/page.tsx → /results/descriptive
 */
function filePathToUrl(filePath: string, appDir: string): string {
  const relative = path.relative(appDir, path.dirname(filePath)).replace(/\\/g, '/')
  return relative ? `/${relative}` : '/'
}

// ---------------------------------------------------------------------------
// Dynamic route expansion
// ---------------------------------------------------------------------------

/**
 * Expand dynamic [role] routes from the personas data source.
 *
 * Cannot import personas.ts directly because it transitively uses @/ path
 * aliases that tsx doesn't resolve from the scripts/ directory.  Instead,
 * extract each persona block individually with a regex that matches the
 * known object shape (id, slug, title, shortTitle, description).
 */
async function expandPersonaRoutes(): Promise<SearchItem[]> {
  const personasPath = path.resolve('src/lib/personas.ts')
  const source = await fs.readFile(personasPath, 'utf-8')

  const items: SearchItem[] = []

  // Match each persona object block: { id: '...', slug: '...', title: '...', ... description: '...' }
  // The regex captures slug, title, and description while allowing arbitrary fields between them.
  const blockRegex =
    /\{\s*\n\s*id:\s*'[^']+',\s*\n\s*slug:\s*'([^']+)',\s*\n\s*title:\s*'([^']+)',[\s\S]*?description:\s*\n?\s*'([\s\S]*?)'/g
  let match
  while ((match = blockRegex.exec(source)) !== null) {
    const [, slug, title, rawDesc] = match
    const description = rawDesc.replace(/\s+/g, ' ').trim()
    items.push({
      id: '', // assigned later via stableId()
      url: `/start/${slug}`,
      title: `${title} | TABS Survey`,
      description,
      content: `${title}. ${description}`,
      category: 'See Yourself',
    })
  }

  return items
}

/**
 * Expand dynamic [slide] routes from the teaching series data source.
 */
function expandTeachingSeriesRoutes(): SearchItem[] {
  const rootSlug = technologyAdoptionTeachingSeries.root.slug
  const items: SearchItem[] = []

  for (const part of technologyAdoptionTeachingSeries.parts) {
    for (const slide of part.slides) {
      items.push({
        id: '', // assigned later
        url: `${rootSlug}/${slide.segment}`,
        title: `${slide.title} - Technology Adoption Teaching Series`,
        description: `${part.title}: ${slide.title}`,
        content: `${slide.title}. ${part.title}. Technology Adoption Teaching Series.`,
        category: 'Teaching Series',
      })
    }
  }

  for (const resource of technologyAdoptionTeachingSeriesResources) {
    items.push({
      id: '', // assigned later
      url: `${rootSlug}/${resource.segment}`,
      title: `${resource.title} - Technology Adoption Teaching Series`,
      description: `Teaching series resource: ${resource.title}`,
      content: `${resource.title}. Technology Adoption Teaching Series resource.`,
      category: 'Teaching Series',
    })
  }

  return items
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generateSearchIndex() {
  console.log('🔍 Generating search index...')

  const appDir = path.resolve('src/app')
  const allPageFiles = (await findPageFiles(appDir)).sort()

  console.log(`   Found ${allPageFiles.length} page.tsx files`)

  const items: SearchItem[] = []
  let skippedDynamic = 0

  for (const filePath of allPageFiles) {
    const urlPath = filePathToUrl(filePath, appDir)

    // Skip dynamic route templates - they are expanded separately
    if (urlPath.includes('[')) {
      skippedDynamic++
      continue
    }

    const source = await fs.readFile(filePath, 'utf-8')
    const { title, description, robotsIndexFalse } = extractStaticMetadata(source)

    // Skip pages without metadata (e.g. layout-only files)
    if (!title) continue

    // Skip noindex pages (redirect stubs, etc.)
    if (robotsIndexFalse) continue

    const visibleText = extractVisibleText(source)
    const segments = [title, description, visibleText]
      .map((segment) => segment?.trim())
      .filter((s): s is string => Boolean(s))
    const content = joinSegments(segments)

    items.push({
      id: stableId(urlPath),
      url: urlPath,
      title,
      description: description || '',
      content: truncateContent(content),
      category: categorize(urlPath),
    })
  }

  console.log(
    `   Indexed ${items.length} static pages (skipped ${skippedDynamic} dynamic templates)`
  )

  // Expand dynamic routes
  try {
    const personaItems = await expandPersonaRoutes()
    for (const item of personaItems) {
      item.id = stableId(item.url)
      items.push(item)
    }
    console.log(`   Expanded ${personaItems.length} persona routes`)
  } catch (err) {
    console.warn('   ⚠ Could not expand persona routes:', (err as Error).message)
  }

  // Expand teaching series slide routes
  const teachingItems = expandTeachingSeriesRoutes()
  for (const item of teachingItems) {
    item.id = stableId(item.url)
    items.push(item)
  }
  console.log(`   Expanded ${teachingItems.length} teaching series routes`)

  // FAQ entries - link to /faq (no fragment; accordion IDs use dynamic useId()
  // prefixes so deep-linking is not reliably possible).  Each entry gets a
  // unique id so the deduplication below does not collapse them into one.
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    const faqContent = `${faq.question} ${faq.answer}`
    items.push({
      id: `faq-${i + 1}`,
      url: '/faq',
      title: faq.question,
      description: 'Frequently asked question',
      content: truncateContent(faqContent),
      category: 'FAQ',
    })
  }

  console.log(`   Added ${faqs.length} FAQ entries`)

  // Deduplicate by URL - static pages are richer so they win over expanded routes.
  // FAQ entries share the /faq URL with the static page but are individually
  // distinct; they bypass URL-based dedup using a composite url+id key.
  const seen = new Set<string>()
  const deduped = items.filter((item) => {
    const key = item.category === 'FAQ' ? `${item.url}\0${item.id}` : item.url
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const dupeCount = items.length - deduped.length
  if (dupeCount > 0) {
    console.log(`   Removed ${dupeCount} duplicate URLs`)
  }

  // Sort by URL for deterministic output (avoids noisy diffs across OS/filesystems)
  deduped.sort((a, b) => a.url.localeCompare(b.url))

  // Write index
  const publicDir = path.resolve('public')
  await fs.mkdir(publicDir, { recursive: true })

  const indexPath = path.join(publicDir, 'search-index.json')
  await fs.writeFile(indexPath, JSON.stringify(deduped, null, 2))

  console.log(`✅ Search index generated: ${deduped.length} items`)
  console.log(`   Written to: public/search-index.json`)

  return deduped
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateSearchIndex()
}

export { generateSearchIndex }
