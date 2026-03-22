import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Transparentbtn from '@/components/ui/transparent-btn'

expect.extend(toHaveNoViolations)

// Mock react-icons
jest.mock('react-icons/io', () => ({
  IoIosArrowForward: () => <span data-testid="arrow-icon" />,
}))

describe('TransparentBtn', () => {
  it('renders the button text', () => {
    render(<Transparentbtn text="Learn More" />)
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('renders a link with the correct href', () => {
    render(<Transparentbtn text="Click Me" href="/about" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/about')
  })

  it('renders with default # href when none provided', () => {
    render(<Transparentbtn text="Click Me" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#')
  })

  it('renders with custom color', () => {
    render(<Transparentbtn text="Colored" color="red" />)
    const link = screen.getByRole('link')
    expect(link.style.color).toBe('red')
    expect(link.style.borderColor).toBe('red')
  })

  it('renders the arrow icon', () => {
    render(<Transparentbtn text="Go" />)
    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Transparentbtn text="Accessible Button" href="/test" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
