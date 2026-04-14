import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
  BODY_OL_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: DoDAF - Department of Defense Architecture Framework (2003)',
  description:
    'An in-depth overview of the Department of Defense Architecture Framework (DoDAF), a military enterprise architecture standard created in 2003 to resolve interoperability crises, enable multi-service coordination, and govern technology adoption across defense and government environments.',
}

const DoDAFPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Department of Defense Architecture Framework (DoDAF) - U.S. DoD (2003)
        </h1>

        {/* Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Department of Defense Architecture Framework (DoDAF)
            </p>
            <p>
              <strong>Authors:</strong> U.S. Department of Defense
            </p>
            <p>
              <strong>Publication Date:</strong> 2003
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono">
              U.S. Department of Defense. (2003). <em>DoDAF Version 1.0.</em> U.S. Department of
              Defense.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            The <strong>Department of Defense Architecture Framework (DoDAF)</strong> is a
            comprehensive enterprise architecture framework developed and published by the U.S.
            Department of Defense in 2003. Classified as both an{' '}
            <strong>Enterprise Architecture Framework</strong> and a{' '}
            <strong>Systems Integration Standard</strong>, DoDAF provides a standardized approach to
            describing, analyzing, and governing the complex technology and operational ecosystems
            that characterize modern military, defense, and government organizations.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF did not emerge in a vacuum. Its immediate predecessor was the{' '}
            <strong>C4ISR Architecture Framework</strong>, developed in the mid-1990s to address
            Command, Control, Communications, Computers, Intelligence, Surveillance, and
            Reconnaissance integration challenges. The lessons learned from C4ISR, combined with the
            operational lessons of conflicts in the 1990s, drove the DoD to create a more
            comprehensive, flexible, and formally structured framework. Since its initial release,
            DoDAF has evolved through multiple versions-Version 1.0 (2003), Version 2.0 (2010), and
            the current Version 2.02 (2018)-while maintaining the core architectural principles that
            distinguish it from civilian enterprise architecture approaches.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework is designed specifically for the unique challenges of military, defense,
            government, and multi-agency environments where <strong>interoperability</strong>,{' '}
            <strong>security</strong>, and <strong>complex systems integration</strong> are not
            optional features but mission-critical requirements. By establishing a common language,
            standardized viewpoints, and explicit governance structures, DoDAF enables organizations
            of extraordinary complexity to coordinate technology adoption decisions across
            organizational, geographic, and jurisdictional boundaries.
          </p>
        </section>

        {/* Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF was created in response to a convergence of acute operational failures and
            structural systemic problems that had accumulated across the U.S. military throughout
            the late twentieth century. Four primary drivers shaped its development.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>The Interoperability Crisis.</strong> During the Gulf War of 1991, the different
            military services operated with fundamentally incompatible communications systems, data
            formats, and operational planning methodologies. The Army, Navy, Air Force, and Marine
            Corps had each developed their own technological ecosystems largely in isolation from
            one another. The consequence in the field was stark: critical gaps in information
            sharing across service lines, slower operational decision cycles, and missed tactical
            opportunities that could have shortened the conflict and reduced casualties. The Gulf
            War exposed, at enormous operational cost, the reality that technological sophistication
            within a single service was insufficient if the services could not function as a unified
            force.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>The Complexity Spiral.</strong> Military systems had grown so interconnected and
            layered that no single organization, program office, or service branch possessed a
            complete understanding of the entire defense technology ecosystem. Changes to one system
            could cascade through dependent systems in ways that were not anticipated, creating
            failures that were difficult to diagnose and even harder to prevent proactively. The
            absence of a common architectural perspective meant that program managers were, in
            effect, making technology decisions in partial darkness-unable to see the full map of
            interdependencies their choices would affect.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>The Security and Reliability Imperative.</strong> Traditional commercial IT
            management approaches, even well-regarded ones, were designed for environments where
            system failures are costly but survivable. Military contexts demand a fundamentally
            different standard: systems that fail in combat environments can directly result in loss
            of life, mission failure, and strategic disadvantage. The security
            requirements-protecting sensitive operational data, ensuring system integrity in
            contested environments, maintaining operational security (OPSEC)-added layers of
            constraint that commercial frameworks were never designed to handle systematically.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>The Multi-Service Coordination Problem.</strong> Each military service made
            independent technology investment and acquisition decisions guided by its own mission
            priorities and institutional culture. Without a unified perspective on defense-wide
            capability requirements, duplicative systems were built, incompatible standards were
            adopted, and inter-service coordination in joint operations remained painfully
            difficult. DoDAF was specifically designed to require a <strong>common language</strong>{' '}
            for architecture discussion across services, <strong>standardized viewpoints</strong>{' '}
            that all stakeholders could read and use, explicit methods for identifying
            incompatibilities before systems were built, governance structures for cross-service
            coordination, and rigorous documentation standards that could support formal review and
            approval processes.
          </p>
        </section>

        {/* Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF organizes architectural description around a set of structured{' '}
            <strong>viewpoints</strong>, each of which captures a distinct perspective on a system
            or enterprise. In the current DoDAF 2.02, eight primary viewpoints provide comprehensive
            coverage of the architectural landscape:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>All Viewpoint (AV):</strong> Provides an overview and integrated perspective
              across all other viewpoints. The AV establishes the scope, context, and purpose of the
              architecture, ensuring that all stakeholders share a common understanding of what the
              architecture is intended to describe and accomplish.
            </li>
            <li>
              <strong>Capability Viewpoint (CV):</strong> Addresses operational capabilities and
              their relationships. The CV defines what the organization must be able to
              do-independent of how it does it-providing a stable foundation for architecture
              development that persists even as specific systems and services evolve.
            </li>
            <li>
              <strong>Data and Information Viewpoint (DIV):</strong> Captures information
              requirements, data structures, and data flows across the architecture. The DIV ensures
              that all systems within the architecture share consistent understanding of the data
              they exchange, a prerequisite for genuine interoperability.
            </li>
            <li>
              <strong>Operational Viewpoint (OV):</strong> Describes operational processes, tasks,
              activities, and participant interactions. The OV defines how capabilities are actually
              executed in operational contexts, mapping the human and organizational dimensions of
              the architecture.
            </li>
            <li>
              <strong>Project Viewpoint (PV):</strong> Addresses programs, projects, and resource
              allocations that implement or sustain the architecture. The PV bridges the
              architecture to the acquisition and program management processes that govern how
              defense technology investments are made.
            </li>
            <li>
              <strong>Services Viewpoint (SvcV):</strong> Describes services and service
              interactions within the architecture. Added in DoDAF 2.0, the SvcV reflects the
              evolution of military systems toward service-oriented architectures and cloud-based
              capabilities.
            </li>
            <li>
              <strong>Standards Viewpoint (StdV):</strong> Documents applicable technology standards
              and profiles that govern the architecture. The StdV ensures that technology adoption
              decisions are compatible with mandated standards, preventing incompatible choices from
              being made independently across program offices and services.
            </li>
            <li>
              <strong>Systems Viewpoint (SV):</strong> Describes systems, their components, and
              system interfaces. The SV provides the detailed technical perspective needed to
              understand how operational processes are implemented in specific technologies and
              platforms.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            These viewpoints are not independent silos. DoDAF establishes explicit{' '}
            <strong>logical interdependencies</strong> among them that form the architecture&rsquo;s
            governing logic: <strong>Capabilities define what must be accomplished</strong> →{' '}
            <strong>Operations define how capabilities are executed</strong> →{' '}
            <strong>Systems implement operational processes</strong> →{' '}
            <strong>Services support systems and operations</strong> →{' '}
            <strong>Data enables all viewpoints</strong> →{' '}
            <strong>Standards ensure compatibility across all viewpoints.</strong>
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This chain of logical dependency means that an architectural decision at any level has
            traceable implications throughout the entire framework. A capability gap identified in
            the CV must eventually be addressed in the OV, SV, SvcV, and StdV. A standards change in
            the StdV may affect system interfaces in the SV and data flows in the DIV. This
            deliberate interconnection is what distinguishes DoDAF from less structured
            documentation approaches and what gives it its power as a governance tool.
          </p>
        </section>

        {/* Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF demonstrates strong <strong>internal validity</strong> through a rigorous
            structural architecture that systematically addresses the complexity of military
            technology environments from multiple angles simultaneously.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Comprehensive Viewpoint Coverage.</strong> The framework&rsquo;s multiple
            viewpoints ensure that no significant dimension of the architecture is overlooked. By
            requiring explicit documentation of capabilities, operations, systems, services, data,
            standards, projects, and integrated overviews, DoDAF prevents the common failure mode of
            architecture efforts that focus exclusively on technical systems while neglecting
            operational context, or that document current state without mapping requirements to
            capabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Cascading Logical Interdependencies.</strong> Because the viewpoints are
            formally interconnected, changes in one viewpoint cascade through dependent viewpoints
            in predictable ways. This traceability is not merely a documentation convenience-it is
            an active governance mechanism. When a capability requirement changes, the DoDAF
            structure makes visible exactly which operational processes, systems, services, and
            standards must be re-examined. This systematically prevents the &ldquo;invisible
            dependency&rdquo; failures that plagued pre-DoDAF military systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Systematic Completeness Through Hierarchical Documentation.</strong> DoDAF
            requires documentation at five hierarchical levels: Strategic, Operational, System,
            Service, and Standards. This ensures that architecture products capture both high-level
            strategic intent and the technical detail required for implementation, creating a
            coherent vertical thread from mission objectives down to interface specifications.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Formal Validation Criteria.</strong> The framework specifies required viewpoints
            and architectural products for each program phase, explicit traceability requirements
            (capability → operation → system → service), consistency checks across viewpoints, and
            formal architecture reviews as program milestones. These validation mechanisms reflect
            the military tradition of complete specification before implementation, formal review
            and approval cycles, and explicit identification and management of technical and
            operational risk. Together they give DoDAF a disciplined rigor that is well suited to
            environments where architecture failures have operational consequences.
          </p>
        </section>

        {/* External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF&rsquo;s external validity is demonstrated by its broad adoption beyond the U.S.
            Army, across allied militaries, civilian government agencies, the defense industry, and
            academic institutions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>NATO and Allied Military Adoption.</strong> The{' '}
            <strong>NATO Architecture Framework (NAF)</strong> directly adopted the DoDAF viewpoint
            approach, and more than 28 NATO member countries now use NAF for joint operations
            planning and systems interoperability. The United Kingdom, Canada, Australia, Japan,
            South Korea, Germany, and France have each adopted NATO-equivalent frameworks that trace
            their structure and vocabulary directly to DoDAF. This international adoption at the
            alliance level is perhaps the most powerful external validation of DoDAF&rsquo;s core
            claims about the value of standardized architectural viewpoints for multi-national
            coordination.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>U.S. Government Expansion Beyond DoD.</strong> DoDAF concepts and practices were
            adopted across the broader U.S. government, including the Intelligence Community (CIA,
            NSA, and DIA), the Department of Homeland Security, the Federal Aviation Administration
            (FAA), and emergency management agencies including FEMA. These civilian government
            adoptions demonstrate that the framework&rsquo;s core value-structured architectural
            governance of complex multi-agency technology environments-is not exclusively military
            in applicability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Defense Industry Standardization.</strong> Major defense contractors including{' '}
            <strong>Boeing</strong>, <strong>Lockheed Martin</strong>,{' '}
            <strong>Northrop Grumman</strong>, <strong>Raytheon</strong>, and{' '}
            <strong>General Dynamics</strong> adopted DoDAF as a standard internal practice, in part
            because military procurement contracts now formally require DoDAF compliance as a
            deliverable. This contractual mandate has embedded DoDAF across the entire defense
            industrial base, creating a consistent architectural vocabulary between government
            program offices and their industry partners.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Academic and Professional Recognition.</strong> DoDAF is taught and studied at
            the U.S. Naval Academy, U.S. Military Academy (West Point), U.S. Air Force Academy, and
            the National Defense University. Its inclusion in professional military education
            reflects institutional recognition that architectural literacy is a core competency for
            senior military and civilian defense leaders.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Critical Infrastructure Application.</strong> DoDAF concepts have been applied
            to national critical infrastructure protection programs including energy grid
            modernization, transportation system integration, water and utility system resilience,
            and communications network hardening. These applications extend DoDAF&rsquo;s reach into
            civilian infrastructure contexts where the multi-organization coordination challenges
            closely parallel those of multi-service military operations.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Operational Evidence.</strong> Perhaps the most direct external validation is
            operational: military operations in Iraq and Afghanistan demonstrated vastly improved
            inter-service and inter-coalition coordination compared to the Gulf War experience that
            motivated DoDAF&rsquo;s creation. Program reviews have documented cost avoidance
            measured in the hundreds of millions of dollars resulting from DoDAF-mandated
            interoperability analyses that identified incompatibilities before systems entered
            full-rate production.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Framework Longevity and Evolution.</strong> The progression from Version 1.0
            (2003) to Version 2.0 (2010) to Version 2.02 (2018) demonstrates that DoDAF has adapted
            to the evolution of military technology-incorporating service-oriented architectures and
            cloud capabilities in the 2.0 revision-while maintaining the core viewpoint structure
            and governance principles that define the framework.
          </p>
        </section>

        {/* Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions and Strengths</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF makes several distinctive contributions to enterprise architecture and technology
            governance that are not replicated in commercial frameworks.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Military-Specific Constraint Modeling.</strong> DoDAF explicitly addresses
            constraints that commercial frameworks treat as edge cases or ignore entirely: extreme
            reliability and redundancy requirements for mission-critical systems, operational
            security (OPSEC) requirements that constrain information sharing, multi-service and
            multi-national coordination in joint operations, contested electromagnetic and cyber
            environments, and the life-safety consequences of system failure in combat. By treating
            these as first-class architectural concerns rather than implementation details, DoDAF
            produces architectures that are genuinely fit for purpose in their operating
            environment.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Systematic Interoperability Analysis.</strong> DoDAF&rsquo;s structured approach
            to viewpoints provides a rigorous methodology for interoperability analysis that goes
            well beyond informal coordination. The framework requires explicit interface definition
            in the SV, compatibility verification against standards in the StdV, data model
            consistency across all viewpoints in the DIV, and traceability from capability
            requirements through operational processes to system implementations. This systematic
            approach to interoperability is directly relevant to any organization managing complex
            multi-system or multi-vendor technology environments.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Security Integration as a First Principle.</strong> Unlike many enterprise
            architecture frameworks that treat security as a separate domain added after the primary
            architecture is defined, DoDAF integrates security considerations throughout all
            viewpoints. Security requirements influence capability definitions, operational process
            design, system interface specifications, service architectures, data structures, and
            standards selection simultaneously-reflecting the operational reality that security
            cannot be retrofitted into military systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Governance at Scale.</strong> DoDAF provides governance mechanisms capable of
            coordinating technology adoption decisions across the entire U.S. Department of
            Defense-an organization of millions of personnel, thousands of programs, and technology
            investments measured in hundreds of billions of dollars annually. The framework&rsquo;s
            mandatory compliance requirements for defense acquisition programs create enforceable
            governance rather than advisory guidance, giving DoDAF a practical authority that purely
            voluntary frameworks lack.
          </p>

          <h2 className={H2_CLASSES}>Weaknesses and Limitations</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF&rsquo;s strengths in rigorous, comprehensive architectural governance come with
            significant costs and constraints that limit its applicability outside defense contexts.
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Extreme Complexity and Documentation Requirements:</strong> Comprehensive
              viewpoint documentation across all eight viewpoints, at all hierarchical levels, for
              large programs demands enormous resources in time, specialized expertise, and
              organizational attention. Small-to-medium organizations typically cannot sustain this
              documentation burden.
            </li>
            <li>
              <strong>Limited Commercial Applicability:</strong> DoDAF was designed for the specific
              constraints of military and government environments. The level of rigor it
              demands-complete specification before implementation, formal review and approval
              cycles, mandatory compliance across procurement-is excessive for most commercial
              organizations and incompatible with agile development methodologies.
            </li>
            <li>
              <strong>Steep Learning Curve:</strong> Effective use of DoDAF requires specialized
              training in architecture modeling methods, familiarity with military operational
              contexts and terminology, and experience with the formal review processes that
              validate DoDAF compliance. The investment required to develop this expertise is
              substantial.
            </li>
            <li>
              <strong>Emphasis on Documentation Over Agility:</strong> The framework&rsquo;s
              emphasis on comprehensive documentation and formal validation may be fundamentally
              incompatible with rapidly changing technology environments where architectures must
              evolve faster than formal documentation cycles allow.
            </li>
            <li>
              <strong>Persistent Organizational Barriers:</strong> Even with DoDAF mandated,
              inter-agency and inter-service coordination challenges persist in practice. The
              framework provides a common language and formal structure, but it cannot fully
              overcome the institutional cultures, budget authorities, and political dynamics that
              drive independent decision-making in large organizations.
            </li>
            <li>
              <strong>Tool and Methodology Costs:</strong> Producing DoDAF-compliant architecture
              products requires specialized modeling tools, trained architects, and often external
              consulting support. These costs are manageable within large defense programs but
              prohibitive for smaller organizations.
            </li>
          </ul>
        </section>

        {/* Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            DoDAF is directly relevant to the study of technology adoption barriers, particularly in
            large, multi-organizational, and complex systems environments. Its contributions to
            understanding technology adoption challenges operate at several distinct levels.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Interoperability as a Primary Adoption Barrier.</strong> DoDAF was created
            specifically in response to interoperability failure as a barrier to effective
            technology adoption across organizational boundaries. The Gulf War experience
            demonstrated that organizations can individually adopt sophisticated technologies while
            collectively failing to achieve the integrated capability those technologies were
            intended to provide-a pattern that appears across many complex technology adoption
            contexts beyond the military. DoDAF&rsquo;s systematic methodology for identifying and
            resolving interoperability barriers before system deployment is directly applicable to
            any organization managing multi-vendor, multi-system technology environments.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Architecture Governance as an Adoption Coordination Mechanism.</strong> One of
            the most significant technology adoption barriers in large organizations is the tendency
            for independent units to make incompatible technology choices that collectively
            undermine organizational capability. DoDAF&rsquo;s governance mechanisms-mandatory
            compliance, formal review, explicit standards enforcement-provide a model for how
            architecture authority can prevent incompatible technology adoption decisions before
            they are implemented and become expensive to reverse.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Capability-Driven Technology Adoption.</strong> The DoDAF Capability Viewpoint
            enforces a discipline of defining what the organization must be able to do before
            selecting the technologies that will implement that capability. This capability-first
            approach is a powerful countermeasure to the common technology adoption failure mode
            where organizations adopt technologies because they are available or technically
            impressive, rather than because they address specific capability gaps. The CV requires
            that every technology adoption decision be traceable to a defined capability
            requirement.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Standards as an Adoption Enabler.</strong> The Standards Viewpoint demonstrates
            the role of technology standards in enabling rather than constraining technology
            adoption. By explicitly documenting applicable standards early in the architecture
            process, DoDAF prevents the adoption of incompatible technologies and creates the
            preconditions for interoperability that allow technology to be adopted across
            organizational boundaries. This insight-that governance of standards is a prerequisite
            for coordinated technology adoption-is broadly applicable beyond the defense context.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Influence on Civilian Enterprise Architecture.</strong> DoDAF&rsquo;s influence
            on civilian enterprise architecture frameworks, including the Federal Enterprise
            Architecture Framework (FEAF) and indirectly on commercial approaches, means that its
            conceptual contributions to technology adoption governance have propagated well beyond
            the defense sector. Organizations studying technology adoption barriers in government,
            healthcare, financial services, and other complex regulated industries will encounter
            DoDAF-derived concepts even when the framework itself is not explicitly cited.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Multi-Organizational Boundary Spanning.</strong> Perhaps the most general
            relevance of DoDAF to technology adoption research is its systematic approach to the
            problem of coordinating technology adoption decisions across organizational
            boundaries-across services, agencies, allied nations, and contractors. This
            boundary-spanning coordination challenge is not unique to military contexts; it appears
            wherever technology adoption requires cooperation among organizations with different
            priorities, cultures, budget authorities, and institutional interests. DoDAF&rsquo;s
            architectural governance approach represents one rigorously tested answer to this
            coordination problem.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Note: This article provides an overview based on the comprehensive literature review.
            Readers are encouraged to consult the original publication for complete details.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              U.S. Department of Defense. (2003). <em>DoDAF Version 1.0</em>. U.S. Department of
              Defense.{' '}
              <a
                href="https://dodcio.defense.gov/Library/DoD-Architecture-Framework-Version-1-0/"
                className="text-blue-600 hover:text-blue-800 underline break-words"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://dodcio.defense.gov/Library/DoD-Architecture-Framework-Version-1-0/
              </a>
            </li>
            <li>
              U.S. Department of Defense. (2010). <em>DoDAF Version 2.0</em>. U.S. Department of
              Defense.
            </li>
            <li>
              U.S. Department of Defense. (2018). <em>DoDAF Version 2.02</em>. U.S. Department of
              Defense.
            </li>
            <li>
              U.S. Department of Defense Chief Information Officer. (2023).{' '}
              <em>DoD Cloud Strategy and Implementation Roadmap</em>. U.S. Department of Defense.
            </li>
            <li>
              NATO. (2018). <em>NATO Architecture Framework (NAF)</em>. NATO Standardization Office.
            </li>
            <li>
              IEEE. (2000).{' '}
              <em>
                IEEE 1471-2000: Recommended practice for architectural description of
                software-intensive systems
              </em>
              . IEEE.
            </li>
          </ol>
        </section>

        {/* Back link */}
        <section className="mt-12 pt-6 border-t border-gray-200">
          <Link
            href="/article-bibliography-comprehensive-series-bibliography"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Complete Bibliography
          </Link>
        </section>
      </article>
    </main>
  )
}

export default DoDAFPage
