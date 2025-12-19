import React from 'react'

/**
 * Contact Section
 * Provides contact information for TABS survey support
 */
const Contact = () => {
  return (
    <section id="contact" className="w-full py-[80px] bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-[90%] mx-auto max-w-[1280px]">
        <div className="text-center mb-[50px]">
          <h2 className="text-[40px] lg:text-[48px] font-bold text-white mb-[20px]">
            Get in Touch
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-300 max-w-[700px] mx-auto">
            Have questions about the survey or need assistance? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px]">
          {/* Phone Contact */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[15px] p-[40px] text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-[70px] h-[70px] bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-[25px]">
              <svg
                className="w-[35px] h-[35px] text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Phone icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-[15px]">Call or Text</h3>
            <a
              href="tel:520-222-8104"
              className="text-[24px] font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              520-222-8104
            </a>
            <p className="text-[14px] text-gray-400 mt-[10px]">Clarke Moyer</p>
          </div>

          {/* Email Contact */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[15px] p-[40px] text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-[70px] h-[70px] bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-[25px]">
              <svg
                className="w-[35px] h-[35px] text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Email icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-[15px]">Email Us</h3>
            <a
              href="mailto:contact@technologyadoptionbarriers.org"
              className="text-[18px] text-blue-400 hover:text-blue-300 transition-colors duration-300 break-all"
            >
              contact@technologyadoptionbarriers.org
            </a>
            <p className="text-[14px] text-gray-400 mt-[10px]">We respond within 24 hours</p>
          </div>

          {/* Online Support */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[15px] p-[40px] text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="w-[70px] h-[70px] bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-[25px]">
              <svg
                className="w-[35px] h-[35px] text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Support icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-[15px]">Visit Live Site</h3>
            <a
              href="https://technologyadoptionbarriers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[25px] py-[10px] bg-purple-500 text-white rounded-[25px] hover:bg-purple-600 transition-colors duration-300"
            >
              Go to Survey
            </a>
            <p className="text-[14px] text-gray-400 mt-[10px]">Access the survey portal</p>
          </div>
        </div>

        {/* Additional CTA */}
        <div className="mt-[60px] text-center">
          <p className="text-[16px] text-gray-300 mb-[25px]">
            Ready to contribute to our research?
          </p>
          <a
            href="https://technologyadoptionbarriers.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-[45px] py-[18px] bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[18px] font-semibold rounded-[30px] hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Take the TABS Survey
          </a>
        </div>
      </div>
    </section>
  )
}

export default Contact
