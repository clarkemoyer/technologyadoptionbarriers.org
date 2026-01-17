import type { Metadata } from 'next'
import React from 'react'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'

export const metadata: Metadata = {
  title: 'Comprehensive Series Bibliography: Foundations of Technology Adoption',
  description:
    'Definitive, exhaustive bibliography for the “Technology Adoption Models” series, covering individual user journeys and organizational playbooks with fully cited APA references.',
}

const BibliographyPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Comprehensive Series Bibliography: Foundations of Technology Adoption
        </h1>

        <SeriesNavigation className="mt-6" />

        {/* Executive Summary */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Executive Summary</h2>
          <p className="mb-4">
            This bibliography serves as the definitive, exhaustive scholarly record for the
            &ldquo;Technology Adoption Models&rdquo; series. It consolidates every intellectual
            foundation identified in the project&rsquo;s research database, bifurcated into the{' '}
            <strong>Individual User&rsquo;s Journey</strong> (Branch 1) and the{' '}
            <strong>Organization&rsquo;s Playbook</strong> (Branch 2).
          </p>
          <p className="mb-4">
            For doctoral-level researchers, this document provides the complete longitudinal record
            of theory evolution, ensuring no seminal work from the source RIS datasets is omitted.
            For executive leadership, it establishes a high-fidelity audit trail for every framework
            and standard referenced in the strategic roadmap. Every entry is meticulously
            synchronized with the project&rsquo;s Zotero database, utilizing the exact persistent
            identifiers (URLs) and specific access dates (Y2 metadata) provided in the source files.
          </p>
        </section>

        {/* How to Use This Bibliography */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>How to Use This Bibliography</h2>
          <p className="mb-4">
            To facilitate rapid navigation and deep verification, this document is structured into
            two distinct sections:
          </p>
          <ol className="list-decimal ml-6 mb-4 space-y-2">
            <li>
              <strong>Inventory Dashboard (Quick Scan):</strong> Located immediately below, this
              section provides a high-level list of all unique titles and authors in a side-by-side
              comparison. Use this for a fast &ldquo;at-a-glance&rdquo; verification of the scope
              and coverage of each track.
            </li>
            <li>
              <strong>Detailed APA Reference Lists:</strong> Located further down, these sections
              provide the complete, APA-formatted citations for every entry, separated by track. Use
              these for academic referencing and verification of source authority.
            </li>
          </ol>
        </section>

        {/* Inventory Dashboard */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Inventory Dashboard</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                    Track 1: The Individual User&rsquo;s Journey (n=21)
                    <br />
                    <span className="text-xs font-normal">
                      Verified against Individual RIS export.
                    </span>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                    Track 2: The Organization&rsquo;s Playbook (n=21)
                    <br />
                    <span className="text-xs font-normal">Verified against Org RIS export.</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Ajzen (1991) - The theory of planned behavior
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Alexander Wöhlke et al. (2024) - AWS Cloud Adoption Framework (AI/ML)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Bandura (1986) - Social foundations of thought and action
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Barney (1991) - Firm Resources and Sustained Competitive Advantage
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Bhattacherjee (2001) - Understanding information systems continuance
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Chrissis, Konrad, &amp; Shrum (2003) - CMMI: Guidelines
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Brown &amp; Venkatesh (2005) - Model of Adoption of Technology in Households
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Cooper &amp; Zmud (1990) - IT Implementation Research
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Davis (1989) - Perceived Usefulness, Perceived Ease of Use...
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Davenport &amp; Short (1990) - The New Industrial Engineering
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Davis, Bagozzi, &amp; Warshaw (1992) - Extrinsic and Intrinsic Motivation...
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Deming (1982) - Quality, productivity, and competitive position
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Fishbein &amp; Ajzen (1975) - Belief, attitude, intention, and behavior
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Fenn (1995) - When to Leap on the Hype Cycle
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Goodhue &amp; Thompson (1995) - Task-Technology Fit
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Gartner (2025) - Hype Cycle Research Methodology
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Kim, Chan, &amp; Gupta (2007) - Value-based Adoption of Mobile Internet
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Gladwell &amp; Watson (2024) - AWS Prescriptive Guidance
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Lin, Shih, &amp; Sher (2007) - Integrating technology readiness (TRAM)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Hammer &amp; Champy (1993) - Reengineering the corporation
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Parasuraman (2000) - Technology readiness index (TRI)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Humphrey (1989) - Managing the software process
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Parasuraman &amp; Colby (2015) - TRI 2.0
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Innovation Value Institute (2016) - IT Capability Maturity Framework (IT-CMF)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Ram (1987) - Model of Innovation Resistance
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Rogers (1962) - Diffusion of innovations
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Rogers (1962) - Diffusion of innovations
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Sumner (2025, April) - Microsoft AI adoption
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Samuelson &amp; Zeckhauser (1988) - Status Quo Bias
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Sumner &amp; Microsoft (2025) - Microsoft Cloud Adoption Framework
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Taylor &amp; Todd (1995) - Understanding Information Technology Usage
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Teece, Pisano, &amp; Shuen (1997) - Dynamic capabilities
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Thompson, Higgins, &amp; Howell (1991) - Personal Computing (MPCU)
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    The Open Group (1995) - TOGAF
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh &amp; Bala (2008) - TAM 3
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Tornatzky, Fleischer, &amp; Chakrabarti (1990) - The processes of technological
                    innovation
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh &amp; Davis (2000) - TAM 2
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    U.S. DoD (1994) - TAFIM Version 3.0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh et al. (2003) - UTAUT
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    U.S. DoD (2003) - DoDAF Version 1.0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Venkatesh et al. (2012) - UTAUT 2
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Wernerfelt (1984) - A Resource-based View of the Firm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Track 1 References */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Detailed APA Reference List: Track 1 (Individual)</h2>
          <div className="space-y-4">
            <p className="pl-8 -indent-8">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes, 50</em>(2), 179–211.
              https://doi.org/10.1016/0749-5978(91)90020-T
            </p>
            <p className="pl-8 -indent-8">
              Bandura, A. (1986).{' '}
              <em>Social foundations of thought and action: A social cognitive theory</em>.
              Prentice-Hall.
            </p>
            <p className="pl-8 -indent-8">
              Bhattacherjee, A. (2001). Understanding information systems continuance: An
              expectation-confirmation model. <em>MIS Quarterly, 25</em>(3), 351–370.
            </p>
            <p className="pl-8 -indent-8">
              Brown, S. A., &amp; Venkatesh, V. (2005). Model of Adoption of Technology in
              Households: A Baseline Model Test and Extension Incorporating Household Life Cycle.{' '}
              <em>MIS Quarterly, 29</em>(3), 399–426. https://doi.org/10.2307/25148690
            </p>
            <p className="pl-8 -indent-8">
              Davis, F. D. (1989). Perceived Usefulness, Perceived Ease of Use, and User Acceptance
              of Information Technology. <em>MIS Quarterly, 13</em>(3), 319–340.
              https://doi.org/10.2307/249008
            </p>
            <p className="pl-8 -indent-8">
              Davis, F. D., Bagozzi, R. P., &amp; Warshaw, P. R. (1992). Extrinsic and Intrinsic
              Motivation to Use Computers in the Workplace.{' '}
              <em>Journal of Applied Social Psychology, 22</em>(14), 1111–1132.
              https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
            </p>
            <p className="pl-8 -indent-8">
              Fishbein, M., &amp; Ajzen, I. (1975).{' '}
              <em>
                Belief, attitude, intention, and behavior: An introduction to theory and research
              </em>
              . Addison-Wesley Pub. Co.
            </p>
            <p className="pl-8 -indent-8">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-Technology Fit and Individual
              Performance. <em>MIS Quarterly, 19</em>(2), 213–236. https://doi.org/10.2307/249689
            </p>
            <p className="pl-8 -indent-8">
              Kim, H.-W., Chan, H. C., &amp; Gupta, S. (2007). Value-based Adoption of Mobile
              Internet: An empirical investigation. <em>Decision Support Systems, 43</em>(1),
              111–126. https://doi.org/10.1016/j.dss.2005.05.009
            </p>
            <p className="pl-8 -indent-8">
              Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (2007). Integrating technology readiness
              into technology acceptance: The TRAM model. <em>Psychology &amp; Marketing, 24</em>
              (7), 641–657. https://doi.org/10.1002/mar.20177
            </p>
            <p className="pl-8 -indent-8">
              Parasuraman, A. (2000). Technology readiness index (TRI): A multiple-item scale to
              measure readiness to embrace new technologies. <em>Journal of Service Research, 2</em>
              (4), 307–320.
            </p>
            <p className="pl-8 -indent-8">
              Parasuraman, A., &amp; Colby, C. L. (2015). An Updated and Streamlined Technology
              Readiness Index: TRI 2.0. <em>Journal of Service Research, 18</em>(1), 59–74.
              https://doi.org/10.1177/1094670514539730
            </p>
            <p className="pl-8 -indent-8">
              Ram, S. (1987). A MODEL OF INNOVATION RESISTANCE.{' '}
              <em>Advances in Consumer Research, 14</em>(1), 208–212.
            </p>
            <p className="pl-8 -indent-8">
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </p>
            <p className="pl-8 -indent-8">
              Samuelson, W., &amp; Zeckhauser, R. (1988). Status Quo Bias in Decision Making.{' '}
              <em>Journal of Risk and Uncertainty, 1</em>(1), 7–59.
            </p>
            <p className="pl-8 -indent-8">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding Information Technology Usage: A
              Test of Competing Models. <em>Information Systems Research, 6</em>(2), 144–176.
              https://doi.org/10.1287/isre.6.2.144
            </p>
            <p className="pl-8 -indent-8">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal Computing:
              Toward a Conceptual Model of Utilization. <em>MIS Quarterly, 15</em>(1), 125.
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., &amp; Bala, H. (2008). Technology Acceptance Model 3 and a Research
              Agenda on Interventions. <em>Decision Sciences, 39</em>(2), 273–315.
              https://doi.org/10.1111/j.1540-5915.2008.00192.x
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., &amp; Davis, F. D. (2000). A Theoretical Extension of the Technology
              Acceptance Model: Four Longitudinal Field Studies. <em>Management Science, 46</em>
              (2), 186–204.
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User Acceptance
              of Information Technology: Toward a Unified View. <em>MIS Quarterly, 27</em>
              (3), 425–478. https://doi.org/10.2307/30036540
            </p>
            <p className="pl-8 -indent-8">
              Venkatesh, V., Thong, J. Y. L., &amp; Xu, X. (2012). Consumer Acceptance and Use of
              Information Technology: Extending the Unified Theory of Acceptance and Use of
              Technology. <em>MIS Quarterly, 36</em>(1), 157–178. https://doi.org/10.2307/41410412
            </p>
          </div>
        </section>

        {/* Track 2 References */}
        <section className="mb-8 sm:mb-12">
          <h2 className={H2_CLASSES}>Detailed APA Reference List: Track 2 (Organization)</h2>
          <div className="space-y-4">
            <p className="pl-8 -indent-8">
              Alexander Wöhlke, Nitin, P., Lachlan, I., Shane, M., Spoorthy, C., Chris, B., Anushka,
              K., &amp; Madhan Raj, M. S. (2024). <em>AWS Cloud Adoption Framework: AI/ML Lens</em>.
              Amazon Web Services.
              https://docs.aws.amazon.com/whitepapers/latest/aws-caf-for-ai-ml/aws-caf-for-ai-ml.html
            </p>
            <p className="pl-8 -indent-8">
              Barney, J. (1991). Firm Resources and Sustained Competitive Advantage.{' '}
              <em>Journal of Management, 17</em>(1), 99–120.
              https://doi.org/10.1177/014920639101700108
            </p>
            <p className="pl-8 -indent-8">
              Chrissis, M. B., Konrad, M., &amp; Shrum, S. (2003).{' '}
              <em>CMMI: Guidelines for process integration and product improvement</em>.
              Addison-Wesley.
            </p>
            <p className="pl-8 -indent-8">
              Cooper, R. B., &amp; Zmud, R. W. (1990). Information Technology Implementation
              Research: A Technological Diffusion Approach. <em>Management Science, 36</em>(2),
              123–139. https://doi.org/10.1287/mnsc.36.2.123
            </p>
            <p className="pl-8 -indent-8">
              Davenport, T. H., &amp; Short, J. E. (1990). The New Industrial Engineering:
              Information Technology and Business Process Redesign. <em>Sloan Management Review</em>
              , Summer 1990, 11–27.
            </p>
            <p className="pl-8 -indent-8">
              Deming, W. E. (1982). <em>Quality, productivity, and competitive position</em>.
              Massachusetts Institute of Technology, Center for Advanced Engineering Study.
            </p>
            <p className="pl-8 -indent-8">
              Fenn, J. (1995). <em>When to Leap on the Hype Cycle</em>. Gartner.
            </p>
            <p className="pl-8 -indent-8">
              Gartner. (2025). <em>Hype Cycle Research Methodology</em>. Gartner.
              https://www.gartner.com/en/research/methodologies/gartner-hype-cycle
            </p>
            <p className="pl-8 -indent-8">
              Gladwell, B., &amp; Watson, J. (2024).{' '}
              <em>
                AWS Prescriptive Guidance: Migration and modernization strategy for Microsoft
                workloads
              </em>
              . Amazon Web Services.
              https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-microsoft-workloads/migration-microsoft-workloads.html
            </p>
            <p className="pl-8 -indent-8">
              Hammer, M., &amp; Champy, J. (1993).{' '}
              <em>Reengineering the corporation: A manifesto for business revolution</em>.
              HarperBusiness.
            </p>
            <p className="pl-8 -indent-8">
              Humphrey, W. S. (1989). <em>Managing the software process</em>. Addison-Wesley.
            </p>
            <p className="pl-8 -indent-8">
              Innovation Value Institute. (2016).{' '}
              <em>IT Capability Maturity Framework (IT-CMF), 2nd Edition</em>. Van Haren Publishing.
            </p>
            <p className="pl-8 -indent-8">
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </p>
            <p className="pl-8 -indent-8">
              Sumner, M. (2025, April). <em>Microsoft AI adoption and security best practices</em>.
              Microsoft. Retrieved January 15, 2025, from
              https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/innovate/ai/
            </p>
            <p className="pl-8 -indent-8">
              Sumner, M., &amp; Microsoft. (2025).{' '}
              <em>Microsoft Cloud Adoption Framework for Azure</em>. Microsoft. Retrieved January
              15, 2025, from https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/
            </p>
            <p className="pl-8 -indent-8">
              Teece, D. J., Pisano, G., &amp; Shuen, A. (1997). Dynamic capabilities and strategic
              management. <em>Strategic Management Journal, 18</em>(7), 509–533.
              https://doi.org/10.1002/(SICI)1097-0266(199708)18:7&lt;509::AID-SMJ882&gt;3.0.CO;2-Z
            </p>
            <p className="pl-8 -indent-8">
              The Open Group. (1995). <em>TOGAF</em>. The Open Group.
              https://www.opengroup.org/togaf
            </p>
            <p className="pl-8 -indent-8">
              Tornatzky, L. G., Fleischer, M., &amp; Chakrabarti, A. K. (1990).{' '}
              <em>The processes of technological innovation</em>. Lexington Books.
            </p>
            <p className="pl-8 -indent-8">
              U.S. Department of Defense. (1994).{' '}
              <em>
                Technical Architecture Framework for Information Management (TAFIM), Version 3.0
              </em>
              . Defense Information Systems Agency.
            </p>
            <p className="pl-8 -indent-8">
              U.S. Department of Defense. (2003).{' '}
              <em>DoD Architecture Framework (DoDAF), Version 1.0</em>. Department of Defense.
            </p>
            <p className="pl-8 -indent-8">
              Wernerfelt, B. (1984). A Resource-based View of the Firm.{' '}
              <em>Strategic Management Journal, 5</em>(2), 171–180.
              https://doi.org/10.1002/smj.4250050207
            </p>
          </div>
        </section>
      </article>
    </main>
  )
}

export default BibliographyPage
