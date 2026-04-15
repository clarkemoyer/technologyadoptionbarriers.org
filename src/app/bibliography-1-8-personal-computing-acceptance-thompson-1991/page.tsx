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
  title: 'Bibliography: Personal Computing Utilization - Thompson et al. (1991)',
  description:
    'Deep dive into the Personal Computing Utilization Model by Thompson, Higgins, and Howell (1991), exploring determinants of actual PC usage in organizational contexts.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Personal Computing Utilization - Thompson, Higgins, &amp; Howell (1991)
        </h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Toward a Conceptual Model of Personal Computing
              Utilization
            </p>
            <p>
              <strong>Model Abbreviation:</strong> PC Utilization Model
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Technology Usage in Organizational
              Contexts
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Organizational Behavior
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Ronald L. Thompson, Christopher A. Higgins, Jane M. Howell
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1991
            </p>
            <p>
              <strong>Official Title:</strong> Toward a Conceptual Model of Personal Computing
              Utilization
            </p>
            <p>
              <strong>Journal:</strong> MIS Quarterly
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 15, No. 1
            </p>
            <p>
              <strong>Pages:</strong> 125-143
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
                Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (
                <a href="#ref-thompson-1991" className="text-tabs-teal-deep hover:underline">
                  1991
                </a>
                ). Toward a conceptual model of personal computing utilization.{' '}
                <em>MIS Quarterly</em>, 15(1), 125-143.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Thompson, Ronald L., Christopher A. Higgins, and Jane M. Howell. 1991. &ldquo;Toward
                a Conceptual Model of Personal Computing Utilization.&rdquo;
                <em>MIS Quarterly</em> 15, no. 1: 125-143.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Thompson, Higgins, and Howell developed their PC utilization model to address a
            significant gap in understanding personal computer adoption within organizational
            settings. While prior technology acceptance models existed, there was insufficient
            theoretical grounding specifically examining factors influencing actual PC usage
            patterns among end-users. Personal computing was becoming increasingly prevalent in
            organizational environments, yet organizations struggled to understand why some
            employees readily adopted PCs while others resisted or underutilized them.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Building on Triandis&rsquo; theory of expected consequences, the authors recognized that
            technology adoption exists on a continuum of utilization intensity rather than as binary
            use versus non-use. Prior research had focused heavily on intention to use or
            acceptance, but Thompson&rsquo;s work directly examined actual usage behavior and
            factors predicting variation in usage levels. The model proposed that six primary
            constructs predict PC utilization: social factors, affect, facilitating conditions,
            complexity, job fit, and long-term consequences.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Research grounded in organizational contexts with 286 survey respondents from a single
            organization made findings directly relevant to managers seeking to understand employee
            PC adoption patterns. By examining actual utilization rather than intentions, the model
            addressed the known intention-behavior gap that affected earlier theoretical frameworks.
            The authors explicitly recognized that technology adoption is multifaceted, requiring
            understanding of affective, social, cognitive, and contextual influences simultaneously.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The PC Utilization Model operationalizes seven primary constructs:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Complexity:</strong> Perceived difficulty of using a PC. Measured through
              items assessing ease versus difficulty in learning and using computers.
            </li>
            <li>
              <strong>Job Fit:</strong> Perceived alignment between PC functionality and job
              requirements. Measured through items assessing whether PCs help with job performance
              and match job tasks.
            </li>
            <li>
              <strong>Long-Term Consequences:</strong> Perceived future payoffs from PC use
              including career advancement and productivity gains. Measured through items assessing
              beliefs about future benefits and career impacts.
            </li>
            <li>
              <strong>Affect:</strong> Emotional attitudes toward PCs. Measured through items
              assessing whether individuals like or dislike PCs and emotional responses.
            </li>
            <li>
              <strong>Social Factors:</strong> Perceived importance of others&rsquo; opinions
              regarding PC use and social norms about technology. Measured through items assessing
              social influence and normative pressures.
            </li>
            <li>
              <strong>Facilitating Conditions:</strong> Objective and perceived availability of
              resources supporting PC use. Measured through items assessing training availability,
              equipment access, and technical support.
            </li>
            <li>
              <strong>Utilization:</strong> Actual frequency and intensity of PC usage. Measured
              through items assessing direct usage behavior including number of facility visits and
              frequency of use.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Thompson model built upon several prior intellectual traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Triandis&rsquo; Theory of Expected Consequences (1980):</strong> Foundational
              framework positing that behavior is influenced by relative influence of different
              components of expected consequences.
            </li>
            <li>
              <strong>Technology Acceptance Model (Davis):</strong> Prior IS acceptance research
              providing context for investigating behavior prediction.
            </li>
            <li>
              <strong>Expectancy theory:</strong> Grounded the concept that expected consequences
              influence behavior.
            </li>
            <li>
              <strong>Porter and Lawler&rsquo;s theory of motivation:</strong> Provided foundations
              for understanding effort-performance-reward relationships.
            </li>
            <li>
              <strong>
                Theory of Planned Behavior (
                <Link
                  href="/bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Ajzen, 1991
                </Link>
                ):
              </strong>{' '}
              Contemporary work on behavioral intention and perceived control.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The PC Utilization Model specifies complex relationships where multiple constructs
            determine actual usage behavior. Expected consequences (complexity, job fit, long-term
            consequences) operate alongside social factors, affect, and facilitating conditions to
            predict utilization. The model explained 24% of variance in PC utilization through these
            multi-level constructs. Path analysis revealed that job fit and social factors showed
            strongest effects on utilization (.26 and .22 respectively).
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Expected consequences constructs:</strong> Complexity perceptions, job fit
              alignment, long-term consequence beliefs predicting utilization indirectly.
            </li>
            <li>
              <strong>Affective and social dimensions:</strong> Emotional attitudes and social
              normative pressures influencing utilization.
            </li>
            <li>
              <strong>Organizational support:</strong> Facilitating conditions reflecting technical
              support, training, and resource availability.
            </li>
            <li>
              <strong>Actual usage behavior:</strong> Direct measurement of utilization frequency,
              facility visit numbers, and time spent using systems.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Actual behavior measurement:</strong> Unlike many models measuring intentions,
              this model directly measures utilization behavior.
            </li>
            <li>
              <strong>Comprehensive construct coverage:</strong> Integrates affective, social,
              cognitive, and contextual factors providing holistic view of usage determinants.
            </li>
            <li>
              <strong>Grounding in established theory:</strong> Anchored in Triandis&rsquo; theory
              providing theoretical justification beyond empirical discovery.
            </li>
            <li>
              <strong>Empirical strength:</strong> Explained substantial variance in utilization (R²
              = .24) demonstrating identified factors capture meaningful drivers.
            </li>
            <li>
              <strong>Clear managerial implications:</strong> Identifying that social factors and
              job fit are strongest predictors guides evidence-based intervention strategy.
            </li>
            <li>
              <strong>Integration of multiple levels:</strong> Synthesizes individual attitudes,
              social context, job characteristics, and organizational support systems.
            </li>
            <li>
              <strong>Sophisticated methodology:</strong> Used PLS analysis allowing simultaneous
              model testing with measurement error accounting.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Single-organization design:</strong> All data came from one organization,
              severely constraining generalizability to other organizations and contexts.
            </li>
            <li>
              <strong>Limited facilitating conditions operationalization:</strong> Measured narrowly
              as technical support, missing other resource factors like equipment access and
              software upgrade ease.
            </li>
            <li>
              <strong>Low reliability for complexity scale:</strong> Complexity had lowest
              Cronbach&rsquo;s alpha (.60), below conventional .70 threshold, indicating measurement
              issues.
            </li>
            <li>
              <strong>Non-significant relationships:</strong> Affect and facilitating conditions
              showed non-significant direct effects, contrasting with prior technology acceptance
              research.
            </li>
            <li>
              <strong>Self-report measurement:</strong> All data were self-reported rather than
              based on objective usage statistics, risking over- or underestimation of actual usage.
            </li>
            <li>
              <strong>Cross-sectional design:</strong> Single-point-in-time snapshot prevents
              establishment of temporal causality and understanding of usage trajectory changes.
            </li>
            <li>
              <strong>Experience effects undertheorized:</strong> While identified as important,
              experience was not formally modeled as factor modifying relationships.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Intention-behavior bridge:</strong> Shifted focus from measuring intentions to
              directly measuring actual utilization behavior.
            </li>
            <li>
              <strong>Social factor emphasis:</strong> Elevated social influence and organizational
              norms to primary status in technology adoption frameworks.
            </li>
            <li>
              <strong>Affective dimension inclusion:</strong> Included emotional attitudes as
              distinct from perceived usefulness, acknowledging emotional aspects of adoption.
            </li>
            <li>
              <strong>Organizational context integration:</strong> Situated model explicitly in
              organizational environments where job fit and organizational factors shape adoption.
            </li>
            <li>
              <strong>Multi-theoretical integration:</strong> Drew from Triandis, expectancy theory,
              and behavioral attitude theory, demonstrating theoretical eclecticism.
            </li>
            <li>
              <strong>Complex model structure:</strong> Specified indirect pathways and interaction
              effects exceeding simpler linear structures.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The researchers established internal validity through rigorous quantitative methodology:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Exploratory factor analysis:</strong> Identified underlying measurement
              dimensions, discovering seven factors rather than originally hypothesized six.
            </li>
            <li>
              <strong>Reliability assessment:</strong> Calculated Cronbach&rsquo;s alpha
              coefficients ranging from .60 to .86, with most scales exceeding .70 threshold.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Confirmed that constructs loaded more highly
              on hypothesized factors than others, with appropriate construct separation.
            </li>
            <li>
              <strong>Path coefficient testing:</strong> Used jackknifing procedures not assuming
              normality to test significance, finding four of six hypothesized relationships
              significant at p &lt; .01.
            </li>
            <li>
              <strong>Sophisticated statistical techniques:</strong> Employed PLS analysis allowing
              simultaneous model testing with measurement error accounting.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity testing was limited due to single-organization design, which the
            authors explicitly acknowledged:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Diverse sample composition:</strong> Selected participants across different
              job levels and positions to capture variance in PC utilization across roles.
            </li>
            <li>
              <strong>Actual behavior measurement:</strong> Measured self-reported usage patterns
              rather than relying on intentions alone, strengthening external validity claims.
            </li>
            <li>
              <strong>Experience consideration:</strong> Collected data on previous PC experience
              and examined whether experience moderated model relationships.
            </li>
            <li>
              <strong>Adequate statistical power:</strong> Large sample size for single organization
              (n=286) provided sufficient power for detecting relationships.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The PC Utilization Model is directly relevant to technology adoption because it
            identifies multiple barriers to usage and specifies organizational interventions
            reducing those barriers. By examining actual utilization rather than intentions, the
            model addresses practical organizational concerns.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Perceived complexity:</strong> Users perceiving PCs as difficult to learn or
              operate show lower utilization regardless of system objective complexity.
            </li>
            <li>
              <strong>Poor job fit:</strong> When users perceive PCs do not align with actual job
              tasks or requirements, motivation to use them diminishes significantly.
            </li>
            <li>
              <strong>Negative long-term consequence perceptions:</strong> When employees perceive
              PC use will not lead to tangible benefits, career advancement, or productivity gains,
              utilization remains low.
            </li>
            <li>
              <strong>Unsupportive social context:</strong> Lack of peer support, organizational
              norms not supporting usage, or absence of respected champions undermines adoption.
            </li>
            <li>
              <strong>Insufficient facilitating conditions:</strong> Inadequate training
              opportunities, insufficient technical support, and poor resource accessibility create
              barriers.
            </li>
            <li>
              <strong>Weak positive affect:</strong> While affect did not show direct effects,
              emotional discomfort toward PCs may represent barriers in some contexts.
            </li>
            <li>
              <strong>Experience gaps:</strong> Inexperience with personal computers creates
              barriers through higher complexity perceptions and uncertain long-term consequences.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Reduce complexity through training:</strong> Ensure accessible,
              context-relevant training reducing perception that PCs are difficult to learn and use.
            </li>
            <li>
              <strong>Establish clear job fit:</strong> Conduct job analysis identifying tasks where
              PC usage enhances performance and communicate connections explicitly to employees.
            </li>
            <li>
              <strong>Highlight long-term benefits:</strong> Educate on expected consequences
              including productivity gains, career development, and effectiveness improvements.
            </li>
            <li>
              <strong>Leverage organizational champions:</strong> Identify and empower early
              adopters and opinion leaders whose visibility publicly demonstrates adoption success.
            </li>
            <li>
              <strong>Provide comprehensive facilitating conditions:</strong> Ensure convenient
              physical access, responsive help desk support, flexible training, and documentation.
            </li>
            <li>
              <strong>Normalize technology affect:</strong> Destigmatize anxiety through positive
              experiences, highlight enjoyable computing aspects, and acknowledge comfort develops
              over time.
            </li>
            <li>
              <strong>Implement multi-level approaches:</strong> Target multiple intervention points
              simultaneously addressing complexity, job fit, consequences, social support, and
              facilitating conditions.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Thompson model directly influenced subsequent technology adoption research:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Decomposed TPB (Taylor &amp;{' '}
                <Link
                  href="/bibliography-1-10-decomposed-tpb-taylor-todd-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Todd, 1995
                </Link>
                ):
              </strong>{' '}
              Extended theory of planned behavior with technology-specific belief categories.
            </li>
            <li>
              <strong>
                Task-Technology Fit Model (Goodhue &amp;{' '}
                <Link
                  href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Thompson, 1995
                </Link>
                ):
              </strong>{' '}
              Built on PC utilization model by formalizing how technology characteristics align with
              task requirements.
            </li>
            <li>
              <strong>Unified Theory of Acceptance and Use of Technology (UTAUT):</strong>{' '}
              Incorporated multiple technology acceptance frameworks emphasizing actual usage.
            </li>
            <li>
              <strong>Technology Acceptance Model extensions:</strong> Subsequent TAM variants
              incorporated social influences and organizational factors similar to Thompson&rsquo;s
              approach.
            </li>
            <li>
              <strong>IS implementation research:</strong> Applied multi-factor frameworks similar
              to Thompson&rsquo;s model examining actual technology implementation outcomes.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-thompson-1991">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal computing:
              Toward a conceptual model of utilization. <em>MIS Quarterly</em>, 15(1), 125-143.
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-triandis-1980">
              Triandis, H. C. (1980). Values, attitudes, and interpersonal behavior. In W. M. Alston
              (Ed.), <em>Nebraska Symposium on Motivation</em> (Vol. 27). University of Nebraska
              Press.
            </li>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              https://doi.org/10.2307/249008
            </li>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-porter-1968">
              Porter, L. W., &amp; Lawler, E. E. (1968). Managerial attitudes and performance.
              Irwin-Dorsey.
            </li>
            <li id="ref-goodhue-1995">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
              performance. <em>MIS Quarterly</em>, 19(2), 213-236. https://doi.org/10.2307/249689
            </li>
            <li id="ref-taylor-1995">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding Information Technology Usage: A
              Test of Competing Models. <em>Information Systems Research</em>, 6(2).
              https://doi.org/10.1287/isre.6.2.144
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Theory of Planned Behavior (Ajzen)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Intrinsic &amp; Extrinsic Motivation (Davis et al.) &rarr;
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
