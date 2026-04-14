import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Bibliography: Dynamic Capabilities Framework - Teece, Pisano, & Shuen (1997)',
  description:
    'An exploration of the Dynamic Capabilities Framework and how it extends the Resource-Based View to address sustained competitive advantage in rapidly changing, turbulent environments through organizational sensing, seizing, and transformation.',
}

const DynamicCapabilitiesPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Bibliography: Dynamic Capabilities Framework - Teece, Pisano, &amp; Shuen (1997)
        </h1>

        {/* Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Dynamic Capabilities Framework
            </p>
            <p>
              <strong>Authors:</strong> David J. Teece, Gary Pisano, and Amy Shuen
            </p>
            <p>
              <strong>Publication Date:</strong> 1997
            </p>
          </div>
        </section>

        {/* Citation Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Citation Information</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="text-sm font-mono">
              Teece, D. J., Pisano, G., &amp; Shuen, A. (1997). Dynamic capabilities and strategic
              management. <em>Strategic Management Journal</em>, 18(7), 509-533.
            </p>
          </div>
        </section>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            In 1997, David J. Teece, Gary Pisano, and Amy Shuen published &ldquo;Dynamic
            Capabilities and Strategic Management&rdquo; in the Strategic Management Journal,
            creating what would become one of the most influential frameworks for understanding
            organizational adaptation and sustained competitive advantage in turbulent environments.
            Building on the Resource-Based View of the Firm (Wernerfelt, 1984) and the VRIO
            Framework (Barney, 1991), the Dynamic Capabilities Framework addressed a critical
            limitation that had become increasingly apparent by the mid-1990s: static frameworks
            were inadequate for explaining sustained competitive advantage when competitive
            environments change rapidly and unpredictably.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The fundamental insight of the Dynamic Capabilities Framework is that sustained
            competitive advantage in turbulent environments requires more than simply possessing
            valuable, rare, and inimitable resources. Organizations must continuously develop new
            capabilities and transform existing resources as environments change. The framework
            identifies three core organizational capabilities that enable sustained adaptation:
            sensing market opportunities and technological possibilities, seizing opportunities by
            developing new products and services, and transforming organizational assets and
            structures in response to environmental change.
          </p>

          <h2 className={H2_CLASSES}>Why Was the Framework Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano, and Shuen developed the Dynamic Capabilities Framework to address
            critical gaps in how the Resource-Based View and VRIO frameworks explained competitive
            advantage in rapidly changing industries. While Wernerfelt and Barney had provided
            powerful frameworks for understanding competitive advantage based on the endowment of
            firm resources, their frameworks gave insufficient attention to how firms continuously
            renew, reconfigure, and transform resources as competitive environments change.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors observed that many firms possessing valuable, rare, inimitable resources
            found those resources becoming obsolete as industries evolved, technologies changed, and
            competitive dynamics shifted. Sony&rsquo;s capabilities in transistor technology, which
            had provided sustained competitive advantage through the 1970s and 1980s, became less
            important as the industry shifted toward digital technologies. Kodak&rsquo;s
            extraordinary capabilities in chemical photography became a liability as digital
            photography emerged. These real-world examples demonstrated that sustained competitive
            advantage required not merely possessing valuable resources but continuously developing
            new resources and capabilities as environments changed.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework was motivated by recognition that in hypercompetitive industries,
            technological turbulence, and rapidly changing markets (exemplified by the information
            technology, telecommunications, and biotechnology sectors), traditional competitive
            advantage grounded in stable, inimitable resource positions was insufficient. Firms
            needed different capabilities - not just the ability to exploit existing resources but
            the ability to sense market opportunities and threats, to seize opportunities through
            organizational restructuring, and to continuously reconfigure organizational assets and
            resources in response to environmental change.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Additionally, the framework was motivated by observation that many firms failed to adapt
            as environments changed because they were locked into existing capabilities and
            resources. What Teece and colleagues termed &ldquo;organizational rigidities&rdquo; or
            &ldquo;core rigidities&rdquo; - deep organizational commitments to particular resource
            configurations that had worked well in the past - prevented organizations from adapting
            when environments changed. The framework provides guidance for overcoming these
            organizational rigidities and maintaining organizational flexibility and adaptive
            capacity.
          </p>

          <h2 className={H2_CLASSES}>The Three Core Dynamic Capabilities</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Dynamic Capabilities Framework identifies three fundamental organizational
            capabilities that enable sustained adaptation in turbulent environments:
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            1. Sensing: Identifying and Assessing Market Opportunities and Threats
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Sensing capability refers to the organizational capacity to identify, monitor, and
            assess market opportunities and technological possibilities before they become obvious
            to the entire market. Rather than simply responding to competitive threats or market
            demands that are already evident, organizations with strong sensing capabilities
            anticipate future market needs and technological possibilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Effective sensing requires establishing systems and processes for monitoring
            technological developments, tracking customer needs and preferences, conducting market
            research, and maintaining awareness of competitors&rsquo; activities and strategic
            directions. Organizations should invest in environmental scanning processes that monitor
            technological change, competitive changes, customer changes, and regulatory changes. By
            developing sensing capabilities, organizations can identify opportunities before they
            become obvious to the entire market, enabling first-mover advantages and strategic
            flexibility.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For technology adoption specifically, sensing capability involves monitoring emerging
            technologies, understanding how technologies might address organizational needs,
            evaluating technology maturity and readiness, and assessing when emerging technologies
            become viable for organizational deployment.
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            2. Seizing: Mobilizing Resources to Capture Value from Opportunities
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Seizing capability refers to the organizational capacity to quickly develop products,
            services, or business models that address identified opportunities. Organizations that
            sense opportunities but lack seizing capabilities fail to convert those insights into
            competitive advantages. Effective seizing requires product development capabilities that
            enable rapid commercialization of new ideas, business model innovation capabilities,
            marketing and customer development capabilities, and decision-making structures that
            enable fast action.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Seizing capability depends on organizational structures that facilitate rapid
            decision-making, cross-functional collaboration, and resource mobilization.
            Organizations with rigid hierarchies, slow decision-making processes, strong functional
            silos, and constrained internal communication will struggle to develop seizing
            capabilities. Leaders should design organizational structures that enable decisive
            seizing of opportunities through fast decision-making, resource flexibility, and
            collaborative processes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            In the context of technology adoption, seizing capability involves the ability to pilot
            new technologies quickly, secure organizational resources and commitment for technology
            initiatives, integrate new technologies with existing systems and processes, and scale
            successful technology pilots into enterprise-wide implementations.
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            3. Transforming: Reconfiguring Assets and Organizational Structures
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Transforming capability (also called reconfiguring capability) refers to the
            organizational capacity to reconfigure organizational assets, structures, and processes
            as competitive environments change. Organizations lacking transforming capabilities find
            themselves constrained by historical asset configurations and strategic directions,
            unable to adapt as environments change.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Effective transforming capability involves organizational redesign, restructuring, and
            change management capabilities; capabilities for retraining personnel to develop new
            skills; capabilities for divesting businesses or assets that no longer fit the
            organization&rsquo;s strategic direction; capabilities for acquiring or licensing new
            technologies and integrating them into organizational operations; and capabilities for
            evolving organizational culture and values as strategic direction changes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For technology adoption, transforming capability includes the ability to redesign
            business processes around new technologies, develop new organizational roles and skills
            to support new technologies, retire legacy systems and processes that are being
            replaced, and manage organizational change and resistance during technology transitions.
          </p>

          <h2 className={H2_CLASSES}>From Static Resources to Dynamic Adaptation</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Dynamic Capabilities Framework represents a fundamental evolution in strategic
            management thinking, shifting focus from what resources the organization currently
            possesses to how organizations develop new resources and transform existing resources as
            environments change. This shift from static to dynamic represents a fundamental
            reorientation-from what the organization has to what the organization can do and become.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            While earlier frameworks focused on resource stocks (what the organization possesses),
            the Dynamic Capabilities Framework emphasizes capability processes (how the organization
            develops, integrates, and deploys resources). The distinction is important: two
            organizations might possess similar resource stocks but differ dramatically in their
            capacity to continuously renew and reconfigure those resources.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework also shifts from pursuing sustainable advantage to pursuing dynamic
            adaptation. While Barney&rsquo;s VRIO framework focused on creating sustained
            competitive advantage by developing resources that competitors cannot imitate, the
            Dynamic Capabilities Framework acknowledges that in turbulent environments, sustained
            advantage is often impossible-the best organizations can do is continuously adapt faster
            than competitors. This shift from pursuing sustainable advantage to pursuing dynamic
            adaptation represents a fundamental change in strategic thinking.
          </p>

          <h2 className={H2_CLASSES}>Application to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Dynamic Capabilities Framework provides crucial insights for technology adoption in
            organizations operating in rapidly changing technological environments. Technology
            adoption is not merely a matter of purchasing systems or implementing tools, but
            requires building and integrating complementary organizational capabilities for sensing
            technological opportunities, seizing those opportunities through effective
            implementation, and transforming organizational processes and structures to fully
            leverage new technologies.
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Sensing Technological Opportunities
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Organizations should develop capabilities for monitoring emerging technologies, tracking
            technological developments, conducting technology assessments, and understanding how
            technologies might address organizational needs. This involves establishing
            relationships with technology suppliers and service providers, participating in
            technology industry consortia and standards organizations, monitoring technology
            research and publications, and maintaining technical expertise that enables evaluation
            of new technologies.
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Seizing Technology Implementation Opportunities
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Organizations should develop capabilities for rapidly piloting new technologies,
            evaluating technology performance and fit with organizational needs, securing resources
            and organizational commitment for promising technologies, and scaling successful pilots
            into enterprise implementations. This requires establishing innovation governance and
            resource allocation processes that enable investment in promising technology
            initiatives, creating dedicated roles and teams for technology evaluation and
            implementation, and developing project management capabilities for technology
            deployment.
          </p>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Transforming Organizations Around New Technologies
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            Organizations should develop capabilities for redesigning business processes to leverage
            new technologies, developing new organizational roles and skills, retiring legacy
            systems and processes, and managing organizational change and resistance. This involves
            investing substantially in organizational change management capabilities, creating
            learning systems that enable organizational learning about new technologies, and
            establishing governance structures specifically designed to foster innovation and
            technology adoption.
          </p>

          <h2 className={H2_CLASSES}>Organizational Learning and Path Dependence</h2>
          <p className={PARAGRAPH_CLASSES}>
            The framework places learning and knowledge development at the center of sustained
            competitive advantage. Organizations that systematically learn from experience, capture
            learning in organizational routines and processes, and continuously improve their
            capabilities will sustain advantage longer than organizations that do not invest in
            learning. This emphasis on learning as central to competitive advantage represents an
            important contribution to strategic management thinking.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            However, the framework also acknowledges the constraints imposed by path
            dependence-organizational capabilities and competitive positions are shaped by
            historical development paths and previous resource commitments. Some capabilities can be
            readily changed while others are constrained by historical choices, investments, and
            organizational commitments. Understanding these path dependencies helps organizations
            recognize which aspects of their strategic position are flexible and subject to change
            versus constrained by historical commitments.
          </p>

          <h2 className={H2_CLASSES}>Strengths of the Framework</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Dynamic Capabilities Framework possesses several significant strengths that have
            contributed to its widespread adoption and influence:
          </p>
          <ul className="list-disc pl-6 mb-3 sm:mb-6 space-y-2 text-gray-800">
            <li>
              <strong>Addresses Turbulent Environment Adaptation:</strong> The framework explains
              how organizations maintain competitive advantage in rapidly changing environments
              where static resource positions become obsolete. This makes it invaluable for
              organizations operating in technology-driven, fast-changing, or disruptive industries.
            </li>
            <li>
              <strong>Integrates Multiple Theoretical Perspectives:</strong> The framework
              successfully integrates insights from evolutionary economics, organizational learning
              theory, organizational routines research, and strategic management, providing a more
              comprehensive understanding of organizational adaptation.
            </li>
            <li>
              <strong>Distinguishes Between Static and Dynamic Capabilities:</strong> The framework
              clarifies the distinction between ordinary capabilities (executing existing processes)
              and dynamic capabilities (changing and renewing capabilities). This helps explain why
              organizations that excel at current operations sometimes struggle to adapt to changing
              environments.
            </li>
            <li>
              <strong>Explains Organizational Rigidity:</strong> The framework provides powerful
              explanation for why organizations with valuable resources and successful competitive
              positions sometimes fail to adapt as environments change, offering valuable guidance
              for avoiding these failure modes.
            </li>
            <li>
              <strong>Provides Guidance for Organizational Design:</strong> Unlike frameworks that
              focus primarily on resources without guidance on organizational structure, the Dynamic
              Capabilities Framework suggests that organizations should have structures that enable
              fast sensing, rapid decision-making, cross-functional collaboration, and
              organizational flexibility.
            </li>
            <li>
              <strong>Addresses Technology Change and Innovation:</strong> The framework provides
              excellent guidance for understanding how organizations should manage technological
              change and invest in innovation, showing how innovation capability is embedded in
              organizational routines, structures, and processes.
            </li>
          </ul>

          <h2 className={H2_CLASSES}>Limitations and Challenges</h2>
          <p className={PARAGRAPH_CLASSES}>
            Despite its considerable strengths, the Dynamic Capabilities Framework exhibits certain
            limitations that scholars and practitioners should understand:
          </p>
          <ul className="list-disc pl-6 mb-3 sm:mb-6 space-y-2 text-gray-800">
            <li>
              <strong>Operationalization and Measurement Challenges:</strong> While the framework
              provides conceptual clarity about what dynamic capabilities are, operationalizing and
              measuring sensing, seizing, and transforming capabilities remains challenging.
              Different research studies use different operationalizations, making it difficult to
              compare findings across contexts.
            </li>
            <li>
              <strong>Difficulty Distinguishing Ordinary from Dynamic Capabilities:</strong> The
              distinction between ordinary and dynamic capabilities is conceptually clear but
              operationally ambiguous in practice. Some scholars argue that all capabilities are
              dynamic to some degree, making it difficult to determine which capabilities to
              prioritize.
            </li>
            <li>
              <strong>Tendency Toward Tautology:</strong> Organizations that successfully adapt are
              said to possess strong dynamic capabilities, but the evidence for possession of
              dynamic capabilities often is that the organization successfully adapted. This
              circular reasoning makes the framework difficult to test falsifiably.
            </li>
            <li>
              <strong>Limited Attention to Resource Constraints:</strong> The framework gives
              limited attention to resource constraints that limit organizations&rsquo; ability to
              invest in dynamic capability development simultaneously across all three dimensions.
            </li>
            <li>
              <strong>Incomplete Specification of Transformation Mechanisms:</strong> While the
              framework identifies that organizations must continuously reconfigure assets and
              processes, it provides incomplete specification of the actual transformation
              mechanisms, such as how organizations divest legacy assets while maintaining current
              profitability.
            </li>
          </ul>

          <h2 className={H2_CLASSES}>Relationship to Organizational Learning and Innovation</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Dynamic Capabilities Framework has important connections to organizational learning
            theory and innovation research. The framework suggests that organizations develop
            dynamic capabilities through organizational learning processes-by systematically
            learning from experience, capturing learning in organizational routines, and
            continuously improving capabilities. This connection to learning theory enriches
            understanding of how dynamic capabilities develop over time.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For innovation, the framework shows that innovation capability is not an isolated
            function but is embedded in organizational routines, structures, and processes.
            Organizations should systematically invest in building sensing, seizing, and
            transforming capabilities related to technology and innovation. This perspective has
            informed subsequent frameworks for understanding organizational innovation capacity and
            technology readiness.
          </p>

          <h2 className={H2_CLASSES}>Subsequent Developments and Extensions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Since its 1997 publication, the Dynamic Capabilities Framework has spawned extensive
            empirical research and theoretical extensions. Subsequent work has examined:
          </p>
          <ul className="list-disc pl-6 mb-3 sm:mb-6 space-y-2 text-gray-800">
            <li>
              <strong>Sensing-Seizing-Transforming Refinements (Teece, 2007):</strong> Further
              refinement of the three-capability model with more detailed specification of
              organizational processes and microfoundations.
            </li>
            <li>
              <strong>Organizational Ambidexterity Theory:</strong> Integration with research on how
              organizations balance exploitation of existing capabilities with exploration of new
              possibilities (March, 1991; O&rsquo;Reilly &amp; Tushman, 2008).
            </li>
            <li>
              <strong>Dynamic Capabilities in Digital and Platform Contexts:</strong> Extensions
              examining how dynamic capabilities operate in multi-sided platform business models and
              digital ecosystem contexts.
            </li>
            <li>
              <strong>Knowledge Management and Learning:</strong> Integration with knowledge
              management frameworks and organizational learning theory to better understand how
              organizations develop and maintain dynamic capabilities.
            </li>
          </ul>

          <h2 className={H2_CLASSES}>Implications for Technology Adoption Research</h2>
          <p className={PARAGRAPH_CLASSES}>
            For technology adoption research specifically, the Dynamic Capabilities Framework
            provided crucial insights into why some organizations successfully adopt new
            technologies while others struggle. The framework highlights that technology adoption is
            not merely a matter of purchasing systems or implementing tools, but requires building
            and integrating complementary organizational capabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This perspective has informed subsequent frameworks for understanding organizational
            technology readiness and adoption capacity, emphasizing the critical role of
            organizational structure, learning capabilities, and change management in technology
            adoption success. Organizations that develop strong sensing capabilities can identify
            valuable technologies early; organizations with strong seizing capabilities can rapidly
            implement and scale new technologies; and organizations with strong transforming
            capabilities can successfully redesign processes and structures to fully leverage
            technological capabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework also suggests that organizations should view technology adoption not as
            isolated projects but as opportunities to develop and enhance organizational dynamic
            capabilities. Each technology adoption initiative provides opportunities for
            organizational learning, capability development, and organizational transformation that
            build capacity for future technology adoption and organizational adaptation.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              Teece, D. J., Pisano, G., & Shuen, A. (1997). Dynamic capabilities and strategic
              management. Strategic Management Journal, 18(7), 509-533.{' '}
              <a
                href="https://doi.org/10.1002/smj.882"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1002/smj.882
              </a>
            </li>
            <li>
              Wernerfelt, B. (1984). A resource-based view of the firm. Strategic Management
              Journal, 5(2), 171-180.{' '}
              <a
                href="https://doi.org/10.1002/smj.4250050207"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1002/smj.4250050207
              </a>
            </li>
            <li>
              Barney, J. B. (1991). Firm resources and sustained competitive advantage. Journal of
              Management, 17(1), 99-120.{' '}
              <a
                href="https://doi.org/10.1177/014920639101700108"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1177/014920639101700108
              </a>
            </li>
            <li>
              Nelson, R. R., & Winter, S. G. (1982). An evolutionary theory of economic change.
              Cambridge: Harvard University Press.
            </li>
            <li>
              Teece, D. J. (2007). Explicating dynamic capabilities: The nature and microfoundations
              of (sustainable) enterprise performance. Strategic Management Journal, 28(13),
              1319-1350.
            </li>
            <li>
              March, J. G. (1991). Exploration and exploitation in organizational learning.
              Organization Science, 2(1), 71-87.
            </li>
            <li>
              O&rsquo;Reilly, C. A., &amp; Tushman, M. L. (2008). Ambidexterity as a dynamic
              capability: Resolving the innovator&rsquo;s dilemma. Research in Organizational
              Behavior, 28, 185-206.
            </li>
            <li>
              Cohen, W. M., & Levinthal, D. A. (1990). Absorptive capacity: A new perspective on
              learning and innovation. Administrative Science Quarterly, 35(1), 128-152.
            </li>
            <li>
              Leonard-Barton, D. (1992). Core capabilities and core rigidities: A paradox in
              managing new product development. Strategic Management Journal, 13(S1), 111-125.
            </li>
            <li>
              Eisenhardt, K. M., & Martin, J. A. (2000). Dynamic capabilities: What are they?
              Strategic Management Journal, 21(10-11), 1105-1121.
            </li>
          </ol>
        </section>

        <p className="mt-8 text-sm italic text-gray-600">
          Note: This article provides an overview based on the comprehensive literature review.
          Readers are encouraged to consult the original publication for complete details.
        </p>

        {/* Navigation */}
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

export default DynamicCapabilitiesPage
