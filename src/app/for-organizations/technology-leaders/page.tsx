import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Technology Leaders | TABS',
  description:
    'Partner with TABS to support your CTO, CIO, and CISO members. Help technology leaders benchmark their technology adoption challenges and gain valuable insights.',
}

const TechnologyLeadersPage = () => {
  const organizations = [
    {
      name: '(ISC)²',
      fullName: 'International Information System Security Certification Consortium',
      focus: 'Cybersecurity professionals and CISOs',
      url: 'https://www.isc2.org/',
    },
    {
      name: 'ISACA',
      fullName: 'Information Systems Audit and Control Association',
      focus: 'IT governance, risk management, and cybersecurity professionals',
      url: 'https://www.isaca.org/',
    },
    {
      name: 'CIO Executive Council',
      fullName: 'CIO Executive Council',
      focus: 'Chief Information Officers and senior IT executives',
      url: 'https://www.cioexecutivecouncil.com/',
    },
    {
      name: 'SIM',
      fullName: 'Society for Information Management',
      focus: 'IT leaders and executives in the information management field',
      url: 'https://www.simnet.org/',
    },
    {
      name: 'CompTIA',
      fullName: 'Computing Technology Industry Association',
      focus: 'IT professionals and technology leaders',
      url: 'https://www.comptia.org/',
    },
    {
      name: 'ISSA',
      fullName: 'Information Systems Security Association',
      focus: 'Information security professionals and security leaders',
      url: 'https://www.issa.org/',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-700 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="mb-[30px]">
            <Link
              href="/for-organizations"
              className="text-blue-200 hover:text-white transition-colors text-[16px]"
            >
              ← Back to All Organizations
            </Link>
          </div>
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            For Technology Leaders
          </h1>
          <p className="text-[24px] text-blue-100 mb-[15px] font-semibold">
            CTO • CIO • CISO • VP of Engineering • VP of Technology
          </p>
          <p className="text-[18px] text-blue-100 max-w-[900px] leading-[1.6]">
            Support your members in understanding and overcoming technology adoption barriers while
            contributing to groundbreaking research in digital transformation.
          </p>
        </div>
      </section>

      {/* Value Proposition for Technology Leaders */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[40px] text-center font-serif">
            Why Technology Leaders Need TABS Insights
          </h2>

          <div className="grid md:grid-cols-3 gap-[30px] mb-[60px]">
            <div className="bg-blue-50 p-[30px] rounded-[12px] border-2 border-blue-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Digital transformation">
                  🚀
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">
                Digital Transformation Challenges
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                CTOs and CIOs face constant pressure to deliver innovation while managing legacy
                systems. TABS provides data-driven insights into what actually prevents successful
                technology adoption across industries.
              </p>
            </div>

            <div className="bg-blue-50 p-[30px] rounded-[12px] border-2 border-blue-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Security">
                  🔒
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">
                Security & Risk Management
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                CISOs need to balance security requirements with business enablement. Understanding
                common barriers helps design security programs that enable rather than block
                technology adoption.
              </p>
            </div>

            <div className="bg-blue-50 p-[30px] rounded-[12px] border-2 border-blue-200">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Benchmarking">
                  📊
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-[15px]">Peer Benchmarking</h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Technology leaders can compare their challenges against industry peers, validate
                their strategies, and identify opportunities to improve their technology adoption
                processes.
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
            By participating in the TABS survey, your technology leader members gain valuable
            insights and contribute to industry knowledge.
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                📈 Comprehensive Benchmark Reports
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Receive detailed reports showing how their organization&apos;s technology adoption
                challenges compare to industry trends, helping justify technology investments and
                strategic initiatives.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🎯 Strategic Planning Insights
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Gain data-driven insights to inform technology roadmaps, prioritize initiatives, and
                build business cases for overcoming adoption barriers.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🤝 Stakeholder Communication Tools
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Access industry-validated data to communicate with boards, executives, and teams
                about technology adoption challenges and solutions.
              </p>
            </div>

            <div className="bg-white p-[30px] rounded-[12px] shadow-md">
              <h3 className="text-[20px] font-bold text-gray-900 mb-[15px]">
                🔬 Contribute to Research
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Help build a longitudinal dataset that advances understanding of technology adoption
                across industries, positioning themselves as thought leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Organizations */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            Professional Organizations for Technology Leaders
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[900px] mx-auto">
            These leading organizations serve CTOs, CIOs, CISOs, and technology executives. If your
            organization serves technology leaders, partnering with TABS provides significant value
            to your members.
          </p>

          <div className="space-y-[25px]">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="bg-gray-50 p-[30px] rounded-[12px] border-l-4 border-blue-600 hover:shadow-md transition-shadow"
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
                    className="inline-block px-[25px] py-[12px] bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] font-semibold text-[14px] transition-colors text-center md:text-left whitespace-nowrap"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[50px] bg-blue-50 p-[40px] rounded-[12px] border-2 border-blue-200">
            <h3 className="text-[24px] font-bold text-gray-900 mb-[15px] text-center">
              Is your organization missing from this list?
            </h3>
            <p className="text-[16px] text-gray-700 text-center mb-[25px]">
              We&apos;re actively seeking partnerships with professional organizations serving
              technology leaders.
            </p>
            <div className="text-center">
              <a
                href="mailto:clarke@technologyadoptionbarriers.org?subject=Technology%20Leader%20Organization%20Partnership"
                className="inline-block px-[35px] py-[16px] bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] font-bold text-[16px] transition-colors"
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
      <section className="bg-blue-900 text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[40px] font-bold mb-[20px] font-serif">
            Ready to Support Your Technology Leaders?
          </h2>
          <p className="text-[18px] text-blue-100 mb-[40px] leading-[1.6]">
            Partner with TABS to provide your CTO, CIO, and CISO members with valuable insights and
            benchmarking data.
          </p>
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center">
            <a
              href="mailto:clarke@technologyadoptionbarriers.org?subject=Technology%20Leaders%20Partnership%20Inquiry"
              className="inline-block px-[40px] py-[18px] bg-white text-blue-900 rounded-[6px] font-bold text-[18px] hover:bg-blue-50 transition-colors"
            >
              Start Partnership Discussion
            </a>
            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[40px] py-[18px] border-2 border-white text-white rounded-[6px] font-bold text-[18px] hover:bg-white hover:text-blue-900 transition-colors"
            >
              Preview the Survey
            </a>
          </div>
          <p className="text-[16px] text-blue-100 mt-[30px]">
            Questions? Call or text Clarke Moyer at{' '}
            <a
              href="tel:5202228104"
              className="font-bold text-white hover:text-blue-200 transition-colors"
            >
              (520) 222-8104
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default TechnologyLeadersPage
