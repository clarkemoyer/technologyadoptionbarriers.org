import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const ModelsPage = () => {
  return (
    <main className="pt-[120px] min-h-screen bg-white">
      <article className="max-w-[800px] mx-auto px-6 pb-20 text-[18px] leading-relaxed text-gray-800 font-serif">
        <h1 className="text-[32px] md:text-[42px] font-bold text-[#145044] mb-8 leading-tight">
          Article 1: The Landscape of Technology Adoption Models & Frameworks
        </h1>

        <section className="mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            Defining the Domain: A Trifecta of Adoption
          </h2>
          <p className="mb-6">
            To truly understand technology adoption, we must move beyond a simple
            user-versus-organization dichotomy. A more accurate model considers three distinct but
            overlapping domains: Organizational Adoption, User Adoption, and Consumer Adoption.
            Successful technology integration requires a strategy that addresses all three.
          </p>

          <div className="my-[40px]">
            <Image
              src="/Images/articles/Tech-Adoption-Triangle.png"
              alt="The Tech Adoption Triangle: Organizational, User, and Consumer Adoption"
              width={800}
              height={500}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>

          <figure className="my-10">
            <div className="relative w-full h-auto">
              <Image
                src="/Images/articles/Trifecta-of-Adoption.png"
                alt="Trifecta of Technology Adoption: Organizational, User, and Consumer"
                width={1024}
                height={1024}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
              Fig 1. The three domains of technology adoption.
            </figcaption>
          </figure>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                1. Organizational Adoption: The C-Suite Focus Area
              </h3>
              <p>
                <strong>Question:</strong> How does the firm decide to procure and deploy a
                technology?
                <br />
                This domain is concerned with strategic alignment, resource allocation, and value
                generation. It is the realm of the CIO and CTO. Frameworks here (like TOGAF or the
                AWS Cloud Adoption Framework) are prescriptive—they tell the organization{' '}
                <em>how</em> to execute.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                2. User Adoption: The Internal Challenge
              </h3>
              <p>
                <strong>Question:</strong> Will employees actually use the tool?
                <br />
                Once a technology is deployed, it succeeds or fails at the desk of the individual
                employee. Models here (like TAM and UTAUT) focus on psychology—perceived usefulness
                and ease of use.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                3. Consumer Adoption: The External Challenge
              </h3>
              <p>
                <strong>Question:</strong> Will the market buy it?
                <br />
                This domain adds market forces to the equation. Factors like price value, hedonic
                motivation (fun), and habit become critical drivers alongside utility.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            A Note on Terminology: Model vs. Framework
          </h2>
          <p className="mb-4">
            Before proceeding, it is useful to clarify two terms that are central to this series:{' '}
            <strong>model</strong> and <strong>framework</strong>. For our purposes, a model (like
            TAM or UTAUT) is a <em>descriptive and predictive</em> tool. It seeks to explain a
            phenomenon by identifying key variables and their relationships to answer <em>why</em>{' '}
            an individual might adopt a technology.
          </p>
          <p>
            In contrast, a framework (like TOGAF or the AWS CAF) is <em>prescriptive</em>. It
            provides a structure or a set of best practices to guide action, answering <em>how</em>{' '}
            an organization should go about implementing technology.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            A Sneak Peek: Charting the Intellectual History
          </h2>
          <p className="mb-4">
            These three domains have spawned their own rich intellectual histories, which this
            series will explore in detail.
          </p>
          <p className="mb-4">
            The study of <strong>User and Consumer Adoption</strong> grew out of broad social
            psychology theories. Researchers refined these into focused models like the influential
            Technology Acceptance Model (TAM) [7] to explain the internal user’s journey, and later
            extended them with concepts like Hedonic Motivation and Price Value to better understand
            the consumer’s decision [9].
          </p>
          <p>
            The study of <strong>Organizational Adoption</strong>, by contrast, has its roots in
            strategic management. Early frameworks provided a high-level lens for understanding why
            a firm might adopt a technology. This has since evolved into a landscape of highly
            practical, prescriptive frameworks from standards bodies like The Open Group (TOGAF)
            [10] and major technology vendors like Amazon Web Services (AWS Cloud Adoption
            Framework) [11], which provide detailed guidance on how to execute these complex
            strategic initiatives.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            Series Roadmap: How to Navigate This Series
          </h2>
          <p className="mb-6">
            This article serves as the trunk of our intellectual tree. The following diagram
            provides a visual roadmap for the entire series, illustrating the key models and
            frameworks we will cover and the intellectual journey a reader will take. From here, the
            series splits into two main branches, each containing a sequence of deep-dive articles.
          </p>

          <figure className="my-10">
            <div className="relative w-full h-auto">
              <Image
                src="/Images/articles/Series-Roadmap.png"
                alt="Series Roadmap: Evolutionary Tree of Technology Adoption Models"
                width={1024}
                height={600}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
              Fig 2. The evolutionary roadmap of technology adoption theories.
            </figcaption>
          </figure>

          <ul className="list-disc pl-6 space-y-4 mb-6">
            <li>
              <strong>Branch 1: The User’s & Consumer’s Journey</strong> will delve into the
              evolution of individual acceptance models, covering both the internal employee and the
              external customer. We will trace the path from foundational psychological theories,
              through the game-changing simplicity of TAM, to the comprehensive unified theories of
              today.
            </li>
            <li>
              <strong>Branch 2: The Organization’s Playbook</strong> will explore the frameworks
              that guide firm-level adoption. We will examine the core strategic theories, the rise
              of maturity models for process improvement, and the modern, prescriptive frameworks
              for navigating complex cloud, cybersecurity, and AI transformations.
            </li>
          </ul>
          <p>
            By understanding the interplay between the organization’s strategic intent, the internal
            user’s acceptance, and the external consumer’s choice, we can begin to build that
            critical bridge between technological potential and realized value. As we embark on this
            journey, we invite you to consider a central tension we will explore: In an era of
            prescriptive, top-down implementation frameworks, how much do the classic psychological
            drivers of individual user adoption still matter?
          </p>
        </section>

        <section className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            The Complete Series: A Glance Ahead
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Branch 1: The User’s Journey – Evolution of Individual Technology Acceptance & Use
                Models
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>
                  <Link
                    href="/technology-adoption-models/users-journey"
                    className="hover:underline"
                  >
                    Article 2: Branch Introduction – The User’s Journey
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technology-adoption-models/foundational-theories"
                    className="hover:underline"
                  >
                    Article 3: The Bedrock – Foundational Theories That Shaped Tech Acceptance
                  </Link>
                </li>
                <li>
                  Article 4: The Game Changer – A Deep Dive into the Technology Acceptance Model
                  (TAM)
                </li>
                <li>
                  Article 5: Expanding the Classic – The Evolution to TAM 2, TAM 3, and C-TAM-TPB
                </li>
                <li>
                  Article 6: The Grand Unification – The Unified Theory of Acceptance and Use of
                  Technology (UTAUT)
                </li>
                <li>
                  Article 7: Beyond the Office – UTAUT2, Consumer Context, and Modern Syntheses
                </li>
                <li>Article 8: Context is King – Specialized Individual Adoption Models</li>
                <li>Article 9: Are you Ready? The Role of Technology Readiness (TRI & TRAM)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Branch 2: The Organization’s Playbook – Evolution of Organizational Technology
                Acceptance & Use Models
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>
                  <Link
                    href="/technology-adoption-models/organizations-playbook"
                    className="hover:underline"
                  >
                    Article 10: Branch Introduction – The Organization’s Playbook
                  </Link>
                </li>
                <li>
                  Article 11: The Strategic Lens – Foundational Theories for Organizational Adoption
                </li>
                <li>Article 12: From Chaos to Control – A Guide to Maturity Models</li>
                <li>Article 13: Managing the Lifecycle – The Gartner Hype Cycle</li>
                <li>
                  Article 14: The Blueprint for Enterprise – A Survey of Architecture Frameworks
                </li>
                <li>Article 15: The Modern Mandate – Frameworks for Cybersecurity and Risk</li>
                <li>Article 16: The Cloud Revolution – Prescriptive Adoption Frameworks</li>
                <li>Article 17: The AI Frontier – Frameworks for Adopting AI, ML, and GenAI</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-[20px] font-bold text-gray-900 mb-4">References</h2>
          <ol className="list-decimal pl-5 text-[14px] text-gray-600 space-y-3 font-sans">
            <li>Rogers, E. M. (2003). Diffusion of Innovations (5th ed.). Free Press.</li>
            <li>
              Tornatzky, L. G., & Fleischer, M. (1990). The Processes of Technological Innovation.
              Lexington Books.
            </li>
            <li>
              Barney, J. (1991). Firm resources and sustained competitive advantage. Journal of
              Management, 17(1), 99–120.{' '}
              <a
                href="https://doi.org/10.1177/014920639101700108"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1177/014920639101700108
              </a>
            </li>
            <li>
              Hammer, M., & Champy, J. (1993). Reengineering the Corporation: A Manifesto for
              Business Revolution. Harper Business.
            </li>
            <li>
              Fishbein, M., & Ajzen, I. (1975). Belief, Attitude, Intention, and Behavior: An
              Introduction to Theory and Research. Addison-Wesley.
            </li>
            <li>
              Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human
              Decision Processes, 50(2), 179-211.{' '}
              <a
                href="https://doi.org/10.1016/0749-5978(91)90020-T"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1016/0749-5978(91)90020-T
              </a>
            </li>
            <li>
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. MIS Quarterly, 13(3), 319–340.{' '}
              <a
                href="https://doi.org/10.2307/249008"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249008
              </a>
            </li>
            <li>
              Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of
              information technology: Toward a unified view. MIS Quarterly, 27(3), 425-478.{' '}
              <a
                href="https://doi.org/10.2307/30036540"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/30036540
              </a>
            </li>
            <li>
              Venkatesh, V., Thong, J. Y. L., & Xu, X. (2012). Consumer acceptance and use of
              information technology: Extending the unified theory of acceptance and use of
              technology. MIS Quarterly, 36(1), 157–178.{' '}
              <a
                href="https://doi.org/10.2307/41410412"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/41410412
              </a>
            </li>
            <li>
              The Open Group. (2018). The TOGAF® Standard, Version 9.2. Van Haren Publishing.{' '}
              <a
                href="https://pubs.opengroup.org/architecture/togaf9-doc/arch/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://pubs.opengroup.org/architecture/togaf9-doc/arch/
              </a>
            </li>
            <li>
              Amazon Web Services. (n.d.). AWS Cloud Adoption Framework. AWS Whitepaper. Retrieved
              from{' '}
              <a
                href="https://aws.amazon.com/professional-services/CAF/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://aws.amazon.com/professional-services/CAF/
              </a>
            </li>
          </ol>
        </section>
      </article>
    </main>
  )
}

export default ModelsPage
