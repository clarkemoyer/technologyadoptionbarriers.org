import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import StepCard from '../../../src/components/ui/step-card'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage(props: {
    src: string
    alt: string
    fill?: boolean
    className?: string
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} />
  }
})

// Mock assetPath
jest.mock('@/lib/assetPath', () => ({
  assetPath: (path: string) => path,
}))

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

const step = {
  number: 1,
  title: 'Identify Barriers',
  description: 'Understand the barriers to adoption',
  linkText: 'Read More',
  innerbg: 'bg-blue-50',
  outerbg: 'bg-blue-100',
  linkUrl: '/barriers',
}

describe('StepCard (step-card)', () => {
  it('renders the step title', () => {
    render(<StepCard step={step} />)
    expect(screen.getByText('Identify Barriers')).toBeInTheDocument()
  })

  it('renders the step description', () => {
    render(<StepCard step={step} />)
    expect(screen.getByText('Understand the barriers to adoption')).toBeInTheDocument()
  })

  it('renders the link with correct href', () => {
    render(<StepCard step={step} />)
    const link = screen.getByRole('link', { name: /read more/i })
    expect(link).toHaveAttribute('href', '/barriers')
  })

  it('renders an image for the step number', () => {
    render(<StepCard step={step} />)
    expect(screen.getByAltText('Step 1')).toBeInTheDocument()
  })

  it('sets up IntersectionObserver on mount', () => {
    render(<StepCard step={step} />)
    expect(window.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<StepCard step={step} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
