import { test, expect } from '@playwright/test'

test.describe('404 Not Found Page', () => {
  test('should display 404 page for non-existent routes', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist')

    // Check the page title
    await expect(page).toHaveTitle(/404 - Page Not Found/)

    // Check for the large 404 heading
    const heading = page.locator('h1:has-text("404")')
    await expect(heading).toBeVisible()

    // Check for the humorous technology adoption barrier message
    const message = page.locator('text=Technology Adoption Barrier Detected!')
    await expect(message).toBeVisible()

    // Check for the main heading
    const mainHeading = page.locator('h2:has-text("Looks Like This Page Resisted Being Adopted!")')
    await expect(mainHeading).toBeVisible()

    // Check for the ASCII art computer
    const asciiArt = page.locator('pre')
    await expect(asciiArt).toBeVisible()
    await expect(asciiArt).toContainText('ERROR')
    await expect(asciiArt).toContainText('404')
    await expect(asciiArt).toContainText('RESISTANCE TO')

    // Check for the "Return to Home" button
    const homeButton = page.locator('a:has-text("Return to Home")')
    await expect(homeButton).toBeVisible()
    await expect(homeButton).toHaveAttribute('href', '/')

    // Check for the "Learn About Real Barriers" button
    const barriersButton = page.locator('a:has-text("Learn About Real Barriers")')
    await expect(barriersButton).toBeVisible()
    await expect(barriersButton).toHaveAttribute('href', '/barriers')

    // Check for the humorous quote at the bottom
    const quote = page.locator('text=The only thing worse than a 404 error')
    await expect(quote).toBeVisible()
  })

  test('should allow navigation back to home from 404 page', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page')

    // Click the "Return to Home" button
    await page.click('a:has-text("Return to Home")')

    // Wait for navigation
    await page.waitForURL('/')

    // Verify we're on the home page
    await expect(page).toHaveURL('/')
  })

  test('should allow navigation to barriers page from 404 page', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/another-missing-page')

    // Click the "Learn About Real Barriers" button
    await page.click('a:has-text("Learn About Real Barriers")')

    // Wait for navigation
    await page.waitForURL('/barriers')

    // Verify we're on the barriers page
    await expect(page).toHaveURL('/barriers')
  })
})
