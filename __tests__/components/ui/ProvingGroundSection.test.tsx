import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ProvingGroundSection from '../../../src/components/ui/proving-ground-section'

expect.extend(toHaveNoViolations)

describe('ProvingGroundSection', () => {
  it('renders the title', () => {
    render(
      <ProvingGroundSection title="Methodology">
        <p>Some content here</p>
      </ProvingGroundSection>
    )
    expect(screen.getByText('Methodology')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <ProvingGroundSection title="Test">
        <p>Child content</p>
      </ProvingGroundSection>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders a heading element for the title', () => {
    render(
      <ProvingGroundSection title="My Title">
        <span>Content</span>
      </ProvingGroundSection>
    )
    expect(screen.getByRole('heading', { name: 'My Title' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ProvingGroundSection title="Accessible Section">
        <p>Accessible content</p>
      </ProvingGroundSection>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
