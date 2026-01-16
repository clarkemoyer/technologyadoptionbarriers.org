import { test, expect } from '@playwright/test'

/**
 * Copyright Notice Tests
 *
 * These tests verify that the copyright notice in the footer:
 * 1. Contains the copyright symbol (©)
 * 2. Displays the current year
 * 3. Renders the complete copyright text
 */

test.describe('Footer Copyright Notice', () => {
  test('should display copyright notice with current year', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Get the current year
    const currentYear = new Date().getFullYear()

    // Verify footer contains the copyright text
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(`© ${currentYear} Clarke Moyer`)
    await expect(footer).toContainText('all rights reserved')
    await expect(footer).toContainText('Credit to Smeal and the PSU DBA program')
  })
})
