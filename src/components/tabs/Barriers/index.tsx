'use client'

import React, { useState, useMemo } from 'react'
import { barriers, barrierCategories } from '@/data/barriers'
import { LiaSearchSolid } from 'react-icons/lia'
import { RxCross2 } from 'react-icons/rx'

/**
 * Barriers Component - Displays Technology Adoption Barriers
 *
 * This component showcases the key barriers to technology adoption
 * as identified by the TABS research. Barriers are organized by category
 * for easy navigation and understanding.
 */

const Barriers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredBarriers = useMemo(() => {
    return barriers.filter((barrier) => {
      const matchesSearch =
        barrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barrier.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory ? barrier.category === activeCategory : true

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveCategory(null)
  }

  return (
    <section id="barriers" className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[40px] lg:text-[48px] font-bold text-[#113563] mb-[20px]">
            Technology Adoption Barriers
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-700 max-w-[800px] mx-auto">
            Understanding the challenges organizations face when adopting new technologies is the
            first step to overcoming them. The TABS research has identified these key barriers.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="max-w-[800px] mx-auto mb-[40px]">
          {/* Search Input */}
          <div className="relative mb-[30px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LiaSearchSolid className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search barriers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search barriers by name or description"
              className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-[30px] shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <RxCross2 className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-[10px]">
            {barrierCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-[20px] py-[10px] rounded-[25px] border-2 transition-all duration-300 font-medium ${
                  activeCategory === category.id
                    ? 'bg-[#2E6F8E] border-[#2E6F8E] text-white shadow-md transform scale-105'
                    : 'bg-white border-[#2E6F8E] text-[#2E6F8E] hover:bg-blue-50'
                }`}
                title={category.description}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Active Filter Summary / Clear Button */}
          {(activeCategory || searchQuery) && (
            <div className="text-center mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-500 underline transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Barriers Grid */}
        {filteredBarriers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {filteredBarriers.map((barrier) => (
              <div
                key={barrier.id}
                className="bg-white rounded-[10px] p-[30px] shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                {/* Category Badge */}
                <div className="mb-[15px]">
                  <span
                    className={`inline-block px-[12px] py-[4px] rounded-[15px] text-[12px] font-semibold uppercase ${
                      barrier.category === 'financial'
                        ? 'bg-green-100 text-green-800'
                        : barrier.category === 'technical'
                          ? 'bg-blue-100 text-blue-800'
                          : barrier.category === 'organizational'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {barrier.category}
                  </span>
                </div>

                {/* Barrier Name */}
                <h3 className="text-[24px] font-bold text-[#113563] mb-[15px]">{barrier.name}</h3>

                {/* Description */}
                <p className="text-[16px] text-gray-700 mb-[15px] leading-[1.6]">
                  {barrier.description}
                </p>

                {/* Examples (if available) */}
                {barrier.examples && barrier.examples.length > 0 && (
                  <div className="mt-[20px]">
                    <h4 className="text-[14px] font-semibold text-[#2E6F8E] mb-[10px]">
                      Common Examples:
                    </h4>
                    <ul className="space-y-[8px]">
                      {barrier.examples.map((example, idx) => (
                        <li key={idx} className="text-[14px] text-gray-600 flex items-start">
                          <span className="text-[#F57C20] mr-[8px] mt-[2px]">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* No Results State */
          <div className="text-center py-20 bg-white rounded-[20px] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No barriers found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-[60px]">
          <p className="text-[18px] text-gray-700 mb-[20px]">
            Help us understand and overcome these barriers
          </p>
          <a
            className="inline-block px-[40px] py-[15px] bg-[#F57C20] text-white text-[18px] font-semibold rounded-[30px] hover:bg-[#d66a1a] transition-colors duration-300"
            href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
            rel="noopener noreferrer"
          >
            Take the TABS Survey
          </a>
        </div>
      </div>
    </section>
  )
}

export default Barriers
