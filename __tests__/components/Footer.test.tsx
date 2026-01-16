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

  it('should display credit in footer', () => {
    render(<Footer />)
    const credits = screen.getAllByText(/Clarke Moyer/i)
    expect(credits.length).toBeGreaterThan(0)
  })

  it('should have social media links', () => {
    render(<Footer />)
    const linkedIn = screen.getByLabelText('LinkedIn')
    expect(linkedIn).toHaveAttribute('href', 'https://www.linkedin.com/in/clarkemoyer/')

    const github = screen.getByLabelText('GitHub')
    expect(github).toHaveAttribute(
      'href',
      'https://github.com/clarkemoyer/technologyadoptionbarriers.org'
    )
  })

  // Email link removed in simplified footer design
  // it('should have email contact link', () => { ... })

  it('should not have accessibility violations', async () => {
    const { container } = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
