/**
 * Full-site search utilities for TABS
 * Provides client-side search across all indexed pages
 */

export interface SearchDocument {
  id: string
  url: string
  title: string
  description: string
  content: string
  category?: string
}

export interface SearchResult {
  document: SearchDocument
  score: number
  matchedFields: string[]
  snippet: string
}

/**
 * Tokenize and normalize text for search
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

/**
 * Check if two tokens are a meaningful match.
 * Exact substring matching only counts when both tokens are at least 3 chars,
 * preventing short noise tokens (e.g. "s", "by") from producing false positives.
 */
function tokensMatch(contentToken: string, queryToken: string): boolean {
  if (contentToken === queryToken) return true
  if (contentToken.length >= 3 && queryToken.length >= 3) {
    return contentToken.includes(queryToken) || queryToken.includes(contentToken)
  }
  return false
}

/**
 * Create a snippet showing matched context
 */
function createSnippet(content: string, query: string, length = 150): string {
  const tokens = tokenize(query)
  const contentLower = content.toLowerCase()

  // Find first match
  for (const token of tokens) {
    const index = contentLower.indexOf(token)
    if (index !== -1) {
      const start = Math.max(0, index - 50)
      const end = Math.min(content.length, index + length)
      let snippet = content.substring(start, end)

      // Add ellipsis if truncated
      if (start > 0) snippet = '...' + snippet
      if (end < content.length) snippet = snippet + '...'

      return snippet
    }
  }

  // Fallback: return start of content
  return content.substring(0, length) + (content.length > length ? '...' : '')
}

/**
 * Calculate relevance score for a document
 */
function calculateScore(document: SearchDocument, queryTokens: string[]): number {
  let score = 0

  // Title matches are worth more (10 points per token)
  const titleTokens = tokenize(document.title)
  for (const token of queryTokens) {
    if (titleTokens.some((t) => tokensMatch(t, token))) {
      score += 10
    }
  }

  // Description matches (5 points per token)
  const descTokens = tokenize(document.description)
  for (const token of queryTokens) {
    if (descTokens.some((t) => tokensMatch(t, token))) {
      score += 5
    }
  }

  // Content matches (1 point per token)
  const contentTokens = tokenize(document.content)
  for (const token of queryTokens) {
    if (contentTokens.some((t) => tokensMatch(t, token))) {
      score += 1
    }
  }

  return score
}

/**
 * Get matched field names for a query
 */
function getMatchedFields(document: SearchDocument, queryTokens: string[]): string[] {
  const fields: string[] = []

  const titleTokens = tokenize(document.title)
  if (queryTokens.some((t) => titleTokens.some((tt) => tokensMatch(tt, t)))) {
    fields.push('title')
  }

  const descTokens = tokenize(document.description)
  if (queryTokens.some((t) => descTokens.some((dt) => tokensMatch(dt, t)))) {
    fields.push('description')
  }

  const contentTokens = tokenize(document.content)
  if (queryTokens.some((t) => contentTokens.some((ct) => tokensMatch(ct, t)))) {
    fields.push('content')
  }

  return fields
}

/**
 * Search documents by query
 */
export function search(documents: SearchDocument[], query: string, limit = 10): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const queryTokens = tokenize(query)

  const results = documents
    .map((doc) => {
      const score = calculateScore(doc, queryTokens)
      const matchedFields = getMatchedFields(doc, queryTokens)

      return {
        document: doc,
        score,
        matchedFields,
        snippet: '',
      }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => ({
      ...result,
      snippet: createSnippet(result.document.content, query),
    }))

  return results
}

/**
 * Load search index from JSON file
 */
export async function loadSearchIndex(): Promise<SearchDocument[]> {
  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const response = await fetch(`${basePath}/search-index.json`)
    if (!response.ok) {
      throw new Error(`Failed to load search index: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error loading search index:', error)
    return []
  }
}

/**
 * Escape HTML special characters to prevent XSS.
 * IMPORTANT: The ampersand (&) MUST be replaced first to avoid double-escaping
 * other entities (e.g., &lt; becoming &amp;lt; if & were replaced second).
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Highlight query terms in a snippet.
 * HTML-escapes the input text first so that dangerouslySetInnerHTML is safe
 * even if the snippet contains angle brackets or other HTML characters.
 */
export function highlightTerms(text: string, query: string): string {
  const escaped = escapeHtml(text)
  if (!query.trim()) return escaped

  const tokens = tokenize(query)
  let highlighted = escaped

  for (const token of tokens) {
    const regex = new RegExp(`\\b${token}\\w*\\b`, 'gi')
    highlighted = highlighted.replace(regex, (match) => `<mark>${match}</mark>`)
  }

  return highlighted
}
