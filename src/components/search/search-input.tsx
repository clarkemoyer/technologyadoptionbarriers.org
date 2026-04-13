'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { search, loadSearchIndex, highlightTerms, SearchResult, SearchDocument } from '@/lib/search'

export default function SearchInput() {
  const instanceId = useId()
  const listboxId = `search-listbox-${instanceId}`
  const optionId = (index: number) => `search-option-${instanceId}-${index}`
  const resultsId = `search-results-${instanceId}`
  const router = useRouter()
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
    // Re-run active query once the search index has loaded.
    // Intentionally only depends on `index` - we want this to fire exactly once when the index
    // becomes available, using the latest `query` and `handleSearch` via closure.
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

  // Close and reset the search dropdown after a result is selected
  const closeSearch = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
  }

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
          router.push(results[selectedIndex].document.url)
          closeSearch()
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
          aria-label="Search site"
          placeholder="Search site..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-expanded={isOpen && query.trim().length > 0}
          aria-controls={results.length > 0 ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? optionId(selectedIndex) : undefined}
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
          id={resultsId}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div role="status" aria-live="polite" className="px-4 py-8 text-center text-gray-500">
              <div className="inline-block">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              className="divide-y divide-gray-200"
            >
              {results.map((result, idx) => (
                <li
                  key={result.document.id}
                  id={optionId(idx)}
                  role="option"
                  aria-selected={selectedIndex === idx}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    selectedIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    router.push(result.document.url)
                    closeSearch()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
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
            <div role="status" aria-live="polite" className="px-4 py-8 text-center text-gray-500">
              <p>No results found</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
