import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import MindMapViewer from '@/components/literature-review-mind-map/mind-map-viewer'

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

describe('MindMapViewer', () => {
  it('renders the mind map image with descriptive alt text', () => {
    render(<MindMapViewer />)
    const img = screen.getByRole('img', {
      name: /tabs literature review mind map/i,
    })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('mind-map.svg'))
  })

  it('exposes zoom controls as a labelled toolbar', () => {
    render(<MindMapViewer />)
    expect(screen.getByRole('toolbar', { name: /zoom controls/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MindMapViewer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
