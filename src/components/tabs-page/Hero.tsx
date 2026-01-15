import React from 'react'

/**
 * TABS Hero Section
 * Main hero section for Technology Adoption Barriers Survey
 */
const Hero = () => {
  return (
    <section
      id="hero"
      className="relative w-full py-[100px] lg:py-[120px] bg-[#F7F9F9] overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-[60px]">
        <div className="flex-1 text-center lg:text-left text-white">
          {/* Badge/Label */}
          <div className="inline-flex items-center gap-[10px] px-[20px] py-[8px] bg-white/20 backdrop-blur-sm rounded-[20px] mb-[30px] border border-white/30">
            <svg
              className="w-[20px] h-[20px]"
              fill="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Research badge"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[14px] font-medium">Research Initiative 2025</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-[48px] lg:text-[64px] font-bold leading-[1.2] mb-[30px] font-serif text-[#0E7162]">
            Technology Adoption Barriers Survey.
          </h1>

          {/* Tagline */}
          <p className="text-[24px] lg:text-[28px] font-medium mb-[40px] max-w-[800px] text-[#666666]">
            Know the Barriers, Break the Barriers:
          </p>

          {/* Description */}
          <p className="text-[18px] lg:text-[20px] leading-[1.6] mb-[50px] max-w-[900px] opacity-90 text-gray-700">
            Technology Adoption Barriers Survey (TABS) collects insights from organizational leaders
            to identify and overcome obstacles to technology adoption. Help us understand
            what&apos;s in your way.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center lg:justify-start">
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="px-[40px] py-[18px] bg-[#26C699] text-white text-[18px] font-semibold rounded-[30px] hover:bg-[#1fa680] hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Take the TABS
            </a>
            <a
              href="#get-involved"
              className="px-[40px] py-[18px] bg-transparent border-2 border-white text-white text-[18px] font-semibold rounded-[30px] hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Involved
            </a>
          </div>
        </div>

        {/* Video Section */}
        <div className="flex-1 w-full max-w-[600px]">
          <div className="relative aspect-video bg-black rounded-[20px] overflow-hidden shadow-2xl border-4 border-white/20 group">
            <video
              className="w-full h-full object-cover"
              poster="/Images/TABS-Logo-Full.png"
              controls
            >
              <source src="/videos/The_TABS_Project.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 animate-bounce">
        <a
          href="#get-involved"
          className="block text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg
            className="w-[30px] h-[30px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Scroll down"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}

export default Hero
