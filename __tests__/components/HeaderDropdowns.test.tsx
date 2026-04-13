import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Sidebar from '../../src/components/sidebar'
import { SidebarProvider } from '../../src/components/sidebar/sidebar-context'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock next/navigation used by Sidebar
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

function renderSidebar() {
  return render(
    <SidebarProvider>
      <Sidebar />
    </SidebarProvider>
  )
}

describe('Sidebar navigation', () => {
  it('renders all top-level section items', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main site navigation' })
    expect(within(nav).getByText('Home')).toBeInTheDocument()
    expect(within(nav).getByText('Survey')).toBeInTheDocument()
    expect(within(nav).getByText('Results')).toBeInTheDocument()
    expect(within(nav).getByText('Models')).toBeInTheDocument()
    expect(within(nav).getByText('Teaching')).toBeInTheDocument()
    expect(within(nav).getByText('Making of TABS')).toBeInTheDocument()
    expect(within(nav).getByText('About')).toBeInTheDocument()
  })

  it('clicking a top-level item shows its accordion groups', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main site navigation' })
    // Click Results top-level button
    fireEvent.click(within(nav).getByText('Results'))
    // The CRP 2026 Dataset group title should appear in the accordion zone
    expect(screen.getByRole('button', { name: /CRP 2026 Dataset/i })).toBeInTheDocument()
  })

  it('switches dynamic zone when different top-level item is clicked', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main site navigation' })

    // Click Results
    fireEvent.click(within(nav).getByText('Results'))
    expect(screen.getByRole('button', { name: /CRP 2026 Dataset/i })).toBeInTheDocument()

    // Click About
    fireEvent.click(within(nav).getByText('About'))
    expect(screen.getByRole('button', { name: /About TABS/i })).toBeInTheDocument()
  })

  it('accordion groups toggle - only one open at a time', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main site navigation' })

    // Activate Results section
    fireEvent.click(within(nav).getByText('Results'))

    // First group auto-opens (CRP 2026 Dataset)
    const crpButton = screen.getByRole('button', { name: /CRP 2026 Dataset/i })
    expect(crpButton).toHaveAttribute('aria-expanded', 'true')

    // Click Live Results group - CRP should close
    const liveButton = screen.getByRole('button', { name: /Live Results/i })
    fireEvent.click(liveButton)
    expect(liveButton).toHaveAttribute('aria-expanded', 'true')
    expect(crpButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('has accessible navigation landmark', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation', { name: 'Main site navigation' })
    expect(nav).toBeInTheDocument()
  })

  it('should not have accessibility violations', async () => {
    const { container } = renderSidebar()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
