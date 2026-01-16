import { test, expect } from '@playwright/test'

/**
 * Test to ensure mobile header doesn't overlap with page content
 * This validates the fix for: https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/XXX
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

    // Get the main content element
    const main = page.locator('main')
    await expect(main).toBeVisible()

    // Get bounding boxes
    const headerBox = await header.boundingBox()
    const mainBox = await main.boundingBox()

    expect(headerBox).not.toBeNull()
    expect(mainBox).not.toBeNull()

    if (headerBox && mainBox) {
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
        // The header height is 80px, and with pt-[80px] on main,
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

    // Find and click the mobile menu button
    const menuButton = page.getByRole('button', { name: /menu/i })
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // Wait for menu to open
    await page.waitForTimeout(500) // Wait for animation

    // Verify menu items are visible
    const homeLink = page.getByRole('link', { name: 'Home' }).first()
    await expect(homeLink).toBeVisible()

    // Get the header and menu bounding boxes
    const header = page.locator('header#header')
    const headerBox = await header.boundingBox()

    expect(headerBox).not.toBeNull()

    // Verify the hero heading is still below the header even with menu open
    const heroHeading = page.getByRole('heading', {
      name: 'Technology Adoption Barriers Survey.',
      level: 1,
    })
    await expect(heroHeading).toBeVisible()

    const heroBox = await heroHeading.boundingBox()
    expect(heroBox).not.toBeNull()

    if (headerBox && heroBox) {
      // Hero content should not be hidden by the header
      expect(heroBox.y).toBeGreaterThan(headerBox.y)
    }
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
      const main = page.locator('main')

      const headerBox = await header.boundingBox()
      const mainBox = await main.boundingBox()

      expect(headerBox, `Header should be visible on ${viewport.name}`).not.toBeNull()
      expect(mainBox, `Main content should be visible on ${viewport.name}`).not.toBeNull()

      if (headerBox && mainBox) {
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
