import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import SlidingCard from '../../../src/components/ui/sliding-card'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage(props: {
    src: string
    alt: string
    width: number
    height: number
    className?: string
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} width={props.width} height={props.height} />
  }
})

// Mock IntersectionObserver
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

beforeEach(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: jest.fn(),
  }))
  mockObserve.mockClear()
  mockDisconnect.mockClear()
})

const defaultProps = {
  subtitle: 'Research Overview',
  description: <p>A description of the research.</p>,
  buttonText: 'Learn More',
  buttonLink: 'https://example.com',
  imageSrc: '/images/research.png',
}

describe('SlidingCard', () => {
  it('renders the subtitle', () => {
    render(<SlidingCard {...defaultProps} />)
    expect(screen.getByText('Research Overview')).toBeInTheDocument()
  })

  it('renders the button with correct text', () => {
    render(<SlidingCard {...defaultProps} />)
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })

  it('button links to the correct href', () => {
    render(<SlidingCard {...defaultProps} />)
    const link = screen.getByRole('link', { name: /learn more/i })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('button opens in a new tab', () => {
    render(<SlidingCard {...defaultProps} />)
    const link = screen.getByRole('link', { name: /learn more/i })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders the image with the subtitle as alt text', () => {
    render(<SlidingCard {...defaultProps} />)
    expect(screen.getByAltText('Research Overview')).toBeInTheDocument()
  })

  it('renders description content', () => {
    render(<SlidingCard {...defaultProps} />)
    expect(screen.getByText('A description of the research.')).toBeInTheDocument()
  })

  it('sets up IntersectionObserver on mount', () => {
    render(<SlidingCard {...defaultProps} />)
    expect(window.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })

  it('renders with direction="left" without errors', () => {
    render(<SlidingCard {...defaultProps} direction="left" />)
    expect(screen.getByText('Research Overview')).toBeInTheDocument()
  })

  it('renders with direction="right" (default) without errors', () => {
    render(<SlidingCard {...defaultProps} direction="right" />)
    expect(screen.getByText('Research Overview')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<SlidingCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
