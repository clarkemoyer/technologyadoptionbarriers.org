import React from 'react'

/**
 * Get Involved Section
 * Simple text section matching live site
 */
const GetInvolved = () => {
  return (
    <section id="get-involved" className="w-full py-[60px] bg-white">
      <div className="w-[90%] mx-auto max-w-[4096px] text-center">
        <h2 className="text-[42px] font-bold text-gray-900 mb-[20px] font-serif">
          How You Can Get Involved
        </h2>

        {/* Phone Number - Key missing element restoring from live site */}
        <p className="text-[20px] text-gray-700 mb-[5px]">Call or Text Clarke Moyer at</p>
        <p className="text-[24px] font-bold text-[#26C699] mb-[20px] font-serif">520-222-8104</p>

        <p className="text-[20px] text-gray-700 max-w-[800px] mx-auto leading-[1.6]">
          Support technology adoption research through participation, funding, or volunteering.
        </p>
      </div>
    </section>
  )
}

export default GetInvolved
