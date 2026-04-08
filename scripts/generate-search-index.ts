#!/usr/bin/env node

/**
 * Generate search index from site pages
 * Run manually (e.g., `npx tsx scripts/generate-search-index.ts`) to create public/search-index.json.
 * Indexes a fixed set of main pages and all FAQ entries.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { faqs } from '../src/data/faqs'

interface SearchItem {
  id: string
  url: string
  title: string
  description: string
  content: string
  category?: string
}

/**
 * Truncate content to reasonable size
 */
function truncateContent(content: string, maxLength = 500): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

/**
 * Find all page routes in src/app
 */
async function findPageRoutes(_dir: string): Promise<SearchItem[]> {
  const items: SearchItem[] = []

  // Hard-coded main pages to index
  const mainPages = [
    {
      path: '',
      title: 'Home',
      description: 'Technology Adoption Barriers Survey',
      category: 'Home',
    },
    {
      path: 'barriers',
      title: 'Barriers',
      description: 'Technology adoption barriers and documentation',
      category: 'Documentation',
    },
    {
      path: 'survey-complete',
      title: 'Survey Complete',
      description: 'Survey completion confirmation',
      category: 'Survey',
    },
    {
      path: 'for-organizations',
      title: 'For Organizations',
      description: 'Resources for organizational leaders',
      category: 'Resources',
    },
    {
      path: 'technology-adoption-models',
      title: 'Technology Adoption Models',
      description: 'Academic frameworks and models',
      category: 'Academic',
    },
    {
      path: 'media',
      title: 'Media & Press Kit',
      description: 'Press kit and media resources',
      category: 'Media',
    },
  ]

  let id = 1

  for (const page of mainPages) {
    const url = page.path ? `/${page.path}` : '/'

    // Create a reasonable text content snippet
    const content = `Technology Adoption Barriers Survey. ${page.description}`

    items.push({
      id: `page-${id++}`,
      url,
      title: page.title,
      description: page.description,
      content: truncateContent(content),
      category: page.category,
    })
  }

  // FAQ entries — use the typed data directly instead of regex-parsing the source file
  for (const faq of faqs) {
    const faqContent = `${faq.question} ${faq.answer}`
    items.push({
      id: `faq-${id++}`,
      url: '/barriers#faqs',
      title: faq.question,
      description: 'Frequently asked question',
      content: truncateContent(faqContent),
      category: 'FAQ',
    })
  }

  return items
}

/**
 * Generate and write search index
 */
async function generateSearchIndex() {
  console.log('🔍 Generating search index...')

  try {
    const appDir = process.cwd()
    const items = await findPageRoutes(appDir)

    // Ensure output directory exists
    const publicDir = path.join(appDir, 'public')
    await fs.mkdir(publicDir, { recursive: true })

    // Write index file
    const indexPath = path.join(publicDir, 'search-index.json')
    await fs.writeFile(indexPath, JSON.stringify(items, null, 2))

    console.log(`✅ Search index generated: ${items.length} items`)
    console.log(`   Written to: public/search-index.json`)

    return items
  } catch (error) {
    console.error('❌ Error generating search index:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  generateSearchIndex()
}

export { generateSearchIndex }
