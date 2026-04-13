import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import AnimatedNumber from '@/components/ui/animated-number'

expect.extend(toHaveNoViolations)

// Mock framer-motion completely
jest.mock('framer-motion', () => {
  const MockSpan = React.forwardRef(
    (
      { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
      ref: React.Ref<HTMLSpanElement>
    ) => (
      <span ref={ref} {...props}>
        {children}
      </span>
    )
  )
  MockSpan.displayName = 'MockMotionSpan'

  return {
    motion: { span: MockSpan },
    useMotionValue: () => ({ set: jest.fn() }),
    useTransform: () => ({ get: () => 0 }),
    useSpring: () => ({ get: () => 0, on: jest.fn(() => jest.fn()) }),
    useInView: () => true,
    useReducedMotion: () => false,
  }
})

describe('AnimatedNumber', () => {
  it('renders a span element', () => {
    const { container } = render(<AnimatedNumber value={42} />)
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<AnimatedNumber value={100} className="text-blue-500" />)
    const span = container.querySelector('span')
    expect(span).toHaveClass('text-blue-500')
  })

  it('applies custom id', () => {
    const { container } = render(<AnimatedNumber value={50} id="counter" />)
    const span = container.querySelector('span')
    expect(span).toHaveAttribute('id', 'counter')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AnimatedNumber value={123} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
