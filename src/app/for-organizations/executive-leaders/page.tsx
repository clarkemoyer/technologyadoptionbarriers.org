import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Executive Leaders | TABS',
  description:
    'Partner with TABS to support your CEO and C-suite executive members. Help executive leaders set strategic direction for technology adoption.',
}

const ExecutiveLeadersPage = () => {
  const organizations = [
    {
      name: 'YPO',
      fullName: "Young Presidents' Organization",
      focus: 'Chief executives and business leaders under 45',
      url: 'https://www.ypo.org/',
    },
    {
      name: 'Vistage',
      fullName: 'Vistage Worldwide',
      focus: 'CEOs, business owners, and senior executives',
      url: 'https://www.vistage.com/',
    },
    {
      name: 'C-Suite Network',
      fullName: 'C-Suite Network',
      focus: 'C-level executives across all industries',
      url: 'https://c-suitenetwork.com/',
    },
    {
      name: 'Chief',
      fullName: 'Chief Executive Group',
      focus: 'Women in executive leadership',
      url: 'https://chief.com/',
    },
    {
      name: 'ACG',
      fullName: 'Association for Corporate Growth',
      focus: 'Corporate development and growth executives',
      url: 'https://www.acg.org/',
    },
    {
      name: 'EO',
      fullName: "Entrepreneurs' Organization",
      focus: 'Entrepreneurs and business owners',
      url: 'https://www.eonetwork.org/',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-900 to-purple-700 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="mb-[30px]">
            <Link
              href="/for-organizations"
              className="text-purple-200 hover:text-white transition-colors text-[16px]"
            >
              ← Back to All Organizations
            </Link>
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            For Executive Leaders
          </h1>
          <p className="text-[24px] text-purple-100 mb-[15px] font-semibold">
            CEO • President • Board Members • Managing Directors • Business Owners
          </p>
          <p className="text-[18px] text-purple-100 max-w-[900px] leading-[1.6]">
            Support your members in setting strategic direction for technology adoption and
            understanding enterprise-wide barriers to digital transformation.
          </p>
        </div>
      </section>

      {/* Value Proposition for Executive Leaders */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[40px] text-center font-serif">
            Why Executive Leaders Need TABS Insights
          </h2>

          <div className="grid md:grid-cols-3 gap-[30px] mb-[60px]">
            <div className="bg-purple-50 p-[30px] rounded-[12px] border-2 border-purple-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Strategy">
                  🎯
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Strategic Direction</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                CEOs and Presidents set the vision for technology adoption. Understanding common
                barriers across industries helps them make informed strategic decisions and allocate
                resources effectively.
              </p>
            </div>

            <div className="bg-purple-50 p-[30px] rounded-[12px] border-2 border-purple-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Competitive advantage">
                  🏆
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">
                Competitive Advantage
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Executive leaders need to understand how technology adoption impacts market
                position. TABS provides insights into what separates successful digital
                transformations from failures.
              </p>
            </div>

            <div className="bg-purple-50 p-[30px] rounded-[12px] border-2 border-purple-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Board relations">
                  📊
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Board Relations</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Access industry-validated data to support board discussions about technology
                investments, digital transformation initiatives, and strategic technology decisions.
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
            By participating in the TABS survey, your executive leader members gain strategic
            insights for technology decision-making.
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🎯 Strategic Planning Data
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Gain access to comprehensive research on technology adoption barriers to inform
                long-term strategic planning and digital transformation roadmaps.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                📈 Industry Benchmarks
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Compare their organization&apos;s technology adoption maturity against industry
                peers, identifying competitive advantages and areas for improvement.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                💼 Executive Communication Tools
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Leverage industry-validated insights to communicate technology strategy to boards,
                investors, and stakeholders with confidence.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🤝 Thought Leadership
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Position themselves as forward-thinking leaders by contributing to and leveraging
                cutting-edge research on technology adoption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Organizations */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            Professional Organizations for Executive Leaders
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[900px] mx-auto">
            These leading organizations serve CEOs, Presidents, and C-suite executives. If your
            organization serves executive leaders, partnering with TABS provides significant value
            to your members.
          </p>

          <div className="space-y-[25px]">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="bg-gray-50 p-[30px] rounded-[12px] border-l-4 border-purple-600 hover:shadow-md transition-shadow"
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
                    className="inline-block px-[25px] py-[12px] bg-purple-600 hover:bg-purple-700 text-white rounded-[6px] font-semibold text-[14px] transition-colors text-center md:text-left whitespace-nowrap"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[50px] bg-purple-50 p-[40px] rounded-[12px] border-2 border-purple-200">
            <h3 className="text-[24px] font-bold text-gray-900 mb-[15px] text-center">
              Is your organization missing from this list?
            </h3>
            <p className="text-[16px] text-gray-700 text-center mb-[25px]">
              We&apos;re actively seeking partnerships with professional organizations serving
              executive leaders.
            </p>
            <div className="text-center">
              <a
                href="mailto:clarke@technologyadoptionbarriers.org?subject=Executive%20Leader%20Organization%20Partnership"
                className="inline-block px-[35px] py-[16px] bg-purple-600 hover:bg-purple-700 text-white rounded-[6px] font-bold text-[16px] transition-colors"
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
      <section className="bg-purple-900 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[40px] font-bold mb-[20px] font-serif">
            Ready to Support Your Executive Leaders?
          </h2>
          <p className="text-[18px] text-purple-100 mb-[40px] leading-[1.6]">
            Partner with TABS to provide your CEO and C-suite executive members with strategic
            insights on technology adoption.
          </p>
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center">
            <a
              href="mailto:clarke@technologyadoptionbarriers.org?subject=Executive%20Leaders%20Partnership%20Inquiry"
              className="inline-block px-[40px] py-[18px] bg-white text-purple-900 rounded-[6px] font-bold text-[18px] hover:bg-purple-50 transition-colors"
            >
              Start Partnership Discussion
            </a>
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[40px] py-[18px] border-2 border-white text-white rounded-[6px] font-bold text-[18px] hover:bg-white hover:text-purple-900 transition-colors"
            >
              Preview the Survey
            </a>
          </div>
          <p className="text-[16px] text-purple-100 mt-[30px]">
            Questions? Call or text Clarke Moyer at{' '}
            <a
              href="tel:5202228104"
              className="font-bold text-white hover:text-purple-200 transition-colors"
            >
              (520) 222-8104
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default ExecutiveLeadersPage
