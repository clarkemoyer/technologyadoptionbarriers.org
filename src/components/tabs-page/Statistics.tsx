import React from 'react'

/**
 * Statistics Section
 * Shows survey statistics and impact metrics
 */
const Statistics = () => {
  return (
    <section id="statistics" className="w-full py-[80px] bg-white">
      <div className="w-[90%] mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[40px] lg:text-[48px] font-bold text-gray-900 mb-[20px]">
            Survey Statistics Since 2025
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-700 max-w-[800px] mx-auto">
            Track our progress and impact in understanding technology adoption barriers
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px]">
          {/* Surveys Completed */}
          <div className="text-center p-[40px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-[15px]">
            <div className="mb-[20px]">
              <svg
                className="w-[60px] h-[60px] text-blue-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-gray-900 mb-[10px]">Surveys Completed</h3>
            <div className="text-[48px] font-bold text-blue-600 mb-[10px]">TBD</div>
            <p className="text-[14px] text-gray-600">Responses collected from leaders</p>
          </div>

          {/* Funds Raised */}
          <div className="text-center p-[40px] bg-gradient-to-br from-green-50 to-green-100 rounded-[15px]">
            <div className="mb-[20px]">
              <svg
                className="w-[60px] h-[60px] text-green-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-gray-900 mb-[10px]">$ Raised</h3>
            <div className="text-[48px] font-bold text-green-600 mb-[10px]">$TBD</div>
            <p className="text-[14px] text-gray-600">Supporting research initiatives</p>
          </div>

          {/* Hours Volunteered */}
          <div className="text-center p-[40px] bg-gradient-to-br from-purple-50 to-purple-100 rounded-[15px]">
            <div className="mb-[20px]">
              <svg
                className="w-[60px] h-[60px] text-purple-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-gray-900 mb-[10px]">Hours Volunteered</h3>
            <div className="text-[48px] font-bold text-purple-600 mb-[10px]">TBD</div>
            <p className="text-[14px] text-gray-600">Contributed by researchers</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-[60px] text-center">
          <p className="text-[16px] text-gray-600 mb-[20px]">
            Statistics are updated regularly as we collect more data
          </p>
          <a
            href="#survey"
            className="inline-block px-[40px] py-[15px] bg-blue-600 text-white text-[18px] font-semibold rounded-[30px] hover:bg-blue-700 transition-colors duration-300"
          >
            Contribute to Our Research
          </a>
        </div>
      </div>
    </section>
  )
}

export default Statistics
