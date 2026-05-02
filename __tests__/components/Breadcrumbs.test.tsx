import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Breadcrumbs from '../../src/components/breadcrumbs'

expect.extend(toHaveNoViolations)

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockedUsePathname = jest.requireMock('next/navigation').usePathname as jest.Mock

describe('Breadcrumbs', () => {
  it('renders nothing on shallow pages', () => {
    mockedUsePathname.mockReturnValue('/faq')
    const { container } = render(<Breadcrumbs />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('renders breadcrumbs for deep pages with display-name mapping', () => {
    mockedUsePathname.mockReturnValue('/results/crp-2026/sample')
    render(<Breadcrumbs />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('CRP 2026')).toBeInTheDocument()
    expect(screen.getByText('Sample & Demographics')).toBeInTheDocument()
  })

  it('maps known acronyms correctly', () => {
    mockedUsePathname.mockReturnValue('/making-of-tabs/integrations')
    render(<Breadcrumbs />)
    expect(screen.getByText('Making of TABS')).toBeInTheDocument()
  })

  it('maps 50-reviewer-process to The 50-Reviewer Process', () => {
    mockedUsePathname.mockReturnValue('/making-of-tabs/ai-assisted-development/50-reviewer-process')
    render(<Breadcrumbs />)
    expect(screen.getByText('The 50-Reviewer Process')).toBeInTheDocument()
  })

  it('maps open-source to Open Source & Community', () => {
    mockedUsePathname.mockReturnValue('/making-of-tabs/open-source/research-value')
    render(<Breadcrumbs />)
    expect(screen.getByText('Open Source & Community')).toBeInTheDocument()
  })

  it('last item has aria-current="page"', () => {
    mockedUsePathname.mockReturnValue('/results/sensitivity')
    render(<Breadcrumbs />)
    const lastItem = screen.getByText('Sensitivity Analysis').closest('li')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
  })

  it('renders custom items when provided', () => {
    mockedUsePathname.mockReturnValue('/results/sensitivity')
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Results', href: '/results' },
          { label: 'Sensitivity Analysis' },
        ]}
      />
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('Sensitivity Analysis')).toBeInTheDocument()
  })

  it('passes accessibility checks', async () => {
    mockedUsePathname.mockReturnValue('/results/crp-2026/sample')
    const { container } = render(<Breadcrumbs />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
