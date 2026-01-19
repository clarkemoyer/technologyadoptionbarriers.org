import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Footer from '../../src/components/footer'

// Mock impact data to avoid import issues and ensure consistent data
jest.mock('../../src/data/impact.json', () => ({
  activeUsers: '100',
  pageViews: '500',
  updatedAt: '2026-01-01T00:00:00.000Z',
}))

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Footer component', () => {
  it('should render the footer', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should display "Get in Touch. Get Involved." heading', () => {
    render(<Footer />)
    const heading = screen.getByRole('heading', { name: /get in touch.*get involved/i })
    expect(heading).toBeInTheDocument()
  })

  it('should display contact information', () => {
    render(<Footer />)
    expect(screen.getByText(/state college pa/i)).toBeInTheDocument()
    const phoneLink = screen.getByRole('link', { name: /520.*222.*8104/i })
    expect(phoneLink).toHaveAttribute('href', 'tel:5202228104')
  })

  it('should display CTA buttons in contact section', () => {
    render(<Footer />)
    const takeTabsLinks = screen.getAllByRole('link', { name: /take the tabs/i })
    // There should be 2: one in contact section, one in navigation
    expect(takeTabsLinks.length).toBeGreaterThanOrEqual(1)
    // Check that at least one has the correct href
    const validLink = takeTabsLinks.find(
      (link) =>
        link.getAttribute('href') === 'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'
    )
    expect(validLink).toBeDefined()

    const supportLink = screen.getByRole('link', { name: /support tabs/i })
    expect(supportLink).toBeInTheDocument()
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

  it('should have policy links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /cookie policy/i })).toHaveAttribute(
      'href',
      '/cookie-policy'
    )
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute(
      'href',
      '/privacy-policy'
    )
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute(
      'href',
      '/terms-of-service'
    )
    expect(screen.getByRole('link', { name: /contribution policy/i })).toHaveAttribute(
      'href',
      '/contribution-policy'
    )
    expect(screen.getByRole('link', { name: /vulnerability disclosure/i })).toHaveAttribute(
      'href',
      '/vulnerability-disclosure-policy'
    )
    expect(screen.getByRole('link', { name: /security acknowledgements/i })).toHaveAttribute(
      'href',
      '/security-acknowledgements'
    )
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
