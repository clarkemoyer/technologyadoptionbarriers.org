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
              <strong>Model Name:</strong> Understanding Information Technology Usage: A Test of
              Competing Models
            </p>
            <p>
              <strong>Model Abbreviation:</strong> Decomposed Theory of Planned Behavior (DTPB)
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
            The authors observed that prior IT adoption models like TAM offered narrower constructs
            (usefulness and ease of use) but lacked the behavioral intention framework of TPB. They
            conceptualized DTPB as decomposing the three TPB belief categories into multiple
            technology-specific dimensions. Attitudinal beliefs decompose into usefulness and
            compatibility; normative beliefs decompose into subjective norm, social influence
            factors, and organizational support; control beliefs decompose into facilitating
            conditions and technology complexity.
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
            The Decomposed Theory of Planned Behavior operationalizes nine primary constructs
            organized within the three TPB belief categories:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Perceived Usefulness (Attitude component):</strong> The degree to which users
              believe the IT system enhances job performance and productivity. Captures instrumental
              benefits and outcome value.
            </li>
            <li>
              <strong>Perceived Compatibility (Attitude component):</strong> The extent to which
              users perceive the system aligns with their existing work practices, values, and
              needs. Reflects adoption of innovations theory compatibility construct.
            </li>
            <li>
              <strong>Subjective Norm (Normative belief component):</strong> Perceived social
              pressure from important others regarding IT system adoption. Reflects primary
              normative influence pathway.
            </li>
            <li>
              <strong>Social Influence (Normative belief component):</strong> Influence of peers,
              managers, and organizational leadership on adoption decisions. Captures network
              effects and referent power.
            </li>
            <li>
              <strong>Organizational Support (Normative belief component):</strong> Perceived
              organizational encouragement, training, and resource allocation supporting system
              adoption. Reflects institutional normative influences.
            </li>
            <li>
              <strong>Facilitating Conditions (Control belief component):</strong> Objective
              availability of resources supporting IT use including training, equipment, and
              technical support. Reflects environmental control factors.
            </li>
            <li>
              <strong>Technology Complexity (Control belief component):</strong> Perceived
              difficulty and learning requirements of the IT system. Reflects effort and cognitive
              burden in system use.
            </li>
            <li>
              <strong>Attitude Toward Use:</strong> Overall favorable or unfavorable evaluation of
              the system predicted by usefulness, compatibility, and other beliefs.
            </li>
            <li>
              <strong>Behavioral Intention to Use:</strong> User likelihood of adopting and using
              the system, predicted by attitudes, normative pressures, and control beliefs.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
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

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            DTPB specifies that behavioral intentions to use IT are determined by attitudes,
            subjective norms, and perceived behavioral control. Critically, each of these three
            intention predictors is decomposed into multiple specific belief dimensions. Attitudes
            toward IT use are predicted by perceived usefulness and compatibility beliefs.
            Subjective norms are predicted by subjective norm, social influence, and organizational
            support beliefs. Perceived behavioral control is predicted by facilitating conditions
            and technology complexity beliefs. The model explained 71% of variance in intention to
            use IT systems, substantially outperforming both TAM and original TPB in predictive
            power.
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitudinal beliefs:</strong> Usefulness and compatibility perceptions
              capturing instrumental and value-alignment motivations for adoption.
            </li>
            <li>
              <strong>Normative beliefs:</strong> Subjective norms, social influence, and
              organizational support capturing multiple social influence pathways.
            </li>
            <li>
              <strong>Control beliefs:</strong> Facilitating conditions and technology complexity
              capturing resource availability and learning barriers.
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
              into IT-relevant dimensions (usefulness, compatibility, organizational support)
              improving precision.
            </li>
            <li>
              <strong>Superior predictive power:</strong> Explains 71% of intention variance,
              substantially outperforming TAM (54%) and original TPB (58%) in this sample.
            </li>
            <li>
              <strong>Multi-pathway modeling:</strong> Recognizes attitudes, norms, and control
              operate through separate pathways, none fully mediating others.
            </li>
            <li>
              <strong>Large-scale validation:</strong> Tested with 786 university users across
              multiple IT systems providing adequate statistical power for complex model estimation.
            </li>
            <li>
              <strong>Comparative design:</strong> Direct comparison with competing theories (TAM
              and TPB) in same sample strengthens conclusions about relative model performance.
            </li>
            <li>
              <strong>Organizational relevance:</strong> Includes organizational support and social
              influence dimensions reflecting real organizational adoption contexts.
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
              <strong>Intention-behavior gap:</strong> Measures behavioral intentions rather than
              actual system usage, which may diverge due to implementation factors and context
              constraints.
            </li>
            <li>
              <strong>Model complexity:</strong> Nine-construct model with multiple paths is more
              complex than simpler alternatives (TAM), potentially overfitting the specific sample.
            </li>
            <li>
              <strong>Limited moderator exploration:</strong> Does not examine whether
              belief-intention relationships differ by user experience, task type, or system
              characteristics.
            </li>
            <li>
              <strong>Self-report limitations:</strong> All measures relied on self-reported beliefs
              rather than behavioral observation or system usage logs.
            </li>
            <li>
              <strong>Sample homogeneity:</strong> Student sample may not represent diverse
              organizational roles, skill levels, and adoption motivations of heterogeneous
              workforces.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
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
              <strong>Organizational constructs emphasis:</strong> Elevated organizational support
              and social influence from peripheral to central in adoption models.
            </li>
            <li>
              <strong>IT adoption theory advancement:</strong> Created framework synthesizing
              behavioral intention theory with information systems adoption insights.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
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
              for all scales demonstrating internal consistency of multi-item constructs.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Provided evidence that model constructs are
              empirically distinct through correlation analysis and variance extracted comparisons.
            </li>
            <li>
              <strong>Structural equation modeling:</strong> Used SEM for simultaneous estimation of
              measurement and structural models with appropriate goodness-of-fit assessment.
            </li>
            <li>
              <strong>Model fit comparison:</strong> Systematically compared three competing models
              (TAM, TPB, DTPB) using chi-square and fit indices enabling model selection.
            </li>
            <li>
              <strong>Variance explained:</strong> Reported R-squared values showing 71% of
              intention variance explained by DTPB model.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
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
              <strong>Single-system limitation:</strong> While tested on multiple systems, all
              systems remained relatively simple university-focused applications.
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

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            DTPB is directly relevant to technology adoption because it identifies multiple specific
            barriers and levers operating through distinct belief pathways. The model suggests that
            adoption strategies must address not only instrumental utility but also social
            influences and organizational support simultaneously.
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
              <strong>Absent organizational support:</strong> Insufficient training, inadequate
              technical help, and lack of management enforcement reduce adoption likelihood.
            </li>
            <li>
              <strong>Perceived high complexity:</strong> Systems requiring substantial learning
              effort create control barriers reducing adoption intentions.
            </li>
            <li>
              <strong>Insufficient facilitating conditions:</strong> Lack of resources, equipment
              access, and technical support undermine behavioral control perceptions.
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
              (usefulness, compatibility), normative barriers (social influence, organizational
              support), and control barriers (complexity, facilitating conditions) simultaneously.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Taylor and Todd&rsquo;s decomposed approach influenced subsequent IT adoption research
            directions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>TAM 2 and TAM 3 (Venkatesh &amp; Bala):</strong> Extended TAM with moderators
              and social influence variables mirroring DTPB&rsquo;s decomposition approach.
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

        {/* 13. References */}
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
                ></a>
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
                ></a>
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
                ></a>
              </span>
            </li>
          </ol>
        </section>

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
          </ol>
        </section>

        {/* 14. Series Navigation */}
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
