#!/usr/bin/env node

/**
 * Generate search index from site pages
 * Runs at build time to create search-index.json
 * Indexes page metadata and strips HTML for search
 */

import { promises as fs } from 'fs'
import path from 'path'

interface SearchItem {
  id: string
  url: string
  title: string
  description: string
  content: string
  category?: string
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace nbsp with space
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
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
async function findPageRoutes(dir: string): Promise<SearchItem[]> {
  const items: SearchItem[] = []
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  // Hard-coded main pages to index
  const mainPages = [
    { path: '', title: 'Home', description: 'Technology Adoption Barriers Survey' },
    {
      path: 'barriers',
      title: 'Barriers',
      description: 'Technology adoption barriers and documentation',
    },
    {
      path: 'survey-complete',
      title: 'Survey Complete',
      description: 'Survey completion confirmation',
    },
    {
      path: 'for-organizations',
      title: 'For Organizations',
      description: 'Resources for organizational leaders',
    },
    {
      path: 'technology-adoption-models',
      title: 'Technology Adoption Models',
      description: 'Academic frameworks and models',
    },
    { path: 'media', title: 'Media & Press Kit', description: 'Press kit and media resources' },
  ]

  let id = 1

  for (const page of mainPages) {
    const url = page.path ? `${basePath}/${page.path}` : basePath || '/'

    // Create a reasonable text content snippet
    const content = `Technology Adoption Barriers Survey. ${page.description}`

    items.push({
      id: `page-${id++}`,
      url,
      title: page.title,
      description: page.description,
      content: truncateContent(content),
    })
  }

  // FAQ entries
  try {
    const faqFile = path.join(dir, './src/data/faqs.ts')
    const faqContent = await fs.readFile(faqFile, 'utf-8')
    const faqMatch = faqContent.match(/export const faqs.*?=\s*\[([\s\S]*?)\]/m)

    if (faqMatch) {
      // Simple parsing - extract question.title values
      const questionMatches = faqContent.matchAll(
        /question:\s*{\s*title:\s*['"](.*?)['"],?\s*description:/g
      )
      for (const match of questionMatches) {
        const question = match[1]
        items.push({
          id: `faq-${id++}`,
          url: `${basePath}/barriers#faqs`,
          title: question,
          description: 'Frequently asked question',
          content: truncateContent(question),
          category: 'FAQ',
        })
      }
    }
  } catch (error) {
    console.warn('Could not load FAQs:', error instanceof Error ? error.message : String(error))
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
if (require.main === module) {
  generateSearchIndex()
}

export { generateSearchIndex }
