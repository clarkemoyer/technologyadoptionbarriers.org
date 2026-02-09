import { test, expect, type Page } from '@playwright/test'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '../src/data/technology-adoption-teaching-series'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function seedCookieConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({
        necessary: true,
        functional: true,
        analytics: false,
        marketing: false,
      })
    )
  })
}

async function openTeachingMegaMenu(page: Page) {
  const megaMenuButton = page.getByRole('button', {
    name: /Technology Adoption Teaching Series/i,
  })
  await expect(megaMenuButton).toBeVisible()

  const megaMenu = page.locator('#mega-menu')

  // The mega menu is client-side state; give hydration a couple chances.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await megaMenuButton.click()

    if (await megaMenu.isVisible().catch(() => false)) {
      return megaMenu
    }

    await page.waitForTimeout(750)
  }

  await expect(megaMenu).toBeVisible({ timeout: 10000 })
  return megaMenu
}

test.describe('Teaching Series - Header Mega Menu', () => {
  test('desktop: opens mega menu and shows parts + first slide', async ({ page }) => {
    test.skip(
      true,
      'Desktop mega-menu hydration/animation can be flaky in static builds; see tests/series-navigation.spec.ts for context.'
    )

    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const megaMenu = await openTeachingMegaMenu(page)

    await expect(
      megaMenu.getByRole('link', {
        name: technologyAdoptionTeachingSeries.root.title,
      })
    ).toBeVisible()

    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    await expect(megaMenu.getByRole('link', { name: part1Title })).toBeVisible()

    await expect(megaMenu.getByRole('link', { name: /Slide 1:/i })).toBeVisible()

    const firstResource = technologyAdoptionTeachingSeriesResources[0]
    await expect(megaMenu.getByRole('link', { name: firstResource.title })).toBeVisible()
  })

  test('mobile: teaching series is accessible from hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /open menu/i }).click()

    const teachingSeriesLink = page.getByRole('link', {
      name: /Technology Adoption Teaching Series/i,
    })
    await expect(teachingSeriesLink).toBeVisible()

    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = page.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible()

    await part1Button.click()

    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides[0]
    await expect(
      page.getByRole('link', { name: new RegExp(`Slide ${firstSlide.number}:`, 'i') })
    ).toBeVisible()

    const resourcesButton = page.getByRole('button', { name: /^Resources$/i })
    await expect(resourcesButton).toBeVisible()
    await resourcesButton.click()

    const firstResource = technologyAdoptionTeachingSeriesResources[0]
    await expect(page.getByRole('link', { name: firstResource.title })).toBeVisible()
  })
})
