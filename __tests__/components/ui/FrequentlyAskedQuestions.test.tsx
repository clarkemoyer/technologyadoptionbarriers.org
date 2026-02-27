import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import FrequentlyAskedQuestions from '../../../src/components/ui/frequently-asked-questions'

expect.extend(toHaveNoViolations)

describe('FrequentlyAskedQuestions', () => {
  const title = 'What is TABS?'
  const content = 'TABS is a technology adoption survey.'

  it('renders the title', () => {
    render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('starts collapsed', () => {
    render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands when clicked', () => {
    render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses when clicked again', () => {
    render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('has accessible aria-label on toggle button', () => {
    render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button', { name: /toggle faq: what is tabs/i })
    expect(button).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FrequentlyAskedQuestions title={title}>
        <p>{content}</p>
      </FrequentlyAskedQuestions>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
