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
  title: 'Bibliography: Capability Maturity Model (CMM) - Humphrey (1989)',
  description:
    'Comprehensive overview of the Capability Maturity Model, a five-level framework for assessing and improving software development process maturity, foundational methodology for IT process improvement emphasizing standardization, measurement, and continuous advancement.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Capability Maturity Model (CMM) - Humphrey (1989)</h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Capability Maturity Model for Software
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> CMM
            </p>
            <p>
              <strong>Target of Framework:</strong> Assessment and improvement of software
              development process maturity through a five-level framework emphasizing
              standardization, measurement, and continuous advancement enabling organizations to
              predict and control software development costs, schedules, and quality
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Software Engineering, Process Management,
              Quality Management, Organizational Capability Development, Technology Management
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Watts S. Humphrey
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1989
            </p>
            <p>
              <strong>Official Title:</strong> Managing the Software Process
            </p>
            <p>
              <strong>Publisher:</strong> Addison-Wesley
            </p>
            <p>
              <strong>Book Format:</strong> Authored book, not journal article
            </p>
            <p>
              <strong>ISBN:</strong> 978-0-201-18095-4
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
                Humphrey, W. S. (
                <a href="#ref-humphrey-1989" className="text-tabs-teal-deep hover:underline">
                  1989
                </a>
                ). <em>Managing the software process</em>. Addison-Wesley.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Humphrey, Watts S. 1989. <em>Managing the Software Process</em>. Reading, MA:
                Addison-Wesley.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Watts Humphrey developed the Capability Maturity Model in direct response to a critical
            crisis in U.S. Department of Defense software development practices. Throughout the
            1970s and 1980s, the Department of Defense managed thousands of software development
            contracts with varying outcomes. Some contractors consistently delivered software on
            time and within budget while others chronically exceeded schedules, budgets, and quality
            expectations. Identical hardware development contracts under identical managers showed
            vast differences in software development outcomes. The Department of Defense and
            contractors struggled to understand what distinguished successful software organizations
            from chronically troubled ones.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Humphrey recognized that the software development field lacked fundamental practices and
            processes that had proven essential in other engineering disciplines. Manufacturing and
            hardware development had standardized processes, documented procedures, and measurement
            systems enabling prediction and control of outcomes. Software development, by contrast,
            was often ad hoc, driven by individual developer heroics, and lacking systematic
            processes or quality measurement. Software success depended more on having exceptional
            developers than on having good processes; this created unpredictability and limited
            scaling. Humphrey proposed that the solution required establishing a scientific basis
            for software process management through process definition, process measurement, and
            systematic process improvement.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The CMM emerged from Humphrey&rsquo;s work at the Software Engineering Institute (SEI)
            at Carnegie Mellon University, chartered by the U.S. Department of Defense to improve
            software development practices. Humphrey synthesized insights from quality management,
            manufacturing engineering, and organizational development into a framework specifically
            tailored to software development process improvement. The framework proposed that
            software development organizations evolve through predictable maturity levels, each
            level building on the previous level and enabling improved predictability, control, and
            effectiveness.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Capability Maturity Model is built on fundamental concepts about how organizations
            mature in process capability:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Process Maturity:</strong> The extent to which an organization has explicitly
              defined, documented, and standardized software development processes. Maturity
              progresses from ad hoc, undocumented practices (initial) to standardized, measured,
              optimized processes (optimizing).
            </li>
            <li>
              <strong>Key Process Areas (KPAs):</strong> Functional elements of software processes
              that must be established and institutionalized at each maturity level. Each level
              requires implementation of specific KPAs and integration with existing processes.
            </li>
            <li>
              <strong>Process Institutionalization:</strong> The extent to which practices are
              documented in standards, procedures, and training; embedded in organizational
              routines; assessed for compliance; and reinforced through organizational culture and
              management attention.
            </li>
            <li>
              <strong>Predictability:</strong> The capability to reliably predict software project
              outcomes (schedule, budget, quality) based on historical data and process knowledge.
              Predictability increases with maturity level.
            </li>
            <li>
              <strong>Measurement:</strong> Systematic collection of project metrics and process
              metrics enabling understanding of process performance, identification of improvement
              opportunities, and evidence-based process adjustments.
            </li>
            <li>
              <strong>Process Improvement:</strong> Systematic activities to evaluate processes,
              identify improvement opportunities, experiment with improvements, and institutionalize
              successful improvements.
            </li>
            <li>
              <strong>Quality Assurance:</strong> Activities to ensure that software development
              follows defined processes, product quality meets standards, and problems are
              identified and corrected.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Capability Maturity Model drew on and synthesized previous process management and
            quality theories:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Total Quality Management and Deming (
                <Link
                  href="/bibliography-2-4-total-quality-management-tqm-deming-1982"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Deming, 1986
                </Link>
                ):
              </strong>{' '}
              CMM incorporated TQM principles emphasizing continuous improvement, measurement, and
              statistical process control. Deming&rsquo;s focus on process improvement provided
              philosophical foundation for CMM maturity progression.
            </li>
            <li>
              <strong>Software Engineering Principles (Boehm, Brooks):</strong> CMM built on
              emerging software engineering discipline insights about software development
              challenges, complexity, and need for disciplined processes.
            </li>
            <li>
              <strong>Organizational Capabilities and Learning (Nelson &amp; Winter):</strong> CMM
              incorporated insights about organizational routines and capabilities as sources of
              performance differentiation.
            </li>
            <li>
              <strong>Systems Engineering and Process Discipline (Crosby, Juran):</strong> CMM
              adapted quality management frameworks from manufacturing and systems engineering to
              software development context.
            </li>
            <li>
              <strong>Project Management Practices (PMI, Kerzner):</strong> CMM incorporated project
              management discipline emphasizing planning, monitoring, control, and organizational
              processes.
            </li>
            <li>
              <strong>Process Maturity Concepts:</strong> Influenced by manufacturing and quality
              management concepts of process capability and progressive improvement.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Capability Maturity Model proposes that software development organizations progress
            through five maturity levels, each representing greater process definition,
            standardization, measurement, and optimization capability. Organizations at higher
            maturity levels can more reliably predict and control software development outcomes,
            achieve better quality with fewer surprises, and execute complex projects with lower
            risk. Progression through maturity levels requires systematic implementation of Key
            Process Areas specific to each level, followed by organizational institutionalization of
            new practices.
          </p>

          <h3 className={H3_CLASSES}>Five Maturity Levels</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Level 1 - Initial/Ad Hoc:</strong> Software development processes are
              unpredictable, poorly controlled, and reactive. Success depends on individual heroics
              rather than organizational processes. Organizations at this level lack defined
              processes, documented procedures, or measurement systems. Project outcomes (schedule,
              budget, quality) are difficult to predict. Software development is chaotic;
              organizations may not sustain repeatable success.
            </li>
            <li>
              <strong>Level 2 - Repeatable/Managed:</strong> Basic project management processes are
              established enabling some project predictability. Key Process Areas include
              requirements management, software planning, project tracking, supplier agreement
              management, and change management. Processes are documented and followed for
              individual projects. Project planning and tracking occur systematically. Some
              historical data becomes available enabling basic process predictions. Organizations
              can repeat past successes in similar contexts.
            </li>
            <li>
              <strong>Level 3 - Defined/Standardized:</strong> Organizational standard processes are
              defined, documented, and tailored for specific projects. Key Process Areas include
              process definition, process focus, peer review, training, product engineering,
              integration engineering, verification and validation. Software development processes
              are standardized across the organization enabling consistency and knowledge sharing.
              Processes are measured and analyzed; improvement recommendations emerge from process
              data. Organizational culture emphasizes process discipline.
            </li>
            <li>
              <strong>Level 4 - Managed/Quantitatively Managed:</strong> Processes are defined
              quantitatively with statistical process control and quantitative performance targets.
              Key Process Areas include quantitative process management and software quality
              management. Process performance is monitored using statistical techniques and
              controlled within quantitatively defined limits. Organizations set quantitative
              quality goals and measure progress toward goals. Process variation is understood and
              controlled.
            </li>
            <li>
              <strong>Level 5 - Optimizing/Continuously Improving:</strong> Processes are
              continuously improved through measurement-based feedback and experimentation. Key
              Process Areas include process improvement focus and technology change management.
              Organizations systematically optimize processes and experiment with innovations. New
              technologies are evaluated and integrated. Organizations maintain processes at the
              leading edge of software engineering practice.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Mechanisms</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Key Process Areas (KPAs):</strong> Functional elements that must be
              established at each maturity level. KPAs define what practices must be implemented and
              institutionalized for organizations to achieve that maturity level.
            </li>
            <li>
              <strong>Common Features:</strong> Characteristics present in organizations
              implementing KPAs effectively: commitment to perform, ability to perform, activities
              performed, measurement and analysis, verification of implementation.
            </li>
            <li>
              <strong>Process Definition and Documentation:</strong> Software processes must be
              explicitly defined, documented in standards and procedures, and made accessible to
              software developers.
            </li>
            <li>
              <strong>Process Measurement:</strong> Organizations collect metrics on process
              performance, project performance, and product quality. Metrics enable understanding of
              process effectiveness and identification of improvement opportunities.
            </li>
            <li>
              <strong>Organizational Learning and Improvement:</strong> Organizations capture
              lessons learned, analyze process data, and systematically improve processes based on
              evidence.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Directly addresses software development challenges:</strong> Developed
              specifically for software context, addressing documented software development problems
              and challenges.
            </li>
            <li>
              <strong>Practical assessment methodology:</strong> Provides concrete assessment
              criteria and detailed practices enabling organizations to assess current maturity
              level and identify improvement path.
            </li>
            <li>
              <strong>Predictable progression path:</strong> Specifies maturity progression path
              with clear criteria for moving between levels. Organizations understand what is
              required at each level.
            </li>
            <li>
              <strong>Empirically validated:</strong> Organizations improving maturity levels have
              demonstrated improved schedule predictability, cost control, and quality. Defensible
              claim of business value.
            </li>
            <li>
              <strong>Addresses scaling challenges:</strong> Enables organizations to scale beyond
              individual hero developers to reliable organizational capability.
            </li>
            <li>
              <strong>Measurement emphasis:</strong> Emphasizes measurement and data-driven
              decision-making enabling evidence-based improvement and objective progress assessment.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Slow progression through levels:</strong> Moving from one maturity level to
              the next typically requires 2-4 years of sustained effort. Organizations seeking rapid
              improvement find CMM progression slow.
            </li>
            <li>
              <strong>Risk of bureaucratization:</strong> Process documentation and standardization
              can create bureaucracy if not managed carefully. Excessive documentation and process
              adherence can inhibit innovation.
            </li>
            <li>
              <strong>Complex assessment and implementation:</strong> CMM assessment is expensive
              and time-consuming. Implementation requires significant organizational change and
              resource commitment.
            </li>
            <li>
              <strong>Limited applicability to innovation and small projects:</strong> CMM emphasis
              on standardized processes may be less applicable to innovative work, research
              projects, or small software developments requiring flexibility.
            </li>
            <li>
              <strong>Context and industry variation:</strong> CMM was developed for DoD software
              development. Applicability to other industries, contexts, or software types (e.g., web
              development, startup environments) may vary.
            </li>
            <li>
              <strong>Agile methodology tensions:</strong> CMM emphasis on planning and
              documentation can tension with Agile methodologies emphasizing iterative development
              and adaptive planning. Integration of CMM and Agile practices remains challenging.
            </li>
            <li>
              <strong>Organizational culture requirements:</strong> CMM implementation requires
              significant organizational culture change. Organizations resistant to process
              discipline struggle with CMM adoption.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Brought process discipline to software development:</strong> Established that
              software development could benefit from process discipline, standardization, and
              measurement similar to manufacturing and engineering disciplines.
            </li>
            <li>
              <strong>Defined software maturity progression:</strong> Provided framework for
              understanding organizational software development maturity and maturity progression
              path.
            </li>
            <li>
              <strong>Operationalized software process improvement:</strong> Provided concrete
              practices and assessment criteria enabling organizations to systematically improve
              software development processes.
            </li>
            <li>
              <strong>Established process measurement in software:</strong> Emphasized measurement
              and metrics as central to process management, improving software engineering rigor.
            </li>
            <li>
              <strong>Addressed software scaling challenges:</strong> Provided framework for
              organizations to scale beyond small team dynamics to organizational capability.
            </li>
            <li>
              <strong>Created standardization opportunity:</strong> Provided common framework
              enabling software organizations globally to assess and compare maturity levels.
            </li>
            <li>
              <strong>Foundation for subsequent frameworks:</strong> Provided foundation for CMMI
              (Capability Maturity Model Integration), ISO/IEC 15504, and other software process
              improvement frameworks.
            </li>
            <li>
              <strong>Influenced DoD and government practice:</strong> Influenced procurement
              practices and contractor selection, driving widespread CMM adoption across software
              industry.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            As a process maturity framework grounded in empirical observation and software
            engineering practice, CMM demonstrates strong internal validity through logical
            coherence and consistency with observed software development patterns:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Logical progression:</strong> The maturity level progression logically builds:
              organizations must have basic project management before standardizing processes; must
              standardize processes before measuring them quantitatively; must measure before
              optimizing.
            </li>
            <li>
              <strong>Grounding in software engineering experience:</strong> The framework emerged
              from empirical investigation of successful and unsuccessful software development
              organizations. Identified practices reflect observed patterns in high-performing
              organizations.
            </li>
            <li>
              <strong>Consistency with process management theory:</strong> The framework
              incorporates established process management concepts: process definition, measurement,
              control, and improvement.
            </li>
            <li>
              <strong>Addresses documented software problems:</strong> The framework addresses
              well-documented software development problems: schedule predictability, quality
              consistency, cost control, and scaling challenges.
            </li>
            <li>
              <strong>Mutual reinforcement of practices:</strong> Practices at each level build on
              and reinforce each other. Process definition enables measurement; measurement enables
              control; control enables optimization.
            </li>
            <li>
              <strong>Clear assessment criteria:</strong> Framework provides clear, observable
              criteria for assessing maturity level enabling objective assessment rather than
              subjective judgment.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations concern generalizability of CMM across diverse software
            development contexts and organizational types:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>DoD context origin:</strong> CMM was developed in Department of Defense
              context with emphasis on large-scale, mission-critical software. Applicability to
              commercial software development, startups, or web development may differ.
            </li>
            <li>
              <strong>Software development context variation:</strong> CMM applicability may vary by
              software type. Applicability to innovative research software, exploratory prototypes,
              or Agile development may be less straightforward than to mission-critical systems.
            </li>
            <li>
              <strong>Organizational size effects:</strong> CMM was developed in large organizations
              with dedicated process management resources. Applicability to small software
              organizations or startups may be limited due to resource constraints.
            </li>
            <li>
              <strong>Agile methodology tensions:</strong> CMM emphasis on planning and
              documentation can conflict with Agile methodologies. Organizations using Agile
              approaches may struggle to implement CMM practices.
            </li>
            <li>
              <strong>Industry and cultural variation:</strong> CMM was developed in American
              software engineering culture. Applicability to different national cultures or
              organizational contexts may require adaptation.
            </li>
            <li>
              <strong>Organizational resistance:</strong> CMM implementation requires significant
              organizational change. Organizations with strong resistance to process discipline may
              struggle with adoption.
            </li>
            <li>
              <strong>Innovation and flexibility concerns:</strong> CMM emphasis on standardization
              and documentation may inhibit innovation in certain contexts requiring high
              flexibility and rapid adaptation.
            </li>
            <li>
              <strong>Measurement capability variation:</strong> CMM implementation requires
              organizational capability to collect, analyze, and act on process metrics.
              Organizations lacking analytical capability may struggle.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            CMM explains organizational success with technology adoption through process capability
            and maturity progression. Organizations at higher CMM maturity levels have standardized,
            measured processes enabling more effective technology adoption. Technology adoption
            success depends on organizational capability to define requirements, plan implementation
            systematically, track implementation progress, manage changes rigorously, and measure
            adoption outcomes. Organizations at CMM Level 1 (ad hoc) struggle with technology
            adoption because they lack basic planning, tracking, and management processes.
            Organizations at CMM Level 3+ (defined/standardized) have established processes enabling
            more systematic, predictable technology adoption. CMM predicts that technology adoption
            success correlates with organizational maturity level.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Lack of defined processes:</strong> Organizations without defined software
              development processes struggle to define technology adoption requirements
              systematically or plan adoption implementation.
            </li>
            <li>
              <strong>Weak project management:</strong> Absence of basic project management
              practices (planning, tracking, change management) creates chaos in technology adoption
              projects.
            </li>
            <li>
              <strong>Insufficient measurement:</strong> Organizations lacking measurement systems
              cannot track adoption progress or identify problems early.
            </li>
            <li>
              <strong>Uncontrolled change:</strong> Organizations without change management
              processes cannot manage the scope, impact, and pace of technology adoption changes.
            </li>
            <li>
              <strong>Poor requirements definition:</strong> Organizations without requirements
              management practices struggle to define what success means for technology adoption.
            </li>
            <li>
              <strong>Inadequate quality assurance:</strong> Organizations without quality assurance
              practices may not identify technology adoption problems until late in implementation.
            </li>
            <li>
              <strong>Lack of lessons capture:</strong> Organizations may repeat technology adoption
              mistakes because they do not systematically capture and share lessons learned.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Establish basic project management practices:</strong> Implement fundamental
              project planning, tracking, and control processes for technology adoption projects.
            </li>
            <li>
              <strong>Define adoption process standards:</strong> Establish organizational standards
              for how technology adoption will be managed, including planning, testing, rollout, and
              support.
            </li>
            <li>
              <strong>Implement requirements management:</strong> Define and manage technology
              adoption requirements systematically. Ensure requirements are clear, traceable, and
              validated.
            </li>
            <li>
              <strong>Establish change management:</strong> Implement formal change control
              processes for technology adoption changes. Control scope changes and prevent unmanaged
              growth.
            </li>
            <li>
              <strong>Implement measurement and tracking:</strong> Collect metrics on adoption
              progress, schedule conformance, budget conformance, and quality. Use metrics to guide
              management decisions.
            </li>
            <li>
              <strong>Institute quality assurance:</strong> Establish QA practices to verify that
              technology adoption follows defined processes and meets quality standards.
            </li>
            <li>
              <strong>Systematize lessons capture:</strong> Document lessons learned from technology
              adoption experiences. Share lessons across the organization to improve future
              adoptions.
            </li>
            <li>
              <strong>Pursue continuous improvement:</strong> Treat each technology adoption as
              opportunity to improve adoption processes. Incorporate improvements into
              organizational standards for future adoptions.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Capability Maturity Model has spawned significant theoretical developments and
            extensions building on and refining the original framework:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>CMMI (Capability Maturity Model Integration, 2000):</strong> Extended and
              integrated CMM with related models (IPPD, Systems Engineering) into unified framework.
              CMMI incorporated lessons learned from CMM implementations and addressed CMM
              limitations.
            </li>
            <li>
              <strong>ISO/IEC 15504 (SPICE):</strong> International standard for software process
              assessment based on CMM concepts but providing more flexible assessment approach and
              broader process areas.
            </li>
            <li>
              <strong>
                Agile and Iterative Models (
                <a
                  id="cite-ref-beck-2000-1"
                  href="#ref-beck-2000"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Beck, 2000
                </a>
                ;{' '}
                <a
                  id="cite-ref-schwaber-2002-1"
                  href="#ref-schwaber-2002"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Schwaber &amp; Sutherland, 2002
                </a>
                ):
              </strong>{' '}
              Developed as alternatives to CMM-style formal process discipline, emphasizing adaptive
              planning and iterative development. Later work explored integration of Agile and CMM
              approaches.
            </li>
            <li>
              <strong>
                DevOps and Continuous Integration (
                <a
                  id="cite-ref-humble-2010-1"
                  href="#ref-humble-2010"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Humble &amp; Farley, 2010
                </a>
                ):
              </strong>{' '}
              Extended software process concepts to emphasize continuous integration, deployment,
              and feedback. Incorporated measurement and automation concepts from CMM.
            </li>
            <li>
              <strong>
                Lean Software Development (Poppendieck &amp;{' '}
                <a
                  id="cite-ref-poppendieck-2003-1"
                  href="#ref-poppendieck-2003"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Poppendieck, 2003
                </a>
                ):
              </strong>{' '}
              Applied Lean principles to software development, emphasizing value delivery and waste
              elimination while incorporating process discipline concepts from CMM.
            </li>
            <li>
              <strong>Organizational Process Asset (OPA) Management:</strong> Extended CMM concepts
              to managing organizational knowledge and process assets across the enterprise.
            </li>
            <li>
              <strong>Software Process Simulation:</strong> Used computational models to simulate
              software process performance and explore process improvement scenarios.
            </li>
            <li>
              <strong>Process Mining and Analytics:</strong> Applied data analytics to process
              execution data to understand, analyze, and improve software development processes.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-humphrey-1989">
              Humphrey, W. S. (1989). <em>Managing the software process</em>. Addison-Wesley.
            </li>
            <li id="ref-beck-2000">
              Beck, K. (2000). <em>Extreme programming explained: Embrace change</em>.
              Addison-Wesley.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-beck-2000-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-poppendieck-2003">
              Poppendieck, M., &amp; Poppendieck, T. (2003).{' '}
              <em>Lean software development: An agile toolkit</em>. Addison-Wesley.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-poppendieck-2003-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-schwaber-2002">
              Schwaber, K., &amp; Sutherland, J. (2002).{' '}
              <em>The Scrum guide: The definitive guide to Scrum</em>. Scrum.org.
            </li>
            <li id="ref-humble-2010">
              Humble, J., &amp; Farley, D. (2010).{' '}
              <em>
                Continuous delivery: Reliable software releases through build, test, and deployment
                automation
              </em>
              . Addison-Wesley.
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-carnegie-1993">
              Carnegie Mellon University Software Engineering Institute. (1993).{' '}
              <em>Capability maturity model for software</em> (Version 1.1). CMU/SEI-93-TR-24.
            </li>
            <li id="ref-chrissis-2003">
              Chrissis, M. B., Konrad, M., &amp; Shrum, S. (2003).{' '}
              <em>CMMI: Guidelines for process integration and product improvement</em>.
              Addison-Wesley.
            </li>
            <li id="ref-international-2007">
              International Organization for Standardization. (2007).{' '}
              <em>ISO/IEC 15504-1: Information technology - Process assessment</em>. ISO.
            </li>
            <li id="ref-pressman-2014">
              Pressman, R. S., &amp; Maxim, B. R. (2014).{' '}
              <em>Software engineering: A practitioner&rsquo;s approach</em> (8th ed.). McGraw-Hill.
            </li>
            <li id="ref-sommerville-2015">
              Sommerville, I. (2015). <em>Software engineering</em> (10th ed.). Addison-Wesley.
            </li>
            <li id="ref-boehm-1988">
              Boehm, B. W. (1988). A spiral model of software development and enhancement.
              <em>Computer</em>, 21(5), 61-72.
            </li>
            <li id="ref-brooks-1995">
              Brooks, F. P. (1995). <em>The mythical man-month: Essays on software engineering</em>
              (anniversary ed.). Addison-Wesley.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-4-total-quality-management-tqm-deming-1982"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Total Quality Management (TQM) (Deming, 1982/1986)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-6-toe-framework-tornatzky-1990"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Technology-Organization-Environment (TOE) Framework (Tornatzky, 1990) &rarr;
              </Link>
            </p>
            <p className={`${PARAGRAPH_CLASSES} mt-6`}>
              <Link
                href="/article-bibliography-comprehensive-series-bibliography"
                className="text-blue-600 hover:text-blue-800 underline"
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
