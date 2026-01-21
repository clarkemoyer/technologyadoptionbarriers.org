import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { personas } from '@/lib/personas'

export const metadata: Metadata = {
  title: 'Find Your Role | TABS Survey',
  description:
    'Select your leadership role to see how your participation in the Technology Adoption Barriers Survey can provide valuable insights for your position and industry.',
}

const StartPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1a2b4b] to-[#2d4a73] text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px] text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            See Yourself in the Survey
          </h1>
          <p className="text-[20px] md:text-[24px] text-blue-100 max-w-[800px] mx-auto leading-[1.6]">
            Your leadership role shapes how you experience technology adoption. Select your role
            below to learn how your participation matters.
          </p>
        </div>
      </section>

      {/* Persona Grid */}
      <section className="py-[60px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="text-center mb-[50px]">
            <h2 className="text-[36px] font-bold text-gray-900 mb-[20px] font-serif">
              Select Your Role
            </h2>
            <p className="text-[18px] text-gray-700 max-w-[700px] mx-auto leading-[1.6]">
              Each leadership role brings unique insights to technology adoption. Choose your role
              to see why your perspective matters.
            </p>
          </div>

          {/* Grid of Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-[60px]">
            {personas.map((persona) => (
              <Link
                key={persona.id}
                href={`/start/${persona.slug}`}
                className="group bg-white border-2 border-gray-200 rounded-[12px] p-[30px] hover:border-[#2583ab] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-[24px] font-bold text-gray-900 mb-[10px] group-hover:text-[#2583ab] transition-colors">
                    {persona.shortTitle}
                  </h3>
                  <p className="text-[16px] text-gray-600 mb-[5px]">{persona.title}</p>
                  <div className="mt-auto pt-[15px]">
                    <span className="text-[#2583ab] font-semibold text-[14px] group-hover:underline">
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Alternative CTA */}
          <div className="bg-blue-50 rounded-[12px] p-[40px] text-center">
            <h3 className="text-[28px] font-bold text-gray-900 mb-[15px]">
              Not Sure Which Role to Choose?
            </h3>
            <p className="text-[16px] text-gray-700 mb-[25px] max-w-[600px] mx-auto">
              No problem! You can take the survey directly. The first question will ask about your
              role, and you can select the option that best fits your position.
            </p>
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[40px] py-[16px] bg-[#F57C20] text-white text-[18px] font-bold rounded-[6px] hover:bg-[#d66a1a] transition-all duration-300 uppercase tracking-wide"
            >
              Take the Survey Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StartPage
