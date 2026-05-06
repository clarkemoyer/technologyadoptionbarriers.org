import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Modulecard from '../../../src/components/ui/module-card'

expect.extend(toHaveNoViolations)

describe('Modulecard', () => {
  it('renders the title', () => {
    render(
      <Modulecard title="Section Title" id="section-1">
        <p>Some content</p>
      </Modulecard>
    )
    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Modulecard title="Title" id="section-1">
        <p>Child paragraph</p>
      </Modulecard>
    )
    expect(screen.getByText('Child paragraph')).toBeInTheDocument()
  })

  it('sets the id attribute on the section element', () => {
    const { container } = render(
      <Modulecard title="Title" id="my-section">
        <span>Content</span>
      </Modulecard>
    )
    expect(container.querySelector('#my-section')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Modulecard title="Accessibility Test" id="a11y-section">
        <p>Content for accessibility check</p>
      </Modulecard>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
