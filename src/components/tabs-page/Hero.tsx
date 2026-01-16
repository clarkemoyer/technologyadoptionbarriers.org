import React from 'react'

/**
 * TABS Hero Section
 * Main hero section for Technology Adoption Barriers Survey
 */
const Hero = () => {
  return (
    <section id="hero" className="w-full bg-[#f4f7f6] py-[60px] lg:py-[100px]">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        <div className="flex flex-col lg:flex-row items-start gap-[40px] lg:gap-[60px]">
          {/* Left Column: Text */}
          <div className="flex-1 w-full lg:w-1/2">
            <h1 className="text-[42px] lg:text-[54px] font-bold text-[#145044] mb-[10px] leading-tight font-serif">
              Technology Adoption Barriers Survey.
            </h1>
            <h2 className="text-[28px] lg:text-[32px] font-bold text-[#145044] mb-[30px] font-serif">
              Know the Barriers, Break the Barriers:
            </h2>

            <ul className="space-y-[20px] mb-[40px] list-disc pl-[20px] marker:text-gray-400">
              <li className="text-[18px] text-gray-700 leading-relaxed">
                Barriers to technology adoption negatively affect competitive advantage within
                industries.
              </li>
              <li className="text-[18px] text-gray-700 leading-relaxed">
                Without{' '}
                <strong className="font-bold">effective and continuous technology adoption</strong>,
                enterprises risk loss in market share, global competitiveness, and even
                obsolescence.
              </li>
              <li className="text-[18px] text-gray-700 leading-relaxed">
                There’s a continuous need for{' '}
                <strong className="font-bold">
                  updated insights, especially from senior leadership
                </strong>
                , who are key decision-makers.
              </li>
            </ul>

            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[35px] py-[15px] bg-[#26C699] text-white text-[18px] font-bold rounded-[4px] hover:bg-[#1fa680] transition-colors"
            >
              TAKE THE TABS
            </a>
          </div>

          {/* Right Column: Video */}
          <div className="flex-1 w-full lg:w-1/2">
            <div className="relative aspect-video w-full bg-black rounded shadow-lg overflow-hidden">
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
      </div>
    </section>
  )
}

export default Hero
