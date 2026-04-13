'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import quotes from '@/data/tech-adoption-quotes.json'

type Quote = {
  quote: string
  author: string
  role: string
  year: number
  yearDisplay: string
  source: string
  era: string
}

const ERA_COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  Ancient: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    text: 'text-amber-700',
  },
  Enlightenment: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-700',
  },
  Renaissance: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-800',
    text: 'text-orange-700',
  },
  'Industrial Revolution': {
    bg: 'bg-stone-50',
    border: 'border-stone-400',
    badge: 'bg-stone-200 text-stone-800',
    text: 'text-stone-700',
  },
  'Early 20th Century': {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-800',
    text: 'text-rose-700',
  },
  'Mid 20th Century': {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-700',
  },
  'Computing Era': {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-700',
  },
  'Internet Era': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800',
    text: 'text-indigo-700',
  },
  'Mobile Era': {
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    badge: 'bg-teal-100 text-teal-800',
    text: 'text-teal-700',
  },
  'AI Era': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800',
    text: 'text-emerald-700',
  },
}

const DEFAULT_COLORS = {
  bg: 'bg-gray-50',
  border: 'border-gray-300',
  badge: 'bg-gray-100 text-gray-800',
  text: 'text-gray-700',
}

function QuoteCard({ quote, index }: { quote: Quote; index: number }) {
  const colors = ERA_COLORS[quote.era] || DEFAULT_COLORS
  const isLeft = index % 2 === 0

  return (
    <div className={`flex w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
      <div
        className={`
          relative w-full md:w-[calc(50%-2rem)]
          ${colors.bg} ${colors.border} border-l-4
          rounded-lg p-5 sm:p-6 shadow-sm
          hover:shadow-md transition-shadow duration-200
        `}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}
          >
            {quote.era}
          </span>
          <span className={`text-xs font-medium ${colors.text}`}>{quote.yearDisplay}</span>
        </div>

        <blockquote className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4 font-serif italic">
          &ldquo;{quote.quote}&rdquo;
        </blockquote>

        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">{quote.author}</span>
          <span className="text-xs text-gray-500">{quote.role}</span>
          <span className="text-xs text-gray-400 mt-0.5">{quote.source}</span>
        </div>
      </div>
    </div>
  )
}

export default function QuotesPageClient() {
  const [selectedEra, setSelectedEra] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const sortedQuotes = useMemo(() => [...(quotes as Quote[])].sort((a, b) => a.year - b.year), [])

  const eras = useMemo(() => [...new Set(sortedQuotes.map((q) => q.era))], [sortedQuotes])

  const eraCounts = useMemo(
    () =>
      sortedQuotes.reduce<Record<string, number>>((counts, q) => {
        counts[q.era] = (counts[q.era] ?? 0) + 1
        return counts
      }, {}),
    [sortedQuotes]
  )

  const filteredQuotes = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase()
    return sortedQuotes.filter((q) => {
      const matchesEra = selectedEra === 'All' || q.era === selectedEra
      const matchesSearch =
        lowerQuery === '' ||
        q.quote.toLowerCase().includes(lowerQuery) ||
        q.author.toLowerCase().includes(lowerQuery) ||
        q.source.toLowerCase().includes(lowerQuery)
      return matchesEra && matchesSearch
    })
  }, [sortedQuotes, selectedEra, searchQuery])

  return (
    <main className="pt-[80px] min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-12 sm:py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Famous Quotes on Technology Adoption
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-2">
            From ancient philosophers to AI pioneers - a chronological journey through humanity
            {"'"}s relationship with innovation and change.
          </p>
          <p className="text-sm opacity-70">
            {sortedQuotes.length} quotes spanning over 2,500 years of human history
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[80px] z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search quotes, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                aria-label="Search quotes"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Era filters */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedEra('All')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedEra === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-pressed={selectedEra === 'All'}
              >
                All ({sortedQuotes.length})
              </button>
              {eras.map((era) => (
                <button
                  key={era}
                  onClick={() => setSelectedEra(era)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedEra === era
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-pressed={selectedEra === era}
                >
                  {era} ({eraCounts[era] ?? 0})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quotes match your search.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedEra('All')
              }}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredQuotes.map((quote, index) => (
              <QuoteCard key={quote.quote} quote={quote} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Back to Barriers */}
      <div className="bg-gray-50 py-10 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-gray-600 mb-4">
            These quotes reflect the timeless human experience of navigating change and new
            technology. The barriers they describe are exactly what TABS measures.
          </p>
          <Link
            href="/barriers"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explore the 16 Adoption Barriers
          </Link>
        </div>
      </div>
    </main>
  )
}
