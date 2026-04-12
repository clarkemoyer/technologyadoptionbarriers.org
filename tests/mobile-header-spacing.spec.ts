import { test, expect } from '@playwright/test'

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

    // Navigate to homepage
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Get the header element
    const header = page.locator('header#header')
    await expect(header).toBeVisible()

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

    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Dismiss cookie consent banner if it appears
    await page.waitForTimeout(250)
    const cookieBanner = page.locator('[role="region"][aria-label="Cookie consent notice"]')
    const cookieBannerAppeared = await cookieBanner
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)

    if (cookieBannerAppeared) {
      await cookieBanner.getByRole('button', { name: 'Decline All' }).click()
      await expect(cookieBanner).toBeHidden({ timeout: 5000 })
    }

    // Find the sidebar mobile menu button
    const menuButton = page.getByRole('button', { name: /open navigation menu/i })
    await expect(menuButton).toBeVisible()

    // Wait for React hydration
    await page.waitForTimeout(1000)

    const dialog = page.getByRole('dialog', { name: /navigation menu/i })

    // Mobile sidebar is client-side state; give hydration a couple chances.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const isDialogVisible = await dialog.isVisible().catch(() => false)
      if (isDialogVisible) break

      await menuButton.click()
      await page.waitForTimeout(1000)

      if (await dialog.isVisible().catch(() => false)) {
        break
      }
    }

    // Wait for sidebar overlay to open
    await expect(dialog).toBeVisible({ timeout: 15000 })

    // Verify the sidebar has a Home link
    const homeLink = dialog.getByRole('link', { name: 'Home' }).first()
    await expect(homeLink).toBeVisible()

    // Verify the hero heading is still in the DOM underneath the overlay
    const heroHeading = page.getByRole('heading', {
      name: 'Technology Adoption Barriers Survey.',
      level: 1,
    })
    await expect(heroHeading).toBeAttached()
  })

  test('should maintain proper spacing on different mobile viewports', async ({ page }) => {
    const mobileViewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 393, height: 851, name: 'Pixel 5' },
    ]

    for (const viewport of mobileViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const header = page.locator('header#header')

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
