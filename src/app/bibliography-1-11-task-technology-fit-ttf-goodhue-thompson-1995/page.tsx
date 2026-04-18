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
            Building on contingency theory and job fit literature, the authors conducted empirical
            research with 662 end-users across 26 departments in two companies, developing an
            8-factor TTF measurement instrument. The research demonstrated that task-technology fit
            independently predicts performance above user attitudes or technology acceptance
            variables, highlighting fit as distinct from adoption. TTF provided managers with
            actionable framework for technology selection, implementation, and evaluation grounded
            in task and capability matching.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Task-Technology Fit model operationalizes several related constructs and dimensions:
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
              <strong>8-Factor TTF Instrument (Table 1):</strong> Quality (data currency,
              correctness, detail level), Locatability, Authorization, Compatibility, Ease of
              Use/Training, Production Timeliness, Systems Reliability, and Relationship with Users
              (IS understanding, dedication, responsiveness, planning assistance).
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
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

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Goodhue and Thompson (1995) name their integrated framework the Technology-to-
            Performance Chain (TPC), with task-technology fit (TTF) as a core construct within it.
            The TPC proposes that task requirements and technology characteristics jointly determine
            task-technology fit, which influences both utilization of system functionality and the
            performance impact of that utilization. The authors formulated three testable
            propositions: (P1) task and technology characteristics predict TTF; (P2) TTF influences
            utilization; and (P3) TTF adds explanatory power in predicting perceived performance
            beyond utilization alone. High acceptance or ease of use without fit produces system use
            unconnected to performance; high fit combined with extensive utilization produces
            performance improvements.
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
              <strong>Fit assessment:</strong> Eight factors capturing quality, locatability,
              authorization, compatibility, ease of use/training, production timeliness, systems
              reliability, and relationship with users.
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
              <strong>Comprehensive fit measurement:</strong> Eight-factor instrument captures fit
              across multiple dimensions beyond simple usefulness or ease-of-use judgments.
            </li>
            <li>
              <strong>Contingency approach:</strong> Acknowledges that fit depends on specific task
              characteristics and system capabilities, rejecting one-size-fits-all technology
              claims.
            </li>
            <li>
              <strong>Large-scale empirical validation:</strong> Tested with 662 users employing 25
              different information technologies across 26 non-IS departments in 2 companies,
              demonstrating robust findings across diverse contexts.
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
              <strong>Complex measurement requirement:</strong> Eight-factor TTF instrument is
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

        {/* 8. Key Contributions */}
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
              <strong>Multidimensional fit measurement:</strong> Developed comprehensive 8-factor
              instrument capturing fit across data quality, functionality, ease of use, and other
              dimensions.
            </li>
            <li>
              <strong>Utilization as mediator:</strong> Demonstrated that fit drives performance
              through increased utilization of relevant system capabilities.
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

        {/* 9. Internal Validity */}
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
              <strong>Exploratory factor analysis:</strong> Used principal components factor
              analysis with promax rotation. From 48 questions measuring 21 original TTF dimensions,
              14 questions and 5 dimensions were dropped; the remaining 34 questions (covering 16 of
              the 21 original dimensions) collapsed into 8 final TTF factors (Table 1).
            </li>
            <li>
              <strong>Reliability testing:</strong> Reported Cronbach&rsquo;s alpha coefficients for
              the 8 TTF factors ranging from .60 to .88 (Table 1).
            </li>
            <li>
              <strong>Discriminant validity:</strong> Confirmed that fit, utilization, and
              performance constructs are empirically distinct through correlation analysis.
            </li>
            <li>
              <strong>Multiple regression analysis:</strong> Tested Proposition 1 with eight
              regressions predicting each TTF factor from task and technology characteristics;
              adjusted R-squared values ranged from .04 to .25 across the 8 regressions (Table 3).
            </li>
            <li>
              <strong>Multiple departments:</strong> Collected data across 26 non-IS departments in
              two companies (400 respondents from Company A, a transportation enterprise; 262 from
              Company B, an insurance company; total n = 662) enabling consistency checks across
              contexts.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity claims rest on substantial but bounded empirical foundations:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multi-department validation:</strong> 26 non-IS departments across 2 companies
              (transportation and insurance) provides diverse context demonstrating generalization
              across units.
            </li>
            <li>
              <strong>System diversity:</strong> 25 different major information systems (13 in
              Company A and 12 in Company B, each used by a minimum of 5 employees) span transaction
              processing and decision support contexts suggesting fit applies across system types.
            </li>
            <li>
              <strong>Large sample size:</strong> 662 end-users provides substantial statistical
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

        {/* 11. Relevance to Technology Adoption */}
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
              (similar to 8-factor TTF) to evaluate systems before and after implementation.
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

        {/* 12. Following Models or Theories */}
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

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-goodhue-1995">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
              performance. <em>MIS Quarterly</em>, 19(2), 213-236.{' '}
              <a
                href="https://doi.org/10.2307/249689"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249689
              </a>
            </li>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-davis-1989-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1 for Davis (1989)"
                >
                  ↩
                </a>
              </span>{' '}
              <a
                href="https://doi.org/10.2307/249008"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249008
              </a>
            </li>
            <li id="ref-rogers-1983">
              Rogers, E. M. (1983). Diffusion of innovations (3rd ed.). Free Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rogers-1983-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1 for Rogers (1983)"
                >
                  ↩
                </a>
              </span>
            </li>
          </ol>
        </section>

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
              test of competing models. <em>Information Systems Research</em>, 6(2), 144-176.{' '}
              <a
                href="https://doi.org/10.1287/isre.6.2.144"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1287/isre.6.2.144
              </a>
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.{' '}
              <a
                href="https://doi.org/10.2307/30036540"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/30036540
              </a>
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
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
