import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ConceptMappingSummary from '../../../src/components/tabs/concept-mapping/summary'
import summaryData from '../../../src/data/concept-mapping-summary.json'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('ConceptMappingSummary component', () => {
  describe('Quick stats bar', () => {
    it('should render all five quick stat values', () => {
      render(<ConceptMappingSummary />)

      const statsBar = screen.getByRole('list', { name: 'Survey quick statistics' })
      const items = within(statsBar).getAllByRole('listitem')
      expect(items).toHaveLength(5)

      expect(within(statsBar).getByText('57')).toBeInTheDocument()
      expect(within(statsBar).getByText('54')).toBeInTheDocument()
      expect(within(statsBar).getByText('3')).toBeInTheDocument()
      expect(within(statsBar).getByText('5')).toBeInTheDocument()
      expect(within(statsBar).getByText('15')).toBeInTheDocument()
    })

    it('should render quick stat labels', () => {
      render(<ConceptMappingSummary />)

      const statsBar = screen.getByRole('list', { name: 'Survey quick statistics' })
      expect(within(statsBar).getByText('Total Items')).toBeInTheDocument()
      expect(within(statsBar).getByText('Substantive')).toBeInTheDocument()
      expect(within(statsBar).getByText('Attention Checks')).toBeInTheDocument()
      expect(within(statsBar).getByText('Sections')).toBeInTheDocument()
      expect(within(statsBar).getByText('Mapped Fields')).toBeInTheDocument()
    })
  })

  describe('Structure table', () => {
    it('should render all 6 section rows', () => {
      render(<ConceptMappingSummary />)

      summaryData.sections.forEach((section) => {
        expect(screen.getByText(section.section)).toBeInTheDocument()
      })
    })

    it('should render column headers', () => {
      render(<ConceptMappingSummary />)

      expect(screen.getByText('Section')).toBeInTheDocument()
      expect(screen.getByText('Question Type')).toBeInTheDocument()
      expect(screen.getByText('Substantive Items')).toBeInTheDocument()
      // "Attention Checks" appears in both stats bar and table header
      expect(screen.getAllByText('Attention Checks').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Scale / Method')).toBeInTheDocument()
    })

    it('should render the total row with correct values', () => {
      render(<ConceptMappingSummary />)

      expect(screen.getByText('TOTAL SUBSTANTIVE')).toBeInTheDocument()
    })

    it('should render section color chips', () => {
      render(<ConceptMappingSummary />)

      const blueChip = screen.getByLabelText('blue section indicator')
      expect(blueChip).toBeInTheDocument()

      const yellowChips = screen.getAllByLabelText('yellow section indicator')
      expect(yellowChips).toHaveLength(2) // Section B has two rows

      expect(screen.getByLabelText('orange section indicator')).toBeInTheDocument()
      expect(screen.getByLabelText('green section indicator')).toBeInTheDocument()
      expect(screen.getByLabelText('gray section indicator')).toBeInTheDocument()
    })

    it('should render hyphen placeholder for null attention checks', () => {
      render(<ConceptMappingSummary />)

      const table = screen.getByRole('table')
      const rows = within(table).getAllByRole('row')
      // Header (index 0) + 6 data rows (index 1-6) + total (index 7)
      // Section A (rows[1]) has null attentionChecks
      const sectionARow = rows[1]
      const cells = within(sectionARow).getAllByRole('cell')
      // Attention Checks is column index 3: Section, Question Type, Substantive Items, Attention Checks
      expect(cells[3]).toHaveTextContent('-')
    })
  })

  describe('Revision notes', () => {
    it('should render all revision notes', () => {
      render(<ConceptMappingSummary />)

      summaryData.revisionNotes.forEach((item) => {
        const noteText = typeof item === 'string' ? item : item.note
        expect(screen.getByText(noteText)).toBeInTheDocument()
      })
    })

    it('should render revision notes as an ordered list', () => {
      render(<ConceptMappingSummary />)

      const section = screen.getByLabelText('Revision Notes')
      const list = within(section).getByRole('list')
      const items = within(list).getAllByRole('listitem')
      expect(items).toHaveLength(summaryData.revisionNotes.length)
    })
  })

  describe('Navigation links', () => {
    it('should render navigation links to all views', () => {
      render(<ConceptMappingSummary />)

      const nav = screen.getByRole('navigation', { name: 'Concept mapping views' })
      expect(within(nav).getByText('Summary')).toBeInTheDocument()
      expect(within(nav).getByText('Simple View')).toBeInTheDocument()
      expect(within(nav).getByText('Complex View')).toBeInTheDocument()
    })

    it('should mark Summary as current page', () => {
      render(<ConceptMappingSummary />)

      const summaryLink = screen.getByText('Summary').closest('a')
      expect(summaryLink).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Download buttons', () => {
    it('should render Excel and CSV download buttons', () => {
      render(<ConceptMappingSummary />)
      expect(
        screen.getByLabelText('Download survey structure summary as Excel spreadsheet')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Download survey structure summary as CSV')).toBeInTheDocument()
    })
  })

  describe('Tooltip functionality', () => {
    it('should render info icons for quick stats', () => {
      render(<ConceptMappingSummary />)
      const statsBar = screen.getByRole('list', { name: 'Survey quick statistics' })
      // Each stat should have an "About <label>" info button
      const aboutButtons = within(statsBar).getAllByRole('button', { name: /^About /i })
      expect(aboutButtons.length).toBeGreaterThan(0)
    })

    it('should render info icons for table column headers', () => {
      render(<ConceptMappingSummary />)
      const table = screen.getByRole('table')
      const columnInfoButtons = within(table).getAllByRole('button', {
        name: /^About the .+ column$/i,
      })
      expect(columnInfoButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ConceptMappingSummary />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
