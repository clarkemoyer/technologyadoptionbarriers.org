import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import FrequentlyAskedQuestions from '@/components/ui/frequently-asked-questions'

expect.extend(toHaveNoViolations)

describe('FrequentlyAskedQuestions', () => {
  it('renders the title', () => {
    render(
      <FrequentlyAskedQuestions title="What is TABS?">
        <p>TABS is a technology adoption barriers survey.</p>
      </FrequentlyAskedQuestions>
    )
    expect(screen.getByText('What is TABS?')).toBeInTheDocument()
  })

  it('starts collapsed', () => {
    render(
      <FrequentlyAskedQuestions title="Question">
        <p>Answer content</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands when clicked', () => {
    render(
      <FrequentlyAskedQuestions title="Question">
        <p>Answer content</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses when clicked again', () => {
    render(
      <FrequentlyAskedQuestions title="Question">
        <p>Answer content</p>
      </FrequentlyAskedQuestions>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders children content', () => {
    render(
      <FrequentlyAskedQuestions title="Question">
        <p>Answer content here</p>
      </FrequentlyAskedQuestions>
    )
    expect(screen.getByText('Answer content here')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FrequentlyAskedQuestions title="Accessible question">
        <p>Accessible answer</p>
      </FrequentlyAskedQuestions>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
