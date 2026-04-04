import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock next/navigation
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

import ClientRedirect from '@/components/client-redirect'

describe('ClientRedirect', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('calls router.replace with the target path on mount', () => {
    render(<ClientRedirect to="/results/data-quality" />)
    expect(mockReplace).toHaveBeenCalledWith('/results/data-quality')
    expect(mockReplace).toHaveBeenCalledTimes(1)
  })

  it('renders a visible link to the new location', () => {
    render(<ClientRedirect to="/results/dashboard" />)
    const link = screen.getByRole('link', { name: /\/results\/dashboard/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/results/dashboard')
  })

  it('renders "has moved to" text for stub detection', () => {
    render(<ClientRedirect to="/results/cmo-survey" />)
    expect(screen.getByText(/has moved to/)).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ClientRedirect to="/results/reproducibility" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
