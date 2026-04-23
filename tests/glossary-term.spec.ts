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
    const dialog = page.getByRole('dialog', { name: /cronbach/i })
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

    const dialog = page.getByRole('dialog', { name: /cronbach/i })
    await expect(dialog).toBeVisible()

    // Click somewhere outside the component using a layout-aware position.
    // The popover opens ABOVE the trigger (`bottom-full left-0`), so we
    // derive a point below the trigger that is clear of both the trigger
    // and the popover without relying on hard-coded viewport coordinates.
    const triggerBox = await triggerButton.boundingBox()
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()

    expect(triggerBox).not.toBeNull()
    expect(bodyBox).not.toBeNull()

    const clickX = Math.max(1, Math.min(10, bodyBox!.width - 1))
    const clickY = Math.min(
      bodyBox!.height - 1,
      Math.max(triggerBox!.y + triggerBox!.height + 24, 1)
    )

    await body.click({ position: { x: clickX, y: clickY } })
    await expect(dialog).not.toBeVisible()
  })

  test('includes a working link to the full glossary entry', async ({ page }) => {
    await page.goto('/results/reliability')

    const triggerButton = page.getByRole('button', { name: /cronbach/i }).first()
    await triggerButton.hover()

    const dialog = page.getByRole('dialog', { name: /cronbach/i })
    await expect(dialog).toBeVisible()

    const link = dialog.getByRole('link', { name: /see full entry/i })
    await expect(link).toBeVisible()
    // Next.js static export adds a trailing slash before fragments, so
    // /results/glossary#cronbach-alpha is rewritten to
    // /results/glossary/#cronbach-alpha. Accept either form.
    await expect(link).toHaveAttribute('href', /\/results\/glossary\/?#cronbach-alpha/)
  })
})
