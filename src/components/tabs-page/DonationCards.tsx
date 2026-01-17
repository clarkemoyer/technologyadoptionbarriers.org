import React from 'react'

const DonationCards = () => {
  const cards = [
    {
      title: 'Donate to the general fund',
      description:
        'This is the general fund to help the survey run and maintain the listings for the annual survey participants.',
      buttonText: 'Donate Now',
      buttonLink: 'https://technologyadoptionbarriers.org/#', // Update with real link if available
      bgColor: 'bg-[#113563]',
      btnConfig: 'bg-[#F57C20] text-white hover:bg-[#d66a1a]',
    },
    {
      title: 'Donate as a Sponsor',
      description:
        'Sponsorship is a great way to contribute to research and support our business insights.',
      buttonText: 'Contact Us',
      buttonLink: 'mailto:clarke@technologyadoptionbarriers.org',
      bgColor: 'bg-[#0E7162]',
      btnConfig: 'bg-white text-[#0E7162] hover:bg-gray-100',
    },
    {
      title: 'Become a Supporting Researcher',
      description:
        'We need more than money to run the survey we need people and skills like yours. Volunteer today to help.',
      buttonText: 'Volunteer Today',
      buttonLink: 'mailto:clarke@technologyadoptionbarriers.org',
      bgColor: 'bg-[#5FB38D]',
      btnConfig: 'bg-white text-[#5FB38D] hover:bg-gray-100',
    },
  ]

  return (
    <section className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[4096px] grid grid-cols-1 md:grid-cols-3 gap-[30px]">
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
              <a
                href={card.buttonLink}
                className={`inline-block px-[25px] py-[12px] rounded-[30px] font-bold text-[16px] transition-all duration-300 transform hover:scale-105 ${card.btnConfig}`}
              >
                {card.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DonationCards
