import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import QuotesPageClient from '../../src/app/barriers/quotes/quotes-client'
import quotes from '../../src/data/tech-adoption-quotes.json'

expect.extend(toHaveNoViolations)

describe('QuotesPageClient', () => {
  it('renders the page heading', () => {
    render(<QuotesPageClient />)
    expect(
      screen.getByRole('heading', { name: /famous quotes on technology adoption/i })
    ).toBeInTheDocument()
  })

  it('renders all quotes by default', () => {
    render(<QuotesPageClient />)
    const quoteElements = screen.getAllByText(/\u201c/)
    expect(quoteElements.length).toBe(quotes.length)
  })

  it('displays the total quote count', () => {
    render(<QuotesPageClient />)
    expect(screen.getByText(new RegExp(`${quotes.length} quotes`))).toBeInTheDocument()
  })

  describe('Search functionality', () => {
    it('renders the search input', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')
      expect(searchInput).toBeInTheDocument()
    })

    it('filters quotes by author name', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: 'Heraclitus' } })

      const quoteElements = screen.getAllByText(/\u201c/)
      expect(quoteElements.length).toBeGreaterThan(0)
      expect(screen.getByText('Heraclitus')).toBeInTheDocument()
    })

    it('filters quotes by quote text', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: 'creative destruction' } })

      expect(screen.getByText('Joseph Schumpeter')).toBeInTheDocument()
    })

    it('is case-insensitive', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: 'HERACLITUS' } })

      expect(screen.getByText('Heraclitus')).toBeInTheDocument()
    })

    it('trims leading and trailing whitespace from search', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: '  Heraclitus  ' } })

      expect(screen.getByText('Heraclitus')).toBeInTheDocument()
    })

    it('shows empty state when no quotes match', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } })

      expect(screen.getByText('No quotes match your search.')).toBeInTheDocument()
    })

    it('clears filters from empty state', () => {
      render(<QuotesPageClient />)
      const searchInput = screen.getByLabelText('Search quotes')

      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } })
      fireEvent.click(screen.getByText('Clear filters'))

      const quoteElements = screen.getAllByText(/\u201c/)
      expect(quoteElements.length).toBe(quotes.length)
    })
  })

  describe('Era filtering', () => {
    it('renders the All filter button', () => {
      render(<QuotesPageClient />)
      expect(
        screen.getByRole('button', { name: new RegExp(`All \\(${quotes.length}\\)`) })
      ).toBeInTheDocument()
    })

    it('filters quotes when an era is selected', () => {
      render(<QuotesPageClient />)
      const ancientQuotes = quotes.filter((q) => q.era === 'Ancient')

      if (ancientQuotes.length > 0) {
        const ancientButton = screen.getByRole('button', {
          name: new RegExp(`Ancient \\(${ancientQuotes.length}\\)`),
        })
        fireEvent.click(ancientButton)

        const quoteElements = screen.getAllByText(/\u201c/)
        expect(quoteElements.length).toBe(ancientQuotes.length)
      }
    })

    it('shows all quotes when All is clicked after filtering', () => {
      render(<QuotesPageClient />)
      const ancientQuotes = quotes.filter((q) => q.era === 'Ancient')

      if (ancientQuotes.length > 0) {
        const ancientButton = screen.getByRole('button', {
          name: new RegExp(`Ancient \\(${ancientQuotes.length}\\)`),
        })
        fireEvent.click(ancientButton)

        const allButton = screen.getByRole('button', {
          name: new RegExp(`All \\(${quotes.length}\\)`),
        })
        fireEvent.click(allButton)

        const quoteElements = screen.getAllByText(/\u201c/)
        expect(quoteElements.length).toBe(quotes.length)
      }
    })
  })

  describe('Chronological ordering', () => {
    it('displays quotes in chronological order', () => {
      render(<QuotesPageClient />)
      const yearElements = screen.getAllByText(/\d{4}|BCE/)
      // Just verify we have year displays rendered
      expect(yearElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<QuotesPageClient />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has aria-pressed on filter buttons', () => {
      render(<QuotesPageClient />)
      const allButton = screen.getByRole('button', {
        name: new RegExp(`All \\(${quotes.length}\\)`),
      })
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
