import React from 'react'

/**
 * Get Involved Section
 * Simple text section matching live site
 */
const GetInvolved = () => {
  return (
    <section id="get-involved" className="w-full py-[60px] bg-white">
      <div className="w-[90%] mx-auto max-w-[1080px] text-center">
        <h2 className="text-[42px] font-bold text-gray-900 mb-[20px] font-serif">
          How You Can Get Involved
        </h2>

        {/* Phone Number - Key missing element restoring from live site */}
        <p className="text-[24px] font-bold text-[#0E7162] mb-[20px]">(571) 257-6411</p>

        <p className="text-[20px] text-gray-700 max-w-[800px] mx-auto leading-[1.6]">
          Support technology adoption research through participation, funding, or volunteering.
        </p>
      </div>
    </section>
  )
}

export default GetInvolved
