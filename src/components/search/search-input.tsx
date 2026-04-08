'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { search, loadSearchIndex, highlightTerms, SearchResult, SearchDocument } from '@/lib/search'

export default function SearchInput() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [index, setIndex] = useState<SearchDocument[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRequestIdRef = useRef(0)

  // Load search index on mount
  useEffect(() => {
    loadSearchIndex().then(setIndex)
  }, [])

  // Re-run active query once the search index has loaded
  useEffect(() => {
    if (index.length > 0 && query.trim().length > 0) {
      handleSearch(query)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Cleanup pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle search
  const handleSearch = (q: string) => {
    setQuery(q)
    setSelectedIndex(-1)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (q.trim().length === 0) {
      searchRequestIdRef.current += 1
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const requestId = ++searchRequestIdRef.current

    // Use setTimeout to debounce and avoid blocking UI
    timeoutRef.current = setTimeout(() => {
      const searchResults = search(index, q)

      if (requestId !== searchRequestIdRef.current) {
        return
      }

      setResults(searchResults)
      setIsLoading(false)
      timeoutRef.current = null
    }, 150)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = results[selectedIndex].document.url
        }
        break
      case 'Escape':
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
          setIsLoading(false)
        }
        searchRequestIdRef.current += 1
        setIsOpen(false)
        setQuery('')
        setResults([])
        setSelectedIndex(-1)
        break
    }
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md"
      role="search"
      aria-label="Site search"
    >
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          placeholder="Search site..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-expanded={isOpen && query.trim().length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          autoComplete="off"
        />
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

      {/* Search Results Dropdown */}
      {isOpen && (query.trim().length > 0 || results.length > 0) && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <div className="inline-block">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <li
                  key={result.document.id}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    window.location.href = result.document.url
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{result.document.title}</h4>
                  {result.document.category && (
                    <p className="text-xs text-gray-500 mb-2">{result.document.category}</p>
                  )}
                  <p
                    className="text-sm text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: highlightTerms(result.snippet, query),
                    }}
                  />
                  {result.matchedFields.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Matched in: {result.matchedFields.join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No results found</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
