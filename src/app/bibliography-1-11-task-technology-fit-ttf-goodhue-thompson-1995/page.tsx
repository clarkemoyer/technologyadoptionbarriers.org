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
  title: 'Bibliography: Task-Technology Fit (TTF) - Goodhue & Thompson (1995)',
  description:
    'Deep exploration of the Task-Technology Fit model, which posits that IT system characteristics and user task requirements determine system fit, functional utilization, and individual performance.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Task-Technology Fit (TTF) - Goodhue &amp; Thompson (1995)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Task-Technology Fit and Individual Performance
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TTF Model
            </p>
            <p>
              <strong>Target of Model:</strong> Fit Between Task Requirements and Technology
              Capabilities
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Organizational Behavior,
              Human-Computer Interaction
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Dale L. Goodhue, Ronald L. Thompson
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1995
            </p>
            <p>
              <strong>Official Title:</strong> Task-Technology Fit and Individual Performance
            </p>
            <p>
              <strong>Journal:</strong> MIS Quarterly
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 19, No. 2
            </p>
            <p>
              <strong>Pages:</strong> 213-236
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.2307/249689"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.2307/249689
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
                Goodhue, D. L., &amp; Thompson, R. L. (
                <a href="#ref-goodhue-1995" className="text-tabs-teal-deep hover:underline">
                  1995
                </a>
                ). Task-technology fit and individual performance. <em>MIS Quarterly</em>, 19(2),
                213-236.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Goodhue, Dale L., and Ronald L. Thompson. 1995. &ldquo;Task-Technology Fit and
                Individual Performance.&rdquo; <em>MIS Quarterly</em> 19, no. 2: 213-236.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Goodhue and Thompson developed the Task-Technology Fit model to address a critical gap
            in IT evaluation research. Prior models focused on user acceptance and intention to use
            systems, but organizations needed frameworks explaining how technological capabilities
            actually improve job performance. They recognized that a well-accepted system offering
            poor task-technology fit delivers little performance value, while a system with
            excellent fit even if less intuitively appealing drives substantial performance
            improvements.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors theorized that performance gains from IT systems depend fundamentally on
            whether system functionalities match the characteristics, demands, and preferences of
            the tasks users perform. A system optimally designed for one task type (e.g.,
            transaction processing) may provide poor fit for different task requirements (e.g.,
            analytical decision-making). Rather than viewing IT adoption as a uniform construct, TTF
            emphasizes the contingency that proper matching of technology capabilities to task needs
            drives performance outcomes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Building on contingency theory and job fit literature, the authors conducted a survey
            study with end-users across two companies and developed a multi-factor TTF measurement
            instrument. They report evidence, within their sample, that task-technology fit predicts
            self-reported performance impacts beyond attitudinal variables alone. TTF thus positions
            fit as a construct distinct from (and complementary to) acceptance. Specific factor
            counts and sample details should be verified against the published paper for derivative
            measurement work.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Task-Technology Fit model operationalizes multiple dimensions across three domains:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Task Characteristics:</strong> The specific work activities, information
              requirements, and performance objectives users pursue. Include task complexity,
              variety, interdependence, and information requirements.
            </li>
            <li>
              <strong>Technology Characteristics:</strong> System functionalities, data
              availability, system performance, ease of use, and reliability. Encompass both
              technical capabilities and user interaction quality.
            </li>
            <li>
              <strong>Task-Technology Fit:</strong> The extent to which technology functionality
              matches task requirements and preferences. High fit occurs when systems provide data,
              analysis, and functionality needed for task execution with appropriate speed and
              reliability.
            </li>
            <li>
              <strong>Utilization (Function Fit):</strong> The extent to which users actually employ
              system capabilities relevant to their work tasks. Reflects whether functionality is
              actually leveraged in practice.
            </li>
            <li>
              <strong>Individual Performance:</strong> User ability to accomplish job objectives,
              complete tasks efficiently, and achieve quality outcomes. Directly measures
              productivity and effectiveness impacts of technology use.
            </li>
            <li>
              <strong>12-Factor TTF Instrument:</strong> Comprehensive measurement of fit across
              data quality, data locating ability, decision support, automation of tasks, ease of
              system use, system reliability, and other dimensions.
            </li>
          </ul>
        </section>

        {/* 6. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Task-Technology Fit (TTF) is, in part, a measurement model. Goodhue and Thompson (1995)
            report a multi-factor TTF instrument that asks users to evaluate information systems and
            data along a set of fit dimensions. The dimensions commonly listed from the paper
            include:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>Quality (currency, accuracy, and level of detail of data)</li>
            <li>Locatability (ease of finding data and of understanding what data means)</li>
            <li>Authorization (obtaining the right level of access to data)</li>
            <li>Compatibility (between data drawn from different sources)</li>
            <li>Ease of use / training</li>
            <li>Production timeliness</li>
            <li>Systems reliability</li>
            <li>Relationship with users (user support and understanding of business)</li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The model relates these user-rated fit perceptions to self-reported utilization and
            self-reported individual performance impacts. Goodhue and Thompson provide item
            statistics and report evidence of construct validity for the TTF dimensions in their
            sample, but subsequent studies have adapted the scale set for different contexts rather
            than reusing a single canonical instrument.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Source note:</strong> Claims below draw from the published MIS Quarterly paper
            (Goodhue &amp; Thompson, 1995, 19(2), 213 - 236). Specific factor counts and exact
            dimension labels should be verified against the paper for any derivative measurement
            work.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The TTF model synthesized multiple foundational theoretical streams:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Contingency theory (Lawrence &amp; Lorsch):</strong> Established that
              organizational effectiveness depends on fit between organizational characteristics and
              environmental demands.
            </li>
            <li>
              <strong>Job fit theory:</strong> Demonstrated that job performance improves when job
              characteristics match worker capabilities and preferences.
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
              Provided context showing acceptance differs from performance impact.
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
              Offered insights on innovation compatibility and relative advantage.
            </li>
            <li>
              <strong>Expectancy theory (Vroom):</strong> Grounded understanding that performance
              improvements depend on proper tool-task alignment.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The TTF model proposes a direct causal path: task requirements and technology
            characteristics jointly determine task-technology fit, which influences utilization of
            system functionality, which in turn drives individual performance. The model emphasizes
            that high fit encourages utilization of relevant system capabilities and that such
            utilization directly improves task execution quality and efficiency. High acceptance or
            ease of use without fit produces system use unconnected to performance. Conversely, high
            fit combined with extensive utilization produces substantial performance improvements.
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Task analysis:</strong> Characteristics of user work including information
              requirements, decision complexity, and task structure.
            </li>
            <li>
              <strong>Technology audit:</strong> System capabilities, feature availability,
              performance characteristics, and user interface quality.
            </li>
            <li>
              <strong>Fit assessment:</strong> Twelve dimensions capturing data quality, ease of
              use, automation potential, decision support, task interdependence matching, and other
              fit aspects.
            </li>
            <li>
              <strong>Utilization patterns:</strong> Frequency and breadth of system feature usage
              relevant to task requirements.
            </li>
            <li>
              <strong>Performance outcomes:</strong> Objective and subjective measures of
              productivity, decision quality, and task completion efficiency.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Performance focus:</strong> Unlike acceptance models, directly measures and
              predicts performance outcomes rather than just adoption intentions.
            </li>
            <li>
              <strong>Comprehensive fit measurement:</strong> Twelve-factor instrument captures fit
              across multiple dimensions beyond simple usefulness or ease-of-use judgments.
            </li>
            <li>
              <strong>Contingency approach:</strong> Acknowledges that fit depends on specific task
              characteristics and system capabilities, rejecting one-size-fits-all technology
              claims.
            </li>
            <li>
              <strong>Large-scale empirical validation:</strong> Tested with 600+ users across 26
              departments and 2 companies demonstrating robust findings across diverse contexts.
            </li>
            <li>
              <strong>Distinct from acceptance:</strong> Shows fit independently predicts
              performance beyond user attitudes or technology acceptance variables.
            </li>
            <li>
              <strong>Actionable for management:</strong> Provides clear guidance: match technology
              to tasks, measure fit, encourage utilization of fit-aligned functionality.
            </li>
            <li>
              <strong>Cross-functional applicability:</strong> Tested across finance, manufacturing,
              marketing, and other departments showing general applicability.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Complex measurement requirement:</strong> Twelve-factor TTF instrument is
              lengthy and demanding, requiring substantial user assessment and analysis time.
            </li>
            <li>
              <strong>Performance measurement limitations:</strong> Performance outcomes are
              difficult to isolate and attribute solely to technology; many organizational factors
              influence productivity.
            </li>
            <li>
              <strong>Static fit conceptualization:</strong> Model captures fit at single point in
              time; does not address how fit evolves as tasks change or users gain experience.
            </li>
            <li>
              <strong>Utilization-performance assumptions:</strong> Assumes greater utilization
              always improves performance; may not hold if users waste time on unnecessary system
              features.
            </li>
            <li>
              <strong>Task characteristic assumptions:</strong> Assumes task characteristics are
              relatively stable and well-defined; may not apply to highly ambiguous or rapidly
              changing tasks.
            </li>
            <li>
              <strong>Limited individual differences:</strong> Does not extensively examine how
              individual skill levels or learning curves affect fit-performance relationships.
            </li>
            <li>
              <strong>Cross-system generalization:</strong> Tested primarily with transaction
              processing and decision support systems; less clear for emerging technology types.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Performance-centered IT evaluation:</strong> Shifted focus from technology
              acceptance to actual performance impact and outcome achievement.
            </li>
            <li>
              <strong>Fit as central construct:</strong> Elevated task-technology fit to primary
              driver of IT success, distinct from general system acceptance.
            </li>
            <li>
              <strong>Contingency theory application:</strong> Applied contingency theory to IT,
              establishing that technology effectiveness depends on task-technology alignment.
            </li>
            <li>
              <strong>Multidimensional fit measurement:</strong> Developed comprehensive 12-factor
              instrument capturing fit across data quality, functionality, ease of use, and other
              dimensions.
            </li>
            <li>
              <strong>Utilization as mediator:</strong> Proposed, and found support for in the
              original study, a pathway where fit influences performance through increased
              utilization of relevant system capabilities.
            </li>
            <li>
              <strong>Distinction from acceptance:</strong> Provided empirical evidence that fit
              predicts performance beyond technology acceptance variables.
            </li>
            <li>
              <strong>Practical evaluation framework:</strong> Created actionable approach for
              organizations evaluating whether technology implementations deliver value.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The researchers established internal validity through rigorous measurement and analysis:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multi-item scales:</strong> Operationalized fit, utilization, and performance
              with multiple survey items enabling measurement error assessment.
            </li>
            <li>
              <strong>Exploratory factor analysis:</strong> Used EFA to identify factor structure of
              the 12-item TTF instrument, validating hypothesized dimensions.
            </li>
            <li>
              <strong>Reliability testing:</strong> Reported Cronbach&rsquo;s alpha coefficients for
              all scales demonstrating internal consistency.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Confirmed that fit, utilization, and
              performance constructs are empirically distinct through correlation analysis.
            </li>
            <li>
              <strong>Correlational and regression analysis:</strong> Tested model predictions using
              multiple regression and path analysis showing fit-to-performance relationships.
            </li>
            <li>
              <strong>Multiple departments:</strong> Collected data across 26 departments and 2
              organizations enabling consistency checks across contexts.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity claims rest on substantial but bounded empirical foundations:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multi-department validation:</strong> 26 departments across 2 companies
              provides diverse context demonstrating generalization across units.
            </li>
            <li>
              <strong>System diversity:</strong> Research included both transaction processing and
              decision support systems suggesting fit applies across system types.
            </li>
            <li>
              <strong>Large sample size:</strong> 600+ end-users provides substantial statistical
              power and heterogeneous sample demographics.
            </li>
            <li>
              <strong>Performance measurement:</strong> Both subjective user ratings and objective
              performance measures strengthen outcome validity.
            </li>
            <li>
              <strong>Emerging technology questions:</strong> Study predates mobile, cloud, and AI
              systems; applicability to these technologies remains unclear.
            </li>
            <li>
              <strong>Task type boundaries:</strong> May apply differently to highly novel,
              ambiguous, or rapidly changing task environments.
            </li>
            <li>
              <strong>Geographic and cultural scope:</strong> Single-country research may not
              generalize across different regulatory, cultural, or industrial contexts.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Task-Technology Fit model is highly relevant to technology adoption because it
            explains why adoption alone does not guarantee success. Poor-fit systems can be adopted
            widely but deliver minimal performance value. The model identifies adoption barriers
            rooted in lack of task-technology alignment distinct from barriers of complexity or
            social influence.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Misaligned system capabilities:</strong> Systems lacking functionality
              required for user tasks create fundamental fit barriers preventing productive
              adoption.
            </li>
            <li>
              <strong>Data quality gaps:</strong> Systems providing inaccurate, incomplete, or
              irrelevant information for decision-making reduce task-technology fit.
            </li>
            <li>
              <strong>Automation mismatch:</strong> Systems automating wrong tasks or automating
              tasks users prefer to control create negative fit perceptions.
            </li>
            <li>
              <strong>Interface incompatibility:</strong> User interface designs poorly matched to
              how users think about tasks create ease-of-use barriers within fit context.
            </li>
            <li>
              <strong>Performance inadequacy:</strong> Systems too slow or unreliable for
              time-sensitive tasks fail to provide adequate fit for performance requirements.
            </li>
            <li>
              <strong>Insufficient flexibility:</strong> Rigid systems unable to accommodate task
              variation reduce fit for dynamic or non-standard workflows.
            </li>
            <li>
              <strong>Integration failures:</strong> Systems not integrated with other tools users
              rely on create workflow disruption reducing overall fit.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Conduct thorough task analysis:</strong> Before system selection, analyze
              information requirements, decision processes, and workflow patterns of target user
              tasks.
            </li>
            <li>
              <strong>Match system capabilities to tasks:</strong> Select and configure systems
              whose functionality closely aligns with identified task characteristics and
              requirements.
            </li>
            <li>
              <strong>Measure task-technology fit:</strong> Use comprehensive fit assessment
              (similar to 12-factor TTF) to evaluate systems before and after implementation.
            </li>
            <li>
              <strong>Optimize data quality:</strong> Ensure systems provide accurate, complete,
              timely information needed for task execution.
            </li>
            <li>
              <strong>Design for relevant functionality:</strong> Configure systems to emphasize
              features matching task requirements; hide or minimize peripheral features.
            </li>
            <li>
              <strong>Customize and integrate:</strong> Modify systems through customization and
              integration with existing tools to improve fit to actual workflows.
            </li>
            <li>
              <strong>Measure performance impact:</strong> Track whether implementations improve
              actual task performance; if fit-driven improvements do not materialize, reassess
              system choice.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Goodhue and Thompson fit concept influenced subsequent IT evaluation and
            implementation research:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Fit-Viability Model extensions:</strong> Later research expanded fit to
              include organizational, strategic, and user capability fit dimensions.
            </li>
            <li>
              <strong>Person-Organization Fit frameworks:</strong> Applied similar matching logic to
              hiring and team composition decisions.
            </li>
            <li>
              <strong>Design Science research:</strong> Used fit concepts to evaluate whether
              designed systems matched problem contexts and user needs.
            </li>
            <li>
              <strong>Implementation science:</strong> Applied fit logic to understand how
              organizational and intervention characteristics affect implementation success.
            </li>
            <li>
              <strong>Digital transformation models:</strong> Emphasized fit between business
              processes, organizational capabilities, and technology architecture choices.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-goodhue-1995">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
              performance. <em>MIS Quarterly</em>, 19(2), 213-236. https://doi.org/10.2307/249689
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

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-thompson-1991">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal computing:
              Toward a conceptual model of utilization. <em>MIS Quarterly</em>, 15(1), 125-143.
            </li>
            <li id="ref-lawrence-1967">
              Lawrence, P. R., &amp; Lorsch, J. W. (1967). Organization and environment: Managing
              differentiation and integration. Harvard Business School Press.
            </li>
            <li id="ref-vroom-1964">
              Vroom, V. H. (1964). Work and motivation. John Wiley &amp; Sons.
            </li>
            <li id="ref-taylor-1995">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding information technology usage: A
              test of competing models. <em>Information Systems Research</em>, 6(2), 144-176.
              https://doi.org/10.1287/isre.6.2.144
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478. https://doi.org/10.2307/30036540
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-10-decomposed-tpb-taylor-todd-1995"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Decomposed Theory of Planned Behavior (Taylor &amp; Todd)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-12-technology-readiness-index-tri-parasuraman-2000"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Technology Readiness Index (Parasuraman) &rarr;
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
