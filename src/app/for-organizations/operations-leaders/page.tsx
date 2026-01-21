import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Operations Leaders | TABS',
  description:
    'Partner with TABS to support your COO and operations executive members. Help operations leaders optimize technology implementation and scaling.',
}

const OperationsLeadersPage = () => {
  const organizations = [
    {
      name: 'APICS',
      fullName: 'Association for Supply Chain Management',
      focus: 'Supply chain and operations professionals',
      url: 'https://www.ascm.org/',
    },
    {
      name: 'CSCMP',
      fullName: 'Council of Supply Chain Management Professionals',
      focus: 'Supply chain and logistics professionals',
      url: 'https://cscmp.org/',
    },
    {
      name: 'ASQ',
      fullName: 'American Society for Quality',
      focus: 'Quality management and operations excellence',
      url: 'https://asq.org/',
    },
    {
      name: 'IISE',
      fullName: 'Institute of Industrial and Systems Engineers',
      focus: 'Industrial engineering and operations optimization',
      url: 'https://www.iise.org/',
    },
    {
      name: 'OPEX Society',
      fullName: 'Operational Excellence Society',
      focus: 'Operational excellence and continuous improvement',
      url: 'https://www.opexsociety.org/',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-900 to-orange-700 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="mb-[30px]">
            <Link
              href="/for-organizations"
              className="text-orange-200 hover:text-white transition-colors text-[16px]"
            >
              ← Back to All Organizations
            </Link>
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            For Operations Leaders
          </h1>
          <p className="text-[24px] text-orange-100 mb-[15px] font-semibold">
            COO • VP Operations • Supply Chain Leaders • Manufacturing Leaders
          </p>
          <p className="text-[18px] text-orange-100 max-w-[900px] leading-[1.6]">
            Support your members in understanding technology implementation barriers and optimizing
            operational processes through data-driven insights.
          </p>
        </div>
      </section>

      {/* Value Proposition for Operations Leaders */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[40px] text-center font-serif">
            Why Operations Leaders Need TABS Insights
          </h2>

          <div className="grid md:grid-cols-3 gap-[30px] mb-[60px]">
            <div className="bg-orange-50 p-[30px] rounded-[12px] border-2 border-orange-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Implementation">
                  ⚙️
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">
                Implementation Challenges
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                COOs must implement technology solutions across complex operational environments.
                TABS provides insights into common barriers that prevent successful technology
                rollouts.
              </p>
            </div>

            <div className="bg-orange-50 p-[30px] rounded-[12px] border-2 border-orange-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Scaling">
                  📈
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Scaling Operations</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Understanding adoption barriers helps operations leaders plan for scaling technology
                solutions across departments, facilities, and geographic regions.
              </p>
            </div>

            <div className="bg-orange-50 p-[30px] rounded-[12px] border-2 border-orange-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Efficiency">
                  🎯
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Process Efficiency</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Identify and address adoption barriers that prevent technology from delivering
                expected efficiency gains and operational improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Member Benefits */}
      <section className="py-[80px] bg-gray-50">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            What Your Members Receive
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[800px] mx-auto">
            By participating in the TABS survey, your operations leader members gain valuable
            insights for technology implementation and scaling.
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🚀 Implementation Best Practices
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Learn from industry data about common implementation barriers and successful
                strategies for overcoming them during technology rollouts.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                📊 Operational Benchmarks
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Compare their organization&apos;s technology adoption challenges against operational
                peers to identify improvement opportunities.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🔧 Change Management Insights
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Understand workforce adoption barriers to develop better change management
                strategies for technology initiatives.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                💡 Cross-Functional Collaboration
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Gain insights that improve collaboration with IT, finance, and other teams by
                understanding common technology adoption challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Organizations */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            Professional Organizations for Operations Leaders
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[900px] mx-auto">
            These leading organizations serve COOs, VPs of Operations, and operational executives.
            If your organization serves operations leaders, partnering with TABS provides
            significant value to your members.
          </p>

          <div className="space-y-[25px]">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="bg-gray-50 p-[30px] rounded-[12px] border-l-4 border-orange-600 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[15px]">
                  <div className="flex-1">
                    <h3 className="text-[22px] font-bold text-gray-900 mb-[5px]">{org.name}</h3>
                    <p className="text-[16px] text-gray-600 mb-[10px]">{org.fullName}</p>
                    <p className="text-[15px] text-gray-700">
                      <strong>Focus:</strong> {org.focus}
                    </p>
                  </div>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-[25px] py-[12px] bg-orange-600 hover:bg-orange-700 text-white rounded-[6px] font-semibold text-[14px] transition-colors text-center md:text-left whitespace-nowrap"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[50px] bg-orange-50 p-[40px] rounded-[12px] border-2 border-orange-200">
            <h3 className="text-[24px] font-bold text-gray-900 mb-[15px] text-center">
              Is your organization missing from this list?
            </h3>
            <p className="text-[16px] text-gray-700 text-center mb-[25px]">
              We&apos;re actively seeking partnerships with professional organizations serving
              operations leaders.
            </p>
            <div className="text-center">
              <a
                href="mailto:clarke@technologyadoptionbarriers.org?subject=Operations%20Leader%20Organization%20Partnership"
                className="inline-block px-[35px] py-[16px] bg-orange-600 hover:bg-orange-700 text-white rounded-[6px] font-bold text-[16px] transition-colors"
              >
                Contact Us About Partnership
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[80px] bg-gray-100">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[50px] text-center font-serif">
            How Partnership Works
          </h2>

          <div className="grid md:grid-cols-4 gap-[30px]">
            <div className="text-center">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Step 1">
                  1️⃣
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">Initial Contact</h3>
              <p className="text-[15px] text-gray-700 leading-[1.6]">
                Reach out to discuss partnership opportunities and how TABS can benefit your
                members.
              </p>
            </div>

            <div className="text-center">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Step 2">
                  2️⃣
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">Receive Materials</h3>
              <p className="text-[15px] text-gray-700 leading-[1.6]">
                Get customized email templates, social media content, and promotional materials for
                your members.
              </p>
            </div>

            <div className="text-center">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Step 3">
                  3️⃣
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">Promote Survey</h3>
              <p className="text-[15px] text-gray-700 leading-[1.6]">
                Share the survey with your members through your preferred channels (email,
                newsletter, events).
              </p>
            </div>

            <div className="text-center">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Step 4">
                  4️⃣
                </span>
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">Share Insights</h3>
              <p className="text-[15px] text-gray-700 leading-[1.6]">
                Receive early access to findings and share exclusive insights with your member
                community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-orange-900 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[40px] font-bold mb-[20px] font-serif">
            Ready to Support Your Operations Leaders?
          </h2>
          <p className="text-[18px] text-orange-100 mb-[40px] leading-[1.6]">
            Partner with TABS to provide your COO and operations executive members with valuable
            insights on technology implementation and scaling.
          </p>
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center">
            <a
              href="mailto:clarke@technologyadoptionbarriers.org?subject=Operations%20Leaders%20Partnership%20Inquiry"
              className="inline-block px-[40px] py-[18px] bg-white text-orange-900 rounded-[6px] font-bold text-[18px] hover:bg-orange-50 transition-colors"
            >
              Start Partnership Discussion
            </a>
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[40px] py-[18px] border-2 border-white text-white rounded-[6px] font-bold text-[18px] hover:bg-white hover:text-orange-900 transition-colors"
            >
              Preview the Survey
            </a>
          </div>
          <p className="text-[16px] text-orange-100 mt-[30px]">
            Questions? Call or text Clarke Moyer at{' '}
            <a
              href="tel:5202228104"
              className="font-bold text-white hover:text-orange-200 transition-colors"
            >
              (520) 222-8104
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default OperationsLeadersPage
