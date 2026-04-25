import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ConceptMappingSimple from '../../../src/components/tabs/concept-mapping/simple'
import conceptMappingData from '../../../src/data/concept-mapping-simple.json'

expect.extend(toHaveNoViolations)

describe('ConceptMappingSimple component', () => {
  it('should render the concept mapping table section', () => {
    render(<ConceptMappingSimple />)
    expect(screen.getByLabelText('Concept Mapping Table')).toBeInTheDocument()
  })

  it('should render all 7 column headers', () => {
    render(<ConceptMappingSimple />)
    conceptMappingData.headers.forEach((header) => {
      expect(screen.getByText(header, { selector: 'th' })).toBeInTheDocument()
    })
  })

  it('should render all 57 rows by default', () => {
    render(<ConceptMappingSimple />)
    expect(screen.getByText('57 of 57 items')).toBeInTheDocument()
  })

  it('should render the Download CSV button', () => {
    render(<ConceptMappingSimple />)
    expect(screen.getByLabelText('Download concept mapping data as CSV')).toBeInTheDocument()
  })

  it('should render the Download Excel button', () => {
    render(<ConceptMappingSimple />)
    expect(
      screen.getByLabelText('Download concept mapping data as Excel spreadsheet')
    ).toBeInTheDocument()
  })

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('aria-label', 'Search concept mapping table')
    })

    it('should filter rows when searching', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'cybersecurity' } })
      // Should show fewer than 57 items
      expect(screen.queryByText('57 of 57 items')).not.toBeInTheDocument()
    })

    it('should be case-insensitive when searching', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'DEMOGRAPHICS' } })
      // Should find Section A demographics rows
      expect(screen.queryByText('57 of 57 items')).not.toBeInTheDocument()
      expect(screen.queryByText('0 of 57 items')).not.toBeInTheDocument()
    })

    it('should show clear button when search query exists', () => {
      render(<ConceptMappingSimple />)
      expect(screen.queryByLabelText('Clear search query')).not.toBeInTheDocument()
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      expect(screen.getByLabelText('Clear search query')).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      fireEvent.click(screen.getByLabelText('Clear search query'))
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Section filtering', () => {
    it('should render all 5 section filter buttons', () => {
      render(<ConceptMappingSimple />)
      expect(
        screen.getByText('Section A: Demographics', { selector: 'button' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Section B: Perceived Technology Adoption Barriers', {
          selector: 'button',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Section C: Perceived Organizational Technology Readiness', {
          selector: 'button',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Section D: Perceived Maturity of Organizational Capabilities', {
          selector: 'button',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Section E: Final Thoughts & Feedback', { selector: 'button' })
      ).toBeInTheDocument()
    })

    it('should filter to section A when clicked', () => {
      render(<ConceptMappingSimple />)
      const sectionBtn = screen.getByText('Section A: Demographics', { selector: 'button' })
      fireEvent.click(sectionBtn)
      expect(screen.getByText('9 of 57 items')).toBeInTheDocument()
    })

    it('should toggle section filter off when clicked again', () => {
      render(<ConceptMappingSimple />)
      const sectionBtn = screen.getByText('Section A: Demographics', { selector: 'button' })
      fireEvent.click(sectionBtn)
      expect(screen.getByText('9 of 57 items')).toBeInTheDocument()
      fireEvent.click(sectionBtn)
      expect(screen.getByText('57 of 57 items')).toBeInTheDocument()
    })

    it('should have proper aria-label on section buttons', () => {
      render(<ConceptMappingSimple />)
      const sectionBtn = screen.getByText('Section A: Demographics', { selector: 'button' })
      expect(sectionBtn).toHaveAttribute('aria-label', 'Filter by Section A: Demographics')
      fireEvent.click(sectionBtn)
      expect(sectionBtn).toHaveAttribute(
        'aria-label',
        expect.stringContaining('currently selected')
      )
    })
  })

  describe('Clear filters', () => {
    it('should show "Clear all filters" when filters are active', () => {
      render(<ConceptMappingSimple />)
      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument()
      const sectionBtn = screen.getByText('Section A: Demographics', { selector: 'button' })
      fireEvent.click(sectionBtn)
      expect(screen.getByText('Clear all filters')).toBeInTheDocument()
    })

    it('should clear all filters when clicked', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      const clearBtn = screen.getByText('Clear all filters')
      fireEvent.click(clearBtn)
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('57 of 57 items')).toBeInTheDocument()
    })
  })

  describe('No results state', () => {
    it('should show no results message', () => {
      render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent999' } })
      expect(screen.getByText(/No items match your search/)).toBeInTheDocument()
      expect(screen.getByText('0 of 57 items')).toBeInTheDocument()
    })
  })

  describe('Tooltip functionality', () => {
    it('should render tooltip triggers (Info icon) for barrier rows', () => {
      render(<ConceptMappingSimple />)
      // The Info icon button has aria-label="View examples for [Barrier Name]"
      const tooltipTriggers = screen.getAllByRole('button', { name: /^View examples for/i })
      expect(tooltipTriggers.length).toBeGreaterThan(0)
    })

    it('should render tooltip triggers for readiness rows (Section C)', () => {
      render(<ConceptMappingSimple />)
      // Filter to Section C so only readiness rows are shown
      const sectionBtn = screen.getByText(
        'Section C: Perceived Organizational Technology Readiness',
        { selector: 'button' }
      )
      fireEvent.click(sectionBtn)
      const readinessTriggers = screen.getAllByRole('button', { name: /^View examples for/i })
      expect(readinessTriggers.length).toBeGreaterThan(0)
    })

    it('should render tooltip triggers for maturity rows (Section D)', () => {
      render(<ConceptMappingSimple />)
      // Filter to Section D so only maturity rows are shown
      const sectionBtn = screen.getByText(
        'Section D: Perceived Maturity of Organizational Capabilities',
        { selector: 'button' }
      )
      fireEvent.click(sectionBtn)
      const maturityTriggers = screen.getAllByRole('button', { name: /^View examples for/i })
      expect(maturityTriggers.length).toBeGreaterThan(0)
    })

    it('should render info icons for section filter chips', () => {
      render(<ConceptMappingSimple />)
      // Each section chip has a sibling info button "About <section label>"
      const aboutButtons = screen.getAllByRole('button', { name: /^About Section/i })
      expect(aboutButtons.length).toBeGreaterThan(0)
    })

    it('should render info icons for column headers', () => {
      render(<ConceptMappingSimple />)
      // Column header tooltips have aria-label "About the <header> column"
      const columnInfoButtons = screen.getAllByRole('button', { name: /^About the .+ column$/i })
      expect(columnInfoButtons.length).toBeGreaterThan(0)
    })

    it('should show tooltip content when focused', async () => {
      render(<ConceptMappingSimple />)
      const tooltipTriggers = screen.getAllByRole('button', { name: /^View examples for/i })
      const firstTrigger = tooltipTriggers[0]

      // Before interaction, content might not be visible, but component is rendered
      fireEvent.focus(firstTrigger)

      // The tooltip panel has role="tooltip" (using await for async mount/portal)
      const tooltips = await screen.findAllByRole('tooltip')
      expect(tooltips.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ConceptMappingSimple />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should not have accessibility violations with active filters', async () => {
      const { container } = render(<ConceptMappingSimple />)
      const searchInput = screen.getByPlaceholderText('Search all columns…')
      fireEvent.change(searchInput, { target: { value: 'demographics' } })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
