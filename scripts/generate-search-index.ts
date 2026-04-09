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

// ---------------------------------------------------------------------------
// Metadata + content extraction
// ---------------------------------------------------------------------------

/**
 * Extract the static `export const metadata` object from a page source file.
 * Returns { title, description } or nulls when not found.
 */
function extractStaticMetadata(source: string): {
  title: string | null
  description: string | null
} {
  let title: string | null = null
  let description: string | null = null

  // Match title — handles single-quoted, double-quoted, and backtick strings,
  // including values that span multiple concatenated lines.
  const titleMatch = source.match(/title:\s*['"`]([^'"`]+)['"`]/)
  if (titleMatch) title = titleMatch[1].trim()

  // Match description — may span multiple lines between quotes
  const descMatch = source.match(/description:\s*\n?\s*['"`]([\s\S]*?)['"`]/)
  if (descMatch) description = descMatch[1].replace(/\s+/g, ' ').trim()

  return { title, description }
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
    // Remove JS expressions like {variable}, {fn()}, but keep string literals inside
    .replace(/\{[^}]*\}/g, ' ')
    // Remove React fragments: <> and </>
    .replace(/<\/?>/g, ' ')
    // Remove self-closing tags: <Component ... />
    .replace(/<[A-Za-z][^>]*\/>/g, ' ')
    // Remove opening/closing tags but keep inner text
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    // Remove className and other JSX attribute noise that leaked through
    .replace(/className="[^"]*"/g, '')
    // Remove remaining HTML entities
    .replace(/&[a-z]+;/g, ' ')
    // Strip email addresses to avoid centralizing scrapeable contact details
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, ' ')
    // Strip phone numbers (optional country code, various separators)
    .replace(/\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // Remove very short fragments (likely code noise) and common JSX artifacts
  const stopWords = new Set([
    'px',
    'py',
    'mt',
    'mb',
    'sm',
    'md',
    'lg',
    'xl',
    'bg',
    'text',
    'flex',
    'block',
    'grid',
    'gap',
    'href',
    'src',
    'alt',
    'div',
    'span',
    'ref',
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
    'from',
    'className',
  ])
  const words = text.split(' ').filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
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
 */
async function expandPersonaRoutes(): Promise<SearchItem[]> {
  // Import personas at runtime so the script works from the repo root
  const personasPath = path.resolve('src/lib/personas.ts')
  const source = await fs.readFile(personasPath, 'utf-8')

  const items: SearchItem[] = []
  // Extract persona objects: { id, slug, title, ..., description }
  const personaRegex =
    /slug:\s*'([^']+)',\s*\n\s*title:\s*'([^']+)',[\s\S]*?description:\s*\n?\s*'([\s\S]*?)'/g
  let match
  while ((match = personaRegex.exec(source)) !== null) {
    const [, slug, title, description] = match
    items.push({
      id: '', // assigned later
      url: `/start/${slug}`,
      title: `${title} | TABS Survey`,
      description: description.replace(/\s+/g, ' ').trim(),
      content: `${title}. ${description.replace(/\s+/g, ' ').trim()}`,
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
        title: `${slide.title} — Technology Adoption Teaching Series`,
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
      title: `${resource.title} — Technology Adoption Teaching Series`,
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
  const allPageFiles = await findPageFiles(appDir)

  console.log(`   Found ${allPageFiles.length} page.tsx files`)

  const items: SearchItem[] = []
  let id = 1
  let skippedDynamic = 0

  for (const filePath of allPageFiles) {
    const urlPath = filePathToUrl(filePath, appDir)

    // Skip dynamic route templates — they are expanded separately
    if (urlPath.includes('[')) {
      skippedDynamic++
      continue
    }

    const source = await fs.readFile(filePath, 'utf-8')
    const { title, description } = extractStaticMetadata(source)

    // Skip pages without metadata (e.g. layout-only files)
    if (!title) continue

    const visibleText = extractVisibleText(source)
    const content = [title, description, visibleText]
      .filter(Boolean)
      .join('. ')
      .replace(/\s+/g, ' ')
      .trim()

    items.push({
      id: `page-${id++}`,
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
      item.id = `page-${id++}`
      items.push(item)
    }
    console.log(`   Expanded ${personaItems.length} persona routes`)
  } catch (err) {
    console.warn('   ⚠ Could not expand persona routes:', (err as Error).message)
  }

  // Expand teaching series slide routes
  const teachingItems = expandTeachingSeriesRoutes()
  for (const item of teachingItems) {
    item.id = `page-${id++}`
    items.push(item)
  }
  console.log(`   Expanded ${teachingItems.length} teaching series routes`)

  // FAQ entries
  for (const faq of faqs) {
    const faqContent = `${faq.question} ${faq.answer}`
    items.push({
      id: `faq-${id++}`,
      url: '/faq',
      title: faq.question,
      description: 'Frequently asked question',
      content: truncateContent(faqContent),
      category: 'FAQ',
    })
  }

  console.log(`   Added ${faqs.length} FAQ entries`)

  // Deduplicate by URL — static pages are richer so they win over expanded routes
  const seen = new Set<string>()
  const deduped = items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
  const dupeCount = items.length - deduped.length
  if (dupeCount > 0) {
    console.log(`   Removed ${dupeCount} duplicate URLs`)
  }

  // Write index
  const publicDir = path.resolve('public')
  await fs.mkdir(publicDir, { recursive: true })

  const indexPath = path.join(publicDir, 'search-index.json')
  await fs.writeFile(indexPath, JSON.stringify(deduped, null, 2))

  console.log(`✅ Search index generated: ${deduped.length} items`)
  console.log(`   Written to: public/search-index.json`)

  return items
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateSearchIndex()
}

export { generateSearchIndex }
