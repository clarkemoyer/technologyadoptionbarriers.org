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

  it('exposes zoom controls as a labelled toolbar', () => {
    render(<MindMapViewer {...defaultProps} />)
    expect(screen.getByRole('toolbar', { name: /zoom controls/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MindMapViewer {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
