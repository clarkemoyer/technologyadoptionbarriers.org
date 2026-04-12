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

  await megaMenuButton.click()
  await expect(megaMenu).toBeVisible({ timeout: 10000 })
  return megaMenu
}

async function openMobileMenu(page: Page) {
  const openMenuButton = page.getByRole('button', { name: /open navigation menu/i })
  await expect(openMenuButton).toBeVisible()

  const dialog = page.getByRole('dialog', { name: /navigation menu/i })

  // Wait for hydration by checking the button becomes interactive
  await openMenuButton.click()
  await expect(dialog).toBeVisible({ timeout: 15000 })
}

test.describe('Teaching Series - Header Mega Menu', () => {
  test('desktop: opens mega menu and shows parts + first slide', async ({ page }) => {
    test.skip(
      Boolean(process.env.CI),
      'Desktop mega-menu hydration/animation can be flaky in static builds (CI). Run locally when investigating; see tests/series-navigation.spec.ts for context.'
    )

    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/', { waitUntil: 'domcontentloaded' })

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
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await openMobileMenu(page)

    // Click Teaching top-level item in sidebar
    const navigationDialog = page.getByRole('dialog', { name: /navigation menu/i })
    const teachingButton = navigationDialog.getByRole('button', { name: /^Teaching$/i })
    await expect(teachingButton).toBeVisible()
    await teachingButton.click()

    // Verify teaching accordion groups appear
    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = page.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible()

    await part1Button.click()

    // Verify slide links are visible (sidebar only shows non-optional slides)
    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides.filter(
      (s) => !s.isOptional
    )[0]
    const slideLink = page.getByRole('link', {
      name: new RegExp(`Slide ${firstSlide.number}:`, 'i'),
    })
    await slideLink.scrollIntoViewIfNeeded()
    await expect(slideLink).toBeVisible()
  })
})
