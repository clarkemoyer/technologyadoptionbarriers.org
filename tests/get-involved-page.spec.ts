import { test, expect } from '@playwright/test'

test.describe('Get Involved Page', () => {
  test('should load get-involved page successfully', async ({ page }) => {
    await page.goto('/get-involved')

    // Check page title
    await expect(page).toHaveTitle(/Get Involved/)

    // Check hero heading
    await expect(
      page.getByRole('heading', { name: 'Get Involved with TABS', level: 1 })
    ).toBeVisible()
  })

  test('should display all five opportunities', async ({ page }) => {
    await page.goto('/get-involved')

    // Check all opportunity titles
    await expect(page.getByRole('heading', { name: 'Take the TABS Survey' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Contribute to the General Fund' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Become a Sponsor' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Volunteer to Help TABS Operations' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Use TABS Data in Your Research' })
    ).toBeVisible()
  })

  test('should have working CTA buttons for each opportunity', async ({ page }) => {
    await page.goto('/get-involved')

    // Check survey link
    const surveyButton = page.getByRole('link', { name: 'Take the Survey' })
    await expect(surveyButton).toBeVisible()
    await expect(surveyButton).toHaveAttribute(
      'href',
      'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'
    )

    // Check contribute link
    const contributeButton = page.getByRole('link', { name: 'Contribute Now' })
    await expect(contributeButton).toBeVisible()
    await expect(contributeButton).toHaveAttribute(
      'href',
      'https://github.com/sponsors/clarkemoyer'
    )

    // Check sponsor link
    const sponsorButton = page.getByRole('link', { name: 'Discuss Sponsorship' })
    await expect(sponsorButton).toBeVisible()
    await expect(sponsorButton).toHaveAttribute(
      'href',
      /mailto:clarke@technologyadoptionbarriers\.org\?subject=TABS%20Sponsorship%20Inquiry/
    )

    // Check volunteer link
    const volunteerButton = page.getByRole('link', { name: 'Volunteer Your Skills' })
    await expect(volunteerButton).toBeVisible()
    await expect(volunteerButton).toHaveAttribute(
      'href',
      /mailto:clarke@technologyadoptionbarriers\.org\?subject=TABS%20Volunteer%20Inquiry/
    )

    // Check dataset access link
    const datasetButton = page.getByRole('link', { name: 'Request Dataset Access' })
    await expect(datasetButton).toBeVisible()
    await expect(datasetButton).toHaveAttribute(
      'href',
      /mailto:clarke@technologyadoptionbarriers\.org\?subject=TABS%20Dataset%20Access%20Request/
    )
  })

  test('should display contact section', async ({ page }) => {
    await page.goto('/get-involved')

    // Check contact heading
    await expect(page.getByRole('heading', { name: /Have Questions/ })).toBeVisible()

    // Check phone link
    const phoneLink = page.getByRole('link', { name: '(520) 222-8104' })
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toHaveAttribute('href', 'tel:5202228104')
  })

  test('should be accessible from homepage', async ({ page }) => {
    await page.goto('/')

    // Click the "See All Ways to Get Involved" link
    const getInvolvedLink = page.getByRole('link', { name: /See All Ways to Get Involved/i })
    await expect(getInvolvedLink).toBeVisible()
    await getInvolvedLink.click()

    // Should navigate to get-involved page
    await expect(page).toHaveURL('/get-involved')
    await expect(
      page.getByRole('heading', { name: 'Get Involved with TABS', level: 1 })
    ).toBeVisible()
  })

  test('should be accessible from footer navigation', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Click Get Involved link in footer (the 4th link in the navigation list)
    const footerLinks = page.locator('footer ul li').filter({ hasText: 'Get Involved' })
    const footerLink = footerLinks.getByRole('link', { name: 'Get Involved' })
    await expect(footerLink).toBeVisible()
    await footerLink.click()

    // Should navigate to get-involved page
    await expect(page).toHaveURL('/get-involved')
  })

  test('should display detailed information for each opportunity', async ({ page }) => {
    await page.goto('/get-involved')

    // Check for detail sections
    await expect(page.getByText('Who Should Participate')).toHaveCount(5)
    await expect(page.getByText('Time Commitment')).toHaveCount(5)
    await expect(page.getByText('Benefits')).toHaveCount(5)
  })

  test('researcher opportunity should mention IRB approval', async ({ page }) => {
    await page.goto('/get-involved')

    // Scroll to the dataset section
    await page
      .getByRole('heading', { name: 'Use TABS Data in Your Research' })
      .scrollIntoViewIfNeeded()

    // Check for IRB mention
    await expect(page.getByText(/IRB approval required/i)).toBeVisible()
    await expect(page.getByText(/papers and dissertations/i)).toBeVisible()
  })
})
