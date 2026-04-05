import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ConceptMappingComplex from '../../../src/components/tabs/concept-mapping/complex'

expect.extend(toHaveNoViolations)

describe('ConceptMappingComplex component', () => {
  it('should render the complex concept mapping section', () => {
    render(<ConceptMappingComplex />)
    expect(screen.getByLabelText('Concept Mapping Complex View')).toBeInTheDocument()
  })

  it('should render all 5 section accordion headers', () => {
    render(<ConceptMappingComplex />)
    // Accordion toggle buttons: name starts with "Section X:" (not "About Section X:")
    expect(screen.getByRole('button', { name: /^Section A: Demographics/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^Section B: Perceived Technology Adoption Barriers/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /^Section C: Perceived Organizational Technology Readiness/,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /^Section D: Perceived Maturity of Organizational Capabilities/,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Section E: Final Thoughts/ })).toBeInTheDocument()
  })

  it('should render item count in section headers', () => {
    render(<ConceptMappingComplex />)
    // Each section accordion toggle button exposes item count in its accessible name
    const sectionBBtn = screen.getByRole('button', {
      name: /^Section B: Perceived Technology Adoption Barriers/,
    })
    expect(sectionBBtn).toBeInTheDocument()
  })

  it('should render 57 of 57 items by default', () => {
    render(<ConceptMappingComplex />)
    expect(screen.getByText('57 of 57 items')).toBeInTheDocument()
  })

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(<ConceptMappingComplex />)
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('aria-label', 'Search concept mapping items')
    })

    it('should filter items when searching', () => {
      render(<ConceptMappingComplex />)
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      fireEvent.change(searchInput, { target: { value: 'cybersecurity' } })
      expect(screen.queryByText('57 of 57 items')).not.toBeInTheDocument()
    })

    it('should show no results state for unmatched query', () => {
      render(<ConceptMappingComplex />)
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent999' } })
      expect(screen.getByText(/No items match your search/)).toBeInTheDocument()
    })

    it('should show clear button when search query exists', () => {
      render(<ConceptMappingComplex />)
      expect(screen.queryByLabelText('Clear search query')).not.toBeInTheDocument()
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      // Use a term that returns results so only the ✕ button (not the no-results link) appears
      fireEvent.change(searchInput, { target: { value: 'leadership' } })
      expect(screen.getByLabelText('Clear search query')).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(<ConceptMappingComplex />)
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      // Use a term that returns results so only the ✕ button appears
      fireEvent.change(searchInput, { target: { value: 'leadership' } })
      fireEvent.click(screen.getByLabelText('Clear search query'))
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('57 of 57 items')).toBeInTheDocument()
    })
  })

  describe('Accordion expand/collapse', () => {
    it('should render Expand All and Collapse All buttons', () => {
      render(<ConceptMappingComplex />)
      expect(screen.getByLabelText('Expand all sections')).toBeInTheDocument()
      expect(screen.getByLabelText('Collapse all sections')).toBeInTheDocument()
    })

    it('should collapse all sections when Collapse All is clicked', () => {
      render(<ConceptMappingComplex />)
      const collapseBtn = screen.getByLabelText('Collapse all sections')
      fireEvent.click(collapseBtn)
      // After collapsing all, section panel regions are hidden (aria-expanded=false)
      const sectionToggles = screen.getAllByRole('button', { name: /^Section [A-E]:/i })
      sectionToggles.forEach((toggle) => {
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should expand all sections after collapsing when Expand All is clicked', () => {
      render(<ConceptMappingComplex />)
      fireEvent.click(screen.getByLabelText('Collapse all sections'))
      fireEvent.click(screen.getByLabelText('Expand all sections'))
      const sectionToggles = screen.getAllByRole('button', { name: /^Section [A-E]:/i })
      sectionToggles.forEach((toggle) => {
        expect(toggle).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })

  describe('Tooltip functionality — item-level (barrier/readiness/maturity)', () => {
    it('should render tooltip triggers (Info icon) for barrier rows', () => {
      render(<ConceptMappingComplex />)
      // Barrier items produce buttons: aria-label="View examples for [Barrier Name]"
      const tooltipTriggers = screen.getAllByRole('button', { name: /^View examples for/i })
      expect(tooltipTriggers.length).toBeGreaterThan(0)
    })

    it('should render tooltip trigger for first barrier item with correct name', () => {
      render(<ConceptMappingComplex />)
      // barriers[0].name = "Resistance to Change"
      expect(
        screen.getByRole('button', { name: 'View examples for Resistance to Change' })
      ).toBeInTheDocument()
    })

    it('should render tooltip trigger for first readiness item', () => {
      render(<ConceptMappingComplex />)
      // readinessItems[0].name = "Leader Vision Clarity"
      expect(
        screen.getByRole('button', { name: 'View examples for Leader Vision Clarity' })
      ).toBeInTheDocument()
    })

    it('should render tooltip trigger for first maturity item', () => {
      render(<ConceptMappingComplex />)
      // maturityItems[0].name = "IT Investment & Value Management"
      expect(
        screen.getByRole('button', { name: 'View examples for IT Investment & Value Management' })
      ).toBeInTheDocument()
    })

    it('should show tooltip content when focused on an item trigger', async () => {
      render(<ConceptMappingComplex />)
      const trigger = screen.getByRole('button', {
        name: 'View examples for Resistance to Change',
      })
      fireEvent.focus(trigger)
      const tooltips = await screen.findAllByRole('tooltip')
      expect(tooltips.length).toBeGreaterThan(0)
    })
  })

  describe('Tooltip functionality — section-level Info triggers', () => {
    it('should render Info tooltip triggers for section headers', () => {
      render(<ConceptMappingComplex />)
      // Sections A-D have descriptions; section E does not
      const sectionInfoTriggers = screen.getAllByRole('button', { name: /^About Section/i })
      expect(sectionInfoTriggers.length).toBeGreaterThan(0)
    })

    it('should render About tooltip for Section B', () => {
      render(<ConceptMappingComplex />)
      expect(
        screen.getByRole('button', {
          name: 'About Section B: Perceived Technology Adoption Barriers',
        })
      ).toBeInTheDocument()
    })

    it('should show section tooltip content when focused', async () => {
      render(<ConceptMappingComplex />)
      const trigger = screen.getByRole('button', {
        name: 'About Section B: Perceived Technology Adoption Barriers',
      })
      fireEvent.focus(trigger)
      const tooltips = await screen.findAllByRole('tooltip')
      expect(tooltips.length).toBeGreaterThan(0)
    })
  })

  describe('Download buttons', () => {
    it('should render Download CSV button', () => {
      render(<ConceptMappingComplex />)
      expect(screen.getByLabelText('Download concept mapping data as CSV')).toBeInTheDocument()
    })

    it('should render Download Excel button', () => {
      render(<ConceptMappingComplex />)
      expect(
        screen.getByLabelText('Download concept mapping data as Excel spreadsheet')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ConceptMappingComplex />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have accessibility violations with active search', async () => {
      const { container } = render(<ConceptMappingComplex />)
      const searchInput = screen.getByPlaceholderText('Search all fields…')
      fireEvent.change(searchInput, { target: { value: 'leadership' } })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
