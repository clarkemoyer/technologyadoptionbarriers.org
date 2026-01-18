import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import DonationCards from '../../src/components/tabs-page/DonationCards'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('DonationCards component', () => {
  it('should render all four donation cards', () => {
    render(<DonationCards />)

    // Check for all four card titles
    expect(screen.getByText('Donate to the general fund')).toBeInTheDocument()
    expect(screen.getByText('Donate as a Sponsor')).toBeInTheDocument()
    expect(screen.getByText('Become a Supporting Researcher')).toBeInTheDocument()
    expect(screen.getByText('Support our Research')).toBeInTheDocument()
  })

  it('should display the researcher CTA with correct content', () => {
    render(<DonationCards />)

    // Check title
    expect(screen.getByText('Support our Research')).toBeInTheDocument()

    // Check description contains key terms
    expect(screen.getByText(/TABS dataset/i)).toBeInTheDocument()
    expect(screen.getByText(/IRB/i)).toBeInTheDocument()
    expect(screen.getByText(/papers and dissertations/i)).toBeInTheDocument()

    // Check button
    const datasetButton = screen.getByRole('link', { name: /request dataset access/i })
    expect(datasetButton).toBeInTheDocument()
    expect(datasetButton).toHaveAttribute(
      'href',
      'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Dataset%20Access%20Request'
    )
  })

  it('should display all CTA buttons with correct links', () => {
    render(<DonationCards />)

    const donateButton = screen.getByRole('link', { name: /donate now/i })
    expect(donateButton).toBeInTheDocument()

    const contactButtons = screen.getAllByRole('link', { name: /contact us/i })
    expect(contactButtons.length).toBeGreaterThan(0)

    const volunteerButton = screen.getByRole('link', { name: /volunteer today/i })
    expect(volunteerButton).toBeInTheDocument()

    const datasetButton = screen.getByRole('link', { name: /request dataset access/i })
    expect(datasetButton).toBeInTheDocument()
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<DonationCards />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
