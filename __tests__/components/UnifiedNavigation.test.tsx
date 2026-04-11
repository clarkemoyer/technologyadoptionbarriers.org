import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import UnifiedNavigation from '../../src/components/unified-navigation'

expect.extend(toHaveNoViolations)

// jsdom does not provide ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// jsdom does not provide IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/results'),
}))

describe('UnifiedNavigation', () => {
  beforeEach(() => {
    const header = document.createElement('div')
    header.id = 'header'
    header.style.height = '80px'
    document.body.appendChild(header)

    const article = document.createElement('article')
    const h2 = document.createElement('h2')
    h2.textContent = 'Test Section'
    article.appendChild(h2)
    document.body.appendChild(article)
  })

  afterEach(() => {
    document.getElementById('header')?.remove()
    document.querySelector('article')?.remove()
  })

  it('renders nothing when no series items and no headings detected yet', () => {
    // Remove the article so no headings are detected
    document.querySelector('article')?.remove()
    const { container } = render(<UnifiedNavigation />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('renders series items when provided', () => {
    render(
      <UnifiedNavigation
        seriesItems={[
          { title: 'Overview', href: '/results', isCurrent: true },
          { title: 'Sample', href: '/results/sample' },
        ]}
      />
    )
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Sample')).toBeInTheDocument()
  })

  it('renders custom series label', () => {
    render(
      <UnifiedNavigation
        seriesItems={[{ title: 'Page 1', href: '/page-1' }]}
        seriesLabel="Results series"
      />
    )
    expect(screen.getByText('Results series')).toBeInTheDocument()
  })

  it('has a navigation landmark', () => {
    render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)
    expect(screen.getByRole('navigation', { name: /page navigation/i })).toBeInTheDocument()
  })

  it('renders mobile FAB button', () => {
    render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)
    expect(screen.getByRole('button', { name: /navigation/i })).toBeInTheDocument()
  })

  it('passes accessibility checks with series items', async () => {
    const { container } = render(
      <UnifiedNavigation
        seriesItems={[
          { title: 'Overview', href: '/results', isCurrent: true },
          { title: 'Sample', href: '/results/sample' },
        ]}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
