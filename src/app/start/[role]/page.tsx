import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPersonaBySlug, getPersonaSlugs } from '@/lib/personas'

type Props = {
  params: Promise<{ role: string }>
}

export async function generateStaticParams() {
  const slugs = getPersonaSlugs()
  return slugs.map((slug) => ({
    role: slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params
  const persona = getPersonaBySlug(role)

  if (!persona) {
    return {
      title: 'Role Not Found | TABS Survey',
    }
  }

  return {
    title: `${persona.title} | TABS Survey`,
    description: persona.description,
  }
}

export default async function RolePage({ params }: Props) {
  const { role } = await params
  const persona = getPersonaBySlug(role)

  if (!persona) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1a2b4b] to-[#2d4a73] text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="mb-[30px]">
            <Link
              href="/start"
              className="inline-flex items-center text-blue-200 hover:text-white transition-colors text-[16px]"
            >
              <span className="mr-[8px]">←</span>
              <span>Not your role? See all roles</span>
            </Link>
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            {persona.title}
          </h1>
          <p className="text-[20px] md:text-[24px] text-blue-100 max-w-[800px] leading-[1.6]">
            {persona.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-[60px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          {/* Why It Matters */}
          <div className="mb-[60px]">
            <h2 className="text-[36px] font-bold text-gray-900 mb-[30px] font-serif">
              Why Your Participation Matters
            </h2>
            <div className="bg-blue-50 rounded-[12px] p-[40px]">
              <ul className="space-y-[20px]">
                {persona.whyItMatters.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[#2583ab] text-[24px] mr-[15px] mt-[5px] flex-shrink-0">
                      ✓
                    </span>
                    <span className="text-[18px] text-gray-800 leading-[1.6]">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What You Get */}
          <div className="mb-[60px]">
            <h2 className="text-[36px] font-bold text-gray-900 mb-[30px] font-serif">
              What You&apos;ll Get in Return
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              {persona.whatYouGet.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-[12px] p-[30px] hover:border-[#2583ab] transition-colors"
                >
                  <div className="flex items-start">
                    <span className="text-[#F57C20] text-[24px] mr-[15px] mt-[5px] flex-shrink-0">
                      →
                    </span>
                    <span className="text-[16px] text-gray-800 leading-[1.6]">{benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#2583ab] to-[#2d4a73] rounded-[12px] p-[50px] text-center text-white">
            <h2 className="text-[36px] font-bold mb-[20px] font-serif">Ready to Participate?</h2>
            <p className="text-[18px] text-blue-100 mb-[30px] max-w-[600px] mx-auto">
              Your insights will help advance our understanding of technology adoption barriers and
              contribute to better organizational practices.
            </p>
            <a
              href={persona.surveyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[50px] py-[18px] bg-[#F57C20] text-white text-[20px] font-bold rounded-[6px] hover:bg-[#d66a1a] transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl"
            >
              Take the TABS Survey
            </a>
            <p className="text-[14px] text-blue-200 mt-[20px]">Takes approximately 15-20 minutes</p>
          </div>

          {/* Additional Info */}
          <div className="mt-[60px] text-center">
            <p className="text-[16px] text-gray-600 mb-[15px]">
              Have questions about the survey or your participation?
            </p>
            <Link
              href="/get-involved"
              className="text-[#2583ab] font-semibold hover:underline text-[16px]"
            >
              Learn more about TABS and how to get involved
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
