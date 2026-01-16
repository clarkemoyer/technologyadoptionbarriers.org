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

    // Find the footer paragraph containing the copyright symbol/year
    const footerText = page.locator('footer p').filter({ hasText: '©' }).first()

    // Verify the copyright notice is visible
    await expect(footerText).toBeVisible()

    // Verify it contains the copyright symbol and current year
    await expect(footerText).toContainText(`© ${currentYear}`)

    // Verify the site-specific copyright copy
    await expect(footerText).toContainText('Clarke Moyer')
    await expect(footerText).toContainText('all rights reserved')
    await expect(footerText).toContainText('PSU DBA')
  })

  test('should not reference freeforcharity.org in footer', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    await expect(page.locator('footer')).not.toContainText('freeforcharity.org')
  })
})
