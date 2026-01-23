import React from 'react'
import Link from 'next/link'

const SeeYourselfTeaser = () => {
  return (
    <section className="w-full py-[60px] bg-white border-b border-gray-100">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-[32px] md:text-[38px] font-bold text-[#145044] mb-4 font-serif">
              See Yourself in the Survey
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl">
              Explore how TABS relates specifically to your role—whether you’re a CEO, CIO, or
              leading specific functions. Discover the impact you can make.
            </p>
          </div>
          <div>
            <Link
              href="/start"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#26C699] text-white text-lg font-bold rounded-lg hover:bg-[#1fa680] transition-colors shadow-sm"
            >
              Find Your Role
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeeYourselfTeaser
