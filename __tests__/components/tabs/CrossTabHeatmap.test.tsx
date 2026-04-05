import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import CrossTabHeatmap from '@/components/tabs/cross-tab-heatmap'

expect.extend(toHaveNoViolations)

const BY_ROLE = [
  {
    group: 'Technical (CIO/CTO)',
    n: 15,
    barrier_mean: 2.72,
    readiness_mean: 3.33,
    maturity_mean: 3.11,
  },
  { group: 'Non-Technical', n: 50, barrier_mean: 2.87, readiness_mean: 3.01, maturity_mean: 2.99 },
  { group: 'Other', n: 13, barrier_mean: 2.71, readiness_mean: 2.92, maturity_mean: 3.11 },
]

const BY_ORG_SIZE = [
  { group: 'Small (<500)', n: 36, barrier_mean: 2.78, readiness_mean: 3.07, maturity_mean: 2.96 },
  {
    group: 'Medium (500-4999)',
    n: 25,
    barrier_mean: 2.68,
    readiness_mean: 3.06,
    maturity_mean: 2.95,
  },
  { group: 'Large (5000+)', n: 17, barrier_mean: 3.09, readiness_mean: 3.02, maturity_mean: 3.3 },
]

describe('CrossTabHeatmap', () => {
  it('renders the empty/placeholder state when no data is provided', () => {
    render(<CrossTabHeatmap byRole={[]} byOrgSize={[]} />)
    expect(
      screen.getByText(/Cross-tabulation data will be populated by the next pipeline run/i)
    ).toBeInTheDocument()
  })

  it('renders heatmap rows for byRole data', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={[]} />)
    expect(screen.getAllByText('Technical (CIO/CTO)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Non-Technical').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0)
  })

  it('renders heatmap rows for byOrgSize data', () => {
    render(<CrossTabHeatmap byRole={[]} byOrgSize={BY_ORG_SIZE} />)
    expect(screen.getAllByText(/Small/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Medium/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Large/i).length).toBeGreaterThan(0)
  })

  it('shows toggle buttons when both byRole and byOrgSize have data', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={BY_ORG_SIZE} />)
    expect(screen.getByRole('button', { name: /by role/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /by org size/i })).toBeInTheDocument()
  })

  it('does not show toggle buttons when only one dataset has data', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={[]} />)
    expect(screen.queryByRole('button', { name: /by role/i })).not.toBeInTheDocument()
  })

  it('switches to org-size view when toggle button is clicked', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={BY_ORG_SIZE} />)

    // Initially shows role data
    expect(screen.getAllByText('Technical (CIO/CTO)').length).toBeGreaterThan(0)

    // Click the org-size toggle
    fireEvent.click(screen.getByRole('button', { name: /by org size/i }))

    // Now shows org-size data
    expect(screen.getAllByText(/Small/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Large/i).length).toBeGreaterThan(0)
  })

  it('marks the active toggle button with aria-pressed="true"', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={BY_ORG_SIZE} />)

    const byRoleBtn = screen.getByRole('button', { name: /by role/i })
    const byOrgBtn = screen.getByRole('button', { name: /by org size/i })

    expect(byRoleBtn).toHaveAttribute('aria-pressed', 'true')
    expect(byOrgBtn).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(byOrgBtn)

    expect(byRoleBtn).toHaveAttribute('aria-pressed', 'false')
    expect(byOrgBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders numeric values for each construct column', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={[]} />)
    // barrier_mean values should appear as formatted strings
    expect(screen.getAllByText('2.72').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2.87').length).toBeGreaterThan(0)
  })

  it('renders the colour legend for each construct', () => {
    render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={[]} />)
    expect(screen.getAllByText('Barriers').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Readiness').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Maturity').length).toBeGreaterThan(0)
  })

  it('meets accessibility standards with data', async () => {
    const { container } = render(<CrossTabHeatmap byRole={BY_ROLE} byOrgSize={BY_ORG_SIZE} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('meets accessibility standards when empty', async () => {
    const { container } = render(<CrossTabHeatmap byRole={[]} byOrgSize={[]} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
