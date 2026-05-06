import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ResultCard from '../../../src/components/ui/result-card'

expect.extend(toHaveNoViolations)

// Mock AnimatedNumber to avoid framer-motion complexities
jest.mock('@/components/ui/animated-number', () => {
  const MockAnimatedNumber = ({ value }: { value: number }) => <span>{value}</span>
  MockAnimatedNumber.displayName = 'MockAnimatedNumber'
  return MockAnimatedNumber
})

describe('ResultCard', () => {
  it('renders the description', () => {
    render(<ResultCard title="42" description="Survey respondents" />)
    expect(screen.getByText('Survey respondents')).toBeInTheDocument()
  })

  it('renders AnimatedNumber when title is a pure integer string', () => {
    render(<ResultCard title="42" description="Respondents" />)
    // The mock renders the numeric value directly
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders the raw title string when it is not a pure integer', () => {
    render(<ResultCard title="N/A" description="No data" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders the raw title string when it contains non-numeric characters', () => {
    render(<ResultCard title="50%" description="Completion rate" />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ResultCard title="100" description="Total responses" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
