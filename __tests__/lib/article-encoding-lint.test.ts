import * as fs from 'fs'
import * as path from 'path'

/**
 * Article Source Encoding Lint Tests
 *
 * These tests scan article page source files (TSX) for raw Unicode characters
 * that are prone to encoding-related rendering bugs ("mojibake").
 *
 * Characters checked:
 *   U+2013  –  en-dash
 *   U+2014  —  em-dash
 *   U+201C  "  left double quotation mark
 *   U+201D  "  right double quotation mark
 *   U+2018  '  left single quotation mark
 *   U+2019  '  right single quotation mark
 *
 * These characters render as garbled text (e.g., â€") when the browser
 * misinterprets UTF-8 as Windows-1252 / Latin-1. Using HTML entities
 * (&ndash;, &mdash;, &ldquo;, &rdquo;, &lsquo;, &rsquo;) in JSX text
 * is more robust — even though React resolves them during SSR, it makes
 * the intent explicit and allows this lint to detect regressions when new
 * content is added with raw Unicode characters.
 */

const APP_DIR = path.join(__dirname, '..', '..', 'src', 'app')

/** Characters that should use HTML entities in JSX text content. */
const PROBLEM_CHARS: Record<string, string> = {
  '\u2013': '&ndash; (en-dash)',
  '\u2014': '&mdash; (em-dash)',
  '\u201C': '&ldquo; (left double quote)',
  '\u201D': '&rdquo; (right double quote)',
  '\u2018': '&lsquo; (left single quote)',
  '\u2019': '&rsquo; (right single quote)',
}

/**
 * Find all .tsx page files under src/app/ that are article or bibliography pages.
 * We check article-* and bibliography-* prefixed routes.
 */
function getArticlePageFiles(): string[] {
  const results: string[] = []

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name === 'page.tsx') {
        // Only check article and bibliography routes
        const relPath = path.relative(APP_DIR, fullPath)
        const routeDir = path.dirname(relPath)
        if (routeDir.startsWith('article-') || routeDir.startsWith('bibliography-')) {
          results.push(fullPath)
        }
      }
    }
  }

  walk(APP_DIR)
  return results.sort()
}

/**
 * Extract only JSX content from a file (after the `return (` statement).
 * This avoids false positives in metadata strings where raw Unicode is fine.
 */
function extractJsxContent(content: string): string {
  const returnIndex = content.search(/\breturn\s*\(/)
  if (returnIndex === -1) return ''
  return content.slice(returnIndex)
}

describe('Article source encoding lint', () => {
  const files = getArticlePageFiles()

  it('found article/bibliography page files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const filePath of files) {
    const relPath = path.relative(path.join(__dirname, '..', '..'), filePath)

    it(`${relPath} has no raw Unicode special characters in JSX`, () => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const jsxContent = extractJsxContent(content)
      if (!jsxContent) return // No JSX found, skip

      const issues: string[] = []

      for (const [char, description] of Object.entries(PROBLEM_CHARS)) {
        const count = (jsxContent.match(new RegExp(char, 'g')) || []).length
        if (count > 0) {
          issues.push(`  ${count}× ${description}`)
        }
      }

      if (issues.length > 0) {
        throw new Error(
          `Raw Unicode characters found in JSX content:\n${issues.join('\n')}\n` +
            'Use HTML entities (&ndash;, &mdash;, &ldquo;, &rdquo;, &lsquo;, &rsquo;) instead.'
        )
      }
    })
  }
})
