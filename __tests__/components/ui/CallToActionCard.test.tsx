import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import IconTextCard from '../../../src/components/ui/call-to-action-card'

expect.extend(toHaveNoViolations)

// Mock IntersectionObserver
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
const mockUnobserve = jest.fn()

beforeEach(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve,
  }))
  mockObserve.mockClear()
  mockDisconnect.mockClear()
})

describe('IconTextCard (call-to-action-card)', () => {
  const icon = <svg data-testid="test-icon" aria-hidden="true" />

  it('renders the text prop', () => {
    render(<IconTextCard icon={icon} text="Get Involved" />)
    expect(screen.getByText('Get Involved')).toBeInTheDocument()
  })

  it('renders the icon', () => {
    render(<IconTextCard icon={icon} text="Icon Test" />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('links to the provided href', () => {
    render(<IconTextCard icon={icon} text="Donate" href="https://example.com/donate" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/donate')
  })

  it('links to "#" when no href is provided', () => {
    render(<IconTextCard icon={icon} text="Donate" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#')
  })

  it('uses the provided iconLabel for the icon container', () => {
    render(<IconTextCard icon={icon} text="Donate" iconLabel="donate icon" />)
    expect(screen.getByLabelText('donate icon')).toBeInTheDocument()
  })

  it('defaults iconLabel to "icon" when not provided', () => {
    render(<IconTextCard icon={icon} text="Donate" />)
    expect(screen.getByLabelText('icon')).toBeInTheDocument()
  })

  it('sets up IntersectionObserver on mount', () => {
    render(<IconTextCard icon={icon} text="Test" />)
    expect(window.IntersectionObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<IconTextCard icon={icon} text="Accessible Card" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
