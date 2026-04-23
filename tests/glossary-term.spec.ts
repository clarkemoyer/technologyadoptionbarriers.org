import { test, expect } from '@playwright/test'

/**
 * Glossary Term inline-popover E2E tests.
 *
 * Covers the Cronbach's alpha Term component wired on /results/reliability
 * (the first production page to use the <Term> component).
 */

test.describe('Glossary Term popover on /results/reliability', () => {
  test('opens on hover and closes on Escape', async ({ page }) => {
    await page.goto('/results/reliability')

    // Find the Cronbach's alpha trigger button
    const triggerButton = page.getByRole('button', { name: /cronbach/i }).first()
    await expect(triggerButton).toBeVisible()

    // Hover to open the popover
    await triggerButton.hover()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Dialog should contain the short definition
    await expect(dialog).toContainText(/internal consistency/i)

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('opens on click and closes on click outside', async ({ page }) => {
    await page.goto('/results/reliability')

    const triggerButton = page.getByRole('button', { name: /cronbach/i }).first()
    await triggerButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Click somewhere outside the component (the page heading)
    await page.locator('h1').click()
    await expect(dialog).not.toBeVisible()
  })

  test('includes a working link to the full glossary entry', async ({ page }) => {
    await page.goto('/results/reliability')

    const triggerButton = page.getByRole('button', { name: /cronbach/i }).first()
    await triggerButton.hover()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const link = dialog.getByRole('link', { name: /see full entry/i })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /\/results\/glossary#cronbach-alpha/)
  })
})
