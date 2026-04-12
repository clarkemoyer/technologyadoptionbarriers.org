import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Header from '../../src/components/header'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '../../src/lib/tabs-survey'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('Header component', () => {
  it('should render the header', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should display the TABS logo', () => {
    render(<Header />)
    expect(screen.getByAltText('TABS Logo')).toBeInTheDocument()
  })

  it("should display 'Take the TABS' primary CTA link", () => {
    render(<Header />)

    const cta = screen.getByTestId('header-take-tabs-cta')
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAccessibleName('Take the TABS')
    expect(cta).toHaveAttribute('href', TABS_WEBSITE_QUALTRICS_SURVEY_URL)
    expect(cta).not.toHaveClass('hidden')
  })

  it('should have navigation links', () => {
    render(<Header />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<Header />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
