import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import InfoCard from '../../../src/components/ui/blog-card'

expect.extend(toHaveNoViolations)

describe('InfoCard (BlogCard)', () => {
  const defaultProps = {
    heading: 'Understanding TAM',
    description: 'A deep dive into the Technology Acceptance Model.',
  }

  it('renders heading and description', () => {
    render(<InfoCard {...defaultProps} />)
    expect(screen.getByText('Understanding TAM')).toBeInTheDocument()
    expect(
      screen.getByText(/a deep dive into the technology acceptance model/i)
    ).toBeInTheDocument()
  })

  it('renders date when provided', () => {
    render(<InfoCard {...defaultProps} date="January 15, 2026" />)
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument()
  })

  it('does not render date when not provided', () => {
    render(<InfoCard {...defaultProps} />)
    expect(screen.queryByText(/january/i)).not.toBeInTheDocument()
  })

  it('renders heading as a link when href is provided', () => {
    render(<InfoCard {...defaultProps} href="https://example.com" />)
    const link = screen.getByRole('link', { name: 'Understanding TAM' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('renders heading as plain text when no href', () => {
    render(<InfoCard {...defaultProps} />)
    expect(screen.queryByRole('link', { name: 'Understanding TAM' })).not.toBeInTheDocument()
    expect(screen.getByText('Understanding TAM')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<InfoCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
