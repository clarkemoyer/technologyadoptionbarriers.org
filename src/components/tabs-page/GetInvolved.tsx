import React from 'react'

/**
 * Get Involved Section
 * Shows ways to participate in TABS research
 */
const GetInvolved = () => {
  return (
    <section id="get-involved" className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[40px] lg:text-[48px] font-bold text-gray-900 mb-[20px]">
            How You Can Get Involved
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-700 max-w-[800px] mx-auto">
            Support technology adoption research through participation, funding, or volunteering
          </p>
        </div>

        {/* Three Ways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px]">
          {/* Take Survey */}
          <div className="bg-white rounded-[15px] p-[40px] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-[25px]">
              <div className="w-[80px] h-[80px] bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-[20px]">
                <svg
                  className="w-[40px] h-[40px] text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Survey document icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                We need YOU to take the survey
              </h4>
            </div>
            <p className="text-[16px] text-gray-700 leading-[1.6] mb-[25px]">
              Take the survey today and support this data and research. We need responses from as
              many types of organizational leaders as possible to provide the best insights.
            </p>
            <a
              href="https://technologyadoptionbarriers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-[30px] py-[12px] bg-blue-600 text-white rounded-[25px] hover:bg-blue-700 transition-colors duration-300"
            >
              Take Survey
            </a>
          </div>

          {/* Donate */}
          <div className="bg-white rounded-[15px] p-[40px] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-[25px]">
              <div className="w-[80px] h-[80px] bg-green-100 rounded-full flex items-center justify-center mx-auto mb-[20px]">
                <svg
                  className="w-[40px] h-[40px] text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Donation funding icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                We need funding to keep up the great work
              </h4>
            </div>
            <p className="text-[16px] text-gray-700 leading-[1.6] mb-[25px]">
              Help us meet our funding goal of $5,000 to run the annual survey. Donate individually
              or become a sponsor of the TABS Survey.
            </p>
            <a
              href="https://technologyadoptionbarriers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-[30px] py-[12px] bg-green-600 text-white rounded-[25px] hover:bg-green-700 transition-colors duration-300"
            >
              Donate Now
            </a>
          </div>

          {/* Volunteer */}
          <div className="bg-white rounded-[15px] p-[40px] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-[25px]">
              <div className="w-[80px] h-[80px] bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-[20px]">
                <svg
                  className="w-[40px] h-[40px] text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Volunteer group icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h4 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                Become a Supporting Researcher
              </h4>
            </div>
            <p className="text-[16px] text-gray-700 leading-[1.6] mb-[25px]">
              We need more than money to run the survey - we need people and skills like yours.
              Volunteer today to help with research and analysis.
            </p>
            <a
              href="https://technologyadoptionbarriers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-[30px] py-[12px] bg-purple-600 text-white rounded-[25px] hover:bg-purple-700 transition-colors duration-300"
            >
              Volunteer
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GetInvolved
