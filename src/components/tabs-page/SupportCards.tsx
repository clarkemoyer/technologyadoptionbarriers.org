import React from 'react'
import StripeDonateButton from '@/components/stripe-donate-button'
import { DonationType } from '@/lib/stripe'

const SupportCards = () => {
  const cards = [
    {
      title: 'Support the Research',
      description:
        'Your financial contribution helps us run the survey, maintain the platform, and disseminate research findings to the community.',
      buttonText: 'Contribute Now',
      buttonLink: 'https://github.com/sponsors/clarkemoyer',
      useStripe: true,
      donationType: DonationType.ONE_TIME,
      bgColor: 'bg-[#113563]',
      btnConfig: 'bg-[#F57C20] text-white hover:bg-[#d66a1a]',
    },
    {
      title: 'Become a Sponsor',
      description:
        "Gain visibility while supporting research. Show your organization's commitment to advancing technology adoption insights.",
      buttonText: 'Learn More',
      buttonLink: '/get-involved#sponsor',
      useStripe: false,
      bgColor: 'bg-[#0E7162]',
      btnConfig: 'bg-white text-[#0E7162] hover:bg-gray-100',
    },
    {
      title: 'Volunteer Your Skills',
      description:
        'Help us run the survey, analyze data, or improve the website. Use your expertise to support TABS operations.',
      buttonText: 'Get Involved',
      buttonLink: '/get-involved#volunteer',
      useStripe: false,
      bgColor: 'bg-[#5FB38D]',
      btnConfig: 'bg-white text-[#5FB38D] hover:bg-gray-100',
    },
    {
      title: 'Use Our Dataset',
      description:
        'Researchers: Access TABS data for your studies. Advance research beyond descriptive statistics with IRB-approved dataset access.',
      buttonText: 'Request Access',
      buttonLink: '/get-involved#use-dataset',
      useStripe: false,
      bgColor: 'bg-[#2EA3F2]',
      btnConfig: 'bg-white text-[#2EA3F2] hover:bg-gray-100',
    },
  ]

  return (
    <section className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-[10px] p-[40px] text-white ${card.bgColor} flex flex-col h-full shadow-lg`}
            >
              <h3 className="text-[24px] font-bold mb-[20px] leading-tight min-h-[60px]">
                {card.title}
              </h3>
              <p className="text-[16px] leading-[1.6] mb-[30px] flex-grow opacity-90">
                {card.description}
              </p>
              <div>
                {card.useStripe && card.donationType ? (
                  <StripeDonateButton
                    type={card.donationType}
                    label={card.buttonText}
                    className={`inline-block px-[25px] py-[12px] rounded-[30px] font-bold text-[16px] transition-all duration-300 transform hover:scale-105 ${card.btnConfig}`}
                  />
                ) : (
                  <a
                    href={card.buttonLink}
                    target={card.buttonLink.startsWith('http') ? '_blank' : undefined}
                    rel={card.buttonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`inline-block px-[25px] py-[12px] rounded-[30px] font-bold text-[16px] transition-all duration-300 transform hover:scale-105 ${card.btnConfig}`}
                  >
                    {card.buttonText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Link to full Get Involved page */}
        <div className="text-center mt-[40px]">
          <a
            href="/get-involved"
            className="inline-flex items-center gap-[10px] text-[18px] font-semibold text-[#1a2b4b] hover:text-[#2EA3F2] transition-colors"
          >
            See All Ways to Get Involved
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default SupportCards
