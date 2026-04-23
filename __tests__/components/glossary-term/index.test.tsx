import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Term from '@/components/glossary-term'

expect.extend(toHaveNoViolations)

describe('Term', () => {
  it('renders the entry term by default', () => {
    render(<Term termId="cronbach-alpha" />)
    expect(screen.getByRole('button')).toHaveTextContent(/Cronbach/i)
  })

  it('accepts override children as the visible text', () => {
    render(<Term termId="kmo">KMO</Term>)
    expect(screen.getByRole('button')).toHaveTextContent('KMO')
  })

  it('opens the tooltip on click and renders the short definition', () => {
    render(<Term termId="kmo">KMO</Term>)
    const btn = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.click(btn)
    const tip = screen.getByRole('tooltip')
    expect(tip).toBeInTheDocument()
    expect(tip).toHaveTextContent(/sampling adequacy for factor analysis/i)
  })

  it('includes a link to the full glossary entry when open', () => {
    render(<Term termId="kmo">KMO</Term>)
    fireEvent.click(screen.getByRole('button'))
    const link = screen.getByRole('link', { name: /see full entry/i })
    expect(link).toHaveAttribute('href', '/results/glossary#kmo')
  })

  it('opens on focus and closes on blur when focus leaves entirely', () => {
    render(
      <div>
        <Term termId="htmt">HTMT</Term>
        <button type="button">After</button>
      </div>
    )
    const termBtn = screen.getAllByRole('button')[0]
    fireEvent.focus(termBtn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.blur(termBtn)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('closes on Escape key', () => {
    render(<Term termId="rmsea">RMSEA</Term>)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('sets aria-expanded and aria-describedby in sync with open state', () => {
    render(<Term termId="htmt">HTMT</Term>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).not.toHaveAttribute('aria-describedby')

    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    const tip = screen.getByRole('tooltip')
    expect(btn).toHaveAttribute('aria-describedby', tip.getAttribute('id')!)
  })

  it('falls back to plain text when the termId is not in the glossary', () => {
    render(<Term termId="nonexistent-term-xyz">fallback text</Term>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('fallback text')).toBeInTheDocument()
  })

  it('renders the termId when a missing term has no children', () => {
    render(<Term termId="nonexistent-term-xyz" />)
    expect(screen.getByText('nonexistent-term-xyz')).toBeInTheDocument()
  })

  it('has no accessibility violations in the closed state', async () => {
    const { container } = render(<Term termId="kmo">KMO</Term>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations in the open state', async () => {
    const { container } = render(<Term termId="kmo">KMO</Term>)
    fireEvent.click(screen.getByRole('button'))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
