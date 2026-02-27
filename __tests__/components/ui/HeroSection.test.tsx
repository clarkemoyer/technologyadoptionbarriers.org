import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import HeroSection from '../../../src/components/ui/hero-section'

expect.extend(toHaveNoViolations)

describe('HeroSection', () => {
  const defaultProps = {
    heading: 'Technology Adoption Barriers',
    paragraph: 'Documenting challenges in technology adoption.',
    heroImg: '/Images/hero.png',
  }

  it('renders heading and paragraph', () => {
    render(<HeroSection {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /technology adoption barriers/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/documenting challenges/i)).toBeInTheDocument()
  })

  it('renders image with descriptive alt text derived from heading', () => {
    render(<HeroSection {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Illustration for Technology Adoption Barriers')
  })

  it('uses custom heroAlt when provided', () => {
    render(<HeroSection {...defaultProps} heroAlt="Custom alt text" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Custom alt text')
  })

  it('applies custom fontSize and lineHeight', () => {
    render(<HeroSection {...defaultProps} fontSize={28} lineHeight={40} />)
    const paragraph = screen.getByText(/documenting challenges/i)
    expect(paragraph).toHaveStyle({ fontSize: '28px', lineHeight: '40px' })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroSection {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
