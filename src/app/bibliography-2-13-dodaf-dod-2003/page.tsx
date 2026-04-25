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
  title: 'Bibliography: DoDAF - Department of Defense Architecture Framework (2003)',
  description:
    'Comprehensive overview of the Department of Defense Architecture Framework (DoDAF). Explains capability-based architecture, viewpoints-based description, and DoDAF role as mandatory architecture framework for US DoD acquisitions and joint capabilities.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>DoDAF - Department of Defense Architecture Framework (2003)</h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Department of Defense Architecture Framework
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> DoDAF
            </p>
            <p>
              <strong>Target of Framework:</strong> Providing mandatory architecture description
              framework for US Department of Defense acquisitions, capability development, and joint
              operations. DoDAF enables consistent capability-based architecture across defense
              enterprise.
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Enterprise Architecture, Defense Acquisition,
              Military Capability Development, Systems Engineering, Joint Operations
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> US Department of Defense, Office of the Chief Information
              Officer
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2003 (DoDAF Version 1.0)
            </p>
            <p>
              <strong>Current Version:</strong> DoDAF Version 2.02 (2010)
            </p>
            <p>
              <strong>Official Title:</strong> DoD Architecture Framework (version-specific)
            </p>
            <p>
              <strong>Publisher:</strong> US Department of Defense
            </p>
            <p>
              <strong>Document Format:</strong> Architecture framework specification, viewpoint
              guides, meta-model documentation, and implementation guidelines
            </p>
            <p>
              <strong>URL:</strong>{' '}
              <a
                href="https://dodcio.defense.gov/Library/DoD-Architecture-Framework/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://dodcio.defense.gov/Library/DoD-Architecture-Framework/
              </a>
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
                U.S. Department of Defense. (2003). <em>DoD architecture framework version 1.0</em>.
                U.S. Department of Defense, Office of the Chief Information Officer.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                U.S. Department of Defense. 2003. <em>DoD Architecture Framework Version 1.0</em>.
                U.S. Department of Defense, Office of the Chief Information Officer.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            During the 1990s and early 2000s, the US Department of Defense faced significant
            capability gaps and modernization challenges. Military capabilities depended on diverse
            information systems, platforms, and networks that were not well-integrated or
            coordinated. Different military commands used different architecture approaches and had
            limited interoperability. The Pentagon needed common framework ensuring military
            capabilities were properly architected, integrated, and operationally effective.
            Acquisition decisions lacked structured approach to capability-based requirements and
            architecture.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF evolved from the earlier C4ISR (Command, Control, Communications, Computers,
            Intelligence, Surveillance, Reconnaissance) Architecture Framework (v2.0, 18 December
            1997) but needed more comprehensive architecture framework incorporating lessons
            learned. DoDAF Version 1.0 (2003; Deskbook 9 February 2004) established a mandatory
            architecture description framework for all DoD acquisitions and major capability
            development efforts. Version 1.5 followed in April 2007 with refinements to the
            view-product set and improved guidance (date reported in secondary sources; not
            verifiable from the Version 1.0 Deskbook). DoDAF provided a structured approach to
            describing military capabilities, analyzing capability gaps, and planning modernization.
            The framework shifted DoD acquisition focus from individual systems to integrated
            capabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF became foundational to US military doctrine. Major defense modernization programs
            became required to develop DoDAF-compliant architecture descriptions. The framework
            enabled DoD to systematically assess joint capabilities, identify capability gaps, plan
            capability improvements, and manage complex interdependencies across platforms,
            networks, and systems. DoDAF 2.0 (2009, updated to 2.02 in 2010) further evolved the
            framework by formalizing the data-centric approach already advocated in the Version 1.0
            Deskbook (see Figure 2.2-2) through the DoDAF Meta-model (DM2) and by restructuring the
            four view categories into eight viewpoints. (Post-v1.0 evolution details are reported in
            subsequent DoDAF releases; they are not verifiable from the Version 1.0 Deskbook.)
          </p>
        </section>

        {/* 5. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF does not measure constructs in the psychometric sense. As an architecture
            framework, it provides structured methods for describing and analyzing:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability requirements:</strong> What military capabilities are needed and
              how they relate to missions, operations, and organizational goals.
            </li>
            <li>
              <strong>Operational activities and information flows:</strong> What tasks, activities,
              and information exchanges are required to execute capabilities.
            </li>
            <li>
              <strong>Systems and services architecture:</strong> What systems, services, and
              interfaces are needed to support operational activities.
            </li>
            <li>
              <strong>Standards compliance:</strong> Whether technology choices conform to mandated
              technical standards and interoperability requirements.
            </li>
            <li>
              <strong>Interoperability:</strong> The degree to which systems, services, and data can
              be exchanged across organizational boundaries.
            </li>
            <li>
              <strong>Capability gaps:</strong> Differences between required capabilities and
              current capabilities, informing modernization and acquisition decisions.
            </li>
          </ul>
        </section>

        {/* 6. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>DoDAF centers on several core concepts:</p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability:</strong> The ability to accomplish a military mission, function,
              or objective. Capabilities span people, processes, technology, and information.
              Capability focus enables warfighter-centric architecture.
            </li>
            <li>
              <strong>Architecture Views:</strong> Structured descriptions of specific aspects of
              capability from particular stakeholder perspective. Views show architecture from
              different vantage points addressing different stakeholder concerns.
            </li>
            <li>
              <strong>Viewpoints:</strong> Sets of related views showing particular architecture
              concerns. Viewpoints organize views into coherent collections addressing specific
              stakeholder interests (e.g., all operational views).
            </li>
            <li>
              <strong>Operational Architecture:</strong> Description of tasks, activities, and
              information flows necessary to accomplish military capability. Operational
              architecture defines what must be done without specifying how.
            </li>
            <li>
              <strong>Systems Architecture:</strong> Description of systems, system
              interconnections, and interfaces required to realize operational capability. Systems
              architecture specifies what systems are needed and how they integrate.
            </li>
            <li>
              <strong>Services Architecture:</strong> Description of services (DoDAF 2.0 addition)
              describing service-oriented approach to capability realization. Services architecture
              enables modular, reusable services.
            </li>
            <li>
              <strong>Capability-Based Planning:</strong> Planning process focused on developing
              capabilities to accomplish military missions rather than platform-centric planning.
              Capability focus enables more flexible modernization strategies.
            </li>
          </ul>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF built upon and extended several prior approaches:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                TAFIM (Technical Architecture Framework for Information Management, DoD 1994):
              </strong>{' '}
              TAFIM provided foundation for TOGAF and influenced DoD architecture thinking. DoDAF
              incorporated some TAFIM principles but took different direction emphasizing
              capability.
            </li>
            <li>
              <strong>C4ISR Architecture Framework (1996/1997):</strong> DoD&rsquo;s predecessor
              framework focusing on Command, Control, Communications, Computers, Intelligence,
              Surveillance, Reconnaissance architecture. DoDAF evolved from C4ISR framework.
            </li>
            <li>
              <strong>
                TOGAF (
                <Link
                  href="/bibliography-2-12-togaf-the-open-group-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  The Open Group Architecture Framework, 1995
                </Link>
                ):
              </strong>{' '}
              Commercial enterprise architecture framework. DoDAF learned from TOGAF but adapted
              principles to military capability focus.
            </li>
            <li>
              <strong>Zachman Framework (Zachman, 1987):</strong> Enterprise architecture framework
              emphasizing multiple stakeholder perspectives. DoDAF incorporated perspective-based
              approach similar to Zachman.
            </li>
            <li>
              <strong>Systems Engineering Practices (IEEE, 1980s-1990s):</strong> Systems
              engineering discipline provided foundation for DoDAF&rsquo;s systematic approach to
              capability development.
            </li>
            <li>
              <strong>Joint Operations Concepts (JOC) Evolution (1990s onwards):</strong> Joint
              warfare doctrine and operational concepts informed DoDAF capability focus. DoDAF
              translated capability concepts into architecture descriptions.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF provides mandatory architecture framework for US Department of Defense enabling
            capability-based architecture descriptions through systematic viewpoints, views, and
            data elements capturing military capability across operational, systems, services, and
            standards domains.
          </p>

          <h3 className={H3_CLASSES}>DoDAF 1.0 View Structure</h3>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF Version 1.0 (2003) organized architecture description into four view categories,
            each containing multiple products:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>All View (AV):</strong> Overarching products describing architecture overview,
              integrated dictionary, and documentation standards. AV products provide comprehensive
              context for all other views.
            </li>
            <li>
              <strong>Operational View (OV):</strong> Describes military tasks, activities,
              information flows, and organizational relationships needed to accomplish capability.
              OV products show operational concepts and required capabilities.
            </li>
            <li>
              <strong>Systems View (SV):</strong> Describes systems, system interconnections, system
              responsibilities, and system information exchanges. SV products show systems
              architecture and system integration.
            </li>
            <li>
              <strong>Technical Standards View (TV):</strong> Describes technical standards,
              policies, and compliance requirements governing architecture. TV products ensure
              interoperability and standards consistency.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>DoDAF 2.0 Evolution</h3>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF 2.0 (2009) and 2.02 (2010) significantly evolved the framework, expanding from
            four view categories to eight viewpoints and formalizing the data-centric approach
            already advocated in the Version 1.0 Deskbook through a defined meta-model:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Expanded to Eight Viewpoints:</strong> Added four new viewpoints: Capability
              Viewpoint (CV) for capability-based planning and assessment, Data and Information
              Viewpoint (DIV) for data standardization and information sharing, Project Viewpoint
              (PV) for implementation planning, and Services Viewpoint (SvcV) for service-oriented
              capability realization. The original TV became the Standards Viewpoint (StdV).
            </li>
            <li>
              <strong>Data-Centric Meta-Model Formalization:</strong> Formalized the data-centric
              architecture approach already described in the Version 1.0 Deskbook (see Figure 2.2-2,
              Data-Centric Build Sequence) by defining the DoDAF Meta-model (DM2) as a standardized
              data model. DM2 enables automated analysis and capability assessment across
              architectures.
            </li>
            <li>
              <strong>Meta-Model Foundation (DM2):</strong> Defined formal meta-model describing all
              architecture elements and relationships. DM2 enables consistent architecture
              description and automated processing.
            </li>
            <li>
              <strong>Fit-for-Purpose Guidance:</strong> Introduced principle that architectures
              should be developed only to the level of detail needed for the decision at hand,
              rather than requiring exhaustive documentation across all viewpoints.
            </li>
            <li>
              <strong>Analytical Capability:</strong> Data-centric approach enables automated
              capability gap analysis and trade-space analysis supporting better decision-making.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Architectural Domains</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Operational Architecture:</strong> Describes tasks, activities, organizations,
              information, and timelines needed to accomplish military operations and capability.
              Operational architecture answers what capabilities are needed.
            </li>
            <li>
              <strong>Systems Architecture:</strong> Describes systems, system interfaces, system
              interactions, and system data flows required to support operations. Systems
              architecture answers what systems and technologies are needed.
            </li>
            <li>
              <strong>Services Architecture:</strong> Describes services, service capabilities,
              service dependencies, and service interfaces enabling capability realization. Services
              architecture enables modular service-based integration.
            </li>
            <li>
              <strong>Capability Architecture:</strong> Describes military capabilities, capability
              dependencies, capability evolution, and capability roadmap. Capability architecture
              enables capability-based planning and assessment.
            </li>
            <li>
              <strong>Data and Information Architecture:</strong> Describes information entities,
              information definitions, information relationships, and information standards. Data
              architecture enables information sharing and interoperability.
            </li>
            <li>
              <strong>Standards Architecture:</strong> Describes technical standards, interface
              standards, data standards, and security standards governing capability realization.
              Standards architecture ensures interoperability and compliance.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability-centric focus:</strong> DoDAF emphasizes military capability
              enabling warfighter-centric architecture. Capability focus aligns architecture with
              military missions.
            </li>
            <li>
              <strong>Mandatory adoption:</strong> DoDAF is mandatory for DoD acquisitions and major
              capability efforts. Mandatory adoption ensures compliance and consistency across
              defense enterprise.
            </li>
            <li>
              <strong>Comprehensive viewpoint set:</strong> Multiple viewpoints address different
              stakeholder perspectives from operators to technologists. Comprehensive viewpoint
              coverage addresses diverse stakeholder interests.
            </li>
            <li>
              <strong>Integration focus:</strong> DoDAF emphasizes integration and interoperability
              across systems and capabilities. Integration focus improves joint operational
              effectiveness.
            </li>
            <li>
              <strong>Data-centric approach (DoDAF 2.0):</strong> Data-centric meta-model enables
              automated analysis and capability assessment. Data-centric approach enables
              sophisticated analytical capabilities.
            </li>
            <li>
              <strong>Proven effectiveness:</strong> DoDAF applied to major defense modernization
              programs. Proven track record demonstrates framework effectiveness at defense scale.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Complexity and documentation burden:</strong> DoDAF requires extensive
              architecture documentation across multiple viewpoints. Documentation burden increases
              time and cost for architecture development.
            </li>
            <li>
              <strong>Learning curve:</strong> DoDAF complexity requires significant training for
              DoD personnel and contractors. Learning curve creates adoption challenges.
            </li>
            <li>
              <strong>Tool immaturity:</strong> DoDAF tooling for architecture development and
              analysis evolved slowly. Tool limitations constrain efficient architecture
              development.
            </li>
            <li>
              <strong>Viewpoint consistency challenges:</strong> Maintaining consistency across
              multiple views and viewpoints proved difficult. Viewpoint consistency remains
              challenging even with meta-model.
            </li>
            <li>
              <strong>Technology evolution pacing:</strong> Technology changes faster than DoDAF
              standards can be updated. Architecture standards may become dated relative to
              technology advances.
            </li>
            <li>
              <strong>Agile tension:</strong> DoDAF structured approach can conflict with agile
              development practices. Reconciling DoDAF with agile methods remains challenging.
            </li>
            <li>
              <strong>Implementation variation:</strong> DoDAF implementation maturity varies across
              DoD organizations and programs. Implementation variation limits consistency across
              defense enterprise.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Advanced capability-centric architecture approach:</strong> DoDAF 2.0 (2009)
              formalized a capability-centric architecture approach in the defense domain,
              complementing parallel capability-based planning initiatives already underway in DoD
              policy during the 2000s.
            </li>
            <li>
              <strong>Mandated architecture discipline across defense:</strong> Mandatory DoDAF
              adoption for acquisitions and major programs established architecture discipline
              across defense enterprise. Mandatory adoption demonstrated executive commitment to
              architecture discipline.
            </li>
            <li>
              <strong>Created comprehensive viewpoint framework:</strong> DoDAF viewpoint structure
              addressed needs of diverse stakeholders from operators to system engineers. Viewpoint
              approach became standard in architecture discipline.
            </li>
            <li>
              <strong>Enabled capability-based planning:</strong> DoDAF architecture descriptions
              enabled capability-based planning approach. Capability-based planning improved defense
              modernization strategy and resource allocation.
            </li>
            <li>
              <strong>Advanced data-centric architecture (DoDAF 2.0):</strong> DoDAF 2.0 emphasized
              a data-centric architecture description approach (via the DoDAF Meta Model, or DM2)
              intended to enable automated analysis and fit-for-purpose architecture data.
            </li>
            <li>
              <strong>Enabled integration and interoperability:</strong> DoDAF emphasized systems
              integration and interoperability. Integration focus improved joint operational
              effectiveness across services.
            </li>
            <li>
              <strong>Foundation for defense acquisition reform:</strong> DoDAF architecture
              descriptions became requirement for major acquisition programs. Architecture
              requirement improved acquisition decision-making and risk management.
            </li>
            <li>
              <strong>Influenced federal and international architecture frameworks:</strong> DoDAF
              principles influenced other government agencies and international military partners.
              DoDAF approach became global defense architecture standard.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF is a prescriptive architecture framework and product specification rather than an
            empirical theory, so construct-validity testing does not apply in the psychometric
            sense. Considerations typically raised about its internal consistency include:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Logically coherent approach:</strong> The argument that capability-based
              architecture improves military effectiveness is logically sound. Capability focus
              aligns architecture with military missions.
            </li>
            <li>
              <strong>Comprehensive coverage:</strong> Framework comprehensively addresses
              capabilities from operational through technology implementation. Comprehensive
              approach addresses multiple interconnected concerns.
            </li>
            <li>
              <strong>Stakeholder perspective integration:</strong> Multiple viewpoints address
              different stakeholder perspectives. Perspective integration improves acceptance and
              addresses diverse concerns.
            </li>
            <li>
              <strong>Systems thinking foundation:</strong> DoDAF emphasis on systems integration
              and interoperability reflects established systems engineering principles. Systems
              approach improves overall capability effectiveness.
            </li>
            <li>
              <strong>Data-centric rigor (DoDAF 2.0):</strong> Formal meta-model and data-centric
              approach provide rigor for architecture description and analysis. Formal approach
              improves consistency and analytical capability.
            </li>
            <li>
              <strong>Broad operational deployment:</strong> DoDAF has been applied across major
              defense programs. Attribution of specific program outcomes to the framework itself
              (versus other factors such as acquisition reform and program management) is generally
              not established in published evaluations.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations concern generalizability of DoDAF beyond military
            context:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Limited civilian adoption:</strong> DoDAF primarily used in defense domain.
              Limited civilian application due to military-specific terminology and concepts.
            </li>
            <li>
              <strong>Military-specific orientation:</strong> DoDAF concepts (operations,
              capability, mission) reflect military domain. Military focus limits applicability to
              commercial or civilian contexts.
            </li>
            <li>
              <strong>Scalability challenges:</strong> DoDAF works well for large complex defense
              programs. Applicability to smaller organizations and projects unclear.
            </li>
            <li>
              <strong>Agile method integration challenges:</strong> DoDAF structured approach
              conflicts with agile methods. Integration with agile practices requires significant
              adaptation.
            </li>
            <li>
              <strong>International variations:</strong> Different military organizations (different
              countries, NATO allies) use different architecture frameworks. International
              standardization on DoDAF limited.
            </li>
            <li>
              <strong>Technology evolution pacing:</strong> Technology changes faster than DoDAF
              standards can be updated. Reference architectures and standards may become outdated.
            </li>
            <li>
              <strong>Government adoption variation:</strong> Federal civilian agencies use FEAF
              (Federal Enterprise Architecture Framework) rather than DoDAF. Civilian government
              adoption inconsistent.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF addresses technology adoption by establishing that technology decisions should
            support military capabilities and operational requirements rather than being driven by
            technology vendors. DoDAF requires organizations to develop operational architecture
            describing required capabilities, systems architecture describing systems needed to
            support capability, and assess technologies against capability requirements. This
            enables capability-driven technology adoption rather than vendor-driven acquisition.
          </p>

          <h3 className={H3_CLASSES}>
            Barriers to Capability-Driven Technology Adoption Identified
          </h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Capability ambiguity:</strong> Military capabilities poorly defined or
              inconsistently understood. Ambiguous capability definitions lead to misaligned
              technology acquisitions.
            </li>
            <li>
              <strong>Legacy system dependencies:</strong> Existing systems and programs constrain
              technology adoption choices. Legacy constraints limit modernization options.
            </li>
            <li>
              <strong>Service parochialism:</strong> Different military services emphasize different
              capabilities and technologies. Service-specific interests conflict with joint
              capability perspective.
            </li>
            <li>
              <strong>Industrial base constraints:</strong> Vendor capabilities and supply base may
              constrain technology choices. Vendor ecosystem limitations restrict technology
              options.
            </li>
            <li>
              <strong>Governance gaps:</strong> Acquisition decisions may bypass capability-based
              governance processes. Governance gaps allow non-compliant acquisitions.
            </li>
            <li>
              <strong>Interoperability challenges:</strong> Technology acquisitions may lack
              interoperability with existing systems and capabilities. Interoperability failures
              reduce overall capability effectiveness.
            </li>
            <li>
              <strong>Rapid technology change:</strong> Technology evolution outpaces acquisition
              timelines. Technology changes between requirement definition and deployment.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Define military capabilities clearly:</strong> Establish clear definition of
              military capabilities, capability requirements, and capability performance measures.
              Clear capability definitions enable technology-independent requirement statements.
            </li>
            <li>
              <strong>Develop operational architecture:</strong> Create operational architecture
              describing tasks, activities, and information flows needed to accomplish capability.
              Operational architecture establishes capability-based requirements.
            </li>
            <li>
              <strong>Assess technology against requirements:</strong> Evaluate technology options
              against capability requirements and operational architecture. Requirements-based
              assessment ensures technology supports capability.
            </li>
            <li>
              <strong>Plan systems integration:</strong> Develop systems architecture describing
              systems needed and system integration approach. Integration planning ensures systems
              work together supporting capability.
            </li>
            <li>
              <strong>Establish interoperability standards:</strong> Define technical standards
              ensuring systems interoperate and support information sharing. Standards ensure
              capability effectiveness across systems.
            </li>
            <li>
              <strong>Coordinate across services:</strong> Establish governance ensuring technology
              acquisitions support joint capabilities. Governance coordination improves joint
              effectiveness.
            </li>
            <li>
              <strong>Monitor capability realization:</strong> Continuously assess whether
              implemented technology systems achieve required capabilities. Monitoring enables
              course correction and capability assurance.
            </li>
            <li>
              <strong>Plan capability evolution:</strong> Develop capability roadmap showing how
              capabilities will evolve over time. Roadmap planning enables orderly modernization and
              technology insertion.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF has evolved through multiple versions and is commonly discussed alongside related
            architecture frameworks and capability-planning approaches:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>DoDAF Evolution (2003-2010+):</strong> DoDAF evolved from Version 1.0 (2003)
              through Version 2.02 (2010) with enhanced capability focus and data-centric approach.
              Evolution demonstrates framework maturity and continuous improvement.
            </li>
            <li>
              <strong>Federal Enterprise Architecture Framework (FEAF):</strong> Civilian federal
              government developed FEAF based on enterprise architecture principles. FEAF adapted
              architecture discipline to civilian government context.
            </li>
            <li>
              <strong>NATO Architecture Framework (NAF):</strong> NATO allies developed architecture
              framework based on DoDAF principles. NAF v3 (2007) aligned with DoDAF viewpoints; NAF
              v4 (2018) adopted a model-based approach aligned with the NATO C3 Taxonomy. NAF
              enabled international military interoperability across 28+ member nations.
            </li>
            <li>
              <strong>Capability-Based Planning (CBP, 2004 onwards):</strong> DoD adopted
              capability-based planning as strategic planning approach enabled by DoDAF
              architectures. CBP revolutionized defense planning from platform-centric to
              capability-centric.
            </li>
            <li>
              <strong>Net-Centric Warfare Architecture (NCW):</strong> DoD emphasized
              network-centric operations and information sharing. DoDAF architectures enabled
              net-centric warfare implementation.
            </li>
            <li>
              <strong>Joint Capability Integration and Development System (JCIDS):</strong> DoD
              requirements process evolved to emphasize capability-based requirements informed by
              DoDAF architectures. JCIDS and DoDAF became complementary processes.
            </li>
            <li>
              <strong>Service-Oriented Architecture (SOA) in Defense:</strong> DoDAF services
              viewpoint enabled service-oriented architecture approaches. SOA provided alternative
              to traditional system-centric integration.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-u-s-2003">
              U.S. Department of Defense. (2003). <em>DoD architecture framework version 1.0</em>.
              U.S. Department of Defense, Office of the Chief Information Officer.
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-u-s-2010">
              U.S. Department of Defense. (2010). <em>DoD architecture framework version 2.02</em>.
              U.S. Department of Defense, Office of the Chief Information Officer.
            </li>
            <li id="ref-u-s-1997">
              U.S. Department of Defense. (1997). <em>C4ISR architecture framework version 2.0</em>.
              U.S. Department of Defense.
            </li>
            <li id="ref-u-s-1994">
              U.S. Department of Defense. (1994).{' '}
              <em>
                Technical architecture framework for information management (TAFIM), version 2.0
              </em>
              . U.S. Government Publishing Office.
            </li>
            <li id="ref-alberts-2007">
              Alberts, D. S., &amp; Hayes, R. E. (2007). <em>Understanding command and control</em>.
              CCRP Publication.
            </li>
            <li id="ref-morris-2004">
              Morris, E., Levine, L., Meyers, C., Place, P., &amp; Plakosh, D. (2004).{' '}
              <em>System of systems interoperability (SOSI)</em>. Software Engineering Institute.
            </li>
            <li id="ref-u-s-2004">
              U.S. Department of Defense. (2004). <em>Capability-based planning guidance</em>. U.S.
              Department of Defense.
            </li>
            <li id="ref-nato-2018">
              NATO. (2018). <em>NATO architecture framework version 4</em>. NATO Consultation,
              Command and Control Board, Architecture Capability Team.
            </li>
            <li id="ref-schekkerman-2003">
              Schekkerman, J. (2003).{' '}
              <em>How to survive in the jungle of enterprise architecture frameworks</em>. Trafford
              Publishing.
            </li>
            <li id="ref-liles-2004">
              Liles, R. P., &amp; Goodman, S. E. (2004). IT leadership as a strategic tool for
              command and control transformation. <em>Naval War College Review</em>, 57(3), 95-111.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-12-togaf-the-open-group-1995"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: TOGAF - The Open Group (1995-2022)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-14-cmmi-chrissis-2005"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: CMMI - Chrissis, Konrad &amp; Shrum (2005) &rarr;
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
