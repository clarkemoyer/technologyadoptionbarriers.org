import React from 'react'

/**
 * Impact Section
 * Showcases the impact and importance of the TABS research
 */
const Impact = () => {
  return (
    <section id="impact" className="w-full py-[80px] bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-[90%] mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[40px] lg:text-[48px] font-bold text-gray-900 mb-[20px]">
            Why TABS Matters
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-700 max-w-[800px] mx-auto">
            Understanding technology adoption barriers helps organizations make informed decisions
            and overcome obstacles to digital transformation
          </p>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {/* Card 1 */}
          <div className="bg-white rounded-[15px] p-[30px] shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500">
            <div className="text-center">
              <div className="text-[48px] font-bold text-blue-600 mb-[15px]">85%</div>
              <h3 className="text-[18px] font-semibold text-gray-900 mb-[10px]">Organizations</h3>
              <p className="text-[14px] text-gray-600 leading-[1.6]">
                Face technology adoption challenges that slow their digital transformation
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[15px] p-[30px] shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-500">
            <div className="text-center">
              <div className="text-[48px] font-bold text-green-600 mb-[15px]">$2.5M</div>
              <h3 className="text-[18px] font-semibold text-gray-900 mb-[10px]">Average Cost</h3>
              <p className="text-[14px] text-gray-600 leading-[1.6]">
                Lost annually due to failed technology implementations and adoption barriers
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[15px] p-[30px] shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-purple-500">
            <div className="text-center">
              <div className="text-[48px] font-bold text-purple-600 mb-[15px]">70%</div>
              <h3 className="text-[18px] font-semibold text-gray-900 mb-[10px]">Success Rate</h3>
              <p className="text-[14px] text-gray-600 leading-[1.6]">
                Improvement when organizations identify and address adoption barriers early
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[15px] p-[30px] shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-orange-500">
            <div className="text-center">
              <div className="text-[48px] font-bold text-orange-600 mb-[15px]">45%</div>
              <h3 className="text-[18px] font-semibold text-gray-900 mb-[10px]">Time Saved</h3>
              <p className="text-[14px] text-gray-600 leading-[1.6]">
                Average reduction in implementation time with proactive barrier identification
              </p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mt-[60px] bg-white rounded-[20px] p-[40px] md:p-[60px] shadow-lg">
          <h3 className="text-[28px] lg:text-[32px] font-bold text-gray-900 mb-[40px] text-center">
            How TABS Research Helps Organizations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
            <div className="flex gap-[20px]">
              <div className="flex-shrink-0 w-[50px] h-[50px] bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-[25px] h-[25px] text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-[18px] font-semibold text-gray-900 mb-[8px]">
                  Identify Common Patterns
                </h4>
                <p className="text-[14px] text-gray-600 leading-[1.6]">
                  Discover the most prevalent barriers across industries and organization types
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="flex-shrink-0 w-[50px] h-[50px] bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-[25px] h-[25px] text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-[18px] font-semibold text-gray-900 mb-[8px]">
                  Accelerate Adoption
                </h4>
                <p className="text-[14px] text-gray-600 leading-[1.6]">
                  Learn proven strategies to overcome barriers and speed up technology
                  implementation
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="flex-shrink-0 w-[50px] h-[50px] bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-[25px] h-[25px] text-purple-600"
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
              <div>
                <h4 className="text-[18px] font-semibold text-gray-900 mb-[8px]">Reduce Costs</h4>
                <p className="text-[14px] text-gray-600 leading-[1.6]">
                  Avoid expensive mistakes by understanding potential barriers before implementation
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="flex-shrink-0 w-[50px] h-[50px] bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-[25px] h-[25px] text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-[18px] font-semibold text-gray-900 mb-[8px]">
                  Benchmark Performance
                </h4>
                <p className="text-[14px] text-gray-600 leading-[1.6]">
                  Compare your organization&apos;s challenges with industry standards and best
                  practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Impact
