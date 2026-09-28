import { test, expect } from '@playwright/test'

/**
 * Fonts are self-hosted via next/font/local (see src/lib/fonts.ts). These
 * checks confirm, in a real browser, that the site never reaches out to
 * Google Fonts and that the site-wide families actually load and render.
 */
test.describe('Self-hosted fonts', () => {
  test('site-wide fonts load from our own origin, never from Google Fonts', async ({ page }) => {
    const googleRequests: string[] = []
    const fontResponses: { url: string; status: number }[] = []
    page.on('request', (req) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(req.url())) googleRequests.push(req.url())
    })
    page.on('response', (res) => {
      if (res.url().endsWith('.woff2')) fontResponses.push({ url: res.url(), status: res.status() })
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)

    expect(googleRequests).toEqual([])
    expect(fontResponses.length).toBeGreaterThan(0)
    for (const res of fontResponses) {
      expect(new URL(res.url).origin).toBe(new URL(page.url()).origin)
      expect([200, 304]).toContain(res.status)
    }

    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
    )
    // Body copy (Faustina), sans text (Lato) and UI text (Open Sans).
    for (const family of ['faustina', 'lato', 'openSans']) {
      expect(loaded).toContain(family)
    }

    const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(bodyFont).toMatch(/^faustina, "faustina Fallback"/)
  })

  test('extended subsets load only when a page needs them', async ({ page }) => {
    // Source files are `*-ext.woff2`; the build emits them as
    // `<Family>_<weight>_ext.<hash>.woff2`, so accept either separator.
    const extFiles: string[] = []
    page.on('response', (res) => {
      if (/[-_]ext[._-][^/]*\.woff2$/.test(res.url())) extFiles.push(res.url())
    })

    // The homepage is plain Latin text: no Latin Extended/Greek downloads.
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    expect(extFiles).toEqual([])

    // Positive control: once Latin Extended text appears in the body font,
    // the browser must fetch that family's ext subset. This proves the
    // matcher above sees ext downloads, so the empty list is meaningful.
    await page.evaluate(() => {
      const probe = document.createElement('p')
      probe.textContent = 'Łódź, Šibenik, Œuvre'
      document.body.appendChild(probe)
    })
    await expect
      .poll(async () => {
        await page.evaluate(() => document.fonts.ready)
        return extFiles.length
      })
      .toBeGreaterThan(0)
  })
})
