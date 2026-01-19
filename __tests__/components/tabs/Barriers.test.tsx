import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Barriers from '../../../src/components/tabs/Barriers'
import { barriers, barrierCategories } from '../../../src/data/barriers'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Barriers component', () => {
  it('should render the barriers section', () => {
    render(<Barriers />)
    expect(screen.getByText('Technology Adoption Barriers')).toBeInTheDocument()
  })

  it('should render all barriers by default', () => {
    render(<Barriers />)
    // Check that some barriers are displayed (sample check)
    const barrierElements = screen.getAllByRole('heading', { level: 3 })
    expect(barrierElements.length).toBeGreaterThan(0)
  })

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('aria-label', 'Search barriers by name or description')
    })

    it('should filter barriers by name when searching', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')

      // Find a specific barrier name from the data
      const firstBarrier = barriers[0]
      fireEvent.change(searchInput, { target: { value: firstBarrier.name } })

      // The barrier with matching name should be visible
      expect(screen.getByText(firstBarrier.name)).toBeInTheDocument()
    })

    it('should filter barriers by description when searching', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')

      // Search for a word that appears in a description
      const searchTerm = 'knowledge'
      fireEvent.change(searchInput, { target: { value: searchTerm } })

      // At least one matching barrier should be visible
      const barrierElements = screen.getAllByRole('heading', { level: 3 })
      expect(barrierElements.length).toBeGreaterThan(0)
    })

    it('should be case-insensitive when searching', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')

      const firstBarrier = barriers[0]
      fireEvent.change(searchInput, { target: { value: firstBarrier.name.toUpperCase() } })

      expect(screen.getByText(firstBarrier.name)).toBeInTheDocument()
    })

    it('should show clear search button when search query exists', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')

      // Initially, clear button should not be present
      expect(screen.queryByLabelText('Clear search query')).not.toBeInTheDocument()

      // Type in search
      fireEvent.change(searchInput, { target: { value: 'cost' } })

      // Clear button should now be present
      expect(screen.getByLabelText('Clear search query')).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(<Barriers />)
      const searchInput = screen.getByPlaceholderText('Search barriers...')

      // Type in search
      fireEvent.change(searchInput, { target: { value: 'cost' } })
      expect(searchInput).toHaveValue('cost')

      // Click clear button
      const clearButton = screen.getByLabelText('Clear search query')
      fireEvent.click(clearButton)

      // Search should be cleared
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Category filtering', () => {
    it('should render all category filter buttons', () => {
      render(<Barriers />)

      barrierCategories.forEach((category) => {
        expect(screen.getByText(category.name)).toBeInTheDocument()
      })
    })

    it('should have proper aria-label on category buttons', () => {
      render(<Barriers />)

      barrierCategories.forEach((category) => {
        const button = screen.getByText(category.name).closest('button')
        expect(button).toHaveAttribute(
          'aria-label',
          expect.stringContaining(`Filter by ${category.name}`)
        )
      })
    })

    it('should filter barriers by category when clicked', () => {
      render(<Barriers />)

      // Click on Financial category
      const financialButton = screen.getByText('Financial').closest('button')
      fireEvent.click(financialButton!)

      // Should show financial barriers
      const financialBarriers = barriers.filter((b) => b.category === 'financial')
      financialBarriers.forEach((barrier) => {
        expect(screen.getByText(barrier.name)).toBeInTheDocument()
      })
    })

    it('should toggle category filter when clicked again', () => {
      render(<Barriers />)

      const financialButton = screen.getByText('Financial').closest('button')

      // Click to activate
      fireEvent.click(financialButton!)

      // Should have aria-label indicating it's selected
      expect(financialButton).toHaveAttribute(
        'aria-label',
        expect.stringContaining('currently selected')
      )

      // Click again to deactivate
      fireEvent.click(financialButton!)

      // Should no longer have 'currently selected' in aria-label
      expect(financialButton).toHaveAttribute('aria-label', 'Filter by Financial')
    })

    it('should update active state visual styling when category is selected', () => {
      render(<Barriers />)

      const financialButton = screen.getByText('Financial').closest('button')

      // Initially should not have active styling
      expect(financialButton).not.toHaveClass('bg-[#2E6F8E]')

      // Click to activate
      fireEvent.click(financialButton!)

      // Should have active styling
      expect(financialButton).toHaveClass('bg-[#2E6F8E]')
    })
  })

  describe('Combined filtering', () => {
    it('should filter by both search and category', () => {
      render(<Barriers />)

      // Activate category filter
      const technicalButton = screen.getByText('Technical').closest('button')
      fireEvent.click(technicalButton!)

      // Also search
      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'complexity' } })

      // At least check that non-matching barriers are not shown
      const otherBarriers = barriers.filter((b) => b.category !== 'technical')
      otherBarriers.forEach((barrier) => {
        expect(screen.queryByText(barrier.name)).not.toBeInTheDocument()
      })
    })
  })

  describe('Clear filters functionality', () => {
    it('should show "Clear all filters" button when filters are active', () => {
      render(<Barriers />)

      // Initially should not show clear all filters
      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument()

      // Activate a category filter
      const financialButton = screen.getByText('Financial').closest('button')
      fireEvent.click(financialButton!)

      // Should now show clear all filters
      expect(screen.getByText('Clear all filters')).toBeInTheDocument()
    })

    it('should show "Clear all filters" button when search is active', () => {
      render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(screen.getByText('Clear all filters')).toBeInTheDocument()
    })

    it('should have proper aria-label on "Clear all filters" button', () => {
      render(<Barriers />)

      // Activate filters
      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const clearButton = screen.getByText('Clear all filters').closest('button')
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all search and category filters')
    })

    it('should clear both search and category filters when clicked', () => {
      render(<Barriers />)

      // Set both filters
      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'cost' } })

      const financialButton = screen.getByText('Financial').closest('button')
      fireEvent.click(financialButton!)

      // Click clear all filters
      const clearButton = screen.getByText('Clear all filters').closest('button')
      fireEvent.click(clearButton!)

      // Both filters should be cleared
      expect(searchInput).toHaveValue('')
      expect(financialButton).not.toHaveClass('bg-[#2E6F8E]')
    })
  })

  describe('No results state', () => {
    it('should show no results message when filters return no matches', () => {
      render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })

      expect(screen.getByText('No barriers found')).toBeInTheDocument()
      expect(
        screen.getByText("Try adjusting your search or filter to find what you're looking for.")
      ).toBeInTheDocument()
    })

    it('should show clear filters button in no results state', () => {
      render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })

      const clearButton = screen.getByText('Clear filters').closest('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('should have proper aria-label on clear filters button in no results state', () => {
      render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })

      const clearButton = screen.getByText('Clear filters').closest('button')
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all search and category filters')
    })

    it('should clear filters and show results when clear button is clicked in no results state', () => {
      render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })

      expect(screen.getByText('No barriers found')).toBeInTheDocument()

      const clearButton = screen.getByText('Clear filters').closest('button')
      fireEvent.click(clearButton!)

      // Should show results again
      expect(screen.queryByText('No barriers found')).not.toBeInTheDocument()
      expect(screen.getByText(barriers[0].name)).toBeInTheDocument()
    })
  })

  describe('Barrier display', () => {
    it('should display barrier categories with correct styling', () => {
      render(<Barriers />)

      // Check that category badges are displayed
      const categoryBadges = screen.getAllByText(
        /financial|technical|organizational|psychological/i
      )
      expect(categoryBadges.length).toBeGreaterThan(0)
    })

    it('should display barrier examples when available', () => {
      render(<Barriers />)

      // Find a barrier with examples
      const barrierWithExamples = barriers.find((b) => b.examples && b.examples.length > 0)
      if (barrierWithExamples && barrierWithExamples.examples) {
        expect(screen.getAllByText('Common Examples:').length).toBeGreaterThan(0)
      }
    })
  })

  describe('Call to Action', () => {
    it('should render Take the TABS Survey CTA', () => {
      render(<Barriers />)

      const ctaLink = screen.getByRole('link', { name: /Take the TABS Survey/i })
      expect(ctaLink).toBeInTheDocument()
      expect(ctaLink).toHaveAttribute(
        'href',
        'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'
      )
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Barriers />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have accessibility violations with active filters', async () => {
      const { container } = render(<Barriers />)

      // Activate filters
      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'cost' } })

      const financialButton = screen.getByText('Financial').closest('button')
      fireEvent.click(financialButton!)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have accessibility violations in no results state', async () => {
      const { container } = render(<Barriers />)

      const searchInput = screen.getByPlaceholderText('Search barriers...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
