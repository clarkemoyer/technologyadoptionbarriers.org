import type { Metadata } from 'next'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'

export const metadata: Metadata = {
  title: 'Get Involved | TABS',
  description:
    'Discover all the ways you can support the Technology Adoption Barriers Survey (TABS) - from taking the survey to volunteering, contributing, or using our dataset in your research.',
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
      commitment: '20-25 minutes to complete the survey',
      benefits: [
        'Receive summary reports and key findings from aggregated data',
        'Benchmark your organization against industry trends',
        'Contribute to advancing technology adoption research',
      ],
      cta: {
        text: 'Take the Survey',
        link: TABS_WEBSITE_QUALTRICS_SURVEY_URL,
        color: 'bg-tabs-orange hover:bg-tabs-orange-hover',
      },
    },
    {
      id: 'use-dataset',
      title: 'Use TABS Data in Your Research',
      icon: '📊',
      description:
        'We encourage researchers to use the TABS dataset to conduct original research, testing hypotheses beyond basic descriptive statistics. As the dataset grows, qualified researchers may request access subject to IRB approval and a data-sharing agreement.',
      whoShouldParticipate:
        'Academic researchers, doctoral students, and research institutions with IRB approval seeking to study technology adoption barriers and organizational capabilities.',
      commitment: 'IRB approval required; research timeline varies by project',
      benefits: [
        'Access to a growing dataset on technology adoption',
        'Opportunity to publish original research',
        'Contribute to advancing the field',
        'Be counted in TABS research impact tracking',
      ],
      cta: {
        text: 'Request Dataset Access',
        link: 'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Dataset%20Access%20Request',
        color: 'bg-tabs-blue hover:bg-tabs-blue-hover',
      },
    },
    {
      id: 'contribute-general',
      title: 'Support This Research',
      icon: '💵',
      description:
        'Contributions via GitHub Sponsors help cover the costs of running the TABS project, including the survey platform, participant recruitment, and sharing findings with the community.',
      whoShouldParticipate:
        'Anyone who believes in the value of research-driven insights into technology adoption.',
      commitment: 'One-time or recurring contribution of any amount',
      benefits: [
        'Enable continued free access to survey insights',
        'Support ongoing data collection and analysis',
        'Help maintain research infrastructure',
      ],
      cta: {
        text: 'Contribute Now',
        link: 'https://github.com/sponsors/clarkemoyer',
        color: 'bg-tabs-navy hover:bg-tabs-navy-bg',
      },
    },
    {
      id: 'sponsor',
      title: 'Become a Sponsor',
      icon: '🤝',
      description:
        "Sponsorship provides significant support while demonstrating your organization's commitment to advancing technology adoption research and business insights.",
      whoShouldParticipate:
        'Organizations, companies, and institutions that want to support research while building their brand in the technology adoption space.',
      commitment: 'Reach out to discuss sponsorship options',
      benefits: [
        'Acknowledgment in research outputs',
        'Early access to findings and insights as they become available',
        'Connection with the TABS research community',
      ],
      cta: {
        text: 'Discuss Sponsorship',
        link: 'mailto:clarke@technologyadoptionbarriers.org?subject=TABS%20Sponsorship%20Inquiry',
        color: 'bg-tabs-teal hover:bg-tabs-teal-deep',
      },
    },
    {
      id: 'volunteer',
      title: 'Volunteer to Help TABS Operations',
      icon: '🙋',
      description:
        'We need more than contributions - we need skilled people to help run the survey, analyze data, improve the website, and support TABS operations. Use your skills to advance technology adoption research.',
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
        color: 'bg-tabs-green hover:bg-tabs-green',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-tabs-navy-bg to-slate-600 text-white py-[80px]">
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
              Whether you have 20 minutes to take the survey, resources to contribute, skills to
              volunteer, or research interests to pursue - there&apos;s a way for you to make an
              impact.
            </p>
          </div>

          {/* Opportunities List */}
          <div className="space-y-[40px]">
            {opportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                id={opportunity.id}
                className={`bg-gray-50 rounded-[12px] p-[40px] shadow-md hover:shadow-lg transition-shadow ${
                  index % 2 === 1 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row gap-[30px]">
                  {/* Icon and Title */}
                  <div className="md:w-1/3">
                    <div className="text-[64px] mb-[10px]">
                      <span role="img" aria-label={`${opportunity.title} icon`}>
                        {opportunity.icon}
                      </span>
                    </div>
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
      <section className="bg-tabs-navy-bg text-white py-[60px]">
        <div className="w-[90%] mx-auto max-w-[800px] text-center">
          <h2 className="text-[36px] font-bold mb-[20px] font-serif">
            Have Questions? Let&apos;s Talk.
          </h2>
          <p className="text-[18px] text-blue-100 mb-[10px]">Call or Text Clarke Moyer</p>
          <a
            href="tel:5202228104"
            className="text-[32px] font-bold text-tabs-teal-bright hover:text-tabs-teal-bright-hover transition-colors block mb-[30px]"
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
