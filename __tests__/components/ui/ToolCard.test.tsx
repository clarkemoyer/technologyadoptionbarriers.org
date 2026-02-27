import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ToolCard from '../../../src/components/ui/tool-card'

// Mock IntersectionObserver
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
const mockUnobserve = jest.fn()

beforeEach(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve,
  }))
})

expect.extend(toHaveNoViolations)

describe('ToolCard', () => {
  const defaultProps = {
    title: 'Qualtrics',
    description: 'Survey platform for research.',
    link: 'https://qualtrics.com',
  }

  it('renders title and description', () => {
    render(<ToolCard {...defaultProps} />)
    expect(screen.getByText('Qualtrics')).toBeInTheDocument()
    expect(screen.getByText('Survey platform for research.')).toBeInTheDocument()
  })

  it('renders "Get Started" link with correct href', () => {
    render(<ToolCard {...defaultProps} />)
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href', 'https://qualtrics.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders logo image when provided', () => {
    render(<ToolCard {...defaultProps} logo="/Images/qualtrics-logo.png" />)
    const img = screen.getByAltText('Qualtrics logo')
    expect(img).toBeInTheDocument()
  })

  it('does not render logo when not provided', () => {
    render(<ToolCard {...defaultProps} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('sets up IntersectionObserver for animation', () => {
    render(<ToolCard {...defaultProps} />)
    expect(window.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ToolCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
