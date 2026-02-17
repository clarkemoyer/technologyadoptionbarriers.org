import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import FaqPageClient from '../../../src/app/faq/faq-client'
import { faqCategories, allFaqItems } from '../../../src/data/faq-page'

expect.extend(toHaveNoViolations)

describe('FAQ Page', () => {
  it('should render the page heading', () => {
    render(<FaqPageClient />)
    expect(
      screen.getByRole('heading', { level: 1, name: /frequently asked questions/i })
    ).toBeInTheDocument()
  })

  it('should render all category headings', () => {
    render(<FaqPageClient />)
    faqCategories.forEach((cat) => {
      expect(
        screen.getByRole('heading', { level: 2, name: new RegExp(cat.title) })
      ).toBeInTheDocument()
    })
  })

  it('should render all FAQ questions', () => {
    render(<FaqPageClient />)
    faqCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(screen.getByText(item.question)).toBeInTheDocument()
      })
    })
  })

  it('should display the correct total question count', () => {
    render(<FaqPageClient />)
    const showing = screen.getByText(/Showing/)
    expect(showing.textContent).toContain(String(allFaqItems.length))
  })

  it('should have at least 40 FAQ items', () => {
    expect(allFaqItems.length).toBeGreaterThanOrEqual(40)
  })

  describe('Accordion behavior', () => {
    it('should start with all answers collapsed', () => {
      render(<FaqPageClient />)
      const buttons = screen.getAllByRole('button', { expanded: false })
      const faqButtons = buttons.filter((btn) =>
        btn.getAttribute('aria-controls')?.includes('-panel')
      )
      expect(faqButtons.length).toBe(allFaqItems.length)
    })

    it('should expand an answer when its question is clicked', () => {
      render(<FaqPageClient />)
      const firstQuestion = faqCategories[0].items[0].question
      const button = screen.getByText(firstQuestion).closest('button')!
      expect(button).toHaveAttribute('aria-expanded', 'false')
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should collapse an answer when clicked again', () => {
      render(<FaqPageClient />)
      const firstQuestion = faqCategories[0].items[0].question
      const button = screen.getByText(firstQuestion).closest('button')!
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should allow multiple items to be open simultaneously', () => {
      render(<FaqPageClient />)
      const q1 = faqCategories[0].items[0].question
      const q2 = faqCategories[0].items[1].question
      const btn1 = screen.getByText(q1).closest('button')!
      const btn2 = screen.getByText(q2).closest('button')!
      fireEvent.click(btn1)
      fireEvent.click(btn2)
      expect(btn1).toHaveAttribute('aria-expanded', 'true')
      expect(btn2).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'search')
    })

    it('should filter questions by search text', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      fireEvent.change(searchInput, { target: { value: 'Prolific' } })
      // Should show fewer items than the full list
      const showing = screen.getByText(/Showing/)
      expect(showing).toBeInTheDocument()
      expect(showing.textContent).not.toContain(String(allFaqItems.length))
    })

    it('should be case-insensitive when searching', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      fireEvent.change(searchInput, { target: { value: 'QUALTRICS' } })
      const showing = screen.getByText(/Showing/)
      expect(showing.textContent).not.toContain('0 questions')
    })

    it('should display no results message for non-matching search', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })
      expect(screen.getByText(/no matching questions found/i)).toBeInTheDocument()
    })

    it('should provide a clear filters button in no-results state', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } })
      const clearBtn = screen.getByText(/clear all filters/i)
      expect(clearBtn).toBeInTheDocument()
      fireEvent.click(clearBtn)
      expect(searchInput).toHaveValue('')
    })

    it('should match answers in addition to questions', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      // Search for a word that appears only in an answer
      fireEvent.change(searchInput, { target: { value: 'Qualtrics' } })
      const showing = screen.getByText(/Showing/)
      expect(showing.textContent).not.toContain('0 questions')
    })
  })

  describe('Category filtering', () => {
    it('should render All Questions button', () => {
      render(<FaqPageClient />)
      expect(screen.getByText('All Questions')).toBeInTheDocument()
    })

    it('should render all category filter buttons', () => {
      render(<FaqPageClient />)
      const nav = screen.getByRole('navigation', { name: /faq categories/i })
      faqCategories.forEach((cat) => {
        expect(within(nav).getByText(cat.title)).toBeInTheDocument()
      })
    })

    it('should filter to a single category when clicked', () => {
      render(<FaqPageClient />)
      const nav = screen.getByRole('navigation', { name: /faq categories/i })
      const targetCat = faqCategories[0]
      const catBtn = within(nav).getByText(targetCat.title).closest('button')!
      fireEvent.click(catBtn)
      const showing = screen.getByText(/Showing/)
      expect(showing.textContent).toContain(String(targetCat.items.length))
    })

    it('should toggle category when clicked twice', () => {
      render(<FaqPageClient />)
      const nav = screen.getByRole('navigation', { name: /faq categories/i })
      const targetCat = faqCategories[0]
      const catBtn = within(nav).getByText(targetCat.title).closest('button')!
      fireEvent.click(catBtn)
      fireEvent.click(catBtn)
      // Back to showing all
      const showing = screen.getByText(/Showing/)
      expect(showing.textContent).toContain(String(allFaqItems.length))
    })

    it('should have aria-pressed on category buttons', () => {
      render(<FaqPageClient />)
      const nav = screen.getByRole('navigation', { name: /faq categories/i })
      const targetCat = faqCategories[0]
      const catBtn = within(nav).getByText(targetCat.title).closest('button')!
      expect(catBtn).toHaveAttribute('aria-pressed', 'false')
      fireEvent.click(catBtn)
      expect(catBtn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Expand / Collapse all', () => {
    it('should expand all visible items', () => {
      render(<FaqPageClient />)
      const expandBtn = screen.getByRole('button', { name: /expand all/i })
      fireEvent.click(expandBtn)
      const expandedBtns = screen.getAllByRole('button', { expanded: true })
      const faqBtns = expandedBtns.filter((btn) =>
        btn.getAttribute('aria-controls')?.includes('-panel')
      )
      expect(faqBtns.length).toBe(allFaqItems.length)
    })

    it('should collapse all items', () => {
      render(<FaqPageClient />)
      // First expand all
      fireEvent.click(screen.getByRole('button', { name: /expand all/i }))
      // Then collapse all
      fireEvent.click(screen.getByRole('button', { name: /collapse all/i }))
      const collapsedBtns = screen.getAllByRole('button', { expanded: false })
      const faqBtns = collapsedBtns.filter((btn) =>
        btn.getAttribute('aria-controls')?.includes('-panel')
      )
      expect(faqBtns.length).toBe(allFaqItems.length)
    })
  })

  describe('Bottom CTA', () => {
    it('should render contact section', () => {
      render(<FaqPageClient />)
      expect(screen.getByRole('heading', { name: /still have questions/i })).toBeInTheDocument()
    })

    it('should link to the contact email', () => {
      render(<FaqPageClient />)
      const link = screen.getByRole('link', { name: /contact us/i })
      expect(link).toHaveAttribute('href', 'mailto:contact@technologyadoptionbarriers.org')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FaqPageClient />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper aria-controls linking buttons to panels', () => {
      render(<FaqPageClient />)
      const firstQ = faqCategories[0].items[0].question
      const button = screen.getByText(firstQ).closest('button')!
      const panelId = button.getAttribute('aria-controls')!
      expect(panelId).toBeTruthy()
      expect(document.getElementById(panelId)).toBeTruthy()
    })

    it('should have role=region on answer panels', () => {
      render(<FaqPageClient />)
      const firstQ = faqCategories[0].items[0].question
      const button = screen.getByText(firstQ).closest('button')!
      const panelId = button.getAttribute('aria-controls')!
      const panel = document.getElementById(panelId)
      expect(panel).toHaveAttribute('role', 'region')
    })

    it('should have a labeled search input', () => {
      render(<FaqPageClient />)
      const searchInput = screen.getByPlaceholderText('Search questions...')
      const labelledBy = searchInput.getAttribute('id')
      // Look for a label pointing to this input
      const label = document.querySelector(`label[for="${labelledBy}"]`)
      expect(label).toBeTruthy()
    })

    it('should have live region for result count', () => {
      render(<FaqPageClient />)
      const showing = screen.getByText(/Showing/)
      expect(showing).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Data integrity', () => {
    it('should have unique IDs across all FAQ items', () => {
      const ids = allFaqItems.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have unique category IDs', () => {
      const ids = faqCategories.map((cat) => cat.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have all items with non-empty question and answer', () => {
      allFaqItems.forEach((item) => {
        expect(item.question.trim().length).toBeGreaterThan(0)
        expect(item.answer.trim().length).toBeGreaterThan(0)
      })
    })

    it('should have 8 categories', () => {
      expect(faqCategories.length).toBe(8)
    })
  })
})
