import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Finance Leaders | TABS',
  description:
    'Partner with TABS to support your CFO and finance executive members. Help finance leaders understand technology ROI and adoption barriers.',
}

const FinanceLeadersPage = () => {
  const organizations = [
    {
      name: 'FEI',
      fullName: 'Financial Executives International',
      focus: 'CFOs, Controllers, and senior financial executives',
      url: 'https://www.financialexecutives.org/',
    },
    {
      name: 'IMA',
      fullName: 'Institute of Management Accountants',
      focus: 'Management accountants and financial professionals',
      url: 'https://www.imanet.org/',
    },
    {
      name: 'AFP',
      fullName: 'Association for Financial Professionals',
      focus: 'Treasury and finance professionals',
      url: 'https://www.afponline.org/',
    },
    {
      name: 'AICPA',
      fullName: 'American Institute of CPAs',
      focus: 'Certified Public Accountants and financial advisors',
      url: 'https://www.aicpa.org/',
    },
    {
      name: 'CFO Executive Network',
      fullName: 'CFO Executive Network',
      focus: 'Chief Financial Officers and senior finance leaders',
      url: 'https://www.cfoexecutivenetwork.com/',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-900 to-green-700 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="mb-[30px]">
            <Link
              href="/for-organizations"
              className="text-green-200 hover:text-white transition-colors text-[16px]"
            >
              ← Back to All Organizations
            </Link>
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            For Finance Leaders
          </h1>
          <p className="text-[24px] text-green-100 mb-[15px] font-semibold">
            CFO • Controller • VP Finance • Treasurer • Financial Planning & Analysis
          </p>
          <p className="text-[18px] text-green-100 max-w-[900px] leading-[1.6]">
            Support your members in understanding technology investment barriers and demonstrating
            ROI on digital transformation initiatives.
          </p>
        </div>
      </section>

      {/* Value Proposition for Finance Leaders */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[40px] text-center font-serif">
            Why Finance Leaders Need TABS Insights
          </h2>

          <div className="grid md:grid-cols-3 gap-[30px] mb-[60px]">
            <div className="bg-green-50 p-[30px] rounded-[12px] border-2 border-green-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="ROI">
                  💰
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">
                Technology ROI Challenges
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                CFOs need to justify technology investments and understand why some initiatives fail
                to deliver expected returns. TABS provides data on common adoption barriers that
                impact ROI.
              </p>
            </div>

            <div className="bg-green-50 p-[30px] rounded-[12px] border-2 border-green-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Budget">
                  📊
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Budget Planning</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Understanding industry-wide adoption barriers helps finance leaders allocate budgets
                more effectively and set realistic expectations for technology initiative timelines.
              </p>
            </div>

            <div className="bg-green-50 p-[30px] rounded-[12px] border-2 border-green-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Risk">
                  ⚖️
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Risk Assessment</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Finance leaders can better assess risks associated with technology investments by
                understanding common failure points and barriers across different industries.
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
            By participating in the TABS survey, your finance leader members gain valuable insights
            for technology investment decisions.
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                💼 Investment Justification Data
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Access industry benchmarks and insights that help justify technology investments to
                boards and stakeholders, backed by comprehensive research data.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                📈 ROI Improvement Insights
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Understand common barriers that prevent technology initiatives from delivering
                expected ROI, enabling better planning and resource allocation.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🎯 Peer Benchmarking
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Compare their organization&apos;s technology adoption challenges against industry
                peers, providing context for budget discussions and planning.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🤝 IT-Finance Alignment
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Gain insights that improve collaboration with technology teams by understanding
                their challenges and building better business cases together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Organizations */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            Professional Organizations for Finance Leaders
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[900px] mx-auto">
            These leading organizations serve CFOs, Controllers, and finance executives. If your
            organization serves finance leaders, partnering with TABS provides significant value to
            your members.
          </p>

          <div className="space-y-[25px]">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="bg-gray-50 p-[30px] rounded-[12px] border-l-4 border-green-600 hover:shadow-md transition-shadow"
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
                    className="inline-block px-[25px] py-[12px] bg-green-600 hover:bg-green-700 text-white rounded-[6px] font-semibold text-[14px] transition-colors text-center md:text-left whitespace-nowrap"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[50px] bg-green-50 p-[40px] rounded-[12px] border-2 border-green-200">
            <h3 className="text-[24px] font-bold text-gray-900 mb-[15px] text-center">
              Is your organization missing from this list?
            </h3>
            <p className="text-[16px] text-gray-700 text-center mb-[25px]">
              We&apos;re actively seeking partnerships with professional organizations serving
              finance leaders.
            </p>
            <div className="text-center">
              <a
                href="mailto:clarke@technologyadoptionbarriers.org?subject=Finance%20Leader%20Organization%20Partnership"
                className="inline-block px-[35px] py-[16px] bg-green-600 hover:bg-green-700 text-white rounded-[6px] font-bold text-[16px] transition-colors"
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
      <section className="bg-green-900 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[40px] font-bold mb-[20px] font-serif">
            Ready to Support Your Finance Leaders?
          </h2>
          <p className="text-[18px] text-green-100 mb-[40px] leading-[1.6]">
            Partner with TABS to provide your CFO and finance executive members with valuable
            insights on technology ROI and adoption barriers.
          </p>
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center">
            <a
              href="mailto:clarke@technologyadoptionbarriers.org?subject=Finance%20Leaders%20Partnership%20Inquiry"
              className="inline-block px-[40px] py-[18px] bg-white text-green-900 rounded-[6px] font-bold text-[18px] hover:bg-green-50 transition-colors"
            >
              Start Partnership Discussion
            </a>
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[40px] py-[18px] border-2 border-white text-white rounded-[6px] font-bold text-[18px] hover:bg-white hover:text-green-900 transition-colors"
            >
              Preview the Survey
            </a>
          </div>
          <p className="text-[16px] text-green-100 mt-[30px]">
            Questions? Call or text Clarke Moyer at{' '}
            <a
              href="tel:5202228104"
              className="font-bold text-white hover:text-green-200 transition-colors"
            >
              (520) 222-8104
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default FinanceLeadersPage
