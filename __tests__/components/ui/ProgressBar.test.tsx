import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ProgressBar from '../../../src/components/ui/progress-bar'

expect.extend(toHaveNoViolations)

describe('ProgressBar', () => {
  describe('with fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('renders the title', () => {
      render(<ProgressBar title="Adoption Rate" percentage={75} />)
      expect(screen.getByText('Adoption Rate')).toBeInTheDocument()
    })

    it('shows 0% before the timer fires', () => {
      const { container } = render(<ProgressBar title="Loading" percentage={60} />)
      const fill = container.querySelector('[style]')
      expect(fill?.getAttribute('style')).toContain('width: 0%')
    })

    it('shows the target percentage after the timer fires', () => {
      const { container } = render(<ProgressBar title="Loading" percentage={80} />)
      act(() => {
        jest.runAllTimers()
      })
      const fill = container.querySelector('[style]')
      expect(fill?.getAttribute('style')).toContain('width: 80%')
    })

    it('displays the percentage label after animation', () => {
      render(<ProgressBar title="Completion" percentage={55} />)
      act(() => {
        jest.runAllTimers()
      })
      expect(screen.getByText('55%')).toBeInTheDocument()
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ProgressBar title="Accessible Bar" percentage={50} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
