import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import SupportCards from '../../src/components/tabs-page/SupportCards'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('SupportCards component', () => {
  it('should render all four support cards', () => {
    render(<SupportCards />)

    // Check for all four card titles with updated names
    expect(screen.getByText('Support the Research')).toBeInTheDocument()
    expect(screen.getByText('Become a Sponsor')).toBeInTheDocument()
    expect(screen.getByText('Volunteer Your Skills')).toBeInTheDocument()
    expect(screen.getByText('Use Our Dataset')).toBeInTheDocument()
  })

  it('should display the researcher CTA with correct content', () => {
    render(<SupportCards />)

    // Check title
    expect(screen.getByText('Use Our Dataset')).toBeInTheDocument()

    // Check description contains key terms
    expect(screen.getByText(/Researchers/i)).toBeInTheDocument()
    expect(screen.getByText(/IRB-approved dataset access/i)).toBeInTheDocument()

    // Check button
    const datasetButton = screen.getByRole('link', { name: /request access/i })
    expect(datasetButton).toBeInTheDocument()
    expect(datasetButton).toHaveAttribute('href', '/get-involved#use-dataset')
  })

  it('should display all CTA buttons with correct links', () => {
    render(<SupportCards />)

    const contributeButton = screen.getByRole('link', { name: /contribute now/i })
    expect(contributeButton).toBeInTheDocument()
    expect(contributeButton).toHaveAttribute('href', 'https://github.com/sponsors/clarkemoyer')

    const learnMoreButton = screen.getByRole('link', { name: /learn more/i })
    expect(learnMoreButton).toBeInTheDocument()
    expect(learnMoreButton).toHaveAttribute('href', '/get-involved#sponsor')

    // Use more specific text for the volunteer button to avoid matching "See All Ways to Get Involved"
    const volunteerButton = screen.getByRole('link', { name: 'Get Involved' })
    expect(volunteerButton).toBeInTheDocument()
    expect(volunteerButton).toHaveAttribute('href', '/get-involved#volunteer')

    const requestAccessButton = screen.getByRole('link', { name: /request access/i })
    expect(requestAccessButton).toBeInTheDocument()
    expect(requestAccessButton).toHaveAttribute('href', '/get-involved#use-dataset')
  })

  it('should display link to full Get Involved page', () => {
    render(<SupportCards />)

    const allWaysLink = screen.getByRole('link', { name: /see all ways to get involved/i })
    expect(allWaysLink).toBeInTheDocument()
    expect(allWaysLink).toHaveAttribute('href', '/get-involved')
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<SupportCards />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
