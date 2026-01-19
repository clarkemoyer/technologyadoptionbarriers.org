import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Involved | TABS',
  description:
    'Discover all the ways you can support the Technology Adoption Barriers Survey (TABS) - from taking the survey to volunteering, donating, or using our dataset in your research.',
}

const GetInvolvedPage = () => {
  const opportunities = [
    {
      id: 'take-survey',
      title: 'Take the TABS Survey',
      icon: '📋',
      description:
        'The most direct way to contribute is by participating in the survey. Your insights as a senior leader help identify common technology adoption barriers and create valuable benchmarks for the industry.',
      whoShouldParticipate:
        'Senior leaders, executives, and decision-makers in organizations of any size who deal with technology adoption challenges.',
      commitment: '15-20 minutes to complete the survey',
      benefits: [
        'Receive summary reports and key findings from aggregated data',
        'Benchmark your organization against industry trends',
        'Contribute to advancing technology adoption research',
      ],
      cta: {
        text: 'Take the Survey',
        link: 'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO',
        color: 'bg-[#F57C20] hover:bg-[#d66a1a]',
      },
    },
    {
      id: 'contribute-general',
      title: 'Contribute to the General Fund',
      icon: '💵',
      description:
        'Support the ongoing operation of the TABS survey. Your financial contribution helps us maintain the survey platform, manage participant listings, and disseminate annual findings to the research community.',
      whoShouldParticipate:
        'Anyone who believes in the value of research-driven insights into technology adoption.',
      commitment: 'One-time or recurring contribution of any amount',
      benefits: [
        'Enable continued free access to survey insights',
        'Support annual data collection and analysis',
        'Help maintain research infrastructure',
      ],
      cta: {
        text: 'Contribute Now',
        link: 'https://github.com/sponsors/clarkemoyer',
        color: 'bg-[#113563] hover:bg-[#0d2a4f]',
      },
    },
    {
      id: 'sponsor',
      title: 'Become a Sponsor',
      icon: '🤝',
      description:
        "Sponsorship provides significant support while gaining visibility and demonstrating your organization's commitment to advancing technology adoption research and business insights.",
      whoShouldParticipate:
        'Organizations, companies, and institutions that want to support research while building their brand in the technology adoption space.',
      commitment: 'Sponsorship packages available at multiple levels',
      benefits: [
        'Recognition in research publications and reports',
        'Early access to findings and insights',
        'Networking opportunities with research community',
      ],
      cta: {
        text: 'Discuss Sponsorship',
        link: 'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Sponsorship%20Inquiry',
        color: 'bg-[#0E7162] hover:bg-[#0b5a4e]',
      },
    },
    {
      id: 'volunteer',
      title: 'Volunteer to Help TABS Operations',
      icon: '🙋',
      description:
        'We need more than funding - we need skilled people to help run the survey, analyze data, improve the website, and support TABS operations. Use your skills to advance technology adoption research.',
      whoShouldParticipate:
        'Researchers, data scientists, web developers, technical writers, and anyone with skills that can help improve TABS operations and impact.',
      commitment: 'Flexible - from a few hours to ongoing involvement',
      benefits: [
        'Gain research experience and build your portfolio',
        'Network with academic and industry professionals',
        'Contribute to meaningful research outcomes',
        'Recognition in project acknowledgments',
      ],
      cta: {
        text: 'Volunteer Your Skills',
        link: 'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Volunteer%20Inquiry',
        color: 'bg-[#5FB38D] hover:bg-[#4d9671]',
      },
    },
    {
      id: 'use-dataset',
      title: 'Use TABS Data in Your Research',
      icon: '📊',
      description:
        'We encourage researchers to use the TABS dataset to conduct original research, proving effects beyond basic descriptive statistics. Request secure access to the dataset once approved by your IRB to contribute to papers and dissertations.',
      whoShouldParticipate:
        'Academic researchers, doctoral students, and research institutions with IRB approval seeking to study technology adoption barriers and organizational capabilities.',
      commitment: 'IRB approval required; research timeline varies by project',
      benefits: [
        'Access to unique longitudinal dataset on technology adoption',
        'Opportunity to publish original research',
        'Contribute to advancing the field',
        'Be counted in TABS research impact tracking',
      ],
      cta: {
        text: 'Request Dataset Access',
        link: 'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Dataset%20Access%20Request',
        color: 'bg-[#2EA3F2] hover:bg-[#2589cc]',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1a2b4b] to-[#2d4a73] text-white py-[80px]">
        <div className="w-[90%] mx-auto max-w-[1200px] text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold mb-[20px] font-serif">
            Get Involved with TABS
          </h1>
          <p className="text-[20px] md:text-[24px] text-blue-100 max-w-[800px] mx-auto leading-[1.6]">
            There are many ways to support technology adoption research. Find the opportunity that
            fits your interests and expertise.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-[60px] bg-white">
        <div className="w-[90%] mx-auto max-w-[1200px]">
          <div className="text-center mb-[60px]">
            <h2 className="text-[36px] font-bold text-gray-900 mb-[20px] font-serif">
              Ways to Contribute
            </h2>
            <p className="text-[18px] text-gray-700 max-w-[800px] mx-auto leading-[1.6]">
              Whether you have 15 minutes to take the survey, resources to donate, skills to
              volunteer, or research interests to pursue - there&apos;s a way for you to make an
              impact.
            </p>
          </div>

          {/* Opportunities List */}
          <div className="space-y-[40px]">
            {opportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className={`bg-gray-50 rounded-[12px] p-[40px] shadow-md hover:shadow-lg transition-shadow ${
                  index % 2 === 1 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row gap-[30px]">
                  {/* Icon and Title */}
                  <div className="md:w-1/3">
                    <div className="text-[64px] mb-[10px]">{opportunity.icon}</div>
                    <h3 className="text-[28px] font-bold text-gray-900 mb-[15px]">
                      {opportunity.title}
                    </h3>
                    <a
                      href={opportunity.cta.link}
                      target={opportunity.cta.link.startsWith('http') ? '_blank' : undefined}
                      rel={
                        opportunity.cta.link.startsWith('http') ? 'noopener noreferrer' : undefined
                      }
                      className={`inline-block px-[30px] py-[14px] ${opportunity.cta.color} text-white rounded-[6px] font-bold text-[16px] transition-all duration-300 hover:scale-105`}
                    >
                      {opportunity.cta.text}
                    </a>
                  </div>

                  {/* Details */}
                  <div className="md:w-2/3">
                    <p className="text-[16px] text-gray-700 mb-[20px] leading-[1.7]">
                      {opportunity.description}
                    </p>

                    <div className="mb-[15px]">
                      <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide mb-[8px]">
                        Who Should Participate
                      </h4>
                      <p className="text-[15px] text-gray-700 leading-[1.6]">
                        {opportunity.whoShouldParticipate}
                      </p>
                    </div>

                    <div className="mb-[15px]">
                      <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide mb-[8px]">
                        Time Commitment
                      </h4>
                      <p className="text-[15px] text-gray-700 leading-[1.6]">
                        {opportunity.commitment}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide mb-[8px]">
                        Benefits
                      </h4>
                      <ul className="list-disc list-inside text-[15px] text-gray-700 space-y-[5px]">
                        {opportunity.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-[#1a2b4b] text-white py-[60px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[36px] font-bold mb-[20px] font-serif">
            Have Questions? Let&apos;s Talk.
          </h2>
          <p className="text-[18px] text-blue-100 mb-[10px]">Call or Text Clarke Moyer</p>
          <a
            href="tel:5202228104"
            className="text-[32px] font-bold text-[#26C699] hover:text-[#1fa884] transition-colors block mb-[30px]"
          >
            (520) 222-8104
          </a>
          <p className="text-[16px] text-blue-200">
            Not sure which opportunity is right for you? Reach out and we&apos;ll help you find the
            best fit.
          </p>
        </div>
      </section>
    </div>
  )
}

export default GetInvolvedPage
