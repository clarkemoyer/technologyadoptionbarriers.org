import { test, expect } from '@playwright/test'

async function expectCtaTopRight(page: any) {
  const header = page.locator('header#header')
  const cta = page.getByTestId('header-take-tabs-cta')

  await expect(header).toBeVisible()
  await expect(cta).toBeVisible()

  const headerBox = await header.boundingBox()
  const ctaBox = await cta.boundingBox()

  expect(headerBox, 'header bounding box').not.toBeNull()
  expect(ctaBox, 'cta bounding box').not.toBeNull()

  const headerRight = headerBox!.x + headerBox!.width
  const ctaRight = ctaBox!.x + ctaBox!.width

  // CTA should be visually anchored near the header's right edge.
  expect(headerRight - ctaRight).toBeLessThanOrEqual(32)

  // CTA should be near the top of the viewport (sticky header).
  expect(ctaBox!.y).toBeLessThanOrEqual(120)
}

test.describe('Header Take the TABS CTA', () => {
  test('desktop: CTA is visible top-right and stays visible after scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    await expectCtaTopRight(page)

    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForFunction(() => window.scrollY >= 500)

    await expectCtaTopRight(page)
  })

  test('mobile: CTA is visible without opening menu and stays visible after scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expectCtaTopRight(page)

    // Ensure we did not need to open the mobile menu for CTA visibility
    const menuButton = page.getByRole('button', { name: /open menu|close menu/i })
    await expect(menuButton).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForFunction(() => window.scrollY >= 500)

    await expectCtaTopRight(page)
  })
})
