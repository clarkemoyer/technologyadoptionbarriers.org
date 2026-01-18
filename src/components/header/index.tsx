'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMenu } from 'react-icons/fi'
import { LiaSearchSolid } from 'react-icons/lia'
import { RxCross2 } from 'react-icons/rx'
import { motion, AnimatePresence } from 'framer-motion'
import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

interface MenuItem {
  label: string
  path: string
  hasMegaMenu?: boolean
}

const SCROLL_OFFSET = 100

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isMobileBranch1Open, setIsMobileBranch1Open] = useState(false)
  const [isMobileBranch2Open, setIsMobileBranch2Open] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuButtonRef = useRef<HTMLLIElement>(null)

  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: 'Home', path: '/' },
      { label: 'Take the TABS', path: 'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO' },
      { label: 'Tech Adoption Barriers', path: '/barriers' },
      { label: 'The Making of TABS', path: '/making-of-tabs' },
      {
        label: 'Technology Adoption Models',
        path: '/technology-adoption-models',
        hasMegaMenu: true,
      },
      { label: 'Media', path: '/media' },
    ],
    []
  )

  const sections = useMemo(
    () =>
      menuItems.map((item) => item.path.replace('/#', '')).filter((section) => section !== 'hero'),
    [menuItems]
  )

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track active section based on scroll position
  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + SCROLL_OFFSET

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetBottom = offsetTop + element.offsetHeight
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(sectionId)
            return
          }
        }
      }
      // If at the top, set home as active
      if (window.scrollY < SCROLL_OFFSET) {
        setActiveSection('')
      }
    }

    window.addEventListener('scroll', handleScrollSpy)
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [sections])

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMegaMenuOpen &&
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        megaMenuButtonRef.current &&
        !megaMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMegaMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMegaMenuOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMegaMenuOpen) {
        setIsMegaMenuOpen(false)
        // Return focus to the button
        megaMenuButtonRef.current?.querySelector('button')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMegaMenuOpen])

  const handleSearchToggle = () => setIsSearchOpen(!isSearchOpen)
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
    setIsMegaMenuOpen(false)
    setIsMobileBranch1Open(false)
    setIsMobileBranch2Open(false)
  }

  const isActive = (path: string) => {
    const sectionId = path.replace('/#', '')
    if (sectionId === 'hero') return activeSection === ''
    return activeSection === sectionId
  }

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen(!isMegaMenuOpen)
  }

  return (
    <header
      id="header"
      className={`w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300 ${
        isScrolled ? 'h-[55px]' : 'h-[80px]'
      }`}
    >
      <div className="w-full">
        <div className="mx-auto max-w-[4096px]">
          <div className="flex items-center px-2 sm:px-4 lg:px-6 xl:px-8 transition-all duration-300">
            {/* Logo */}
            <div
              className={`transition-all duration-300 ${isScrolled ? 'w-[110px]' : 'w-[150px]'}`}
            >
              <Link href="/" onClick={handleLinkClick} className="block">
                <Image
                  src={basePath + '/Images/TABS-Logo-Full.png'}
                  alt="TABS Logo"
                  width={150}
                  height={64}
                  priority
                  className={`transition-all duration-300 object-contain ${
                    isScrolled ? 'h-10 w-auto' : 'h-16 w-auto'
                  }`}
                />
              </Link>
            </div>

            {/* Menu or Search */}
            {!isSearchOpen ? (
              <div className="flex items-center justify-end sm:pl-[50px] md:pl-[70px] w-full">
                {/* Desktop Menu */}
                <nav className="hidden lg:block transition-all duration-300">
                  <ul className="flex items-center space-x-[1px] font-navbar font-[600]">
                    {menuItems.map((item, index) => (
                      <li
                        key={index}
                        className="relative py-6"
                        ref={item.hasMegaMenu ? megaMenuButtonRef : null}
                      >
                        {item.hasMegaMenu ? (
                          <button
                            onClick={toggleMegaMenu}
                            onMouseEnter={() => setIsMegaMenuOpen(true)}
                            onFocus={() => setIsMegaMenuOpen(true)}
                            className={`flex items-center px-3 py-2 text-[14px] transition-colors duration-200 ${
                              isActive(item.path)
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-500'
                            }`}
                            aria-expanded={isMegaMenuOpen}
                            aria-controls="mega-menu"
                          >
                            {item.label}
                            <svg
                              className={`w-4 h-4 ml-1 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        ) : (
                          <Link
                            href={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center px-3 py-2 text-[14px] transition-colors duration-200 ${
                              isActive(item.path)
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-500'
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Search Icon */}
                <div className="hidden lg:flex items-center">
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="Search"
                  >
                    <LiaSearchSolid className="h-5 w-5 cursor-pointer" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-blue-600"
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMobileMenuOpen ? (
                    <RxCross2 className="h-6 w-6" />
                  ) : (
                    <FiMenu className="h-6 w-6" />
                  )}
                </button>
              </div>
            ) : (
              // Search Input
              <div className="w-full max-w-[750px] ml-auto flex items-center justify-between transition-all duration-300">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 focus:outline-none"
                  autoFocus
                  aria-label="Search input"
                />
                <button
                  onClick={handleSearchToggle}
                  className="ml-2 p-2 text-gray-600"
                  aria-label="Close search"
                >
                  <RxCross2 className="cursor-pointer h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Mega Menu */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            id="mega-menu"
            ref={megaMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className={`hidden lg:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg z-40 ${
              isScrolled ? 'top-[55px]' : 'top-[80px]'
            }`}
          >
            <div className="max-w-[4096px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
              <div className="grid grid-cols-3 gap-8">
                {/* Column 1: Root */}
                <div>
                  <Link
                    href={technologyAdoptionModelsSeries.root.slug}
                    onClick={handleLinkClick}
                    className="block text-[16px] font-bold text-[#145044] hover:text-blue-600 mb-4"
                  >
                    {technologyAdoptionModelsSeries.root.title}
                  </Link>
                </div>

                {/* Column 2: Branch 1 */}
                <div>
                  <Link
                    href={technologyAdoptionModelsSeries.branches[0].slug}
                    onClick={handleLinkClick}
                    className="block text-[14px] font-bold text-gray-900 hover:text-blue-600 mb-3"
                  >
                    {technologyAdoptionModelsSeries.branches[0].title}
                  </Link>
                  <ul className="space-y-2">
                    {technologyAdoptionModelsSeries.branches[0].articles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={article.slug}
                          onClick={handleLinkClick}
                          className="block text-[13px] text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Branch 2 */}
                <div>
                  <Link
                    href={technologyAdoptionModelsSeries.branches[1].slug}
                    onClick={handleLinkClick}
                    className="block text-[14px] font-bold text-gray-900 hover:text-blue-600 mb-3"
                  >
                    {technologyAdoptionModelsSeries.branches[1].title}
                  </Link>
                  <ul className="space-y-2">
                    {technologyAdoptionModelsSeries.branches[1].articles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={article.slug}
                          onClick={handleLinkClick}
                          className="block text-[13px] text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bibliography Link */}
              {technologyAdoptionModelsSeries.bibliography && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link
                    href={technologyAdoptionModelsSeries.bibliography.slug}
                    onClick={handleLinkClick}
                    className="inline-block text-[14px] font-bold text-[#145044] hover:text-blue-600"
                  >
                    📚 {technologyAdoptionModelsSeries.bibliography.title}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`lg:hidden absolute left-0 w-full overflow-hidden z-40 ${
              isScrolled ? 'top-[53px]' : 'top-[77px]'
            }`}
          >
            <div
              className={`max-w-[700px] mx-auto px-6 py-4 bg-white border-t-[3px] border-[#2EA3F2] shadow-[0_2px_5px_rgba(0,0,0,0.1)] max-h-[80vh] overflow-auto`}
            >
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {item.hasMegaMenu ? (
                      <div>
                        <Link
                          href={item.path}
                          onClick={handleLinkClick}
                          className={`block px-4 py-2 rounded-lg text-sm font-[600] ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                        </Link>

                        {/* Branch 1: User's Journey */}
                        <div className="ml-4 mt-2">
                          <button
                            onClick={() => setIsMobileBranch1Open(!isMobileBranch1Open)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
                            aria-expanded={isMobileBranch1Open}
                          >
                            <span className="text-[13px]">
                              {technologyAdoptionModelsSeries.branches[0].title}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${isMobileBranch1Open ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isMobileBranch1Open && (
                            <ul className="mt-1 space-y-1">
                              <li>
                                <Link
                                  href={technologyAdoptionModelsSeries.branches[0].slug}
                                  onClick={handleLinkClick}
                                  className="block px-4 py-1 text-[12px] text-blue-700 hover:bg-blue-50 rounded"
                                >
                                  Branch Introduction
                                </Link>
                              </li>
                              {technologyAdoptionModelsSeries.branches[0].articles.map(
                                (article) => (
                                  <li key={article.id}>
                                    <Link
                                      href={article.slug}
                                      onClick={handleLinkClick}
                                      className="block px-4 py-1 text-[12px] text-gray-700 hover:bg-blue-50 rounded"
                                    >
                                      {article.title}
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>

                        {/* Branch 2: Organization's Playbook */}
                        <div className="ml-4 mt-2">
                          <button
                            onClick={() => setIsMobileBranch2Open(!isMobileBranch2Open)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded"
                            aria-expanded={isMobileBranch2Open}
                          >
                            <span className="text-[13px]">
                              {technologyAdoptionModelsSeries.branches[1].title}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${isMobileBranch2Open ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isMobileBranch2Open && (
                            <ul className="mt-1 space-y-1">
                              <li>
                                <Link
                                  href={technologyAdoptionModelsSeries.branches[1].slug}
                                  onClick={handleLinkClick}
                                  className="block px-4 py-1 text-[12px] text-blue-700 hover:bg-blue-50 rounded"
                                >
                                  Branch Introduction
                                </Link>
                              </li>
                              {technologyAdoptionModelsSeries.branches[1].articles.map(
                                (article) => (
                                  <li key={article.id}>
                                    <Link
                                      href={article.slug}
                                      onClick={handleLinkClick}
                                      className="block px-4 py-1 text-[12px] text-gray-700 hover:bg-blue-50 rounded"
                                    >
                                      {article.title}
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>

                        {/* Bibliography Link in Mobile */}
                        {technologyAdoptionModelsSeries.bibliography && (
                          <div className="ml-4 mt-2">
                            <Link
                              href={technologyAdoptionModelsSeries.bibliography.slug}
                              onClick={handleLinkClick}
                              className="block px-4 py-2 text-[12px] font-semibold text-[#145044] hover:bg-blue-50 rounded"
                            >
                              📚 {technologyAdoptionModelsSeries.bibliography.title}
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={handleLinkClick}
                        className={`block px-4 py-2 rounded-lg text-sm font-[600] ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
