import { test, expect } from '@playwright/test'

/**
 * Media Page Tests
 *
 * Verifies that the Media page loads and the project video is configured correctly.
 */

test.describe('Media Page', () => {
  test('should display media video with captions', async ({ page }) => {
    await page.goto('/media')

    const mediaVideo = page.getByLabel('Introduction to The TABS Project')
    await expect(mediaVideo).toBeVisible()

    const videoSource = page.locator('#video video source')
    await expect(videoSource).toHaveCount(1)
    await expect(videoSource).toHaveAttribute('type', 'video/mp4')

    const src = await videoSource.getAttribute('src')
    expect(src).toBeTruthy()
    expect(src).toContain('/videos/The_TABS_Project.mp4')

    const captionsTrack = page.locator('#video video track[kind="captions"]')
    await expect(captionsTrack).toHaveCount(1)

    const captionsSrc = await captionsTrack.getAttribute('src')
    expect(captionsSrc).toBeTruthy()
    expect(captionsSrc).toContain('/videos/The_TABS_Project.en.vtt')

    const poster = await mediaVideo.getAttribute('poster')
    expect(poster).toBeTruthy()
    expect(poster).toContain('/Images/TABS-Logo-Full.png')
  })
})
