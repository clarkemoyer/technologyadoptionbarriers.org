import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Professional Organizations | TABS',
  description:
    'Partner with TABS to provide your members with valuable technology adoption insights. Learn how professional organizations can support their members through the Technology Adoption Barriers Survey.',
}

const ForOrganizationsPage = () => {
  const personaPages = [
    {
      id: 'technology-leaders',
      title: 'Technology Leaders',
      subtitle: 'CTO, CIO, CISO',
      icon: '💻',
      description:
        'Organizations serving technology executives who drive digital transformation and innovation.',
      path: '/for-organizations/technology-leaders',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'finance-leaders',
      title: 'Finance Leaders',
      subtitle: 'CFO, Controller, VP Finance',
      icon: '💰',
      description:
        'Organizations serving finance executives who manage technology investments and ROI.',
      path: '/for-organizations/finance-leaders',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'operations-leaders',
      title: 'Operations Leaders',
      subtitle: 'COO, VP Operations',
      icon: '⚙️',
      description:
        'Organizations serving operations executives who implement and scale technology solutions.',
      path: '/for-organizations/operations-leaders',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      id: 'executive-leaders',
      title: 'Executive Leaders',
      subtitle: 'CEO, President, Board Members',
      icon: '🎯',
      description:
        'Organizations serving C-suite executives who set strategic direction for technology adoption.',
      path: '/for-organizations/executive-leaders',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1a2b4b] to-[#2d4a73] text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px] text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            Partner with TABS
          </h1>
          <p className="text-[20px] md:text-[24px] text-blue-100 max-w-[900px] mx-auto leading-[1.6]">
            Provide your members with valuable insights into technology adoption barriers while
            contributing to groundbreaking research.
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[30px] text-center font-serif">
            Why Professional Organizations Partner with TABS
          </h2>

          <div className="grid md:grid-cols-2 gap-[40px] mb-[60px]">
            <div className="bg-gray-50 p-[30px] rounded-[12px]">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Members benefit">
                  🌟
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                Deliver Member Value
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Your members receive comprehensive reports and benchmarking data that help them make
                better technology decisions. They gain insights into industry trends and compare
                their challenges against peers.
              </p>
            </div>

            <div className="bg-gray-50 p-[30px] rounded-[12px]">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Thought leadership">
                  📊
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                Strengthen Thought Leadership
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Position your organization as a leader in understanding technology adoption
                challenges. Access exclusive data and insights to share with your community.
              </p>
            </div>

            <div className="bg-gray-50 p-[30px] rounded-[12px]">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Research support">
                  🔬
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                Support Critical Research
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Help advance the understanding of technology adoption barriers across industries.
                Your members&apos; participation contributes to a longitudinal dataset that benefits
                the entire professional community.
              </p>
            </div>

            <div className="bg-gray-50 p-[30px] rounded-[12px]">
              <div className="text-[48px] mb-[15px]">
                <span role="img" aria-label="Easy engagement">
                  ✅
                </span>
              </div>
              <h3 className="text-[24px] font-bold text-gray-900 mb-[15px]">
                Easy Member Engagement
              </h3>
              <p className="text-[16px] text-gray-700 leading-[1.7]">
                Simple 15-20 minute survey that respects your members&apos; time. We provide
                ready-to-use email templates and promotional materials to make outreach effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Persona-Specific Pages */}
      <section className="py-[80px] bg-gray-100">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[20px] text-center font-serif">
            Find Your Member Audience
          </h2>
          <p className="text-[18px] text-gray-700 text-center mb-[50px] max-w-[800px] mx-auto">
            Select the leadership category that best matches your organization&apos;s membership to
            see targeted benefits and relevant professional associations.
          </p>

          <div className="grid md:grid-cols-2 gap-[30px]">
            {personaPages.map((persona) => (
              <Link
                key={persona.id}
                href={persona.path}
                className="bg-white p-[40px] rounded-[12px] shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="text-[64px] mb-[15px]">
                  <span role="img" aria-label={`${persona.title} icon`}>
                    {persona.icon}
                  </span>
                </div>
                <h3 className="text-[28px] font-bold text-gray-900 mb-[10px]">{persona.title}</h3>
                <p className="text-[16px] text-gray-600 mb-[15px] font-semibold">
                  {persona.subtitle}
                </p>
                <p className="text-[16px] text-gray-700 leading-[1.7] mb-[20px]">
                  {persona.description}
                </p>
                <span
                  className={`inline-block px-[25px] py-[12px] ${persona.color} text-white rounded-[6px] font-bold text-[16px] transition-colors`}
                >
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-[80px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <h2 className="text-[40px] font-bold text-gray-900 mb-[40px] text-center font-serif">
            Partnership Benefits
          </h2>

          <div className="space-y-[30px]">
            <div className="flex gap-[20px]">
              <div className="text-[32px] flex-shrink-0">
                <span role="img" aria-label="Recognition">
                  🏆
                </span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">
                  Recognition as Research Partner
                </h3>
                <p className="text-[16px] text-gray-700 leading-[1.7]">
                  Your organization will be acknowledged in research publications, reports, and on
                  the TABS website as a supporting partner.
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="text-[32px] flex-shrink-0">
                <span role="img" aria-label="Early access">
                  🎯
                </span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">
                  Early Access to Findings
                </h3>
                <p className="text-[16px] text-gray-700 leading-[1.7]">
                  Receive aggregate findings and insights before public release, allowing you to
                  provide exclusive value to your members.
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="text-[32px] flex-shrink-0">
                <span role="img" aria-label="Materials">
                  📧
                </span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">
                  Ready-to-Use Promotional Materials
                </h3>
                <p className="text-[16px] text-gray-700 leading-[1.7]">
                  We provide email templates, social media posts, and website content that you can
                  customize to promote the survey to your members.
                </p>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div className="text-[32px] flex-shrink-0">
                <span role="img" aria-label="No cost">
                  💡
                </span>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-[10px]">
                  No Cost Partnership
                </h3>
                <p className="text-[16px] text-gray-700 leading-[1.7]">
                  There is no fee to partner with TABS. This is a value-add service you can offer
                  your members at no cost to your organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#0E7162] text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[40px] font-bold mb-[20px] font-serif">
            Ready to Partner with TABS?
          </h2>
          <p className="text-[18px] text-green-100 mb-[40px] leading-[1.6]">
            Join leading professional organizations in supporting technology adoption research and
            delivering value to your members.
          </p>
          <div className="flex flex-col sm:flex-row gap-[20px] justify-center">
            <a
              href="mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Partnership%20Inquiry"
              className="inline-block px-[40px] py-[18px] bg-white text-[#0E7162] rounded-[6px] font-bold text-[18px] hover:bg-gray-100 transition-colors"
            >
              Contact Us About Partnership
            </a>
            <a
              href="/get-involved"
              className="inline-block px-[40px] py-[18px] border-2 border-white text-white rounded-[6px] font-bold text-[18px] hover:bg-white hover:text-[#0E7162] transition-colors"
            >
              View All Ways to Support
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

export default ForOrganizationsPage
