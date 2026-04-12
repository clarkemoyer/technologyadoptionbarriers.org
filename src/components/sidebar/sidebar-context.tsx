'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface SidebarContextValue {
  isMobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isMobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const openMobile = useCallback(() => setIsMobileOpen(true), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isMobileOpen, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
