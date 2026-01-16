import { test, expect } from '@playwright/test'

/**
 * Mission Video Tests
 *
 * These tests verify that the mission video is present and properly configured
 * on the homepage mission section.
 */

test.describe('Mission Video', () => {
  test('should display video in mission section', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the hero video element
    const missionVideo = page.locator('#hero video')

    // Verify the video exists and is visible
    await expect(missionVideo).toBeVisible()

    // Verify the video has controls enabled
    await expect(missionVideo).toHaveJSProperty('controls', true)
  })

  test('should have video source configured correctly', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Find the video source element
    const videoSource = page.locator('#hero video source')

    // Verify the source exists
    await expect(videoSource).toHaveCount(1)

    // Verify the source has the correct type
    await expect(videoSource).toHaveAttribute('type', 'video/mp4')

    // Verify the source points at the TABS video
    await expect(videoSource).toHaveAttribute('src', '/videos/The_TABS_Project.mp4')
  })
})
