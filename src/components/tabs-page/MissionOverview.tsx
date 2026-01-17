import React from 'react'

const MissionOverview = () => {
  return (
    <section className="w-full py-[80px] bg-white text-gray-800">
      <div className="w-[90%] mx-auto max-w-[4096px] grid grid-cols-1 lg:grid-cols-2 gap-[60px]">
        {/* Column 1: What We Do */}
        <div>
          <h2 className="text-[32px] font-bold text-[#113563] mb-[25px] font-serif border-b-4 border-[#F57C20] inline-block pb-2">
            What We Do
          </h2>
          <div className="text-[17px] leading-[1.8] space-y-4">
            <p>
              At TABS (Technology Adoption Barriers Survey), we conduct essential research to help
              organizations navigate the complexities of technology adoption and maintain their
              competitive edge. Our core mission is to develop a deeper and more current
              understanding of the multifaceted challenges and organizational competencies that
              shape the success of technology adoption initiatives.
            </p>
            <p>
              By collecting and analyzing these insights, TABS aims to provide empirically grounded
              findings that offer practical value to organizations like yours. Our research is
              designed to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Help leaders identify and prioritize key areas for intervention to overcome adoption
                barriers.
              </li>
              <li>
                Enable organizations to benchmark their readiness and capability maturity against
                aggregated data.
              </li>
              <li>
                Inform the development of targeted strategies to enhance workforce skills, improve
                IT infrastructure, foster a more adaptive culture, and strengthen governance
                mechanisms.
              </li>
            </ul>
            <p>
              Ultimately, our work contributes to more successful technology implementations,
              thereby improving organizational performance, innovation, and the realization of value
              from technology investments. We are committed to providing ongoing value with plans
              for annual dissemination of our findings.
            </p>
          </div>
        </div>

        {/* Column 2: Our Mission */}
        <div>
          <h2 className="text-[32px] font-bold text-[#113563] mb-[25px] font-serif border-b-4 border-[#F57C20] inline-block pb-2">
            Our Mission
          </h2>
          <div className="text-[17px] leading-[1.8] space-y-4">
            <p>
              Our mission at TABS (Technology Adoption Barriers Survey) is to advance the
              understanding and practice of technology adoption within organizations. We aim to
              address the critical problem that barriers to technology adoption can negatively
              affect an enterprise’s ability to obtain or maintain competitive advantage,
              potentially leading to loss of market share or even obsolescence.
            </p>
            <ul className="list-none space-y-4">
              <li>
                <strong className="text-[#0E7162]">
                  Assessment of Organizational Technology Readiness:
                </strong>{' '}
                We evaluate an organization’s current capabilities and preparedness to effectively
                leverage new technologies. This assessment covers multiple dimensions, such as the
                clarity of leadership’s vision for technology, alignment of technology strategy with
                organizational goals, effectiveness of IT governance structures, cultural openness
                to change, availability of skilled personnel, adequacy of IT infrastructure, and
                maturity of data governance policies.
              </li>
              <li>
                <strong className="text-[#0E7162]">
                  Exploration of Organizational Capability Maturity:
                </strong>{' '}
                We assess the perceived maturity of key organizational capabilities that underpin
                successful technology adoption and overall performance. These capabilities include
                IT investment and value management, IT-enabled organizational innovation, process
                management and standardization, data governance and analytics for decision-making,
                technology risk and resilience management, strategic IT planning and enterprise
                architecture, workforce capability and talent development, and change leadership and
                adoption management.
              </li>
            </ul>
            <p>
              By systematically gathering and analyzing these perspectives, TABS provides
              empirically grounded insights that offer practical value to organizations. Our
              findings are designed to help leaders identify and prioritize key areas for
              intervention, enable benchmarking, and inform targeted development strategies.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MissionOverview
