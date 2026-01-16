import React from 'react'
import Image from 'next/image'

const BottomCTA = () => {
  return (
    <section
      id="contact"
      className="w-full py-[100px] bg-[#1a2b4b] text-white relative overflow-hidden"
    >
      <div className="w-[90%] mx-auto max-w-[1080px] text-center relative z-10">
        {/* Neon Logo Effect placeholder - using text style or image if available */}
        <div className="mb-[40px] flex justify-center">
          {/* If we have the neon logo asset, we'd use it here. For now, text styled to match. 
               The browser agent said "Neon TABS logo graphic". 
               I'll use the main logo with a glow effect if extracting asset isn't easy, 
               but ideally uses TABS-Logo-Full with filter. */}
          <Image
            src="/Images/TABS-Logo-Full.png"
            alt="TABS Logo"
            width={300}
            height={120}
            className="brightness-0 invert drop-shadow-[0_0_15px_rgba(46,163,242,0.8)]"
          />
        </div>

        <h2 className="text-[48px] font-bold mb-[20px] font-serif tracking-wide">
          Get in Touch. Get Involved.
        </h2>
        <p className="text-[20px] text-blue-200 mb-[10px]">
          Do not hesitate to reach out with any question or to become part of the project.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-[40px] mt-[30px] mb-[60px] text-[18px] font-medium">
          <div>
            <span className="text-blue-400 block text-[14px] uppercase tracking-wider mb-1">
              Location
            </span>
            State College PA
          </div>
          <div className="hidden md:block w-[1px] h-[40px] bg-blue-800"></div>
          <div>
            <span className="text-blue-400 block text-[14px] uppercase tracking-wider mb-1">
              Phone
            </span>
            <a href="tel:5202228104" className="hover:text-blue-300 transition-colors">
              Call Us: (520) 222 8104
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-[20px]">
          <a
            href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
            target="_blank"
            rel="noopener noreferrer"
            className="px-[40px] py-[18px] bg-[#F57C20] text-white text-[18px] font-bold rounded-[4px] hover:bg-[#d66a1a] transition-all duration-300 uppercase tracking-widest"
          >
            TAKE THE TABS
          </a>
          <a
            href="#"
            className="px-[40px] py-[18px] bg-[#2EA3F2] text-white text-[18px] font-bold rounded-[4px] hover:bg-[#2589cc] transition-all duration-300 uppercase tracking-widest"
          >
            MAKE A DONATION
          </a>
        </div>
      </div>
    </section>
  )
}

export default BottomCTA
