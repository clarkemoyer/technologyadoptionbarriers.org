import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import MindMapViewer, {
  computeFitTransform,
  MIN_SCALE,
  MAX_SCALE,
  WHEEL_STEP,
} from '@/components/mind-maps/mind-map-viewer'

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

  it('exposes zoom controls as a labelled toolbar', () => {
    render(<MindMapViewer {...defaultProps} />)
    expect(screen.getByRole('toolbar', { name: /mind map controls/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('renders the fullscreen button with aria-pressed="false" by default', () => {
    render(<MindMapViewer {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /enter fullscreen/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates the fullscreen button label and aria-pressed on fullscreenchange', () => {
    const { container } = render(<MindMapViewer {...defaultProps} />)
    const section = container.querySelector('section')!

    const hadOwnFullscreenElement = Object.prototype.hasOwnProperty.call(
      document,
      'fullscreenElement'
    )
    const originalFullscreenElementDescriptor = Object.getOwnPropertyDescriptor(
      document,
      'fullscreenElement'
    )

    try {
      // Simulate entering fullscreen: make document.fullscreenElement return the section
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => section,
      })
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'))
      })

      expect(screen.getByRole('button', { name: /exit fullscreen/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )

      // Simulate exiting fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => null,
      })
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'))
      })

      expect(screen.getByRole('button', { name: /enter fullscreen/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    } finally {
      if (hadOwnFullscreenElement && originalFullscreenElementDescriptor) {
        Object.defineProperty(document, 'fullscreenElement', originalFullscreenElementDescriptor)
      } else {
        delete (document as Document & { fullscreenElement?: Element | null }).fullscreenElement
      }
    }
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MindMapViewer {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('WHEEL_STEP is small enough that a single mouse-wheel notch does not max out zoom', () => {
    // react-zoom-pan-pinch v4 computes scale_delta = deltaY * WHEEL_STEP.
    // A typical mouse-wheel notch produces |deltaY| ~100; the resulting scale
    // delta must stay well below 1.0 to avoid leaping to MIN_SCALE/MAX_SCALE.
    expect(WHEEL_STEP).toBe(0.0003)
    expect(Math.abs(100 * WHEEL_STEP)).toBeLessThan(0.1)
  })

  describe('computeFitTransform – scale clamping', () => {
    it('clamps to MIN_SCALE when the SVG is much larger than the wrapper', () => {
      // Raw fit scale: min(800/50000, 600/30000) * 0.95 ≈ 0.0152, below MIN_SCALE
      const wrapperW = 800
      const wrapperH = 600
      const svgW = 50_000
      const svgH = 30_000
      const { scale, x, y } = computeFitTransform(wrapperW, wrapperH, svgW, svgH)

      expect(scale).toBe(MIN_SCALE)
      // x/y must be computed from the CLAMPED scale, not the unclamped fit scale
      expect(x).toBeCloseTo((wrapperW - svgW * MIN_SCALE) / 2)
      expect(y).toBeCloseTo((wrapperH - svgH * MIN_SCALE) / 2)
    })

    it('clamps to MAX_SCALE when the SVG is much smaller than the wrapper', () => {
      // Raw fit scale: min(800/10, 600/8) * 0.95 = 71.25, above MAX_SCALE
      const wrapperW = 800
      const wrapperH = 600
      const svgW = 10
      const svgH = 8
      const { scale, x, y } = computeFitTransform(wrapperW, wrapperH, svgW, svgH)

      expect(scale).toBe(MAX_SCALE)
      expect(x).toBeCloseTo((wrapperW - svgW * MAX_SCALE) / 2)
      expect(y).toBeCloseTo((wrapperH - svgH * MAX_SCALE) / 2)
    })

    it('uses the unclamped fit scale when it is within [MIN_SCALE, MAX_SCALE]', () => {
      // Fit scale for 800×600 wrapper and 1200×900 SVG:
      // min(800/1200, 600/900) * 0.95 ≈ 0.633 — well within range
      const wrapperW = 800
      const wrapperH = 600
      const svgW = 1200
      const svgH = 900
      const { scale } = computeFitTransform(wrapperW, wrapperH, svgW, svgH)

      expect(scale).toBeGreaterThan(MIN_SCALE)
      expect(scale).toBeLessThan(MAX_SCALE)
      // Should equal min(800/1200, 600/900) * 0.95
      expect(scale).toBeCloseTo(Math.min(wrapperW / svgW, wrapperH / svgH) * 0.95)
    })
  })
})
