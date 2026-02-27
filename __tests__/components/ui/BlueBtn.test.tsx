import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import BlueBtn from '../../../src/components/ui/blue-btn'

expect.extend(toHaveNoViolations)

describe('BlueBtn', () => {
  it('renders with default "Learn More" text', () => {
    render(<BlueBtn />)
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument()
  })

  it('renders with custom children text', () => {
    render(<BlueBtn>Get Started</BlueBtn>)
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('opens link in new tab when href is provided and clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<BlueBtn href="https://example.com">Click Me</BlueBtn>)
    fireEvent.click(screen.getByRole('button'))
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank')
    openSpy.mockRestore()
  })

  it('does not open window when no href', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<BlueBtn>Click Me</BlueBtn>)
    fireEvent.click(screen.getByRole('button'))
    expect(openSpy).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BlueBtn />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
