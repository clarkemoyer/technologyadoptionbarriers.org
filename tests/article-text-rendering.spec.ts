import { test, expect } from '@playwright/test'

/**
 * Article Text Rendering Smoke Tests
 *
 * These tests detect "mojibake" — garbled characters caused by encoding
 * mismatches (e.g., UTF-8 bytes interpreted as Windows-1252/Latin-1).
 *
 * Common patterns caught:
 *   â€"  (en-dash U+2013: byte 0x93 maps to \u201C in CP-1252)
 *   â€\u201D  (em-dash U+2014: byte 0x94 maps to \u201D in CP-1252)
 *   â€œ  (left double quote U+201C: byte 0x9C maps to œ in CP-1252)
 *   â€˜  (left single quote U+2018: byte 0x98 maps to ˜ in CP-1252)
 *   â€™  (right single quote U+2019: byte 0x99 maps to ™ in CP-1252)
 *   â†   (right-arrow mojibake prefix)
 *   Ã©, Ã¨, etc. (accented Latin characters)
 *
 * If any of these patterns appear in the visible page text the test fails,
 * signalling a charset / encoding regression.
 */

/**
 * Regex that matches the most common UTF-8 → CP-1252 mojibake sequences.
 *
 * Explanation of the alternation groups:
 *   â€["\u201C\u201D]  en-dash / em-dash mojibake
 *     — en-dash  (e2 80 93): byte 0x93 → U+201C " in CP-1252
 *     — em-dash  (e2 80 94): byte 0x94 → U+201D " in CP-1252
 *     — also matches ASCII double-quote " for simplified representations
 *   â€œ   left double quote  (e2 80 9c): byte 0x9C → œ in CP-1252
 *   â€\u009D  right double quote (e2 80 9d) — byte 0x9D is unmapped, shows as control char
 *   â€˜   left single quote  (e2 80 98): byte 0x98 → ˜ in CP-1252
 *   â€™   right single quote (e2 80 99): byte 0x99 → ™ in CP-1252
 *   â†   right-arrow mojibake prefix (e2 86)
 *   Ã + letter  accented-Latin mojibake  (c3 xx)
 *
 * Note: en-dash and em-dash mojibake both start with â€ but end with different
 * curly quotes: \u201C for en-dash (byte 0x93), \u201D for em-dash (byte 0x94).
 * The regex uses â€["\u201C\u201D] to match both, plus ASCII double-quote.
 */
const MOJIBAKE_PATTERN =
  /â€["\u201C\u201D]|â€œ|â€\u009d|â€˜|â€™|â†|Ã[©¨¼¶¤±²³µ¹ºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/

/** Representative article pages to check. */
const ARTICLE_PAGES = [
  '/article-2-4-the-blueprint-for-enterprise-a-survey-of-architecture-frameworks/',
  '/article-1-1-the-bedrock-foundational-theories-that-shaped-tech-acceptance/',
  '/article-1-4-the-grand-unification-the-unified-theory-of-acceptance-and-use-of-technology-utaut/',
  '/article-1-5-beyond-the-office-utaut2-consumer-context-and-modern-syntheses/',
  '/article-2-5-the-modern-mandate-frameworks-for-cybersecurity-and-risk/',
  '/article-2-7-the-ai-frontier-frameworks-for-adopting-ai-ml-and-genai/',
]

test.describe('Article text rendering — encoding smoke tests', () => {
  for (const path of ARTICLE_PAGES) {
    test(`no mojibake in ${path.split('/').filter(Boolean)[0]}`, async ({ page }) => {
      await page.goto(path)

      // Wait for the article content to load
      const article = page.locator('article')
      await expect(article).toBeVisible({ timeout: 10_000 })

      // Extract visible text from the article
      const visibleText = await article.innerText()

      // Check for mojibake patterns
      const match = MOJIBAKE_PATTERN.exec(visibleText)
      expect(match, `Mojibake detected: "${match?.[0]}" in ${path}`).toBeNull()
    })
  }

  test('meta charset utf-8 tag is present', async ({ page }) => {
    await page.goto(ARTICLE_PAGES[0])

    // Verify charset meta tag exists
    const charsetMeta = page.locator('meta[charset], meta[charSet]')
    await expect(charsetMeta).toHaveCount(1)

    const charsetValue = await charsetMeta.getAttribute('charset')
    // React renders as charSet (camelCase) — attribute access is case-insensitive
    const charSetValue = await charsetMeta.getAttribute('charSet')
    const resolvedCharset = charsetValue || charSetValue
    expect(resolvedCharset?.toLowerCase()).toBe('utf-8')
  })
})
