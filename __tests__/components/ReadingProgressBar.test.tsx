import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ReadingProgressBar from '../../src/components/reading-progress-bar'

expect.extend(toHaveNoViolations)

// jsdom does not provide ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

describe('ReadingProgressBar', () => {
  beforeEach(() => {
    // Create a mock header element for ResizeObserver
    const header = document.createElement('div')
    header.id = 'header'
    header.style.height = '80px'
    document.body.appendChild(header)
  })

  afterEach(() => {
    const header = document.getElementById('header')
    if (header) header.remove()
  })

  it('renders a progress bar container', () => {
    const { container } = render(<ReadingProgressBar />)
    const bar = container.querySelector('[aria-hidden="true"]')
    expect(bar).toBeInTheDocument()
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<ReadingProgressBar />)
    const bar = container.querySelector('[aria-hidden="true"]')
    expect(bar).toHaveAttribute('aria-hidden', 'true')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(<ReadingProgressBar />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
