import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: Business Process Redesign (BPR) - Davenport & Short (1990)',
  description:
    'An exploration of the Business Process Redesign framework by Davenport and Short, which established how information technology enables radical redesign of core business processes for competitive advantage.',
}

const DavenportShortBPRPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Business Process Redesign (BPR) - Davenport &amp; Short (1990)
        </h1>

        {/* Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Business Process Redesign (BPR)
            </p>
            <p>
              <strong>Authors:</strong> Thomas H. Davenport and James E. Short
            </p>
            <p>
              <strong>Publication Date:</strong> 1990
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono">
              Davenport, T. H., &amp; Short, J. E. (1990). The new industrial engineering:
              Information technology and business process redesign. <em>Sloan Management Review</em>
              , 31(4), 11-27.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            In 1990, Thomas H. Davenport and James E. Short published &ldquo;The New Industrial
            Engineering: Information Technology and Business Process Redesign&rdquo; in the{' '}
            <em>Sloan Management Review</em>, introducing a framework that fundamentally reoriented
            how organizations think about leveraging information technology. Rather than treating IT
            as a tool for automating existing processes, Davenport and Short proposed that IT
            enables the radical redesign of core business processes - a shift they framed as a new
            form of industrial engineering appropriate for the information age.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The Business Process Redesign (BPR) model emerged at a moment when competitive pressures
            were intensifying and IT capabilities were expanding beyond simple automation. The
            authors observed that organizations routinely applied technology to existing process
            structures rather than questioning those structures themselves. By synthesizing concepts
            from industrial engineering, value chain analysis, and organizational theory, Davenport
            and Short provided practitioners with a conceptual and practical framework for achieving
            step-change improvements in cost, quality, speed, and customer service through
            process-level redesign.
          </p>

          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Davenport and Short developed the Business Process Redesign model in response to
            fundamental changes occurring in competitive environments and technology capabilities
            during the late 1980s. Organizations faced mounting pressures from several directions
            that made traditional approaches insufficient.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Competitive Pressure and Performance Challenges:</strong> Organizations operated
            in increasingly competitive environments where rivals had restructured their operations
            to achieve superior performance. Traditional industrial engineering had been applied
            relatively narrowly to manufacturing, yet competitive advantage increasingly derived
            from comprehensive business process performance - how effectively organizations managed
            customer acquisition, product design, order fulfillment, and customer service in
            addition to manufacturing efficiency.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Information Technology Capability Expansion:</strong> IT had evolved from
            supporting existing processes to enabling fundamentally different ways of working. Prior
            IT adoption had primarily focused on automating existing processes - faster, cheaper
            operations doing the same work. Davenport and Short recognized that emerging IT
            capabilities could support more radical redesign: information systems could capture
            customer data comprehensively, enable communication across organizational boundaries,
            support sophisticated decision-making, and automate complex processes previously
            requiring significant human judgment.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Limitations of Incremental Approaches:</strong> The authors observed that
            traditional process improvement had inherent limits. Optimizing an existing process
            sometimes locked organizations into suboptimal configurations. If a fundamental business
            process was poorly designed, making it more efficient merely made inefficiency faster.
            Competitive advantage increasingly came from reconceiving and fundamentally redesigning
            core business processes, not from incremental optimization.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Integration Opportunity:</strong> The model emerged from recognizing that IT
            could serve as a bridge for integrating processes previously separated or poorly
            coordinated. Complex products required coordination across functions (marketing,
            engineering, manufacturing); customer service required integration across departments.
            Information technology could connect these previously disconnected activities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The model synthesized several recognitions: IT capabilities had expanded far beyond
            simple automation; process structure fundamentally determines organizational
            performance; organizational functions were fragmented in ways that created
            inefficiencies; and managers needed frameworks to guide how to leverage IT for business
            process redesign.
          </p>

          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            At the heart of the BPR model is a focus on <strong>business processes</strong> -
            end-to-end sets of activities that together deliver value to customers or the
            organization. Davenport and Short distinguish between core business processes (customer
            acquisition, product design, order fulfillment, customer service) and supporting
            processes (human resources, accounting). Core processes directly impact competitive
            positioning and should receive priority for redesign efforts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework identifies five types of IT-enabled process redesign, each representing a
            distinct way technology can transform how work is performed:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Automational:</strong> Eliminating human labor from a process. Routine,
              rule-based decisions are delegated to information systems, reducing cost and improving
              speed.
            </li>
            <li>
              <strong>Informational:</strong> Capturing process information for purposes of
              understanding. Comprehensive data availability enables better decisions and
              performance monitoring.
            </li>
            <li>
              <strong>Sequential:</strong> Changing process sequence or enabling parallelism.
              Activities previously performed in sequence can occur simultaneously when information
              flows electronically.
            </li>
            <li>
              <strong>Tracking:</strong> Monitoring process status and objects closely. Real-time
              visibility into process state enables proactive management and rapid response to
              exceptions.
            </li>
            <li>
              <strong>Analytical:</strong> Improving analysis of information and decision-making.
              Decision support tools and analytical models enable higher-quality decisions based on
              comprehensive data.
            </li>
            <li>
              <strong>Geographical:</strong> Coordinating processes across distances. IT enables
              work previously requiring physical proximity to be conducted by geographically
              distributed teams.
            </li>
            <li>
              <strong>Integrative:</strong> Coordination between tasks and processes. Information
              systems enable seamless handoffs and coordination across organizational boundaries.
            </li>
            <li>
              <strong>Intellectual:</strong> Capturing and distributing intellectual assets.
              Knowledge management capabilities enable organizational learning and expertise
              sharing.
            </li>
            <li>
              <strong>Disintermediating:</strong> Eliminating intermediaries from a process. Direct
              connections between process participants remove unnecessary steps and improve
              responsiveness.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The authors also articulate a systematic five-step methodology for process redesign: (1)
            develop the business vision and process objectives; (2) identify the processes to be
            redesigned; (3) understand and measure the existing process; (4) identify IT levers
            available; and (5) design and build a prototype of the new process.
          </p>

          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Davenport and Short&rsquo;s BPR model was developed and validated through multiple
            approaches grounded in real organizational experience.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Case Study Research and Field Experience:</strong> The model was grounded in
            extensive case study research and consulting engagement across multiple industries. The
            authors documented actual business process redesign initiatives, examining organizations
            that successfully leveraged IT for process transformation, the business processes that
            could be fundamentally redesigned, the outcomes achieved, and the challenges
            encountered.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The paper provides detailed illustrative examples across diverse industries:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Insurance Claims Processing:</strong> Companies previously handled claims
              through labor-intensive sequential processes. Information systems enabled redesign
              that significantly reduced processing time by allowing representatives with
              comprehensive system support to handle entire claims rather than sequential hand-offs.
            </li>
            <li>
              <strong>Airline Reservation Systems:</strong> Airlines completely restructured
              customer reservation processes through technology, enabling travel agents and
              eventually customers to access real-time information and conduct transactions
              independently.
            </li>
            <li>
              <strong>Telecommunications Service Installation:</strong> Companies redesigned
              installation processes so technicians could access complete customer information and
              design specifications in real-time, reducing site visits and improving coordination.
            </li>
            <li>
              <strong>Manufacturing Order Fulfillment:</strong> Firms redesigned order-to-delivery
              processes by enabling front-line personnel to access inventory, engineering, and
              manufacturing capability data to respond to customer orders immediately rather than
              through lengthy internal consultations.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The consistency of redesign patterns across telecommunications, insurance, airlines, and
            manufacturing supports the conclusion that the underlying redesign principles hold
            generally rather than being industry-specific.
          </p>

          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The BPR model&rsquo;s external validity was established through several mechanisms that
            demonstrate generalizability beyond the original case contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Multi-Industry Case Illustrations:</strong> The model was tested across diverse
            industries - insurance, airlines, telecommunications, and manufacturing - suggesting
            that business process redesign principles apply broadly. Fundamentally similar redesign
            patterns emerging across different industries lends credibility to the model&rsquo;s
            generalizability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Cross-Functional Process Coverage:</strong> The case examples span diverse
            functional areas and process types: customer-facing processes (reservations, claims
            handling, order fulfillment), internal operational processes (manufacturing scheduling,
            service delivery), and information-intensive processes (claims assessment, system
            design). This breadth suggests that process redesign principles apply to diverse process
            types rather than a narrow range.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Organizational Size Variation:</strong> The cases encompassed large
            organizations (major airlines, large telecommunications companies) as well as mid-sized
            firms. The applicability across different organizational sizes suggests the model is not
            limited to particular company profiles.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>IT Technology Span:</strong> The case examples involved different IT
            technologies - telecommunications systems, database systems, personal computers with
            information access capabilities - demonstrating that redesign principles apply across
            technology platforms rather than being dependent on specific systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Theoretical Grounding:</strong> By grounding the model in established industrial
            engineering principles and extending them to IT-enabled contexts, the authors draw on a
            well-established theoretical tradition. The framework&rsquo;s acknowledgment of
            contingencies - particular process characteristics, organizational capability, IT
            infrastructure, and market conditions - adds nuance without undermining the general
            applicability of the core principles.
          </p>

          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Davenport &amp; Short BPR model made several contributions that distinguished it
            from prior frameworks:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Process-Centric View of Organizations:</strong> Rather than viewing
              organizations primarily through functional hierarchies, the model reframed them as
              collections of business processes. This shift in perspective opened new avenues for
              identifying improvement opportunities that cut across organizational silos.
            </li>
            <li>
              <strong>IT as Enabler, Not Automator:</strong> The framework explicitly distinguished
              between automating existing processes (paving cow paths) and using IT to enable
              fundamentally different process designs. This distinction was novel and influential.
            </li>
            <li>
              <strong>Systematic Redesign Methodology:</strong> The five-step methodology provided
              practitioners with actionable guidance for conducting process redesign projects,
              bridging academic concepts and managerial practice.
            </li>
            <li>
              <strong>Typology of IT-Enabled Change:</strong> The taxonomy of nine IT redesign roles
              provided a structured vocabulary for describing how technology transforms work,
              enabling more precise analysis of redesign opportunities.
            </li>
            <li>
              <strong>Industrial Engineering Heritage:</strong> By framing BPR as a natural
              evolution of industrial engineering, Davenport and Short legitimized the approach
              within established business disciplines while extending it to the information age.
            </li>
          </ul>

          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Davenport &amp; Short BPR framework carries direct and enduring relevance for
            understanding organizational technology adoption. It fundamentally reframes what it
            means to &ldquo;adopt&rdquo; technology: successful adoption is not simply purchasing
            and deploying a system, but rethinking how work should be performed and then designing
            technology-enabled processes to realize that vision.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The model&rsquo;s emphasis on beginning with business objectives rather than technology
            capabilities is particularly instructive. Organizations that start by asking &ldquo;what
            does our IT system support?&rdquo; will likely automate existing inefficiencies.
            Organizations that start by asking &ldquo;what should this process accomplish for
            customers and the organization?&rdquo; and then determine technology requirements are
            positioned to achieve genuine transformation.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework also highlights that technology adoption barriers often reside in
            organizational and process structure rather than technology itself. A new system
            implemented within a fragmented, sequential process may deliver minimal value. The same
            technology implemented to enable an integrated, parallel process can deliver dramatic
            improvements. This insight directs attention to organizational redesign as a
            prerequisite for technology value realization.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The BPR model&rsquo;s emphasis on change management-establishing transition
            infrastructure, communicating honestly, and preparing people for new ways of
            working-anticipates findings from subsequent technology adoption research showing that
            human and organizational factors consistently explain more variance in adoption outcomes
            than technical factors.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <em>
              Note: This article provides an overview based on the comprehensive literature review.
              Readers are encouraged to consult the original publication for complete details.
            </em>
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            {/* prettier-ignore */}
            <li>Davenport, T. H., &amp; Short, J. E. (1990). The new industrial engineering: Information technology and business process redesign. <em>Sloan Management Review</em>, 31(4), 11-27.</li>
            <li>
              Porter, M. E. (1985).{' '}
              <em>Competitive advantage: Creating and sustaining superior performance</em>. Free
              Press.
            </li>
            <li>
              Hammer, M. (1990). Reengineering work: Don&rsquo;t automate, obliterate.{' '}
              <em>Harvard Business Review</em>, 68(4), 104-112.
            </li>
            <li>
              Hammer, M., &amp; Champy, J. (1993).{' '}
              <em>Reengineering the corporation: A manifesto for business revolution</em>.
              HarperBusiness.
            </li>
            <li>
              Venkatraman, N. (1994). IT-enabled business transformation: From automation to
              business scope redefinition. <em>Sloan Management Review</em>, 35(2), 73-87.
            </li>
            <li>
              Davenport, T. H. (1993).{' '}
              <em>Process innovation: Reengineering work through information technology</em>.
              Harvard Business School Press.
            </li>
            <li>
              Kettinger, W. J., Teng, J. T. C., &amp; Guha, S. (1997). Business process change: A
              study of methodologies, techniques, and tools. <em>MIS Quarterly</em>, 21(1), 55-80.{' '}
              <a
                href="https://doi.org/10.2307/249742"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249742
              </a>
            </li>
            <li>
              Taylor, F. W. (1911). <em>The principles of scientific management</em>. Harper &amp;
              Brothers.
            </li>
          </ol>
        </section>

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

export default DavenportShortBPRPage
