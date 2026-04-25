import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import LiveResults from '../../../src/components/tabs-page/live-results'
import dispositionData from '../../../src/data/disposition-summary.json'
import sensitivityData from '../../../src/data/sensitivity-analysis.json'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('LiveResults component', () => {
  it('should render the live results section', () => {
    render(<LiveResults />)
    expect(screen.getByText('Live Results: Top Barriers')).toBeInTheDocument()
  })

  it('should display the survey-completion count from the same source as the homepage Statistics callout', () => {
    render(<LiveResults />)
    const totalN = dispositionData.completionProgress.approved
    const formattedTotalN = totalN.toLocaleString()
    expect(screen.getByText(new RegExp(formattedTotalN))).toBeInTheDocument()
  })

  it('should display exactly 3 barriers', () => {
    render(<LiveResults />)
    // Each barrier has a rank badge numbered 1, 2, 3 (anchored to avoid matching counts like 101)
    expect(screen.getByText(/^1$/)).toBeInTheDocument()
    expect(screen.getByText(/^2$/)).toBeInTheDocument()
    expect(screen.getByText(/^3$/)).toBeInTheDocument()
  })

  it('should display barriers sorted by count (descending)', () => {
    render(<LiveResults />)

    // Get top 3 barriers sorted by count (using pre-sorted list to avoid mutation)
    const top3 = sensitivityData.top3_pick_counts.items_sorted_desc.slice(0, 3)

    // Check that each barrier text is displayed
    top3.forEach((barrier) => {
      expect(screen.getByText(barrier.text)).toBeInTheDocument()
    })
  })

  it('should display count and percentage for each barrier', () => {
    render(<LiveResults />)

    // Get top 3 barriers (using pre-sorted list to avoid mutation)
    const top3 = sensitivityData.top3_pick_counts.items_sorted_desc.slice(0, 3)

    top3.forEach((barrier) => {
      // Count should be displayed
      expect(screen.getByText(barrier.count.toString())).toBeInTheDocument()

      // Percentage should be displayed (with 1 decimal place, or em dash if null)
      const pctText = typeof barrier.pct === 'number' ? `${barrier.pct.toFixed(1)}%` : '—'
      expect(screen.getByText(pctText)).toBeInTheDocument()
    })
  })

  it('should render link to results page', () => {
    render(<LiveResults />)

    const ctaLink = screen.getByRole('link', { name: /View All Results & Analysis/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/results')
  })

  it('should display explanatory text about the results', () => {
    render(<LiveResults />)

    // "Surveys Completed" counter is a separate status line, not part of the top-3 intro
    expect(screen.getByText(/surveys completed/i)).toBeInTheDocument()
    // Top-3 intro is a standalone sentence with no N reference (avoids implying the
    // card percentages use the same denominator as the completion counter)
    expect(
      screen.getByText(/here are the most commonly identified technology adoption barriers/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Explore detailed analysis, cross-tabulations, and statistical findings/i)
    ).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LiveResults />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      render(<LiveResults />)

      const heading = screen.getByRole('heading', { name: /Live Results: Top Barriers/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('should have descriptive link text', () => {
      render(<LiveResults />)

      const ctaLink = screen.getByRole('link', { name: /View All Results & Analysis/i })
      expect(ctaLink).toHaveAccessibleName()
    })
  })

  describe('Visual styling', () => {
    it('should render with gray background', () => {
      const { container } = render(<LiveResults />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('bg-gray-50')
    })

    it('should render barrier cards with white background', () => {
      const { container } = render(<LiveResults />)
      const cards = container.querySelectorAll('.bg-white')
      // Should have at least 3 cards (one for each barrier)
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })

    it('should render rank badges with blue background', () => {
      const { container } = render(<LiveResults />)
      const badges = container.querySelectorAll('.bg-tabs-blue')
      // Should have 3 rank badges
      expect(badges.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Responsive grid layout', () => {
    it('should use responsive grid classes', () => {
      const { container } = render(<LiveResults />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-3')
    })
  })
})
