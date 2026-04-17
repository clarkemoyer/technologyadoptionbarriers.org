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
  title: 'Bibliography: Decomposed TPB - Taylor & Todd (1995)',
  description:
    'Comprehensive analysis of the Decomposed Theory of Planned Behavior (DTPB), which decomposes attitudinal, normative, and control beliefs into technology-specific multidimensional constructs for predicting IT adoption.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Decomposed TPB - Taylor &amp; Todd (1995)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Decomposed Theory of Planned Behavior
            </p>
            <p>
              <strong>Model Abbreviation:</strong> DTPB
            </p>
            <p>
              <strong>Target of Model:</strong> IT Adoption and Usage Behavior Prediction
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Social Psychology,
              Behavioral Decision Making
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Shirley Taylor, Peter A. Todd
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1995
            </p>
            <p>
              <strong>Official Title:</strong> Understanding Information Technology Usage: A Test of
              Competing Models
            </p>
            <p>
              <strong>Journal:</strong> Information Systems Research
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 6, No. 2
            </p>
            <p>
              <strong>Pages:</strong> 144-176
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1287/isre.6.2.144"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.1287/isre.6.2.144
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
                Taylor, S., &amp; Todd, P. A. (
                <a href="#ref-taylor-1995" className="text-tabs-teal-deep hover:underline">
                  1995
                </a>
                ). Understanding information technology usage: A test of competing models.{' '}
                <em>Information Systems Research</em>, 6(2), 144-176.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Taylor, Shirley, and Peter A. Todd. 1995. &ldquo;Understanding Information
                Technology Usage: A Test of Competing Models.&rdquo;{' '}
                <em>Information Systems Research</em> 6, no. 2: 144-176.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Taylor and Todd developed the Decomposed Theory of Planned Behavior to advance beyond
            the original Theory of Planned Behavior (TPB) in predicting IT adoption and usage. While
            Ajzen&rsquo;s TPB was a robust general theory of human behavior, it operated at a
            relatively high level of abstraction with broad categories of beliefs (attitudes,
            subjective norms, and perceived control). Taylor and Todd recognized that IT adoption
            required more technology-specific theorizing with decomposed belief constructs that
            captured the unique facets influencing information systems decisions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors observed that prior IT adoption models like TAM offered narrower attitudinal
            constructs (usefulness and ease of use) but lacked the social (subjective norm) and
            control (perceived behavioral control) determinants of intention present in TPB. They
            conceptualized DTPB as decomposing the three TPB belief categories into multiple
            technology-specific dimensions. Attitudinal beliefs decompose into perceived usefulness,
            perceived ease of use (complexity), and compatibility (from Rogers); normative beliefs
            decompose into peer influence and superior influence; control beliefs decompose into
            self-efficacy, resource facilitating conditions, and technology facilitating conditions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The empirical research compared three models (TAM, TPB, DTPB) using 786 university
            students at a business school computing facility. This large-scale study enabled
            comprehensive model comparison revealing that DTPB provided superior fit and explained
            more variance in IT usage intentions than both TAM and the original TPB. The research
            demonstrated that decomposing general behavioral constructs into technology-specific
            dimensions substantially improved prediction of IT adoption behavior.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The DTPB decomposes the three TPB belief structures into technology-specific
            multi-dimensional constructs:
          </p>

          <h3 className={H3_CLASSES}>Attitudinal Belief Decomposition</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Perceived Usefulness (Relative Advantage):</strong> The degree to which using
              the system enhances job performance. Analogous to Rogers&rsquo; relative advantage and
              Davis&rsquo; perceived usefulness.
            </li>
            <li>
              <strong>Perceived Ease of Use (Complexity):</strong> The degree to which the system is
              perceived as easy to understand and use. Analogous to Rogers&rsquo; complexity
              (inverse direction) and Davis&rsquo; ease of use.
            </li>
            <li>
              <strong>Compatibility:</strong> The degree to which the system fits with the potential
              adopter&rsquo;s existing values, previous experience, and current needs. From
              Rogers&rsquo; (1983) innovation characteristics.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Normative Belief Decomposition</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Peer Influence:</strong> Influence of peers (colleagues, other students) on
              the individual&rsquo;s adoption decision.
            </li>
            <li>
              <strong>Superior Influence:</strong> Influence of superiors (managers, professors) on
              the individual&rsquo;s adoption decision.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Control Belief Decomposition</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Self-Efficacy:</strong> The individual&rsquo;s confidence in their ability to
              use the system, based on{' '}
              <a
                id="cite-ref-bandura-1977-1"
                href="#ref-bandura-1977"
                className="text-tabs-teal-deep hover:underline"
              >
                Bandura&rsquo;s (1977)
              </a>{' '}
              self-efficacy theory.
            </li>
            <li>
              <strong>Resource Facilitating Conditions:</strong> Availability of resources needed to
              use the system (time, money), based on{' '}
              <a
                id="cite-ref-triandis-1979-1"
                href="#ref-triandis-1979"
                className="text-tabs-teal-deep hover:underline"
              >
                Triandis&rsquo; (1979)
              </a>{' '}
              facilitating conditions concept.
            </li>
            <li>
              <strong>Technology Facilitating Conditions:</strong> Compatibility issues that may
              constrain usage (such as a lack of appropriate hardware, software, or technology
              support). Taylor and Todd separate these from resource conditions because technology
              compatibility operates independently of resource availability in the empirical data.
            </li>
          </ul>
        </section>

        {/* 6. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Taylor and Todd (1995) decompose each TPB belief structure into multiple
            technology-specific constructs. The measured constructs are:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitude (from decomposed attitudinal beliefs):</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>
                  <strong>Perceived Usefulness:</strong> Rogers-style relative advantage / TAM PU
                  adapted to the technology context.
                </li>
                <li>
                  <strong>Perceived Ease of Use:</strong> Davis 1989 PEOU.
                </li>
                <li>
                  <strong>Compatibility:</strong> Rogers 1983 compatibility with values,
                  experiences, and needs.
                </li>
              </ul>
            </li>
            <li>
              <strong>Subjective Norm (from decomposed normative beliefs):</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>
                  <strong>Peer Influence:</strong> Influence of colleagues.
                </li>
                <li>
                  <strong>Superior&rsquo;s Influence:</strong> Influence of supervisors/managers.
                </li>
              </ul>
            </li>
            <li>
              <strong>Perceived Behavioral Control (from decomposed control beliefs):</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>
                  <strong>Self-Efficacy:</strong> Bandura-style belief in one&rsquo;s capability.
                </li>
                <li>
                  <strong>Resource Facilitating Conditions:</strong> Access to money, time, and
                  other resources.
                </li>
                <li>
                  <strong>Technology Facilitating Conditions:</strong> Access to compatible
                  technology and support.
                </li>
              </ul>
            </li>
            <li>
              <strong>Behavioral Intention and Behavior:</strong> Standard TPB dependent measures.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Taylor and Todd (1995) report a field study of information center users; they provide
            reliability and validity evidence for the decomposed scales and compare the decomposed
            TPB with TAM and pure TPB.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The DTPB synthesized multiple prior theoretical traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Theory of Planned Behavior (
                <a
                  id="cite-ref-ajzen-1991-1"
                  href="#ref-ajzen-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Ajzen, 1991
                </a>
                ):
              </strong>{' '}
              Foundational framework establishing attitude, subjective norm, and perceived
              behavioral control as intention predictors.
            </li>
            <li>
              <strong>
                Technology Acceptance Model (
                <a
                  id="cite-ref-davis-1989-1"
                  href="#ref-davis-1989"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Davis, 1989
                </a>
                ):
              </strong>{' '}
              IS-specific model demonstrating perceived usefulness and ease of use effectiveness in
              predicting IT adoption.
            </li>
            <li>
              <strong>
                Diffusion of Innovations (
                <a
                  id="cite-ref-rogers-1983-1"
                  href="#ref-rogers-1983"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rogers, 1983
                </a>
                ):
              </strong>{' '}
              Provided compatibility construct and concepts of relative advantage relevant to
              technology adoption.
            </li>
          </ul>
        </section>

        {/* 8. Describe the Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe the Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            DTPB specifies that behavioral intentions to use IT are determined by attitudes,
            subjective norms, and perceived behavioral control. Critically, each of these three
            intention predictors is decomposed into multiple specific belief dimensions. Attitudes
            toward IT use are predicted by perceived usefulness, perceived ease of use (complexity),
            and compatibility beliefs. Normative beliefs are predicted by peer influence and
            superior influence. Perceived behavioral control is predicted by self-efficacy, resource
            facilitating conditions, and technology facilitating conditions. Per Table 3, the model
            explained 60% of variance in behavioral intention (R²=.60), compared to TAM (R²=.52) and
            original TPB (R²=.57). The study also measured actual usage behavior by monitoring 3,780
            visits to the computing resource center over a 12-week period (Methods, p.157).
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitudinal beliefs:</strong> Perceived usefulness, ease of use (complexity),
              and compatibility capturing instrumental, cognitive, and value-alignment motivations
              for adoption.
            </li>
            <li>
              <strong>Normative beliefs:</strong> Peer influence and superior influence capturing
              horizontal and vertical social influence pathways.
            </li>
            <li>
              <strong>Control beliefs:</strong> Self-efficacy, resource facilitating conditions, and
              technology facilitating conditions capturing individual capability confidence,
              resource availability, and technology compatibility constraints.
            </li>
            <li>
              <strong>Behavioral intentions:</strong> Likelihood of system adoption and usage
              predicted through multiple belief pathways.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Theoretical comprehensiveness:</strong> Integrates three distinct theoretical
              traditions (TPB, TAM, diffusion theory) creating more complete framework than any
              single theory.
            </li>
            <li>
              <strong>Technology-specific decomposition:</strong> Decomposes general TPB constructs
              into IT-relevant dimensions (usefulness, ease of use/complexity, compatibility,
              peer/superior influence, self-efficacy, resource and technology facilitating
              conditions) improving precision.
            </li>
            <li>
              <strong>Superior predictive power:</strong> Explains 60% of intention variance
              (R²=.60), outperforming TAM (R²=.52) and original TPB (R²=.57) in this sample.
            </li>
            <li>
              <strong>Multi-pathway modeling:</strong> Recognizes attitudes, norms, and control
              operate through separate pathways, none fully mediating others.
            </li>
            <li>
              <strong>Large-scale validation:</strong> Tested with 786 university users (582
              undergraduate, 204 MBA) at a single business school computing resource center,
              providing adequate statistical power for complex model estimation and direct
              comparison of three competing theoretical models in the same sample.
            </li>
            <li>
              <strong>Comparative design:</strong> Direct comparison with competing theories (TAM
              and TPB) in same sample strengthens conclusions about relative model performance.
            </li>
            <li>
              <strong>Organizational relevance:</strong> Includes peer/superior influence and
              resource facilitating conditions reflecting real organizational adoption contexts.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>University laboratory context:</strong> Study conducted in university
              computing facility with voluntary student users, limiting generalization to mandatory
              workplace contexts.
            </li>
            <li>
              <strong>Single-time measurement:</strong> Cross-sectional design at single time point
              prevents understanding of actual adoption trajectories or sustained usage patterns.
            </li>
            <li>
              <strong>Intention-behavior gap:</strong> While actual usage was monitored (3,780
              visits over 12 weeks by 451 of 786 respondents), the decomposed belief structure
              primarily predicts intentions. The link from intention to actual behavior showed
              moderate strength.
            </li>
            <li>
              <strong>Model complexity:</strong> 13-variable decomposed model (per Taylor &amp;
              Todd, 1995, p.169) with multiple paths is substantially more complex than simpler
              alternatives like the 5-variable TAM, and only improves behavior variance explained by
              2% over TAM (36% vs. 34%), raising a parsimony vs. understanding tradeoff.
            </li>
            <li>
              <strong>Limited moderator exploration:</strong> Does not examine whether
              belief-intention relationships differ by user experience, task type, or system
              characteristics.
            </li>
            <li>
              <strong>Self-report limitations:</strong> The belief and intention constructs relied
              on self-reported perceptions, although actual usage was tracked separately through
              system visit logs rather than direct behavioral observation.
            </li>
            <li>
              <strong>Sample homogeneity:</strong> Student sample may not represent diverse
              organizational roles, skill levels, and adoption motivations of heterogeneous
              workforces.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Theoretical integration model:</strong> Demonstrated how to combine
              TPB&rsquo;s behavioral intention framework with TAM&rsquo;s IT-specific constructs
              into unified model.
            </li>
            <li>
              <strong>Decomposition methodology:</strong> Established approach for making general
              behavioral theories technology-specific through construct decomposition.
            </li>
            <li>
              <strong>Superior predictive framework:</strong> Provided empirical evidence that
              decomposed, technology-specific theories outperform both TAM and original TPB.
            </li>
            <li>
              <strong>Multi-belief-pathway recognition:</strong> Articulated how attitudes,
              normative pressures, and control beliefs operate as independent intention predictors.
            </li>
            <li>
              <strong>Decomposed social and control constructs:</strong> Clarified how normative
              beliefs split into peer and superior influence, while control beliefs split into
              self-efficacy, resource facilitating conditions, and technology facilitating
              conditions in technology adoption models.
            </li>
            <li>
              <strong>IT adoption theory advancement:</strong> Created framework synthesizing
              behavioral intention theory with information systems adoption insights.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The researchers established internal validity through comprehensive measurement and
            structural equation modeling:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multi-item measurement scales:</strong> Operationalized all constructs with
              multiple survey items enabling measurement error and reliability estimation.
            </li>
            <li>
              <strong>Reliability assessment:</strong> Reported Cronbach&rsquo;s alpha coefficients
              for all 13 scales (Table 1). Ten scales were above the conventional 0.70 threshold,
              but three scales fell below: PBC (α=0.68), Ease of Use (α=0.60), and Resource
              Facilitating Conditions (α=0.52), limiting confidence in those constructs.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Provided evidence that model constructs are
              empirically distinct through correlation analysis and variance extracted comparisons.
            </li>
            <li>
              <strong>Structural equation modeling:</strong> Used LISREL 8 with weighted least
              squares (WLS) estimation (Joreskog &amp; Sorbom, 1993) for simultaneous estimation of
              measurement and structural models, with fit assessed by χ², AGFI, RNI, and RMSEA
              (p.158).
            </li>
            <li>
              <strong>Model fit comparison:</strong> Systematically compared three competing models
              (TAM, TPB, DTPB) using chi-square and fit indices enabling model selection.
            </li>
            <li>
              <strong>Variance explained:</strong> Reported R-squared values showing 60% of
              intention variance explained by DTPB model (Table 3).
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations require acknowledging both strengths and limitations:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>University sample composition:</strong> Students may be younger, more
              educated, and more computer-proficient than typical organizational IT users.
            </li>
            <li>
              <strong>Voluntary adoption context:</strong> University lab context with optional
              system use differs from mandatory workplace IT implementations.
            </li>
            <li>
              <strong>Single-system limitation:</strong> Tested on only one computing resource
              center (document/presentation production facility) in a single university setting,
              limiting generalization to other types of IT systems and organizational contexts.
            </li>
            <li>
              <strong>Structural generalization:</strong> Three-component belief structure of TPB is
              theoretically robust and generalizable across populations and technologies.
            </li>
            <li>
              <strong>Cross-national applicability:</strong> While specific belief dimensions may
              vary, the decomposition approach transfers to different cultural contexts.
            </li>
            <li>
              <strong>Temporal generalizability:</strong> Cross-sectional design limits
              understanding of whether belief-intention relationships persist over time or change as
              use experience accumulates.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            DTPB is directly relevant to technology adoption because it identifies multiple specific
            barriers and levers operating through distinct belief pathways. The model suggests that
            adoption strategies must address not only instrumental utility but also peer and
            superior influences, self-efficacy, resource facilitating conditions, and technology
            facilitating conditions simultaneously.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Low perceived usefulness:</strong> When users believe systems do not enhance
              job performance or outcomes, attitude-based resistance emerges.
            </li>
            <li>
              <strong>Poor perceived compatibility:</strong> Systems perceived as misaligned with
              existing work practices and values face adoption friction despite potential utility.
            </li>
            <li>
              <strong>Weak social support:</strong> Absence of peer adoption, manager endorsement,
              or opinion leader influence undermines normative adoption motivation.
            </li>
            <li>
              <strong>Insufficient resource facilitating conditions:</strong> Inadequate training,
              technical help, equipment access, and management support reduce adoption likelihood by
              undermining perceived behavioral control.
            </li>
            <li>
              <strong>Perceived high complexity:</strong> Systems requiring substantial learning
              effort create control barriers reducing adoption intentions.
            </li>
            <li>
              <strong>Negative social influence:</strong> Peer skepticism, visible non-adoption by
              respected users, and management indifference create normative barriers.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Establish clear usefulness narrative:</strong> Communicate specific
              productivity gains, time savings, or capability enhancements building usefulness
              beliefs.
            </li>
            <li>
              <strong>Demonstrate compatibility fit:</strong> Show how systems integrate with
              existing workflows, tools, and job tasks reducing friction and workflow disruption.
            </li>
            <li>
              <strong>Mobilize social influence:</strong> Identify opinion leaders, early adopters,
              and respected figures to publicly endorse and visibly use systems.
            </li>
            <li>
              <strong>Secure visible management commitment:</strong> Ensure managers and executives
              visibly adopt and use systems, creating strong normative pressure.
            </li>
            <li>
              <strong>Provide comprehensive facilitating conditions:</strong> Ensure training
              programs, help desk support, documentation, and easy access to required resources.
            </li>
            <li>
              <strong>Reduce perceived complexity:</strong> Design intuitive interfaces, provide
              hands-on practice, and create clear learning pathways reducing cognitive burden.
            </li>
            <li>
              <strong>Implement multi-level strategies:</strong> Address attitudinal barriers
              (usefulness, compatibility, complexity, ease-of-use), normative barriers (peer and
              superior influences), and control barriers (self-efficacy, resource facilitating
              conditions, and technology facilitating conditions) simultaneously.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Taylor and Todd&rsquo;s decomposed approach influenced subsequent IT adoption research
            directions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>TAM 2 (Venkatesh &amp; Davis, 2000):</strong> Extended TAM with social
              influence and cognitive instrumental processes, reflecting DTPB&rsquo;s more
              differentiated treatment of adoption determinants.
            </li>
            <li>
              <strong>TAM 3 (Venkatesh &amp; Bala, 2008):</strong> Further elaborated TAM by
              decomposing determinants of perceived usefulness and perceived ease of use in ways
              that parallel DTPB&rsquo;s decomposition approach.
            </li>
            <li>
              <strong>Unified Theory of Acceptance and Use of Technology (UTAUT):</strong>{' '}
              Integrated multiple theories including TPB, TAM, and DTPB insights into comprehensive
              model.
            </li>
            <li>
              <strong>Technology Readiness Index expansions:</strong> Applied decomposition
              methodology to user predispositions and technology readiness dimensions.
            </li>
            <li>
              <strong>Implementation science frameworks:</strong> Adopted decomposed multi-pathway
              approach examining fidelity, adoption, and sustainability determinants.
            </li>
            <li>
              <strong>Organizational change models:</strong> Incorporated multi-level decomposition
              acknowledging individual beliefs, group norms, and organizational structures.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-taylor-1995">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding information technology usage: A
              test of competing models. <em>Information Systems Research</em>, 6(2), 144-176.
              https://doi.org/10.1287/isre.6.2.144
            </li>
            <li id="ref-ajzen-1991">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-ajzen-1991-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>{' '}
              https://doi.org/10.1016/0749-5978(91)90020-T
            </li>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-davis-1989-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>{' '}
              https://doi.org/10.2307/249008
            </li>
            <li id="ref-rogers-1983">
              Rogers, E. M. (1983). Diffusion of innovations (3rd ed.). Free Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rogers-1983-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>
            </li>
            <li id="ref-bandura-1977">
              Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change.{' '}
              <em>Psychological Review</em>, 84(2), 191-215.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-bandura-1977-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>{' '}
              https://doi.org/10.1037/0033-295X.84.2.191
            </li>
            <li id="ref-triandis-1979">
              Triandis, H. C. (1979). Values, attitudes, and interpersonal behavior. In H. E. Howe
              &amp; M. M. Page (Eds.), <em>Nebraska Symposium on Motivation</em>, Vol. 27 (pp.
              195-259). University of Nebraska Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-triandis-1979-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478. https://doi.org/10.2307/30036540
            </li>
            <li id="ref-davis-1992">
              Davis, F. D., Bagozzi, R. P., &amp; Warshaw, P. R. (1992). Extrinsic and intrinsic
              motivation to use computers in the workplace.{' '}
              <em>Journal of Applied Social Psychology</em>, 22(14), 1111-1132.
              https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
            </li>
            <li id="ref-venkatesh-2000">
              Venkatesh, V., &amp; Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. <em>Management Science</em>, 46(2),
              186-204.
            </li>
            <li id="ref-venkatesh-2008">
              Venkatesh, V., &amp; Bala, H. (2008). Technology acceptance model 3 and a research
              agenda on interventions. <em>Decision Sciences</em>, 39(2), 273-315.
              https://doi.org/10.1111/j.1540-5915.2008.00192.x
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Extrinsic &amp; Intrinsic Motivation (Davis et al.)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Task-Technology Fit (Goodhue &amp; Thompson) &rarr;
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
