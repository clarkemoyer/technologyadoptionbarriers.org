import React from 'react'
import Link from 'next/link'

const UsersJourneyPage = () => {
  return (
    <main className="pt-[120px] min-h-screen bg-white">
      <article className="max-w-[800px] mx-auto px-6 pb-20 text-[18px] leading-relaxed text-gray-800 font-serif">
        <h1 className="text-[32px] md:text-[42px] font-bold text-[#145044] mb-8 leading-tight">
          Article 1: Branch Introduction – The User’s Journey
        </h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            This narrative provides the structure for the articles to come. Our exploration of the
            user’s journey is organized as follows:
          </p>
          <p className="mb-6">
            First, we’ll look at the foundational theories. Then, we’ll do a deep dive into TAM, the
            model that changed everything. From there, we’ll explore its direct successors before
            examining the ambitious UTAUT model that sought to unify the field. After establishing
            this core lineage, our focus will broaden to see how these theories were adapted for the
            consumer context, explore specialized models where context is king, and finally,
            consider the crucial role of an individual’s innate readiness for technology.
          </p>
          <p className="mb-6">
            This journey will provide a comprehensive understanding of how the field has evolved,
            from its psychological roots to the sophisticated, unified models used today. In our
            next article, we will begin at the beginning, with a deep dive into the bedrock theories
            that made everything else possible.
          </p>
        </section>

        <section className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#145044] mb-4">
            The Complete Branch: A Glance Ahead
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700 font-sans">
            <li>
              <Link
                href="/article-1-1-the-bedrock-foundational-theories-that-shaped-tech-acceptance"
                className="hover:underline"
              >
                Article 1.1: The Bedrock – Foundational Theories That Shaped Tech Acceptance
              </Link>
            </li>
            <li>
              Article 1.2: The Game Changer – A Deep Dive into the Technology Acceptance Model (TAM)
            </li>
            <li>
              Article 1.3: Expanding the Classic – The Evolution to TAM 2, TAM 3, and C-TAM-TPB
            </li>
            <li>
              Article 1.4: The Grand Unification – The Unified Theory of Acceptance and Use of
              Technology (UTAUT)
            </li>
            <li>Article 1.5: Beyond the Office – UTAUT2, Consumer Context, and Modern Syntheses</li>
            <li>Article 1.6: Context is King – Specialized Individual Adoption Models</li>
            <li>Article 1.7: Are You Ready? The Role of Technology Readiness (TRI & TRAM)</li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-[20px] font-bold text-gray-900 mb-4">References</h2>
          <ol className="list-decimal pl-5 text-[14px] text-gray-600 space-y-3 font-sans">
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
            <li>Rogers, E. M. (1962). Diffusion of Innovations. Free Press of Glencoe.</li>
            <li>
              Bandura, A. (1986). Social foundations of thought and action: A social cognitive
              theory. Prentice-Hall.
            </li>
            <li>
              Davis, F. D., Bagozzi, R. P., & Warshaw, P. R. (1992). Extrinsic and intrinsic
              motivation to use computers in the workplace. Journal of Applied Social Psychology,
              22(14), 1111-1132.{' '}
              <a
                href="https://doi.org/10.1111/j.1559-1816.1992.tb00945.x"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
              </a>
            </li>
            <li>
              Thompson, R. L., Higgins, C. A., & Howell, J. M. (1991). Personal computing: Toward a
              conceptual model of utilization. MIS Quarterly, 15(1), 125-143.{' '}
              <a
                href="https://doi.org/10.2307/249443"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249443
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
              Venkatesh, V., & Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. Management Science, 46(2), 186-204.{' '}
              <a
                href="https://doi.org/10.1287/mnsc.46.2.186.11926"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1287/mnsc.46.2.186.11926
              </a>
            </li>
            <li>
              Venkatesh, V., & Bala, H. (2008). Technology acceptance model 3 and a research agenda
              on interventions. Decision Sciences, 39(2), 273-315.{' '}
              <a
                href="https://doi.org/10.1111/j.1540-5915.2008.00192.x"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1111/j.1540-5915.2008.00192.x
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
              Goodhue, D. L., & Thompson, R. L. (1995). Task-technology fit and individual
              performance. MIS Quarterly, 19(2), 213-236.{' '}
              <a
                href="https://doi.org/10.2307/249244"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249244
              </a>
            </li>
            <li>
              Parasuraman, A. (2000). Technology Readiness Index (TRI): A multiple-item scale to
              measure readiness to embrace new technologies. Journal of Service Research, 2(4),
              307-320.{' '}
              <a
                href="https://doi.org/10.1177/109467050024001"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1177/109467050024001
              </a>
            </li>
          </ol>
        </section>
      </article>
    </main>
  )
}

export default UsersJourneyPage
