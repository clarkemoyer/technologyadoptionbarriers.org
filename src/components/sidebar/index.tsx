'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  sidebarSections,
  getActiveSectionId,
  type SidebarSection,
  type SidebarGroup,
} from '@/data/sidebar-navigation'
import { normalizePath } from '@/lib/normalizePath'
import { useSidebar } from './sidebar-context'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'tabs-sidebar-section'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SidebarGroupAccordion({
  group,
  isOpen,
  onToggle,
  currentPath,
}: {
  group: SidebarGroup
  isOpen: boolean
  onToggle: () => void
  currentPath: string
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
        aria-expanded={isOpen}
      >
        <span className="truncate">{group.title}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <ul className="ml-3 border-l border-slate-700 pl-3 py-1">
          {group.links.map((link) => {
            const isActive = normalizePath(link.href) === currentPath
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 font-medium text-blue-400'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function TopLevelItem({
  section,
  isActive,
  onClick,
}: {
  section: SidebarSection
  isActive: boolean
  onClick: () => void
}) {
  if (section.href) {
    return (
      <Link
        href={section.href}
        onClick={onClick}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className="text-base" aria-hidden="true">
          {section.icon}
        </span>
        <span>{section.label}</span>
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        isActive
          ? 'bg-slate-700 text-white'
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }`}
      aria-expanded={isActive}
    >
      <span className="text-base" aria-hidden="true">
        {section.icon}
      </span>
      <span>{section.label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Sidebar Component                                             */
/* ------------------------------------------------------------------ */

export default function Sidebar() {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname)
  const detectedSection = getActiveSectionId(currentPath)
  const { isMobileOpen, closeMobile } = useSidebar()

  const [activeSection, setActiveSection] = useState<string>(detectedSection)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Sync active section with current URL
  useEffect(() => {
    setActiveSection(detectedSection)
    try {
      sessionStorage.setItem(STORAGE_KEY, detectedSection)
    } catch {
      // sessionStorage unavailable
    }
  }, [detectedSection])

  // Auto-expand the group that contains the current page
  useEffect(() => {
    const section = sidebarSections.find((s) => s.id === detectedSection)
    if (!section) return
    for (const group of section.groups) {
      if (group.links.some((l) => normalizePath(l.href) === currentPath)) {
        setOpenGroup(group.title)
        return
      }
    }
    // If no match, open first group
    if (section.groups.length > 0) {
      setOpenGroup(section.groups[0].title)
    }
  }, [detectedSection, currentPath])

  // Toggle accordion group (max one open at a time)
  const toggleGroup = useCallback((title: string) => {
    setOpenGroup((prev) => (prev === title ? null : title))
  }, [])

  // Handle top-level item click
  const handleTopLevelClick = useCallback(
    (section: SidebarSection) => {
      setActiveSection(section.id)
      try {
        sessionStorage.setItem(STORAGE_KEY, section.id)
      } catch {
        // sessionStorage unavailable
      }
      // Open first group of the new section
      if (section.groups.length > 0) {
        setOpenGroup(section.groups[0].title)
      } else {
        setOpenGroup(null)
      }
      // Close mobile overlay on direct-link items
      if (section.href) {
        closeMobile()
      }
    },
    [closeMobile]
  )

  // Mobile: close on navigation link click (not accordion button clicks)
  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a')) {
        closeMobile()
      }
    },
    [closeMobile]
  )

  // Focus trap & Escape key for mobile overlay
  useEffect(() => {
    if (!isMobileOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile()
        return
      }

      if (e.key !== 'Tab') return

      const sidebar = sidebarRef.current
      if (!sidebar) return

      const focusable = sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus the close button when overlay opens
    closeButtonRef.current?.focus()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isMobileOpen, closeMobile])

  // Get the active section's groups
  const activeSectionData = sidebarSections.find((s) => s.id === activeSection)
  const groups = activeSectionData?.groups ?? []

  const sidebarContent = (
    <>
      {/* Fixed zone: top-level items */}
      <nav aria-label="Main site navigation">
        <ul className="space-y-0.5 px-2 pt-3 pb-2">
          {sidebarSections.map((section) => (
            <li key={section.id}>
              <TopLevelItem
                section={section}
                isActive={activeSection === section.id}
                onClick={() => handleTopLevelClick(section)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      {groups.length > 0 && <hr className="mx-3 border-slate-700" />}

      {/* Dynamic zone: accordion groups */}
      {groups.length > 0 && (
        <div
          className="flex-1 overflow-y-auto px-2 py-2"
          onClick={handleLinkClick}
          role="presentation"
        >
          {groups.map((group) => (
            <SidebarGroupAccordion
              key={group.title}
              group={group}
              isOpen={openGroup === group.title}
              onToggle={() => toggleGroup(group.title)}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar - always visible at lg+ */}
      <aside
        id="sidebar"
        className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 bg-slate-900 text-white h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto"
        aria-label="Site navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile} aria-hidden="true" />

          {/* Sidebar panel */}
          <aside
            ref={sidebarRef}
            className="absolute inset-y-0 left-0 flex w-full max-w-[320px] flex-col bg-slate-900 text-white shadow-2xl"
            aria-label="Site navigation"
          >
            {/* Close button */}
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <span className="text-sm font-semibold text-slate-200">Navigation</span>
              <button
                ref={closeButtonRef}
                onClick={closeMobile}
                className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </aside>
        </div>
      )}
    </>
  )
}
