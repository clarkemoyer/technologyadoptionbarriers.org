'use client'

import { useState, useMemo, useCallback, useId } from 'react'
import { faqCategories, allFaqItems } from '@/data/faq-page'

/* ------------------------------------------------------------------ */
/*  Accordion Item                                                     */
/* ------------------------------------------------------------------ */
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  id: string
}) {
  const panelId = `${id}-panel`
  const buttonId = `${id}-btn`

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 px-1 text-left text-[17px] sm:text-[18px] font-semibold text-gray-900 hover:text-tabs-teal-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tabs-teal focus-visible:ring-offset-2 rounded"
        >
          <span>{question}</span>
          <span
            className={`shrink-0 text-tabs-teal transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] opacity-100 pb-5 px-1' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-[16px] sm:text-[17px] text-gray-700 leading-[1.7]">{answer}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Category Card                                                      */
/* ------------------------------------------------------------------ */
function CategoryCard({
  title,
  icon,
  isActive,
  count,
  onClick,
}: {
  title: string
  icon: string
  isActive: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-left text-[15px] font-medium transition-all w-auto whitespace-nowrap lg:w-full ${
        isActive
          ? 'bg-tabs-teal-deep text-white shadow-md'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
      }`}
    >
      <span className="text-[20px]" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">{title}</span>
      <span className={`text-[13px] font-normal ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
        {count}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Main FAQ Page (Client Component)                                   */
/* ------------------------------------------------------------------ */
export default function FaqPageClient() {
  const uid = useId()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  /* --- derived data ------------------------------------------------ */
  const searchLower = search.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    if (!searchLower && !activeCategory) return faqCategories

    return faqCategories
      .map((cat) => {
        if (activeCategory && cat.id !== activeCategory) return { ...cat, items: [] }
        if (!searchLower) return cat
        return {
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchLower) ||
              item.answer.toLowerCase().includes(searchLower)
          ),
        }
      })
      .filter((cat) => cat.items.length > 0)
  }, [searchLower, activeCategory])

  const totalVisible = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories]
  )

  /* --- handlers ---------------------------------------------------- */
  const toggleItem = useCallback((itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  const handleCategoryClick = useCallback((catId: string) => {
    setActiveCategory((prev) => (prev === catId ? null : catId))
    setOpenItems(new Set())
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setActiveCategory(null)
    setOpenItems(new Set())
  }, [])

  const expandAll = useCallback(() => {
    const ids = filteredCategories.flatMap((c) => c.items.map((i) => i.id))
    setOpenItems(new Set(ids))
  }, [filteredCategories])

  const collapseAll = useCallback(() => {
    setOpenItems(new Set())
  }, [])

  /* --- render ------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-tabs-navy-bg to-slate-600 text-white pt-[120px] pb-[60px] sm:pt-[140px] sm:pb-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px] text-center">
          <h1 className="text-[36px] sm:text-[48px] md:text-[56px] font-bold mb-[16px] font-serif leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[18px] sm:text-[20px] md:text-[24px] text-blue-100 max-w-[700px] mx-auto leading-[1.6]">
            Find answers to common questions about the Technology Adoption Barriers Survey, our
            research, and how to get involved.
          </p>

          {/* Search */}
          <div className="mt-[32px] max-w-[600px] mx-auto relative">
            <label htmlFor={`${uid}-search`} className="sr-only">
              Search frequently asked questions
            </label>
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M17.5 17.5L13.875 13.875M15.833 9.167a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z"
                stroke="currentColor"
                strokeWidth="1.667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              id={`${uid}-search`}
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOpenItems(new Set())
              }}
              className="w-full rounded-[12px] border border-transparent bg-white pl-12 pr-4 py-[14px] text-gray-900 placeholder-gray-500 text-[16px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-[40px] sm:py-[60px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px]">
            {/* Sidebar - category filters */}
            <nav className="lg:w-[280px] shrink-0" aria-label="FAQ categories">
              <h2 className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-[16px]">
                Categories
              </h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <button
                  onClick={clearFilters}
                  aria-pressed={!activeCategory}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-left text-[15px] font-medium transition-all whitespace-nowrap ${
                    !activeCategory
                      ? 'bg-tabs-teal-deep text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <span className="text-[20px]" aria-hidden="true">
                    📚
                  </span>
                  <span className="flex-1">All Questions</span>
                  <span
                    className={`text-[13px] font-normal ${!activeCategory ? 'text-white/80' : 'text-gray-400'}`}
                  >
                    {allFaqItems.length}
                  </span>
                </button>
                {faqCategories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    title={cat.title}
                    icon={cat.icon}
                    isActive={activeCategory === cat.id}
                    count={cat.items.length}
                    onClick={() => handleCategoryClick(cat.id)}
                  />
                ))}
              </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-[24px]">
                <p className="text-[15px] text-gray-500" aria-live="polite">
                  Showing <span className="font-semibold text-gray-800">{totalVisible}</span>{' '}
                  {totalVisible === 1 ? 'question' : 'questions'}
                  {activeCategory && (
                    <>
                      {' '}
                      in{' '}
                      <span className="font-semibold text-gray-800">
                        {faqCategories.find((c) => c.id === activeCategory)?.title}
                      </span>
                    </>
                  )}
                  {searchLower && (
                    <>
                      {' '}
                      matching &ldquo;
                      <span className="font-semibold text-gray-800">{search.trim()}</span>
                      &rdquo;
                    </>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={expandAll}
                    className="text-[13px] text-tabs-teal-deep hover:underline font-medium"
                    aria-label="Expand all FAQ answers"
                  >
                    Expand all
                  </button>
                  <div className="w-px h-3.5 bg-gray-300" aria-hidden="true" />
                  <button
                    onClick={collapseAll}
                    className="text-[13px] text-tabs-teal-deep hover:underline font-medium"
                    aria-label="Collapse all FAQ answers"
                  >
                    Collapse all
                  </button>
                </div>
              </div>

              {/* FAQ categories & accordions */}
              {filteredCategories.length === 0 ? (
                <div className="text-center py-[60px]">
                  <p className="text-[48px] mb-[16px]" aria-hidden="true">
                    🔍
                  </p>
                  <p className="text-[20px] font-semibold text-gray-800 mb-[8px]">
                    No matching questions found
                  </p>
                  <p className="text-[16px] text-gray-500 mb-[24px]">
                    Try adjusting your search or browse a different category.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-[15px] font-medium text-tabs-teal-deep hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-[40px]">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id}>
                      <div className="mb-[12px]">
                        <h2 className="text-[22px] sm:text-[26px] font-bold text-gray-900 font-serif flex items-center gap-2">
                          <span aria-hidden="true">{cat.icon}</span>
                          {cat.title}
                        </h2>
                        <p className="text-[15px] text-gray-500 mt-[4px]">{cat.description}</p>
                      </div>
                      <div className="bg-gray-50 rounded-[12px] px-[20px] sm:px-[28px]">
                        {cat.items.map((item) => (
                          <AccordionItem
                            key={item.id}
                            id={`${uid}-${item.id}`}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openItems.has(item.id)}
                            onToggle={() => toggleItem(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-tabs-navy-bg text-white py-[60px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold mb-[16px] font-serif">
            Still have questions?
          </h2>
          <p className="text-[17px] sm:text-[19px] text-blue-100 mb-[32px] leading-[1.6]">
            We&apos;d love to hear from you. Reach out and our team will get back to you.
          </p>
          <a
            href="mailto:contact@technologyadoptionbarriers.org"
            className="inline-block bg-tabs-orange hover:bg-tabs-orange-hover text-white px-[30px] py-[14px] rounded-[8px] font-bold text-[16px] transition-all hover:scale-105"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}
