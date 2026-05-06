import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import StepCard from '../../../src/components/ui/domain-card'

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

describe('StepCard (domain-card)', () => {
  const defaultProps = {
    imageSrc: '/icons/step-icon.png',
    text: 'Follow the adoption framework',
  }

  it('renders the text content', () => {
    render(<StepCard {...defaultProps} />)
    expect(screen.getByText('Follow the adoption framework')).toBeInTheDocument()
  })

  it('renders an image with default alt text', () => {
    render(<StepCard {...defaultProps} />)
    expect(screen.getByAltText('Step icon')).toBeInTheDocument()
  })

  it('renders an image with the provided alt text', () => {
    render(<StepCard {...defaultProps} imageAlt="Custom alt" />)
    expect(screen.getByAltText('Custom alt')).toBeInTheDocument()
  })

  it('applies an additional className when provided', () => {
    const { container } = render(<StepCard {...defaultProps} className="extra-class" />)
    expect(container.firstChild).toHaveClass('extra-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<StepCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
