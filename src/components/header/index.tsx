'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SearchInput from '@/components/search/search-input'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'
import { useSidebar } from '@/components/sidebar/sidebar-context'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const TAKE_TABS_URL = TABS_WEBSITE_QUALTRICS_SURVEY_URL

/**
 * Slim header bar - Logo + Search + CTA.
 *
 * All page-level navigation has moved to the persistent Sidebar component.
 * Mobile: hamburger in the header opens sidebar overlay.
 * Desktop: sidebar is always visible; no hamburger needed.
 */
const Header: React.FC = () => {
  const { openMobile } = useSidebar()

  return (
    <header
      id="header"
      className="sticky top-0 z-50 flex h-14 w-full items-center bg-white shadow-sm"
    >
      <div className="mx-auto flex w-full max-w-[4096px] items-center gap-4 px-3 sm:px-4 lg:px-6">
        {/* Mobile hamburger - triggers sidebar overlay */}
        <button
          className="lg:hidden shrink-0 rounded p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={openMobile}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src={basePath + '/Images/TABS-Logo-Full.png'}
            alt="TABS Logo"
            width={120}
            height={48}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Search - hidden on small mobile, visible from sm+ */}
        <div className="hidden sm:block sm:max-w-md">
          <SearchInput />
        </div>

        {/* Spacer - pushes CTA to far right */}
        <div className="flex-1" />

        {/* Primary CTA */}
        <a
          href={TAKE_TABS_URL}
          data-testid="header-take-tabs-cta"
          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:px-4 sm:text-[14px]"
        >
          Take the TABS
        </a>
      </div>
    </header>
  )
}

export default Header
