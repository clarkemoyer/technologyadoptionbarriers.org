import { test, expect, type Page } from '@playwright/test'
import { technologyAdoptionTeachingSeries } from '../src/data/technology-adoption-teaching-series'
import { escapeRegExp } from './utils/escape-regexp'

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

async function openSidebar(page: Page) {
  const openMenuButton = page.getByRole('button', { name: /open navigation menu/i })
  await expect(openMenuButton).toBeVisible()

  const dialog = page.getByRole('dialog', { name: /navigation menu/i })

  // Wait for hydration by checking the button becomes interactive
  await openMenuButton.click()
  await expect(dialog).toBeVisible({ timeout: 15000 })
  return dialog
}

test.describe('Teaching Series - Sidebar Navigation', () => {
  test('desktop: sidebar shows teaching parts + first slide', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // On desktop the sidebar is always visible; click Teaching section
    const teachingButton = page.getByRole('button', { name: /^Teaching$/i })
    await expect(teachingButton).toBeVisible({ timeout: 15000 })
    await teachingButton.click()

    // Verify accordion groups appear
    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = page.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible()

    // Expand first part and verify a slide link
    await part1Button.click()
    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides.filter(
      (s) => !s.isOptional
    )[0]
    await expect(
      page.getByRole('link', { name: new RegExp(`Slide ${firstSlide.number}:`, 'i') })
    ).toBeVisible()
  })

  test('mobile: teaching series is accessible from hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await seedCookieConsent(page)
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const navigationDialog = await openSidebar(page)
    const teachingButton = navigationDialog.getByRole('button', { name: /^Teaching$/i })
    await expect(teachingButton).toBeVisible()
    await teachingButton.click()

    // Verify teaching accordion groups appear
    const part1Title = technologyAdoptionTeachingSeries.parts[0].title
    const part1Button = navigationDialog.getByRole('button', {
      name: new RegExp(escapeRegExp(part1Title), 'i'),
    })
    await expect(part1Button).toBeVisible()

    await part1Button.click()

    // Verify slide links are visible (sidebar only shows non-optional slides)
    const firstSlide = technologyAdoptionTeachingSeries.parts[0].slides.filter(
      (s) => !s.isOptional
    )[0]
    const slideLink = navigationDialog.getByRole('link', {
      name: new RegExp(`Slide ${firstSlide.number}:`, 'i'),
    })
    await slideLink.scrollIntoViewIfNeeded()
    await expect(slideLink).toBeVisible()
  })
})
