import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SidebarProvider, useSidebar } from '../../src/components/sidebar/sidebar-context'

function TestConsumer() {
  const { isMobileOpen, openMobile, closeMobile } = useSidebar()
  return (
    <div>
      <span data-testid="state">{String(isMobileOpen)}</span>
      <button onClick={openMobile}>open</button>
      <button onClick={closeMobile}>close</button>
    </div>
  )
}

describe('SidebarContext', () => {
  it('should throw when useSidebar is called outside SidebarProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<TestConsumer />)).toThrow(
        'useSidebar must be used within a SidebarProvider'
      )
    } finally {
      spy.mockRestore()
    }
  })

  it('should default isMobileOpen to false', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    )
    expect(screen.getByTestId('state')).toHaveTextContent('false')
  })

  it('should set isMobileOpen to true when openMobile is called', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    )
    act(() => {
      screen.getByRole('button', { name: 'open' }).click()
    })
    expect(screen.getByTestId('state')).toHaveTextContent('true')
  })

  it('should set isMobileOpen to false when closeMobile is called', () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    )
    act(() => {
      screen.getByRole('button', { name: 'open' }).click()
    })
    expect(screen.getByTestId('state')).toHaveTextContent('true')

    act(() => {
      screen.getByRole('button', { name: 'close' }).click()
    })
    expect(screen.getByTestId('state')).toHaveTextContent('false')
  })
})
