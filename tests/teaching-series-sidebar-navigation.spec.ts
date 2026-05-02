import { test, expect, type Page } from '@playwright/test'
import { technologyAdoptionTeachingSeries } from '../src/data/technology-adoption-teaching-series'
import { escapeRegExp } from './utils/escape-regexp'
import { seedCookieConsent, assertCookieConsentSeeded } from './utils/seed-cookie-consent'

/** Shared timeout for sidebar visibility expectations (tolerates slow CI hydration). */
const NAVIGATION_TIMEOUT_MS = 15_000

async function openSidebar(page: Page) {
  const openMenuButton = page.getByRole('button', { name: /open navigation menu/i })
  await expect(openMenuButton).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })

  const dialog = page.getByRole('dialog', { name: /navigation menu/i })

  // Open the navigation menu and wait for the dialog to become visible
  await openMenuButton.click()
  await expect(dialog).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })
  return dialog
}

test.describe('Teaching Series - Sidebar Navigation', () => {
  test('desktop: sidebar shows teaching parts + first slide', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await assertCookieConsentSeeded(page)

    // On desktop the sidebar is always visible; scope all locators to it
    const sidebar = page.getByRole('complementary', { name: /site navigation/i })
    await expect(sidebar).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })

    // Teaching section is now a link (it has an href); click it to navigate
    const teachingLink = sidebar.getByRole('link', { name: /^Teaching$/i })
    await expect(teachingLink).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })
    await teachingLink.click()

    // After navigating to the teaching landing page the sidebar auto-expands Teaching groups
    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = sidebar.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })

    // Expand first part and verify a slide link
    await part1Button.click()
    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides.find((s) => !s.isOptional)
    if (!firstSlide) throw new Error('Expected at least one non-optional slide in part 1')
    await expect(
      sidebar.getByRole('link', { name: new RegExp(`Slide ${firstSlide.number}:`, 'i') })
    ).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })
  })

  test('mobile: teaching series is accessible from hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/technology-adoption-series', { waitUntil: 'domcontentloaded' })
    await assertCookieConsentSeeded(page)

    const navigationDialog = await openSidebar(page)
    // Sidebar auto-activates the Teaching section; accordion groups are already visible
    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = navigationDialog.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })

    await part1Button.click()

    // Verify slide links are visible (sidebar only shows non-optional slides)
    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides.find((s) => !s.isOptional)
    if (!firstSlide) throw new Error('Expected at least one non-optional slide in part 1')
    const slideLink = navigationDialog.getByRole('link', {
      name: new RegExp(`Slide ${firstSlide.number}:`, 'i'),
    })
    await slideLink.scrollIntoViewIfNeeded()
    await expect(slideLink).toBeVisible({ timeout: NAVIGATION_TIMEOUT_MS })
  })
})
