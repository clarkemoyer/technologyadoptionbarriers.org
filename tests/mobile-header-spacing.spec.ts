import { test, expect } from '@playwright/test'
import { seedCookieConsent, assertCookieConsentSeeded } from './utils/seed-cookie-consent'

/**
 * Test to ensure mobile header doesn't overlap with page content
 * This validates the fix for mobile menu overlapping homepage text
 */
test.describe('Mobile Header Spacing', () => {
  test('should have proper spacing between fixed header and main content on mobile', async ({
    page,
  }) => {
    // Set mobile viewport (iPhone 12 Pro size)
    await page.setViewportSize({ width: 390, height: 844 })

    // Seed consent so the banner never appears
    await seedCookieConsent(page)

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await assertCookieConsentSeeded(page)

    // Wait for the header to be visible as a deterministic UI signal
    const header = page.locator('header#header')
    await expect(header).toBeVisible()

    // Wait for fonts to finish loading so layout is fully settled before
    // reading bounding boxes (avoids late layout-shift flakiness).
    await page.evaluate(async () => {
      await document.fonts?.ready
    })

    // Get bounding box for header
    const headerBox = await header.boundingBox()
    expect(headerBox).not.toBeNull()

    if (headerBox) {
      // Verify the hero heading is visible and not behind the header
      const heroHeading = page.getByRole('heading', {
        name: 'Technology Adoption Barriers Survey.',
        level: 1,
      })
      await expect(heroHeading).toBeVisible()

      const heroBox = await heroHeading.boundingBox()
      expect(heroBox).not.toBeNull()

      if (heroBox) {
        // Hero heading should be below the fixed header
        // The header height is 80px, and with pt-[80px] on the homepage wrapper,
        // the content should start at least at y=80
        expect(heroBox.y).toBeGreaterThanOrEqual(80)

        // Also verify it's not overlapped by the header
        const headerBottom = headerBox.y + headerBox.height
        expect(heroBox.y).toBeGreaterThanOrEqual(headerBottom)
      }
    }
  })

  test('mobile menu should not overlap content when opened', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })

    // Seed consent so the banner never appears
    await seedCookieConsent(page)

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await assertCookieConsentSeeded(page)

    // Wait for the header to be visible as a deterministic UI signal
    const header = page.locator('header#header')
    await expect(header).toBeVisible()

    // Wait for fonts to finish loading so layout is fully settled before
    // reading bounding boxes (avoids late layout-shift flakiness).
    await page.evaluate(async () => {
      await document.fonts?.ready
    })

    const headerBox = await header.boundingBox()
    expect(headerBox).not.toBeNull()

    const heroHeading = page.getByRole('heading', {
      name: 'Technology Adoption Barriers Survey.',
      level: 1,
    })
    await expect(heroHeading).toBeVisible()
    const heroBox = await heroHeading.boundingBox()
    expect(heroBox).not.toBeNull()

    if (headerBox && heroBox) {
      const headerBottom = headerBox.y + headerBox.height
      expect(heroBox.y).toBeGreaterThanOrEqual(headerBottom)
    }

    // Open sidebar overlay
    const menuButton = page.getByRole('button', { name: /open navigation menu/i })
    await expect(menuButton).toBeVisible()

    const dialog = page.getByRole('dialog', { name: /navigation menu/i })
    await menuButton.click()
    await expect(dialog).toBeVisible({ timeout: 15000 })

    // Verify the sidebar has a Home link
    const homeLink = dialog.getByRole('link', { name: 'Home' }).first()
    await expect(homeLink).toBeVisible()

    // Verify the hero heading is still in the DOM underneath the overlay
    await expect(heroHeading).toBeAttached()

    // Re-read layout after the overlay opens so this test verifies spacing
    // in the "menu open" state, as the test name implies.
    const openHeaderBox = await header.boundingBox()
    expect(openHeaderBox).not.toBeNull()

    const openHeroBox = await heroHeading.boundingBox()
    expect(openHeroBox).not.toBeNull()

    if (openHeaderBox && openHeroBox) {
      const openHeaderBottom = openHeaderBox.y + openHeaderBox.height
      expect(openHeroBox.y).toBeGreaterThanOrEqual(openHeaderBottom)
    }
  })

  test('should maintain proper spacing on different mobile viewports', async ({ page }) => {
    const mobileViewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 393, height: 851, name: 'Pixel 5' },
    ]

    // Seed consent once before the loop - addInitScript persists for the page lifetime
    await seedCookieConsent(page)

    for (const viewport of mobileViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await assertCookieConsentSeeded(page)

      const header = page.locator('header#header')
      await expect(header).toBeVisible()

      // Wait for fonts to finish loading so layout is fully settled
      await page.evaluate(async () => {
        await document.fonts?.ready
      })

      const headerBox = await header.boundingBox()

      expect(headerBox, `Header should be visible on ${viewport.name}`).not.toBeNull()

      if (headerBox) {
        // Verify the hero heading starts below the header
        const heroHeading = page.getByRole('heading', {
          name: 'Technology Adoption Barriers Survey.',
          level: 1,
        })
        await expect(heroHeading).toBeVisible()

        const heroBox = await heroHeading.boundingBox()
        expect(heroBox, `Hero heading should be visible on ${viewport.name}`).not.toBeNull()

        if (heroBox) {
          // Hero content should not be hidden by the fixed header
          const headerBottom = headerBox.y + headerBox.height
          expect(
            heroBox.y,
            `Hero content should start below fixed header on ${viewport.name}`
          ).toBeGreaterThanOrEqual(headerBottom)
        }
      }
    }
  })
})
