import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: IT-CMF - Innovation Value Institute (2016)',
  description:
    'Comprehensive overview of the IT Capability Maturity Framework (IT-CMF). Explains the 36 Critical Capabilities, 5-level maturity model, and IT-CMF role as comprehensive framework for IT capability assessment and business-IT alignment.',
}

const navLinkClass = 'text-blue-600 hover:text-blue-800 underline'

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>IT-CMF - Innovation Value Institute (2016)</h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> IT Capability Maturity Framework
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> IT-CMF
            </p>
            <p>
              <strong>Target of Framework:</strong> Providing comprehensive framework for assessing
              and improving IT capability maturity across organizations. IT-CMF enables
              organizations to systematically evaluate IT effectiveness and identify capability
              improvement opportunities aligned with business value creation.
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> IT Management, Business-IT Alignment, IT
              Governance, Capability Maturity, Organizational Performance, IT Service Management
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author/Organization:</strong> Innovation Value Institute (IVI), Maynooth
              University, Ireland, in partnership with Intel and 100+ member organizations
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2016
            </p>
            <p>
              <strong>Current Version:</strong> IT-CMF, 2nd Edition (2016)
            </p>
            <p>
              <strong>Official Title:</strong>{' '}
              <em>
                IT Capability Maturity Framework (IT-CMF): The Body of Knowledge Guide, 2nd ed.
              </em>
            </p>
            <p>
              <strong>Publisher:</strong> Van Haren Publishing
            </p>
            <p>
              <strong>Document Format:</strong> Comprehensive framework specification, capability
              descriptions, assessment methodologies, and supporting materials
            </p>
            <p>
              <strong>ISBN:</strong> 978-94-018-0050-1
            </p>
          </div>
        </section>

        {/* 3. Citation Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 space-y-3">
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">APA (7th ed.)</p>
              <p className="text-sm font-mono">
                {'Curley, M., Kenneally, J., & Carcary, M. ('}
                <a
                  href="#ref-curley-2016"
                  aria-label="Jump to reference: Curley, Kenneally, and Carcary 2016"
                  className="text-tabs-teal-deep hover:underline"
                >
                  2016
                </a>
                {').'}{' '}
                <em>IT capability maturity framework (IT-CMF): The body of knowledge guide</em>
                {' (2nd ed.). Van Haren Publishing.'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Curley, Martin, Jim Kenneally, and Marian Carcary. 2016.{' '}
                <em>IT Capability Maturity Framework (IT-CMF): The Body of Knowledge Guide</em>. 2nd
                ed. Van Haren Publishing.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Beginning in the early 2000s with the transformation of Intel Corporation&rsquo;s IT
            function, IT leaders recognized significant challenges in demonstrating technology value
            to business stakeholders. While frameworks existed for assessing software development
            maturity (CMM, CMMI) and IT service quality (ITIL), no comprehensive framework directly
            addressed the broader IT capability maturity question: how mature is our IT organization
            in creating business value?
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The Innovation Value Institute (IVI) at Maynooth University, in collaboration with Intel
            and a consortium of 100+ leading organizations, recognized that existing maturity
            frameworks were fragmented and did not provide integrated assessment of the full
            spectrum of IT capabilities required for business value creation. Organizations lacked
            systematic way to evaluate whether their IT capabilities aligned with business strategy,
            supported innovation, managed risk appropriately, and delivered measurable value.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF was created to establish comprehensive, business-value-focused maturity framework
            spanning the full range of IT management and capability domains. Unlike software-focused
            frameworks (CMMI) or service-focused frameworks (ITIL), IT-CMF explicitly connects IT
            capability maturity to business value creation. The framework emerged from collaborative
            research with over 100 consortium member organizations and IT leaders, ensuring
            framework relevance to real-world IT management challenges.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>IT-CMF centers on several core concepts:</p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>IT Capability:</strong> Organizational ability to perform IT-enabled
              activities consistently and effectively. Capabilities span strategy, governance,
              delivery, and value management.
            </li>
            <li>
              <strong>Critical Capability:</strong> 36 specific IT capabilities identified as
              essential for IT organizations to deliver value. Critical Capabilities span four
              macro-capability categories.
            </li>
            <li>
              <strong>Maturity Level:</strong> Five-level scale (Initial, Basic, Intermediate,
              Advanced, Optimizing) describing progression in capability sophistication and business
              impact.
            </li>
            <li>
              <strong>Macro-Capability:</strong> Four broad IT management domains: Managing IT like
              a Business, Managing the IT Budget, Managing the IT Capability, Managing IT for
              Business Value.
            </li>
            <li>
              <strong>Business Value:</strong> Tangible and intangible benefits IT delivers to
              organization. IT-CMF explicitly emphasizes that IT capability maturity should drive
              measurable business value.
            </li>
            <li>
              <strong>IT Governance:</strong> Frameworks and processes ensuring IT decisions align
              with business strategy and organizational values. Governance is foundational to
              IT-CMF.
            </li>
            <li>
              <strong>Capability Assessment:</strong> Systematic evaluation of current capability
              maturity against defined capability levels. Assessment identifies improvement
              opportunities.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF built upon and extended several prior capability and IT management frameworks:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability Maturity Model (CMM, Carnegie Mellon 1991):</strong> CMM
              established 5-level maturity model for software development processes. IT-CMF adapted
              CMM&apos;s maturity level structure while extending to IT management beyond software
              development.
            </li>
            <li>
              <strong>Capability Maturity Model Integration (CMMI, SEI 2002):</strong> CMMI extended
              CMM to systems and IT service management. IT-CMF incorporated CMMI concepts while
              creating broader IT capability framework.
            </li>
            <li>
              <strong>IT Infrastructure Library (ITIL, 1989 onwards):</strong> ITIL established best
              practices for IT service management. IT-CMF incorporated ITIL principles while
              expanding to broader IT value creation.
            </li>
            <li>
              <strong>
                COBIT (Control Objectives for Information and related Technology, ISACA 1996):
              </strong>{' '}
              COBIT provided IT governance and control framework. IT-CMF aligned with COBIT
              governance principles while emphasizing value creation.
            </li>
            <li>
              <strong>
                Balanced Scorecard (
                <a
                  id="cite-ref-kaplan-1992-1"
                  href="#ref-kaplan-1992"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Kaplan &amp; Norton, 1992
                </a>
                ):
              </strong>{' '}
              Balanced Scorecard framework for business performance measurement influenced
              IT-CMF&apos;s emphasis on IT business value measurement.
            </li>
            <li>
              <strong>IT Portfolio Management Approaches (1990s-2000s):</strong> IT portfolio
              management practices informed IT-CMF&apos;s emphasis on IT investment and business-IT
              alignment.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF provides comprehensive framework for assessing and improving IT capability
            maturity through integrated evaluation of 36 Critical Capabilities organized into four
            macro-capability categories, each evaluated against five maturity levels ranging from
            Initial to Optimizing.
          </p>

          <h3 className={H3_CLASSES}>Four Macro-Capabilities</h3>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF organizes 36 Critical Capabilities into four macro-capability domains:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Managing IT like a Business:</strong> Capabilities for treating IT as
              strategic business function requiring business discipline, strategy alignment, and
              governance. Includes 14 critical capabilities spanning governance, strategy, business
              relationship, and organizational design.
            </li>
            <li>
              <strong>Managing the IT Budget:</strong> Capabilities for financial management,
              investment justification, cost optimization, and IT spending alignment with business
              value. Includes 4 critical capabilities for budget planning, cost management, and
              investment governance.
            </li>
            <li>
              <strong>Managing the IT Capability:</strong> Capabilities for IT delivery excellence
              including service management, architecture, quality, security, and risk management.
              Includes 15 critical capabilities for development, delivery, and operational
              excellence.
            </li>
            <li>
              <strong>Managing IT for Business Value:</strong> Capabilities for ensuring IT
              investments create demonstrable business value through benefit realization,
              performance management, and continuous value creation. Includes 3 critical
              capabilities for value measurement, benefit realization, and total cost of ownership.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Five Maturity Levels</h3>
          <p className={PARAGRAPH_CLASSES}>
            Each Critical Capability is assessed on five maturity levels:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Level 1 - Initial:</strong> Approaches are inadequate and unstable. Scope is
              fragmented and incoherent. Repeatable outcomes are rare.
            </li>
            <li>
              <strong>Level 2 - Basic:</strong> Approaches are defined but inconsistencies remain.
              Scope is limited to a partial area of a business function or domain. Repeatable
              outcomes are achieved occasionally.
            </li>
            <li>
              <strong>Level 3 - Intermediate:</strong> Approaches are standardized and
              inconsistencies are addressed. Scope expands to cover a business function (typically
              IT) or domain area. Repeatable outcomes are often achieved.
            </li>
            <li>
              <strong>Level 4 - Advanced:</strong> Approaches can systematically flex for innovative
              adaptations. Scope covers the end-to-end organization and neighboring domain areas.
              Repeatable outcomes are very often achieved.
            </li>
            <li>
              <strong>Level 5 - Optimizing:</strong> Approaches demonstrate world-class attributes.
              Scope extends beyond the borders of the organization and neighboring domains.
              Repeatable outcomes are virtually always achieved.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Capability Architecture</h3>
          <p className={PARAGRAPH_CLASSES}>
            Each Critical Capability is composed of Capability Building Blocks (CBBs) - the
            sub-components that define specific areas of practice within the capability. For each
            CBB, IT-CMF provides Practices-Outcomes-Metrics (POMs): representative practices to
            drive maturity, expected outcomes from implementing them, and metrics to monitor
            progress. Maturity levels are additive - each lower level provides the foundation for
            the next higher one.
          </p>

          <h3 className={H3_CLASSES}>Assessment Methodology</h3>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF assessment involves systematic evaluation of each Critical Capability against
            maturity level definitions. Assessment methodology includes:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability interviews:</strong> Structured interviews with IT leaders and
              practitioners assess current capability maturity across dimensions: awareness, process
              definition, standardization, metrics, and continuous improvement.
            </li>
            <li>
              <strong>Evidence gathering:</strong> Documentation, process artifacts, and
              measurements provide evidence of capability maturity level.
            </li>
            <li>
              <strong>Maturity scoring:</strong> Each capability is scored on five-level maturity
              scale. Scoring reflects both process maturity and business impact.
            </li>
            <li>
              <strong>Gap analysis:</strong> Assessment identifies gaps between current capability
              maturity and target capability maturity. Gaps inform improvement prioritization.
            </li>
            <li>
              <strong>Value alignment:</strong> Assessment evaluates how capability maturity
              contributes to business value creation and strategic alignment.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Differentiators from Prior Frameworks</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Business value focus:</strong> Unlike CMMI (software-focused) or ITIL
              (service-focused), IT-CMF explicitly emphasizes business value creation throughout
              framework. Every capability is evaluated in context of business value contribution.
            </li>
            <li>
              <strong>Comprehensive scope:</strong> IT-CMF spans from IT strategy and governance
              through service delivery through financial management through value realization.
              Framework comprehensively addresses IT management.
            </li>
            <li>
              <strong>Macro-capability integration:</strong> Four macro-capability categories ensure
              holistic evaluation of IT management. Macro-capability perspective prevents siloed
              capability assessments.
            </li>
            <li>
              <strong>Enterprise-scale research:</strong> IT-CMF developed through collaborative
              research involving 100+ large organizations. Framework reflects enterprise-scale IT
              management challenges and practices.
            </li>
            <li>
              <strong>Maturity-value correlation:</strong> IT-CMF explicitly establishes that
              capability maturity improvement correlates with business value increase. Framework
              emphasizes ROI on capability improvement investments.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Business-value alignment:</strong> IT-CMF explicitly connects IT capability
              maturity to business value creation. Framework provides language for business-IT
              conversations about IT effectiveness.
            </li>
            <li>
              <strong>Comprehensive framework:</strong> 36 Critical Capabilities comprehensively
              cover IT management domains. Framework addresses IT from strategy through delivery
              through value realization.
            </li>
            <li>
              <strong>Holistic assessment:</strong> Four macro-capability categories ensure holistic
              IT capability evaluation. Framework prevents siloed assessment of individual
              functions.
            </li>
            <li>
              <strong>Clear maturity progression:</strong> Five-level maturity model provides clear
              progression path for capability improvement. Maturity model enables organizations to
              establish realistic improvement roadmaps.
            </li>
            <li>
              <strong>Enterprise-focused:</strong> Framework developed specifically for large
              enterprises facing complex IT management challenges. Framework addresses
              enterprise-scale governance, cost management, and value realization challenges.
            </li>
            <li>
              <strong>Practitioner grounded:</strong> Framework development involved 100+
              organizations, ensuring framework reflects real-world IT management practices and
              challenges.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Enterprise-focused limitation:</strong> Framework design emphasizes large
              enterprise IT organizations. Framework applicability to mid-market or small
              organizations may be limited.
            </li>
            <li>
              <strong>Assessment complexity:</strong> Comprehensive assessment of 36 Critical
              Capabilities is time-intensive. Assessment requires significant organizational
              commitment.
            </li>
            <li>
              <strong>Subjective maturity scoring:</strong> Capability maturity assessment involves
              subjective judgment. Different assessors may score capability maturity differently.
            </li>
            <li>
              <strong>Limited agile integration:</strong> Framework emphasis on standardization and
              process discipline may conflict with agile development practices. Integration with
              agile methods requires careful approach.
            </li>
            <li>
              <strong>Value measurement challenges:</strong> While framework emphasizes IT business
              value, measuring IT capability maturity impact on business value remains challenging.
              Business value causality attribution is complex.
            </li>
            <li>
              <strong>Implementation variation:</strong> IT-CMF implementation and interpretation
              varies across organizations. Framework provides comprehensive guidance but does not
              dictate specific implementation approaches.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Established business-IT value connection:</strong> IT-CMF established explicit
              connection between IT capability maturity and business value creation. Framework
              provided language for business-IT alignment conversations.
            </li>
            <li>
              <strong>Comprehensive IT capability taxonomy:</strong> 36 Critical Capabilities
              created comprehensive taxonomy of IT capabilities required for IT organizations.
              Taxonomy enabled common understanding of IT management domains.
            </li>
            <li>
              <strong>Holistic IT assessment framework:</strong> Four macro-capability categories
              enabled holistic IT assessment spanning strategy through delivery through value.
              Framework prevented siloed IT capability evaluation.
            </li>
            <li>
              <strong>Maturity-value correlation research:</strong> IT-CMF research established
              correlation between capability maturity improvement and business value increase.
              Research provided empirical foundation for capability improvement investment
              justification.
            </li>
            <li>
              <strong>Large-scale IT management research:</strong> IT-CMF development involved 100+
              organizations providing large-scale research on enterprise IT management practices and
              challenges.
            </li>
            <li>
              <strong>IT governance advancement:</strong> IT-CMF elevated IT governance discipline
              emphasis. Framework established governance as foundational IT management capability.
            </li>
            <li>
              <strong>IT-CMF practitioner community:</strong> Framework created community of IT
              leaders and organizations focused on capability maturity improvement. Community
              enabled knowledge sharing and best practice dissemination.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF demonstrates strong internal validity as IT capability maturity framework:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Design science research methodology:</strong> IT-CMF was developed using
              design science research, which creates and evaluates IT artefacts intended to solve
              organizational problems. IVI addresses utility by making pragmatic validation an
              integral part of its research approach.
            </li>
            <li>
              <strong>Open innovation development:</strong> The research process is based on open
              innovation principles where IT professionals across multiple industries and academic
              researchers jointly define the research agenda, perform research, and validate
              results. This provides an essential feedback loop ensuring relevance and rigor.
            </li>
            <li>
              <strong>Consortium validation:</strong> Framework development involved 100+ large
              organizations collaborating to validate framework relevance, with over 200 consulting
              engagements by Boston Consulting Group providing practical validation.
            </li>
            <li>
              <strong>Clear maturity progression:</strong> Five-level maturity model provides
              logical progression from Initial (inadequate and unstable) through Optimizing
              (world-class attributes), with maturity levels additive and evidence-based.
            </li>
            <li>
              <strong>Comprehensive capability coverage:</strong> Framework comprehensively
              addresses IT from strategy through delivery through value realization across 36
              Critical Capabilities organized into four macro-capabilities.
            </li>
            <li>
              <strong>Iterative staged validation:</strong> Research is overseen by a Steering Board
              including industry leaders and academic researchers. Research is conducted in
              iterative stages with ongoing consortium validation.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations concern generalizability of IT-CMF across diverse
            organizational contexts:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Enterprise applicability:</strong> Framework developed for large enterprise IT
              organizations. Applicability to enterprise context is strong, supported by 100+ large
              organization research.
            </li>
            <li>
              <strong>Mid-market applicability:</strong> Framework applicability to mid-market
              organizations is moderate. Mid-market organizations with smaller IT teams may find 36
              capabilities overwhelming.
            </li>
            <li>
              <strong>Small organization limitations:</strong> Framework emphasis on comprehensive
              capability assessment and formalization may be less applicable to small organizations
              with limited IT staff.
            </li>
            <li>
              <strong>Industry variation:</strong> Framework applicability varies across industries.
              Financial services, healthcare, and government organizations benefit from governance
              and risk emphasis. Startup and technology companies may find framework less
              applicable.
            </li>
            <li>
              <strong>Organizational culture dependence:</strong> Framework effectiveness depends on
              organizational commitment to process discipline and continuous improvement.
              Organizations with process discipline culture benefit more from IT-CMF.
            </li>
            <li>
              <strong>Agile integration challenges:</strong> Organizations adopting agile methods
              report challenges with IT-CMF emphasis on standardization and process discipline.
              Framework adaptation required for agile environments.
            </li>
            <li>
              <strong>Digital transformation applicability:</strong> Digital transformation
              initiatives increasingly emphasize speed and innovation. IT-CMF advanced and
              optimizing levels provide digital transformation relevance.
            </li>
            <li>
              <strong>Geographic and cultural variation:</strong> Framework developed primarily with
              large Western organizations. Applicability to different geographic regions and
              organizational cultures varies.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF addresses technology adoption by establishing that technology decisions should
            align with IT capability maturity and business value creation objectives. Framework
            emphasizes that organizations must develop IT capabilities to effectively adopt and
            sustain new technologies. Technology adoption success depends on organizational
            readiness, governance maturity, change management capability, and business-IT alignment
            maturity.
          </p>

          <h3 className={H3_CLASSES}>
            Barriers to Capability-Aligned Technology Adoption Identified
          </h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Immature technology governance:</strong> Organizations without mature
              technology governance lack decision frameworks for technology adoption. Governance
              immaturity leads to technology decisions based on enthusiasm rather than strategic
              alignment.
            </li>
            <li>
              <strong>Inadequate business-IT alignment:</strong> Technology adoption without
              business-IT alignment may not support business objectives. Alignment immaturity leads
              to technology investments not creating business value.
            </li>
            <li>
              <strong>Weak IT service management:</strong> Organizations without mature IT service
              management cannot effectively operationalize adopted technologies. Service management
              immaturity leads to technology adoption failures.
            </li>
            <li>
              <strong>Limited change management capability:</strong> Technology adoption requires
              capability to manage organizational change. Change management immaturity leads to
              adoption resistance and inadequate user transitions.
            </li>
            <li>
              <strong>Insufficient cost management:</strong> Technology adoption without mature cost
              management creates uncontrolled IT spending. Cost management immaturity leads to
              technology adoption overspend.
            </li>
            <li>
              <strong>Weak value realization discipline:</strong> Technology adoption without value
              realization discipline fails to demonstrate business value. Value realization
              immaturity leads to inability to justify continued investment.
            </li>
            <li>
              <strong>Inadequate organizational capability:</strong> Technology adoption requires
              organizational capability and capacity. Organizational capability immaturity leads to
              technology adoption overwhelm.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Assess current IT capability maturity:</strong> Conduct comprehensive
              assessment of current IT capability maturity across 36 Critical Capabilities.
              Assessment establishes baseline for improvement planning.
            </li>
            <li>
              <strong>Establish technology governance:</strong> Create governance structures and
              decision processes ensuring technology adoption aligns with business strategy and
              organizational capabilities.
            </li>
            <li>
              <strong>Define target capability maturity:</strong> Establish target capability
              maturity levels for adoption support capabilities. Target definition provides
              improvement objectives.
            </li>
            <li>
              <strong>Plan capability improvement:</strong> Develop phased plan for improving IT
              capability maturity in areas supporting technology adoption. Improvement plan aligns
              with technology adoption timeline.
            </li>
            <li>
              <strong>Strengthen business-IT alignment:</strong> Establish structures connecting
              business strategy to technology adoption decisions. Alignment ensures technology
              adoption supports business objectives.
            </li>
            <li>
              <strong>Develop service management capability:</strong> Build IT service management
              capability to operationalize and sustain adopted technologies. Service management
              capability reduces adoption failure risk.
            </li>
            <li>
              <strong>Enhance change management:</strong> Develop organizational change management
              capability supporting technology adoption. Change management capability increases
              adoption success.
            </li>
            <li>
              <strong>Establish value measurement:</strong> Create processes for measuring and
              demonstrating technology adoption business value. Value measurement provides
              justification for continued investment.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            IT-CMF influenced subsequent IT management frameworks and research:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            As a 2016 framework with ongoing development by the Innovation Value Institute, IT-CMF
            is relatively recent. Documented adoption includes over 200 consulting engagements by
            Boston Consulting Group and deployment at organizations including BNY Mellon, Chevron,
            BP, and EY. The framework continues to be developed through IVI&rsquo;s open innovation
            consortium model.
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                <Link
                  href="/bibliography-2-16-aws-caf-ai-2024"
                  className="text-tabs-teal-deep hover:underline"
                >
                  AWS Cloud Adoption Framework for AI (2024)
                </Link>
                :
              </strong>{' '}
              Cloud adoption frameworks increasingly assess organizational capability maturity as a
              prerequisite for technology adoption, reflecting IT-CMF&rsquo;s emphasis on capability
              readiness.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-curley-2016">
              Curley, M., Kenneally, J., &amp; Carcary, M. (2016).{' '}
              <em>IT capability maturity framework (IT-CMF): The body of knowledge guide</em> (2nd
              ed.). Van Haren Publishing.
            </li>
            <li id="ref-kaplan-1992">
              Kaplan, R. S., &amp; Norton, D. P. (1992). The balanced scorecard: Measures that drive
              performance. <em>Harvard Business Review</em>, 70(1), 71-79.
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-carcary-2014">
              Carcary, M., Doherty, E., &amp; Heavin, C. (2014). The roadmap to value: Defining
              organisational value using the business value model.{' '}
              <em>Journal of Decision Systems</em>, 23(3), 345-365.
            </li>
            <li id="ref-sei-2010">
              SEI (Carnegie Mellon Software Engineering Institute). (2010).{' '}
              <em>CMMI for development: Version 1.3</em>. Carnegie Mellon University Press.
            </li>
            <li id="ref-axelos-2011">
              Axelos. (2011). <em>ITIL Foundation handbook</em>. The Stationery Office.
            </li>
            <li id="ref-cobit-2012">
              ISACA. (2012).{' '}
              <em>
                COBIT 5: A business framework for the governance and management of enterprise IT
              </em>
              {'. ISACA Publications.'}
            </li>
            <li id="ref-ross-2006">
              Ross, J. W., Weill, P., &amp; Robertson, D. C. (2006).{' '}
              <em>
                Enterprise architecture as strategy: Creating a foundation for business execution
              </em>
              . Harvard Business School Press.
            </li>
            <li id="ref-barkley-1994">
              Barkley, B. T., &amp; Saylor, J. H. (1994).{' '}
              <em>
                Customer-driven project management: A new paradigm in total quality implementation
              </em>
              . McGraw-Hill.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link href="/bibliography-2-14-cmmi-chrissis-2005" className={navLinkClass}>
                &larr; Previous: CMMI - Chrissis, Konrad, &amp; Shrum (2005)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link href="/bibliography-2-16-aws-caf-ai-2024" className={navLinkClass}>
                Next: AWS Cloud Adoption Framework for AI - AWS (2024) &rarr;
              </Link>
            </p>
            <p className={`${PARAGRAPH_CLASSES} mt-6`}>
              <Link
                href="/article-bibliography-comprehensive-series-bibliography"
                className={navLinkClass}
              >
                Back to Complete Bibliography
              </Link>
            </p>
          </div>
        </section>
      </article>
    </main>
  )
}

export default BibliographyArticlePage
