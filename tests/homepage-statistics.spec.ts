import { test, expect } from '@playwright/test'
import dispositionData from '../src/data/disposition-summary.json'
import impactData from '../src/data/impact.json'
import { TOTAL_ITEMS_PRESENTED } from '../src/lib/tabs-survey-constants'

/**
 * Verifies the three homepage Statistics counters match their canonical data
 * sources so regressions are caught before they reach production.
 *
 * Expected values are derived from the same imports/constants used by
 * statistics.tsx, so the test stays in sync automatically when data updates.
 */
test.describe('Homepage Statistics Section', () => {
  test('should display correct counter values from canonical data sources', async ({ page }) => {
    await page.goto('/')

    const section = page.locator('#statistics')
    await expect(section).toBeVisible()

    // Surveys Completed: Prolific-approved count from disposition-summary.json
    await expect(section).toContainText(
      dispositionData.completionProgress.approved.toLocaleString(),
    )

    // Survey Questions: participant-facing item total derived from constants
    await expect(section).toContainText(TOTAL_ITEMS_PRESENTED.toLocaleString())

    // Verified Visitors: production hostname visitors from impact.json
    await expect(section).toContainText(
      (parseInt(impactData.verifiedVisitors, 10) || 0).toLocaleString(),
    )
  })
})
