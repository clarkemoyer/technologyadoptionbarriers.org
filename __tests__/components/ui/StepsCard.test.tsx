import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import StepsCard from '../../../src/components/ui/step-content-card'

expect.extend(toHaveNoViolations)

describe('StepsCard', () => {
  const defaultProps = {
    title: 'Step 1: Getting Started',
    id: 'step-1',
  }

  it('renders the title', () => {
    render(
      <StepsCard {...defaultProps}>
        <p>Step instructions</p>
      </StepsCard>
    )
    expect(screen.getByText('Step 1: Getting Started')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <StepsCard {...defaultProps}>
        <p>Important step instructions</p>
      </StepsCard>
    )
    expect(screen.getByText('Important step instructions')).toBeInTheDocument()
  })

  it('sets the id attribute on the wrapper element', () => {
    const { container } = render(
      <StepsCard title="My Step" id="unique-id">
        <span>Content</span>
      </StepsCard>
    )
    expect(container.querySelector('#unique-id')).toBeInTheDocument()
  })

  it('applies additional className when provided', () => {
    const { container } = render(
      <StepsCard title="Title" id="id-1" className="extra-class">
        <span>Content</span>
      </StepsCard>
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('extra-class')
  })

  it('renders a heading for the title', () => {
    render(
      <StepsCard title="Step Title" id="h-test">
        <span />
      </StepsCard>
    )
    expect(screen.getByRole('heading', { name: 'Step Title' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StepsCard title="Accessible Step" id="a11y-step">
        <p>Accessible step content</p>
      </StepsCard>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
