import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
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

  it('opens the dialog on click and renders the short definition', () => {
    render(<Term termId="kmo">KMO</Term>)
    const btn = screen.getByRole('button')
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(btn)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent(/sampling adequacy for factor analysis/i)
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
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.blur(termBtn)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on Escape key', () => {
    render(<Term termId="rmsea">RMSEA</Term>)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('sets aria-expanded in sync with open state and opens a dialog', () => {
    render(<Term termId="htmt">HTMT</Term>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('restores focus to the trigger when Escape is pressed from within the dialog', async () => {
    render(<Term termId="kmo">KMO</Term>)
    const btn = screen.getByRole('button')

    // Open the dialog
    fireEvent.click(btn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Move focus to the "See full entry" link inside the dialog
    const link = screen.getByRole('link', { name: /see full entry/i })
    act(() => link.focus())
    expect(link).toHaveFocus()

    // Press Escape — dialog should close and focus should return to trigger
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()

    await waitFor(() => {
      expect(btn).toHaveFocus()
    })
  })

  it('closes when focus leaves the component entirely (Tab past the link)', () => {
    render(
      <div>
        <Term termId="kmo">KMO</Term>
        <button type="button">after</button>
      </div>
    )
    const trigger = screen.getAllByRole('button')[0]
    // Open via focus on trigger
    fireEvent.focus(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Simulate Tab into the link (focus stays inside container → dialog stays open)
    const link = screen.getByRole('link', { name: /see full entry/i })
    fireEvent.blur(trigger, { relatedTarget: link })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Simulate Tab past the link → relatedTarget is the outside "after" button
    const after = screen.getAllByRole('button')[1]
    fireEvent.blur(link, { relatedTarget: after })
    expect(screen.queryByRole('dialog')).toBeNull()
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

  it('closes when a pointerdown event fires outside the component', () => {
    render(
      <div>
        <Term termId="kmo">KMO</Term>
        <button type="button" data-testid="outside">
          Outside
        </button>
      </div>
    )
    // Open the dialog
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Pointer down outside the component closes it
    fireEvent.pointerDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('dialog')).toBeNull()
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
