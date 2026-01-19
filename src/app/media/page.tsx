import React from 'react'

const MediaPage = () => {
  return (
    <>
      <main className="pt-[80px]">
        <div className="bg-gray-800 py-[60px] text-white text-center">
          <h1 className="text-[48px] font-bold">Media</h1>
          <p className="text-[20px] opacity-90">Information for media contacts and outcomes.</p>
        </div>

        {/* Video Section */}
        <section className="py-[60px] bg-gray-50">
          <div className="w-[90%] mx-auto max-w-[4096px]">
            <div className="relative aspect-video bg-black rounded-[20px] overflow-hidden shadow-2xl border-4 border-white/20 group">
              <video
                className="w-full h-full object-contain"
                poster="/Images/figma-hero-img.webp"
                controls
              >
                <source src="/videos/The_TABS_Project.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="mt-4 text-center text-gray-600 font-medium">
              Introduction to The TABS Project
            </p>
          </div>
        </section>

        {/* Presentation Section */}
        <section className="py-[60px] bg-white">
          <div className="w-[90%] mx-auto max-w-[4096px]">
            <h2 className="text-[32px] font-bold mb-[20px] text-center">TABS Presentation</h2>
            <p className="text-[18px] text-gray-700 mb-[40px] text-center max-w-[800px] mx-auto">
              View our comprehensive presentation about the Technology Adoption Barriers Survey
              project, including our mission, methodology, and roadmap.
            </p>
            <div className="flex justify-center">
              <a
                href="/tabs-presentation"
                className="px-[40px] py-[15px] bg-teal-600 text-white font-semibold rounded-[30px] hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                View Presentation
              </a>
            </div>
          </div>
        </section>

        <section className="py-[100px] w-[90%] mx-auto max-w-[4096px]">
          <div className="grid md:grid-cols-2 gap-[40px]">
            {/* Media Inquiries */}
            <div className="bg-white p-[60px] rounded-[20px] shadow-xl text-center flex flex-col items-center justify-center">
              <h2 className="text-[32px] font-bold mb-[20px]">Media Inquiries</h2>
              <p className="text-[20px] text-gray-700 mb-[40px]">
                Page for media contacts and outcomes. Please check back regularly for updates.
              </p>
              <a
                href="mailto:contact@technologyadoptionbarriers.org"
                className="px-[40px] py-[15px] bg-blue-600 text-white font-semibold rounded-[30px] hover:bg-blue-700 transition-colors"
              >
                Contact Media Team
              </a>
            </div>

            {/* Press Kit */}
            <div className="bg-white p-[60px] rounded-[20px] shadow-xl">
              <h2 className="text-[32px] font-bold mb-[20px] text-center md:text-left">
                Press Kit
              </h2>
              <div className="space-y-[20px]">
                <div>
                  <h3 className="text-[20px] font-semibold mb-[10px]">About TABS</h3>
                  <p className="text-[16px] text-gray-700 leading-relaxed">
                    The Technology Adoption Barriers Survey (TABS) identifies and analyzes the
                    obstacles organizations face when implementing new technologies, providing
                    actionable insights for leaders.
                  </p>
                </div>
                <div>
                  <h3 className="text-[20px] font-semibold mb-[10px]">Resources</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-[5px]">
                    <li>Official Logos & Brand Assets</li>
                    <li>Research Methodologies</li>
                    <li>Latest Key Findings</li>
                  </ul>
                  <p className="text-[14px] text-gray-500 mt-[10px] italic">
                    * Downloadable assets coming soon. For immediate requests, please contact us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default MediaPage
