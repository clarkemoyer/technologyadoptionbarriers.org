import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import AccordionItem from '../../../src/components/ui/accordion'

expect.extend(toHaveNoViolations)

describe('AccordionItem', () => {
  const defaultProps = {
    number: '1',
    title: 'Introduction',
    children: <p>Accordion content here.</p>,
  }

  it('renders number and title', () => {
    render(<AccordionItem {...defaultProps} />)
    expect(screen.getByText(/1\.introduction/i)).toBeInTheDocument()
  })

  it('starts collapsed with aria-expanded false', () => {
    render(<AccordionItem {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands when clicked', () => {
    render(<AccordionItem {...defaultProps} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders children content', () => {
    render(<AccordionItem {...defaultProps} />)
    expect(screen.getByText('Accordion content here.')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AccordionItem {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
