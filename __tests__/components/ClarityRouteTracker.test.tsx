import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import ClarityRouteTracker from '@/components/clarity-route-tracker'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('ClarityRouteTracker', () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Mock window.clarity
    ;(window as Window & { clarity?: (command: string, ...args: string[]) => void }).clarity =
      jest.fn()
  })

  afterEach(() => {
    // Clean up window.clarity after each test
    delete (window as Window & { clarity?: (command: string, ...args: string[]) => void }).clarity
  })

  it('should render without crashing', () => {
    mockUsePathname.mockReturnValue('/')
    const { container } = render(<ClarityRouteTracker />)
    expect(container.firstChild).toBeNull() // Component returns null
  })

  it('should call clarity with the current pathname', () => {
    const pathname = '/test-page'
    mockUsePathname.mockReturnValue(pathname)

    render(<ClarityRouteTracker />)

    expect(window.clarity).toHaveBeenCalledWith('set', 'page', pathname)
  })

  it('should include basePath in the clarity call when NEXT_PUBLIC_BASE_PATH is set', () => {
    const basePath = '/my-base'
    const pathname = '/test-page'
    const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH

    // Set the environment variable
    process.env.NEXT_PUBLIC_BASE_PATH = basePath
    mockUsePathname.mockReturnValue(pathname)

    render(<ClarityRouteTracker />)

    expect(window.clarity).toHaveBeenCalledWith('set', 'page', basePath + pathname)

    // Restore original value
    process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath
  })

  it('should call clarity with root path when pathname is /', () => {
    // Ensure basePath is not set
    delete process.env.NEXT_PUBLIC_BASE_PATH
    mockUsePathname.mockReturnValue('/')

    render(<ClarityRouteTracker />)

    expect(window.clarity).toHaveBeenCalledWith('set', 'page', '/')
  })

  it('should not throw if clarity is not loaded', () => {
    delete (window as Window & { clarity?: (command: string, ...args: string[]) => void }).clarity
    mockUsePathname.mockReturnValue('/test')

    expect(() => {
      render(<ClarityRouteTracker />)
    }).not.toThrow()
  })

  it('should update clarity when pathname changes', () => {
    // Ensure basePath is not set
    delete process.env.NEXT_PUBLIC_BASE_PATH
    const { rerender } = render(<ClarityRouteTracker />)

    // First render with /page1
    mockUsePathname.mockReturnValue('/page1')
    rerender(<ClarityRouteTracker />)
    expect(window.clarity).toHaveBeenCalledWith('set', 'page', '/page1')

    // Second render with /page2
    mockUsePathname.mockReturnValue('/page2')
    rerender(<ClarityRouteTracker />)
    expect(window.clarity).toHaveBeenCalledWith('set', 'page', '/page2')

    expect(window.clarity).toHaveBeenCalledTimes(3) // Initial + 2 updates
  })
})
