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
  let originalClientWidth: number

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

    // jsdom's clientWidth defaults to 0; set a realistic viewport so the
    // desktop sidebar variant renders (rightSpace = 1024 - 0 = 1024 >= 250).
    originalClientWidth = document.documentElement.clientWidth
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1024,
      configurable: true,
    })
  })

  afterEach(() => {
    document.getElementById('header')?.remove()
    document.querySelector('article')?.remove()
    document.getElementById('site-footer')?.remove()
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: originalClientWidth,
      configurable: true,
    })
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

  it('renders mobile FAB button when right-side space is too small for desktop sidebar', () => {
    const originalInnerWidth = window.innerWidth
    const originalClientWidth = document.documentElement.clientWidth
    Object.defineProperty(window, 'innerWidth', { value: 200, configurable: true })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 200,
      configurable: true,
    })

    const article = document.querySelector('article')
    expect(article).not.toBeNull()

    if (!article) {
      throw new Error('Expected article element to exist for layout test')
    }

    article.getBoundingClientRect = jest.fn(() => ({
      x: 0,
      y: 0,
      width: 190,
      height: 100,
      top: 0,
      right: 190,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    }))

    try {
      render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)
      expect(screen.getByRole('button', { name: /navigation/i })).toBeInTheDocument()
      expect(screen.queryByRole('navigation', { name: /page navigation/i })).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
      Object.defineProperty(document.documentElement, 'clientWidth', {
        value: originalClientWidth,
        configurable: true,
      })
    }
  })

  it('renders desktop navigation when right-side space is large enough for the sidebar', () => {
    const originalInnerWidth = window.innerWidth
    const originalClientWidth = document.documentElement.clientWidth
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1200,
      configurable: true,
    })

    const article = document.querySelector('article')
    expect(article).not.toBeNull()

    if (!article) {
      throw new Error('Expected article element to exist for layout test')
    }

    // rightSpace = 1200 - 900 = 300 >= SIDEBAR_MIN_SPACE (250)
    article.getBoundingClientRect = jest.fn(() => ({
      x: 0,
      y: 0,
      width: 900,
      height: 100,
      top: 0,
      right: 900,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    }))

    try {
      render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)
      expect(screen.getByRole('navigation', { name: /page navigation/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /navigation/i })).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
      Object.defineProperty(document.documentElement, 'clientWidth', {
        value: originalClientWidth,
        configurable: true,
      })
    }
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

describe('UnifiedNavigation — footer-aware bottom offset', () => {
  let originalClientWidth: number

  beforeEach(() => {
    const header = document.createElement('div')
    header.id = 'header'
    document.body.appendChild(header)

    // Article is required so the desktop sidebar can determine its position
    const article = document.createElement('article')
    document.body.appendChild(article)

    // jsdom's clientWidth defaults to 0; set a realistic viewport so the
    // desktop sidebar variant renders (rightSpace = 1024 - 0 = 1024 >= 250).
    originalClientWidth = document.documentElement.clientWidth
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1024,
      configurable: true,
    })

    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    document.getElementById('header')?.remove()
    document.querySelector('article')?.remove()
    document.getElementById('site-footer')?.remove()
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: originalClientWidth,
      configurable: true,
    })
    jest.restoreAllMocks()
  })

  function stubFooterRect(rect: Partial<DOMRect>) {
    const footer = document.createElement('footer')
    footer.id = 'site-footer'
    document.body.appendChild(footer)
    jest.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    })
    return footer
  }

  it('applies MIN_BOTTOM_GAP (20px) as bottom style when footer is fully off-screen', () => {
    // footer top is below viewport - not visible
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    stubFooterRect({ top: 900, height: 200 })

    render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)

    const nav = document.querySelector('nav') as HTMLElement
    // When footer is off-screen, bottom should be MIN_BOTTOM_GAP = 20px
    expect(nav?.style.bottom).toBe('20px')
  })

  it('increases bottom style when footer partially scrolls into view', () => {
    // footer top = 700, height = 200, innerHeight = 800 → 100px visible
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    stubFooterRect({ top: 700, height: 200 })

    render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)

    const nav = document.querySelector('nav') as HTMLElement
    // footerVisiblePx = min(800-700, min(200,800)) = min(100,200) = 100
    // footerOffset = 100 + 20 = 120px
    expect(nav?.style.bottom).toBe('120px')
  })

  it('clamps footerOffset to rect.height + MIN_BOTTOM_GAP when scrolled past footer top', () => {
    // rect.top is negative - user scrolled well past the start of the footer
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    stubFooterRect({ top: -50, height: 200 })

    render(<UnifiedNavigation seriesItems={[{ title: 'Page 1', href: '/page-1' }]} />)

    const nav = document.querySelector('nav') as HTMLElement
    // rawVisibleFooterPx = 800 - (-50) = 850, but clamped to min(200,800) = 200
    // footerOffset = 200 + 20 = 220px  (not 870px)
    expect(nav?.style.bottom).toBe('220px')
  })
})
