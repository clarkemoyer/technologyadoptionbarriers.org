import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import TrainingCard from '@/components/ui/training-card'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage(props: { src: string; alt: string; width: number; height: number }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} width={props.width} height={props.height} />
  }
})

describe('TrainingCard', () => {
  const defaultProps = {
    src: '/images/test-icon.png',
    heading: 'Test Heading',
    text: 'This is a description of the training card.',
  }

  it('renders the heading', () => {
    render(<TrainingCard {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Heading')
  })

  it('renders the description text', () => {
    render(<TrainingCard {...defaultProps} />)
    expect(screen.getByText('This is a description of the training card.')).toBeInTheDocument()
  })

  it('renders the image with correct alt text', () => {
    render(<TrainingCard {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Test Heading')
  })

  it('renders the image with correct src', () => {
    render(<TrainingCard {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/images/test-icon.png')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<TrainingCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
