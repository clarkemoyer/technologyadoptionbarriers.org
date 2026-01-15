import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Footer from '../../src/components/footer'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Footer component', () => {
  it('should render the footer', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should display the current year in copyright', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })

  it('should display TABS credit in footer', () => {
    render(<Footer />)
    const credits = screen.getAllByText(/Technology Adoption Barriers Survey/i)
    expect(credits.length).toBeGreaterThan(0)
  })

  it('should have email contact link', () => {
    render(<Footer />)
    const emailLink = screen.getByText(/clarke@technologyadoptionbarriers.org/i)
    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:clarke@technologyadoptionbarriers.org'
    )
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
