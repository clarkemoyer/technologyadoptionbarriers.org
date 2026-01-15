import React from 'react'
import { barriers, barrierCategories } from '@/data/barriers'

/**
 * Barriers Component - Displays Technology Adoption Barriers
 *
 * This component showcases the key barriers to technology adoption
 * as identified by the TABS research. Barriers are organized by category
 * for easy navigation and understanding.
 *
 * TODO: Once live site is accessible, update styling to match live site design
 * TODO: Add icons/imagery from live site
 * TODO: Verify content matches live site exactly
 */

const Barriers = () => {
  return (
    <section id="barriers" className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[1280px]">
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

        {/* Category Labels (non-interactive) */}
        <div className="flex flex-wrap justify-center gap-[10px] mb-[40px]">
          {barrierCategories.map((category) => (
            <div
              key={category.id}
              className="px-[20px] py-[10px] rounded-[25px] bg-white border-2 border-[#2E6F8E] text-[#2E6F8E]"
              title={category.description}
            >
              {category.name}
            </div>
          ))}
        </div>

        {/* Barriers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
          {barriers.map((barrier) => (
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
