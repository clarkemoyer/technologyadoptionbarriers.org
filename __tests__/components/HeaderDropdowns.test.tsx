import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Header from '../../src/components/header'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    nav: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <nav {...props}>{children}</nav>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// --- Helpers ---

/** Known sub-item labels for the Results dropdown */
const RESULTS_SUB_ITEMS = [
  'Overview',
  'Sample & Demographics',
  'Data Quality Pipeline',
  'Descriptive Statistics',
  'Scale Reliability',
  'Sensitivity Analysis',
  'Key Findings',
  'Survey Statistics',
  'Prolific Dashboard',
  'CMO Survey Comparison',
  'Open Data & Reproducibility',
]

/** Known sub-item labels for the Making of TABS dropdown */
const MAKING_OF_TABS_SUB_ITEMS = [
  'Overview',
  'TABS Presentation',
  'Technical Integrations',
  'AI-Assisted Development',
  'AI Validity Checks',
  'Development Workflow',
  'Accessibility',
  'Open Source & Community',
  'Content Architecture',
  'SEO Benchmarking',
]

/**
 * Get a desktop dropdown trigger button by its label.
 * Desktop buttons have aria-expanded and are not inside a mobile-only container.
 */
function getDesktopDropdownButton(name: RegExp): HTMLElement {
  const allButtons = screen.getAllByRole('button', { name })
  const desktopButton = allButtons.find(
    (btn) => btn.getAttribute('aria-expanded') !== null && !isMobileElement(btn)
  )
  if (!desktopButton) throw new Error(`Desktop button matching "${name}" not found`)
  return desktopButton
}

/**
 * Check if an element is inside the mobile menu (xl:hidden container).
 */
function isMobileElement(el: HTMLElement): boolean {
  let node: HTMLElement | null = el
  while (node) {
    if (node.classList?.contains('xl:hidden')) return true
    node = node.parentElement
  }
  return false
}

/**
 * Open the mobile menu by clicking the hamburger button.
 */
function openMobileMenu() {
  const menuButton = screen.getByRole('button', { name: /open menu/i })
  fireEvent.click(menuButton)
}

/**
 * Get a mobile dropdown button by label.
 */
function getMobileDropdownButton(label: RegExp): HTMLElement {
  const allButtons = screen.getAllByRole('button', { name: label })
  const mobileButton = allButtons.find(
    (btn) => btn.getAttribute('aria-expanded') !== null && isMobileElement(btn)
  )
  if (!mobileButton) throw new Error(`Mobile button matching "${label}" not found`)
  return mobileButton
}

// --- Desktop Dropdown Tests ---

describe('Header desktop dropdown independence', () => {
  it('Results dropdown renders sub-items when clicked', () => {
    render(<Header />)

    const resultsButton = getDesktopDropdownButton(/results/i)
    fireEvent.click(resultsButton)

    for (const label of RESULTS_SUB_ITEMS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('Making of TABS dropdown renders sub-items when clicked', () => {
    render(<Header />)

    const makingButton = getDesktopDropdownButton(/the making of tabs/i)
    fireEvent.click(makingButton)

    for (const label of MAKING_OF_TABS_SUB_ITEMS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('opening Results does NOT show Making of TABS sub-items', () => {
    render(<Header />)

    const resultsButton = getDesktopDropdownButton(/results/i)
    fireEvent.click(resultsButton)

    // Skip "Overview" because it appears in both dropdowns
    const uniqueMakingItems = MAKING_OF_TABS_SUB_ITEMS.filter((l) => l !== 'Overview')
    for (const label of uniqueMakingItems) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument()
    }
  })

  it('opening Making of TABS does NOT show Results sub-items', () => {
    render(<Header />)

    const makingButton = getDesktopDropdownButton(/the making of tabs/i)
    fireEvent.click(makingButton)

    // Skip "Overview" because it appears in both dropdowns
    const uniqueResultsItems = RESULTS_SUB_ITEMS.filter((l) => l !== 'Overview')
    for (const label of uniqueResultsItems) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument()
    }
  })

  it('aria-expanded is correct for each trigger button', () => {
    render(<Header />)

    const resultsButton = getDesktopDropdownButton(/results/i)
    const makingButton = getDesktopDropdownButton(/the making of tabs/i)

    // Both start collapsed
    expect(resultsButton).toHaveAttribute('aria-expanded', 'false')
    expect(makingButton).toHaveAttribute('aria-expanded', 'false')

    // Open Results
    fireEvent.click(resultsButton)
    expect(resultsButton).toHaveAttribute('aria-expanded', 'true')
    expect(makingButton).toHaveAttribute('aria-expanded', 'false')

    // Open Making of TABS (Results should close via toggleDropdown logic)
    fireEvent.click(makingButton)
    expect(resultsButton).toHaveAttribute('aria-expanded', 'false')
    expect(makingButton).toHaveAttribute('aria-expanded', 'true')
  })
})

// --- Mobile Dropdown Tests ---

describe('Header mobile dropdown independence', () => {
  it('mobile Results dropdown opens independently', () => {
    render(<Header />)
    openMobileMenu()

    const resultsButton = getMobileDropdownButton(/results/i)
    fireEvent.click(resultsButton)

    expect(resultsButton).toHaveAttribute('aria-expanded', 'true')
    for (const label of RESULTS_SUB_ITEMS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('mobile Making of TABS dropdown opens independently', () => {
    render(<Header />)
    openMobileMenu()

    const makingButton = getMobileDropdownButton(/the making of tabs/i)
    fireEvent.click(makingButton)

    expect(makingButton).toHaveAttribute('aria-expanded', 'true')
    for (const label of MAKING_OF_TABS_SUB_ITEMS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('opening one mobile dropdown closes the other', () => {
    render(<Header />)
    openMobileMenu()

    const resultsButton = getMobileDropdownButton(/results/i)
    const makingButton = getMobileDropdownButton(/the making of tabs/i)

    // Open Results
    fireEvent.click(resultsButton)
    expect(resultsButton).toHaveAttribute('aria-expanded', 'true')
    expect(makingButton).toHaveAttribute('aria-expanded', 'false')

    // Open Making of TABS — Results should close
    fireEvent.click(makingButton)
    expect(makingButton).toHaveAttribute('aria-expanded', 'true')
    expect(resultsButton).toHaveAttribute('aria-expanded', 'false')
  })
})

// --- Accessibility Tests ---

describe('Header dropdown accessibility', () => {
  it('no accessibility violations with Results dropdown open', async () => {
    const { container } = render(<Header />)

    const resultsButton = getDesktopDropdownButton(/results/i)
    fireEvent.click(resultsButton)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no accessibility violations with Making of TABS dropdown open', async () => {
    const { container } = render(<Header />)

    const makingButton = getDesktopDropdownButton(/the making of tabs/i)
    fireEvent.click(makingButton)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
