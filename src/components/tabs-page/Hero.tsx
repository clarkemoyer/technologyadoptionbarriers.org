import React from 'react'

/**
 * TABS Hero Section
 * Main hero section for Technology Adoption Barriers Survey
 */
const Hero = () => {
  return (
    <section
      id="hero"
      className="relative w-full py-[100px] lg:py-[120px] bg-gradient-to-br from-blue-600 to-blue-800"
    >
      <div className="w-[90%] mx-auto max-w-[1280px]">
        <div className="flex flex-col items-center text-center text-white">
          {/* Main Heading */}
          <h1 className="text-[48px] lg:text-[64px] font-bold leading-[1.2] mb-[30px]">
            Technology Adoption Barriers Survey
          </h1>

          {/* Tagline */}
          <p className="text-[24px] lg:text-[28px] font-medium mb-[40px] max-w-[800px]">
            Know the Barriers, Break the Barriers
          </p>

          {/* Description */}
          <p className="text-[18px] lg:text-[20px] leading-[1.6] mb-[50px] max-w-[900px] opacity-90">
            Technology Adoption Barriers Survey (TABS) collects insights from organizational leaders
            to identify and overcome obstacles to technology adoption. Help us understand
            what&apos;s in your way.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-[20px]">
            <a
              href="#survey"
              className="px-[40px] py-[18px] bg-white text-blue-700 text-[18px] font-semibold rounded-[30px] hover:bg-gray-100 transition-colors duration-300"
            >
              Take the Survey
            </a>
            <a
              href="#get-involved"
              className="px-[40px] py-[18px] bg-transparent border-2 border-white text-white text-[18px] font-semibold rounded-[30px] hover:bg-white hover:text-blue-700 transition-colors duration-300"
            >
              Get Involved
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
