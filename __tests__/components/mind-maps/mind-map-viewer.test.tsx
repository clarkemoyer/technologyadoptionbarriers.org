import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import MindMapViewer from '@/components/mind-maps/mind-map-viewer'

expect.extend(toHaveNoViolations)

// react-zoom-pan-pinch uses ResizeObserver, which JSDOM doesn't provide.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

type GlobalWithResizeObserver = {
  ResizeObserver?: typeof ResizeObserverMock
}

const globalWithResizeObserver = global as typeof global & GlobalWithResizeObserver
const originalResizeObserver = globalWithResizeObserver.ResizeObserver

beforeAll(() => {
  globalWithResizeObserver.ResizeObserver = ResizeObserverMock
})

afterAll(() => {
  if (originalResizeObserver) {
    globalWithResizeObserver.ResizeObserver = originalResizeObserver
  } else {
    delete globalWithResizeObserver.ResizeObserver
  }
})

const defaultProps = {
  src: '/Svgs/mind-maps/full-mind-map.svg',
  alt: 'TABS full mind map covering frameworks, models, standards, and the CRP workflow.',
}

describe('MindMapViewer', () => {
  it('renders the mind map image with the provided alt text and src', () => {
    render(<MindMapViewer {...defaultProps} />)
    const img = screen.getByRole('img', { name: /tabs full mind map/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('full-mind-map.svg'))
  })

  it('exposes controls as a labelled toolbar', () => {
    render(<MindMapViewer {...defaultProps} />)
    expect(screen.getByRole('toolbar', { name: /mind map controls/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('renders the zoom slider with an accessible label', () => {
    render(<MindMapViewer {...defaultProps} />)
    const slider = screen.getByRole('slider', { name: /zoom level/i })
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('type', 'range')
  })

  it('renders the fullscreen button with aria-pressed="false" initially', () => {
    render(<MindMapViewer {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /enter fullscreen/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('keyboard shortcuts do not preventDefault when an interactive control has focus', () => {
    render(<MindMapViewer {...defaultProps} />)
    const slider = screen.getByRole('slider', { name: /zoom level/i })
    // Use a real KeyboardEvent and check defaultPrevented, because fireEvent
    // init-object overrides of `preventDefault` are not reliable.
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })
    slider.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('keyboard shortcuts preventDefault when the viewer itself has focus', () => {
    const { container } = render(<MindMapViewer {...defaultProps} />)
    const viewer = container.querySelector('section')
    expect(viewer).not.toBeNull()

    // Use a real KeyboardEvent and check defaultPrevented, because fireEvent
    // init-object overrides of `preventDefault` are not reliable.
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })

    viewer?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('renders correctly with the initialFocus prop', () => {
    const initialFocus = { x: 2900, y: 4500, w: 3700, h: 2200 }
    render(<MindMapViewer {...defaultProps} initialFocus={initialFocus} />)
    // Component must render its image and controls without crashing
    expect(screen.getByRole('img', { name: /tabs full mind map/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('toolbar', { name: /mind map controls/i })).toBeInTheDocument()
  })

  it('does not crash when initialFocus has zero or negative dimensions', () => {
    // focusRegion validates inputs; these edge cases must be silently ignored
    const { unmount: u1 } = render(
      <MindMapViewer {...defaultProps} initialFocus={{ x: 0, y: 0, w: 0, h: 0 }} />
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
    u1()

    const { unmount: u2 } = render(
      <MindMapViewer {...defaultProps} initialFocus={{ x: 100, y: 100, w: -50, h: -20 }} />
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
    u2()
  })

  it('has no accessibility violations when rendered with initialFocus', async () => {
    const initialFocus = { x: 5300, y: 700, w: 3700, h: 1100 }
    const { container } = render(<MindMapViewer {...defaultProps} initialFocus={initialFocus} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MindMapViewer {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
