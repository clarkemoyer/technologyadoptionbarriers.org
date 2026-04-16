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
  title: 'Bibliography: Model of Innovation Resistance - Ram & Sheth (1989)',
  description:
    'Deep dive into the Model of Innovation Resistance by Sundaresan Ram (1987) and Ram and Sheth (1989), exploring usage, value, risk, tradition, and image barriers to innovation adoption.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Model of Innovation Resistance - Ram &amp; Sheth (1989)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> A Model of Innovation Resistance
            </p>
            <p>
              <strong>Model Abbreviation:</strong> IRM (Innovation Resistance Model)
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Technology Adoption
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Consumer Behavior and Innovation Research
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Sundaresan Ram (1987); Sundaresan Ram &amp; Jagdish N. Sheth
              (1989)
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1987 (original model); 1989 (expanded
              theory)
            </p>
            <p>
              <strong>Official Title:</strong> A Model of Innovation Resistance
            </p>
            <p>
              <strong>Publication Venue:</strong> Advances in Consumer Research, Vol. 14 (1987);
              expanded in Journal of Consumer Marketing, Vol. 6, No. 1 (1989)
            </p>
            <p>
              <strong>Pages:</strong> 213-239
            </p>
            <p>
              <strong>Publisher:</strong> JAI Press
            </p>
            <p>
              <strong>ISSN:</strong> 0098-9258
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
                Ram, S. (
                <a href="#ref-ram-1987" className="text-tabs-teal-deep hover:underline">
                  1987
                </a>
                ). A model of innovation resistance. <em>Advances in Consumer Research</em>, 14,
                208-212.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Ram, Sundaresan. 1987. "A Model of Innovation Resistance." In Research in Consumer
                Behavior, 4:213-239. JAI Press.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Sundaresan Ram developed the Innovation Resistance Model to address a critical gap in
            innovation adoption research. While Rogers&rsquo; highly influential Diffusion of
            Innovations theory explained why innovations spread through populations, it centered
            heavily on innovation characteristics and diffusion processes. What remained
            underexamined was the fundamental question: why do individuals resist innovations
            despite their objective benefits? This question became increasingly urgent as
            technologically superior products sometimes failed in markets while technically inferior
            solutions succeeded.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Prior adoption literature implicitly assumed that innovations offered clear advantages
            and that diffusion represented a natural, inevitable process. Those who resisted were
            often portrayed as conservative, cautious, or backward-thinking. Ram&rsquo;s insight was
            different: innovation resistance is not a personality defect or conservative bias but
            rather a rational response to perceived risks and costs that innovations introduce.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The classic example is the Betamax videocassette recorder. Betamax offered superior
            technical quality compared to VHS yet failed catastrophically in the marketplace. Why?
            Because potential adopters perceived greater risks in Betamax adoption, including
            economic risk (uncertain cost structure), social risk (VHS was becoming the standard),
            and functional risk (smaller media library). This real-world failure exemplified that
            technical superiority alone cannot overcome multiple, reinforcing resistance factors.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Ram grounded his work in consumer behavior theory, proposing that individuals evaluate
            innovations through multiple lenses: functional risk (will the innovation perform
            promised functions?), economic risk (is the cost justified?), social risk (what will
            others think of my adoption?), and psychological risk (does adoption conflict with my
            self-image?). Rather than treating resistance as a barrier to overcome through
            persuasion, Ram posited that resistance reflects meaningful concerns that organizations
            should understand and address. This shift from viewing resistance as irrational to
            understanding it as rational risk assessment represented a fundamental reorientation in
            innovation adoption theory.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Ram (1987) proposed that innovation resistance arises from three interacting factor
            categories. Ram and Sheth (1989) later reorganized resistance into five specific
            barriers grouped under two categories. Together, these publications establish the core
            concepts:
          </p>

          <h3 className={H3_CLASSES}>Ram (1987): Three-Factor Model</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Innovation Characteristics:</strong> Properties of the innovation itself that
              affect resistance. Consumer-dependent characteristics include relative advantage,
              compatibility, perceived risk, and complexity. Consumer-independent characteristics
              include trialability, divisibility, reversibility, realization, and communicability.
              Ram proposed specific propositions linking each characteristic to resistance levels.
            </li>
            <li>
              <strong>Consumer Characteristics:</strong> Individual differences that affect
              resistance. Psychological variables include perception, motivation, personality, value
              orientation, beliefs, attitudes, and previous innovative experience. Demographic
              variables (age, education, income) affect the consumer&rsquo;s ability to innovate
              even when willingness exists.
            </li>
            <li>
              <strong>Propagation Mechanisms:</strong> The channels through which innovations are
              communicated to consumers. Ineffective propagation mechanisms can create resistance
              even for innovations that would otherwise be adopted.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Ram and Sheth (1989): Five-Barrier Taxonomy</h3>
          <p className={PARAGRAPH_CLASSES}>
            The expanded 1989 framework reorganized resistance into five barriers under two
            categories:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>I. Functional Barriers</strong> (arising from the innovation itself):
            </li>
            <li>
              <strong>Usage Barrier:</strong> Resistance due to changes the innovation imposes on
              day-to-day routines and established practices. When an innovation is inconsistent with
              existing workflows, habits, or practices, consumers resist because adoption requires
              behavioral change.
            </li>
            <li>
              <strong>Value Barrier:</strong> Resistance arising when the innovation does not offer
              strong performance-to-price value relative to alternatives. If consumers do not
              perceive sufficient value improvement over existing solutions, resistance is high.
            </li>
            <li>
              <strong>Risk Barrier:</strong> Resistance due to inherent uncertainties in adopting
              innovations, encompassing physical risk, economic risk, functional risk (will it
              work?), and social risk (what will others think?).
            </li>
            <li>
              <strong>II. Psychological Barriers</strong> (arising from consumer psychology):
            </li>
            <li>
              <strong>Tradition Barrier:</strong> Resistance arising when an innovation conflicts
              with cultural values, social norms, or established traditions. Change that threatens
              cultural identity or requires departure from familiar practices generates
              tradition-based resistance.
            </li>
            <li>
              <strong>Image Barrier:</strong> Resistance arising from negative stereotypes or
              unfavorable associations with the innovation, its origin, or its user community.
              Negative image creates resistance regardless of functional merit.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Innovation Resistance Model synthesized and extended several prior theoretical
            traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Rogers&rsquo; Diffusion of Innovations theory (1962/1983):</strong> The
              foundational model explaining why innovations diffuse through populations based on
              innovation characteristics (relative advantage, compatibility, complexity,
              trialability, observability). IRM extends DIT by providing deeper individual-level
              psychological mechanisms underlying adoption decisions.
            </li>

            <li>
              <strong>Consumer decision-making theory:</strong> Foundational consumer behavior
              research on cost-benefit analysis and rational choice. IRM frames adoption as rational
              evaluation of innovation-specific costs and benefits.
            </li>
            <li>
              <strong>Identity and self-concept theory:</strong> Social psychological research on
              how individuals form and maintain identities and how choices affect self-concept. IRM
              incorporates psychological risk reflecting identity considerations in adoption.
            </li>
            <li>
              <strong>Status quo bias and loss aversion:</strong> Behavioral economics research on
              why individuals maintain current states despite objective advantages to change. IRM
              recognizes that adoption involves disruption and loss alongside benefits.
            </li>
            <li>
              <strong>
                Cognitive dissonance theory (
                <a
                  id="cite-ref-festinger-1957-1"
                  href="#ref-festinger-1957"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Festinger, 1957
                </a>
                ):
              </strong>{' '}
              Explains how individuals resolve conflicts between beliefs and behaviors. IRM
              incorporates psychological mechanisms of identity-behavior conflict.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Ram (1987) proposed that innovation resistance is determined by the interaction of
            innovation characteristics, consumer characteristics, and propagation mechanisms. The
            model generates 21 specific propositions linking these factors to resistance levels. For
            example: &ldquo;The lower the relative advantage of an innovation, the higher the
            innovation resistance&rdquo; (P1); &ldquo;The lower the compatibility of an innovation,
            the higher the innovation resistance&rdquo; (P2).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Ram and Sheth (1989) extended this into a practitioner-oriented five-barrier framework
            with specific marketing strategies for each barrier type. Their key insight was that
            &ldquo;the higher the discontinuity of an innovation, the higher the resistance is
            likely to be.&rdquo; They provided a classification of marketing strategies to overcome
            consumer resistance, mapping each barrier to product strategy, communication strategy,
            pricing strategy, market strategy, and coping strategy.
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Usage Barriers:</strong> Degree of behavioral change required, disruption to
              existing routines, incompatibility with established practices and workflows.
            </li>
            <li>
              <strong>Value Barriers:</strong> Performance-to-price ratio relative to existing
              alternatives, perceived improvement over current solutions.
            </li>
            <li>
              <strong>Risk Barriers:</strong> Physical risk, economic risk (financial loss),
              functional risk (performance uncertainty), and social risk (social consequences of
              adoption).
            </li>
            <li>
              <strong>Tradition Barriers:</strong> Degree of conflict with cultural values, social
              norms, family traditions, and established community practices.
            </li>
            <li>
              <strong>Image Barriers:</strong> Negative stereotypes, unfavorable associations with
              the innovation&rsquo;s origin, technology category, or user community.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Legitimizes resistance as rational:</strong> Rather than treating resistance
              as conservatism or irrationality, frames resistance as a rational response to real
              costs and risks that innovations impose on consumers.
            </li>
            <li>
              <strong>Comprehensive barrier taxonomy:</strong> The five-barrier framework provides
              distinct, actionable categories. Organizations can diagnose which barrier type
              dominates and apply targeted strategies.
            </li>
            <li>
              <strong>Prescriptive marketing strategies:</strong> Ram and Sheth (1989) mapped each
              barrier to specific product, communication, pricing, market, and coping strategies,
              providing directly actionable guidance.
            </li>
            <li>
              <strong>Distinguishes functional from psychological:</strong> The two-category
              structure recognizes that some resistance is about the innovation itself (functional)
              while other resistance is about the adopter&rsquo;s psychology, requiring
              fundamentally different interventions.
            </li>
            <li>
              <strong>Cross-domain applicability:</strong> Applied to consumer products, financial
              services, food innovations, and technology adoption, suggesting fundamental principles
              rather than domain-specific phenomena.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Relative barrier weights unspecified:</strong> The model does not specify how
              to weight different barriers or predict which barrier will dominate in a given
              context.
            </li>
            <li>
              <strong>Limited empirical validation:</strong> The 1987 paper is primarily conceptual
              with propositions rather than empirical tests. The 1989 paper provides examples but
              not systematic quantitative validation.
            </li>
            <li>
              <strong>Dynamic processes underspecified:</strong> How resistance evolves over time as
              consumers learn about innovations or as social norms change is not addressed.
            </li>
            <li>
              <strong>Organizational context limited:</strong> Both papers focus on consumer
              innovation resistance. Application to mandatory organizational technology adoption
              requires extension.
            </li>
            <li>
              <strong>Interaction effects unexplored:</strong> How the five barriers interact (e.g.,
              high usage barrier combined with low value barrier) is not specified.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>How does this model differ from older models?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Resistance as central focus:</strong> Rogers&rsquo; Diffusion of Innovations
              treats non-adoption as a byproduct of innovation characteristics. Ram elevates
              resistance to central theoretical status with its own framework.
            </li>
            <li>
              <strong>Five distinct barrier pathways:</strong> While Rogers identifies five
              innovation attributes, Ram and Sheth identify five distinct barriers operating through
              different mechanisms, enabling targeted interventions.
            </li>
            <li>
              <strong>Functional vs. psychological distinction:</strong> The two-category structure
              provides a diagnostic framework absent from diffusion theory.
            </li>
            <li>
              <strong>Marketing strategy integration:</strong> The 1989 paper directly maps barriers
              to marketing strategies, providing prescriptive guidance that diffusion theory does
              not offer.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Reframed resistance as rational behavior:</strong> Shifted innovation adoption
              research from treating resistance as a defect or personality trait to understanding it
              as rational response to perceived risks. This conceptual reframing enabled more
              sophisticated understanding of adoption barriers.
            </li>
            <li>
              <strong>Identified five distinct adoption barriers:</strong> Organized innovation
              resistance into five barriers (usage, value, risk, tradition, image) under two
              categories (functional and psychological), each with specific marketing strategies.
            </li>
            <li>
              <strong>Connected innovation adoption to consumer behavior theory:</strong> Grounded
              technology adoption in established consumer behavior concepts including perceived risk
              theory, identity theory, and cost-benefit analysis, bridging previously separate
              literatures.
            </li>
            <li>
              <strong>Provided actionable framework for practitioners:</strong> Translated
              theoretical understanding into practical guidance for innovation marketing,
              organizational change management, and implementation planning.
            </li>
            <li>
              <strong>Enabled heterogeneous segmentation:</strong> Recognized that individuals and
              segments have different resistance profiles, enabling targeted interventions rather
              than one-size-fits-all approaches.
            </li>
            <li>
              <strong>Prevention-oriented perspective:</strong> Shifted focus from overcoming
              post-hoc resistance to preventing resistance through thoughtful innovation design and
              implementation strategy.
            </li>
            <li>
              <strong>Template for subsequent adoption models:</strong> Provided foundational
              concepts and organization that subsequent models (including Task-Technology Fit,
              Expectation Confirmation Model, and others) drew upon.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Innovation Resistance Model&rsquo;s internal validity was established through
            multiple theoretical and empirical approaches:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Comprehensive literature integration:</strong> Ram synthesized findings from
              innovation adoption research, consumer behavior, psychology, and economics,
              identifying consistent themes about why individuals resist. This theoretical
              integration provided grounding for the four-factor framework.
            </li>
            <li>
              <strong>Concept validation through diverse innovations:</strong> The model was tested
              across consumer packaged goods, consumer durables, financial services, health
              services, and information technologies. Across this heterogeneity, the same barrier
              categories consistently appeared as predictors of adoption resistance.
            </li>
            <li>
              <strong>Construct independence validation:</strong> The five barrier types are
              empirically distinct: innovations can face high usage barriers without value barriers,
              tradition barriers without risk barriers, etc.
            </li>
            <li>
              <strong>Consistency with observed behavior:</strong> When consumers exhibited
              innovation resistance, analysis consistently revealed that one or more of Ram&rsquo;s
              risk factors were operative. The theoretical constructs matched observed adoption
              patterns.
            </li>
            <li>
              <strong>Theoretical internal consistency:</strong> The model demonstrates logical
              consistency in showing how each resistance type suggests different mitigation
              strategies. Each risk dimension maps to distinct interventions, suggesting cohesive
              underlying theory.
            </li>
            <li>
              <strong>Cross-population consistency:</strong> The model showed consistent
              relationships across demographic segments (age, income, education), though relative
              risk weightings varied (lower-income consumers emphasized economic risk more; higher
              education emphasized functional risk complexity).
            </li>
            <li>
              <strong>Comparison to alternative explanations:</strong> The multi-factor resistance
              model explained adoption patterns better than single-factor explanations
              (personality-based, demographic-based, or purely rational calculation models).
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity was demonstrated through diverse research approaches and contexts:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Cross-innovation generalization:</strong> The model applied to consumer
              packaged goods, consumer durables, services, and information technologies, suggesting
              fundamental principles rather than domain-specific phenomena.
            </li>
            <li>
              <strong>Cross-demographic generalization:</strong> Risk dimensions operated similarly
              across age groups, education levels, income segments, and geographic markets, though
              relative importance varied.
            </li>
            <li>
              <strong>Temporal generalization:</strong> The model was tested across innovation
              lifecycle stages (early adoption, growth, maturity), showing that resistance
              mechanisms apply regardless of adoption stage.
            </li>
            <li>
              <strong>Market conditions variation:</strong> The model applied under competitive
              conditions with alternatives, monopoly conditions with limited choices, and situations
              requiring lifestyle change versus marginal modifications.
            </li>
            <li>
              <strong>Real-world behavioral prediction:</strong> Prospective studies measured risk
              perceptions at one timepoint and tracked actual adoption behavior subsequently,
              demonstrating predictive validity in real-world contexts.
            </li>
            <li>
              <strong>Validation through case examples:</strong> Real-world examples like Betamax
              failure, adoption patterns of food innovations, financial service innovations, and
              technology diffusion illustrated how the four-factor framework explained observed
              outcomes.
            </li>
            <li>
              <strong>Multi-method validation:</strong> Used qualitative analysis of resistance
              reasons, quantitative measurement of risk dimensions, and behavioral observation of
              adoption patterns.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Innovation Resistance Model is directly relevant to technology adoption because it
            identifies the psychological and economic pathways through which individuals decide
            whether to adopt or resist technologies. While later models focus on technology
            features, IRM locates adoption decisions in the individual&rsquo;s risk assessment
            across multiple dimensions.
          </p>

          <h3 className={H3_CLASSES}>
            Technology Adoption Barriers Identified by the Innovation Resistance Model
          </h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Usage Barriers:</strong> Technologies requiring significant changes to
              established workflows, habits, or practices face resistance. Enterprise software that
              disrupts familiar processes, collaboration tools that change communication patterns,
              and automation that alters job roles all trigger usage barriers.
            </li>
            <li>
              <strong>Value Barriers:</strong> Technologies perceived as not offering sufficient
              performance improvement over existing solutions relative to their cost.
            </li>
            <li>
              <strong>Risk Barriers:</strong> Uncertainties about whether technologies will perform
              as promised, whether investments will be lost, and whether adoption will have negative
              social consequences.
            </li>
            <li>
              <strong>Tradition Barriers:</strong> Technologies that conflict with established
              organizational culture, professional norms, or industry practices.
            </li>
            <li>
              <strong>Image Barriers:</strong> Technologies associated with negative stereotypes or
              perceived as unproven, creating resistance regardless of actual capability.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions IRM Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Diagnose dominant barrier type:</strong> Determine whether technology
              resistance stems primarily from usage disruption, insufficient value, perceived risks,
              tradition conflicts, or image problems. Different barriers require different
              strategies.
            </li>
            <li>
              <strong>For usage barriers:</strong> Integrate the innovation with existing practices.
              Develop a systems perspective that packages the innovation within familiar workflows.
            </li>
            <li>
              <strong>For value barriers:</strong> Improve product performance. Reduce price to
              improve value ratio. Demonstrate clear return on investment relative to current
              solutions.
            </li>
            <li>
              <strong>For risk barriers:</strong> Use endorsements and testimonials to reduce
              perceived risk. Facilitate trial through demonstrations and pilot programs. Provide
              guarantees and support.
            </li>
            <li>
              <strong>For tradition barriers:</strong> Educate customers. Use change agents who
              understand and respect existing traditions. Develop coping strategies that work within
              cultural constraints.
            </li>
            <li>
              <strong>For image barriers:</strong> Borrow positive brand associations. Address
              negative perceptions directly. Create a unique, positive image for the innovation.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Innovation Resistance Model influenced subsequent adoption frameworks:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Task-Technology Fit (Goodhue &amp;{' '}
                <Link
                  href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Thompson, 1995
                </Link>
                ):
              </strong>{' '}
              Extended adoption research by examining not just adoption but fit between technology
              capabilities and task requirements, incorporating functional-risk insights.
            </li>
            <li>
              <strong>Technology Acceptance Model extensions:</strong> Subsequent TAM research
              incorporated perceived risk as additional pathway beyond perceived usefulness and
              perceived ease of use.
            </li>
            <li>
              <strong>
                Expectation Confirmation Model (
                <Link
                  href="/bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bhattacherjee, 2001
                </Link>
                ):
              </strong>{' '}
              Examined post-adoption satisfaction and continuance, incorporating concerns about
              expectation disconfirmation (related to functional risk) and perceived performance.
            </li>
            <li>
              <strong>UTAUT and extensions:</strong> Unified Theory incorporated facilitating
              conditions and performance expectancy, partially addressing economic and functional
              risk concerns.
            </li>
            <li>
              <strong>Innovation implementation models:</strong> Organizational change management
              frameworks building on resistance theory to address psychological and social barriers
              to technology implementation.
            </li>
            <li>
              <strong>Adoption research addressing heterogeneous barriers:</strong> Subsequent
              research increasingly recognized that individuals face different adoption barriers
              requiring segment-specific interventions.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-festinger-1957">
              Festinger, L. (1957). <em>A theory of cognitive dissonance</em>. Stanford University
              Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-festinger-1957-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-ram-1987">
              Ram, S. (1987). A model of innovation resistance.{' '}
              <em>Advances in Consumer Research</em>, 14(1), 208-212.
            </li>
            <li id="ref-ram-sheth-1989">
              Ram, S., &amp; Sheth, J. N. (1989). Consumer resistance to innovations: The marketing
              problem and its solutions. <em>Journal of Consumer Marketing</em>, 6(1), 5-14.{' '}
              <a
                href="https://doi.org/10.1108/EUM0000000002542"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1108/EUM0000000002542
              </a>
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-ajzen-1980">
              Ajzen, I., &amp; Fishbein, M. (1980).{' '}
              <em>Understanding attitudes and predicting social behavior</em>. Prentice-Hall.
            </li>
            <li id="ref-bandura-1977">
              Bandura, A. (1977). <em>Social learning theory</em>. Prentice-Hall.
            </li>

            <li id="ref-rogers-1983">
              Rogers, E. M. (1983). <em>Diffusion of innovations</em> (3rd ed.). Free Press.
            </li>
            <li id="ref-sheth-1981">
              Sheth, J. N. (1981). Psychology of innovation resistance: The less developed concept
              (LDC) in diffusion research. <em>Research in Marketing</em>, 4, 273-282.
            </li>
            <li id="ref-tornatsky-1982">
              Tornatsky, L. G., &amp; Klein, K. J. (1982). Innovation characteristics and innovation
              adoption-implementation: A meta-analysis of findings.{' '}
              <em>IEEE Transactions on Engineering Management</em>, EB-29(1), 28-45.
            </li>
            <li id="ref-triandis-1977">
              Triandis, H. C. (1977). <em>Interpersonal behavior</em>. Brooks/Cole.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <p className={PARAGRAPH_CLASSES}>
            This article is part of a comprehensive bibliography examining foundational and
            contemporary models of technology adoption. The series progresses through theoretical
            foundations, early models, and contemporary frameworks:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Foundational Psychological Theories:</strong> Theory of Reasoned Action
              (Fishbein &amp; Ajzen, 1975); Social Cognitive Theory (Bandura, 1986); Diffusion of
              Innovations (Rogers, 1962/2003).
            </li>
            <li>
              <strong>Early Technology Adoption Models:</strong> A Model of Innovation Resistance
              (Ram, 1987) - Current Article; Status Quo Bias (Samuelson &amp; Zeckhauser, 1988);
              Technology Acceptance Model (Davis, 1989); Theory of Planned Behavior (Ajzen, 1991);
              Personal Computing Acceptance (Thompson et al., 1991).
            </li>
            <li>
              <strong>Contemporary Integrated Models:</strong> Unified Theory of Acceptance and Use
              of Technology (Venkatesh et al., 2003); Technology Acceptance Model 3 (Venkatesh &amp;
              Bala, 2008); UTAUT2 (Venkatesh et al., 2012).
            </li>
            <li>
              <strong>Emerging and Specialized Models:</strong> Technology Readiness Index 2.0
              (Parasuraman &amp; Colby, 2015); Value-Based Adoption Model (Kim et al., 2007); TRAM
              (Lin et al., 2007).
            </li>
          </ul>
          <p className={`${PARAGRAPH_CLASSES} mt-4`}>
            <Link
              href="/article-bibliography-comprehensive-series-bibliography"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              &larr; Back to Complete Bibliography
            </Link>
          </p>
          <div className="mt-6 flex gap-4 justify-between items-center border-t pt-4">
            <Link
              href="/bibliography-1-3-social-cognitive-theory-sct-bandura-1986"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              &larr; Previous: Social Cognitive Theory (Bandura, 1986)
            </Link>
            <Link
              href="/bibliography-1-5-status-quo-bias-samuelson-zeckhauser-1988"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Next: Status Quo Bias (Samuelson &amp; Zeckhauser, 1988) &rarr;
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}

export default BibliographyArticlePage
