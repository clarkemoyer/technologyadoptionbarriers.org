import { test, expect } from '@playwright/test'

test.describe('Persona Landing Pages', () => {
  test.describe('/start index page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/start')
    })

    test('should load the /start page', async ({ page }) => {
      await expect(page).toHaveTitle(/Find Your Role.*TABS/)
    })

    test('should display the main heading', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /See Yourself in the Survey/i, level: 1 })
      await expect(heading).toBeVisible()
    })

    test('should display persona cards for all 11 roles', async ({ page }) => {
      // Check for specific roles
      await expect(page.getByRole('link', { name: /CEO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CFO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CIO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CISO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /COO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CMO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CTO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CSO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CHRO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /CRO.*Learn more/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Other.*Learn more/i })).toBeVisible()
    })

    test('should have working links to persona pages', async ({ page }) => {
      const ceoLink = page.getByRole('link', { name: /CEO.*Learn more/i })
      await expect(ceoLink).toHaveAttribute('href', '/start/ceo')
    })

    test('should display alternative CTA for direct survey access', async ({ page }) => {
      const directCTA = page.getByRole('link', { name: /Take the Survey Now/i })
      await expect(directCTA).toBeVisible()
      await expect(directCTA).toHaveAttribute('href', /qualtrics\.com/)
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab')
      const firstFocusable = await page.evaluate(() => document.activeElement?.tagName)
      expect(['A', 'BUTTON']).toContain(firstFocusable)
    })
  })

  test.describe('Individual persona pages', () => {
    const roles = ['ceo', 'cfo', 'cio', 'ciso', 'coo', 'cmo', 'cto', 'cso', 'chro', 'cro', 'other']

    for (const role of roles) {
      test(`should load /start/${role} page`, async ({ page }) => {
        await page.goto(`/start/${role}`)
        await expect(page).toHaveTitle(new RegExp(`.*${role.toUpperCase()}.*TABS`, 'i'))
      })
    }

    test('should display CEO persona page correctly', async ({ page }) => {
      await page.goto('/start/ceo')

      // Check main heading
      await expect(
        page.getByRole('heading', { name: /Chief Executive Officer/i, level: 1 })
      ).toBeVisible()

      // Check for "Why Your Participation Matters" section
      await expect(
        page.getByRole('heading', { name: /Why Your Participation Matters/i })
      ).toBeVisible()

      // Check for "What You'll Get in Return" section
      await expect(page.getByRole('heading', { name: /What You.*ll Get in Return/i })).toBeVisible()

      // Check for CTA button
      const ctaButton = page.getByRole('link', { name: /Take the TABS Survey/i })
      await expect(ctaButton).toBeVisible()
      await expect(ctaButton).toHaveAttribute('href', /qualtrics\.com/)
      await expect(ctaButton).toHaveAttribute('target', '_blank')

      // Check for "Not your role?" link
      const backLink = page.getByRole('link', { name: /Not your role.*See all roles/i })
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute('href', '/start')
    })

    test('should display CTO persona page correctly', async ({ page }) => {
      await page.goto('/start/cto')

      // Check main heading
      await expect(
        page.getByRole('heading', { name: /Chief Technology Officer/i, level: 1 })
      ).toBeVisible()

      // Check for description
      await expect(
        page.getByText(/lead technology innovation and product development/i)
      ).toBeVisible()
    })

    test('should have accessible survey CTA button', async ({ page }) => {
      await page.goto('/start/ceo')

      const ctaButton = page.getByRole('link', { name: /Take the TABS Survey/i })

      // Should be visible and clickable
      await expect(ctaButton).toBeVisible()

      // Should have proper accessibility attributes
      await expect(ctaButton).toHaveAttribute('href', /qualtrics\.com/)
      await expect(ctaButton).toHaveAttribute('rel', /noopener noreferrer/)
    })

    test('should navigate back to /start from persona page', async ({ page }) => {
      await page.goto('/start/ceo')

      const backLink = page.getByRole('link', { name: /Not your role.*See all roles/i })
      await backLink.click()

      await page.waitForURL('/start')
      await expect(page.getByRole('heading', { name: /See Yourself in the Survey/i })).toBeVisible()
    })

    test('should navigate from /start to specific persona page', async ({ page }) => {
      await page.goto('/start')

      const cfoLink = page.getByRole('link', { name: /CFO.*Learn more/i })
      await cfoLink.click()

      await page.waitForURL('/start/cfo')
      await expect(
        page.getByRole('heading', { name: /Chief Financial Officer/i, level: 1 })
      ).toBeVisible()
    })

    test('should have link to get-involved page', async ({ page }) => {
      await page.goto('/start/ceo')

      const getInvolvedLink = page.getByRole('link', {
        name: /Learn more about TABS and how to get involved/i,
      })
      await expect(getInvolvedLink).toBeVisible()
      await expect(getInvolvedLink).toHaveAttribute('href', '/get-involved')
    })
  })

  test.describe('Accessibility', () => {
    test('start index page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/start')

      // Should have one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)

      // Should have h2 elements
      const h2Count = await page.locator('h2').count()
      expect(h2Count).toBeGreaterThan(0)
    })

    test('persona page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/start/ceo')

      // Should have one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)

      // Should have h2 elements
      const h2Count = await page.locator('h2').count()
      expect(h2Count).toBeGreaterThan(0)
    })

    test('all links should be keyboard accessible', async ({ page }) => {
      await page.goto('/start')

      // Tab through the page
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => document.activeElement?.tagName)
        if (focused === 'A') {
          // Verify link has visible text or aria-label
          const hasText =
            (await page.evaluate(() => document.activeElement?.textContent?.trim())) !== ''
          const hasAriaLabel =
            (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) !== null
          expect(hasText || hasAriaLabel).toBe(true)
        }
      }
    })
  })

  test.describe('SEO and Metadata', () => {
    test('start page should have proper meta description', async ({ page }) => {
      await page.goto('/start')

      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
      expect(metaDescription).toBeTruthy()
      expect(metaDescription).toContain('leadership')
    })

    test('persona pages should have role-specific titles', async ({ page }) => {
      await page.goto('/start/ceo')
      await expect(page).toHaveTitle(/Chief Executive Officer/)

      await page.goto('/start/cfo')
      await expect(page).toHaveTitle(/Chief Financial Officer/)
    })
  })
})
