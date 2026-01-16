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
        <section className="py-[100px] w-[90%] mx-auto max-w-[4096px]">
          <div className="bg-white p-[60px] rounded-[20px] shadow-xl text-center">
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
        </section>
      </main>
    </>
  )
}

export default MediaPage
