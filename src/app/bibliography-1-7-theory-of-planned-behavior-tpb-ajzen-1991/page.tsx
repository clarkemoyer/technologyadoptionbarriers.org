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
  title: 'Bibliography: Theory of Planned Behavior (TPB) - Ajzen (1991)',
  description:
    'Deep dive into the Theory of Planned Behavior by Icek Ajzen (1991), exploring attitudes, norms, and perceived control as determinants of intentional behavior.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Theory of Planned Behavior (TPB) - Ajzen (1991)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Theory of Planned Behavior
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TPB
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Intentional Behavior Across Diverse
              Domains
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Social Psychology, Behavioral Science
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Icek Ajzen
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1991
            </p>
            <p>
              <strong>Official Title:</strong> The Theory of Planned Behavior
            </p>
            <p>
              <strong>Journal:</strong> Organizational Behavior and Human Decision Processes
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 50, No. 2
            </p>
            <p>
              <strong>Pages:</strong> 179-211
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
                Ajzen, I. (
                <a href="#ref-ajzen-1991" className="text-tabs-teal-deep hover:underline">
                  1991
                </a>
                ). The theory of planned behavior.{' '}
                <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Ajzen, Icek. 1991. &ldquo;The Theory of Planned Behavior.&rdquo;
                <em>Organizational Behavior and Human Decision Processes</em> 50, no. 2: 179-211.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Icek Ajzen developed the Theory of Planned Behavior to address critical limitations in
            the Theory of Reasoned Action and provide a more comprehensive framework for
            understanding behavior across diverse domains. The fundamental motivation stemmed from
            recognizing that TRA, while successful in predicting behavior under conditions of
            volitional control, failed adequately when individuals lacked complete control over
            behavior performance.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            While TRA successfully predicted voting, family planning, and consumer choice, it
            operated under an assumption that behavior results solely from conscious intentions
            determined by attitudes and subjective norms. This assumption proved problematic in
            real-world contexts where individuals often cannot fully control behavior performance
            due to resource constraints, skills limitations, environmental obstacles, or structural
            barriers. Many significant behaviors, including technology adoption, involve elements
            beyond complete volitional control.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Ajzen explicitly constructed TPB to overcome this limitation by adding perceived
            behavioral control - the extent to which individuals believe they can successfully
            perform behavior even when facing obstacles. By incorporating control perceptions, the
            TPB creates applicability to behaviors where volitional control varies. Beyond
            technology adoption, the framework aims to explain intentional behavior across health,
            education, environment, relationships, and organizational contexts with consistent
            theoretical structure while allowing domain-specific applications.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            TPB operationalizes three primary determinants of behavioral intention:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitudes Toward Behavior:</strong> Overall favorable or unfavorable
              evaluations of performing a specific behavior. Reflect underlying beliefs about
              behavior consequences weighted by desirability of those consequences.
            </li>
            <li>
              <strong>Subjective Norms:</strong> Perceived social pressure to perform or not perform
              behavior. Capture perceptions of what important others think the individual should do,
              weighted by motivation to comply with each referent.
            </li>
            <li>
              <strong>Perceived Behavioral Control:</strong> Beliefs about one&rsquo;s ability to
              successfully perform behavior given existing constraints and resources. Reflect both
              internal factors (skills, self-efficacy) and external factors (environmental
              opportunities, dependencies on others).
            </li>
            <li>
              <strong>Behavioral Intention:</strong> Readiness or plan to perform behavior.
              Represents the immediate antecedent to actual behavior performance.
            </li>
            <li>
              <strong>Behavior:</strong> The observable action performed, whether individuals
              actually perform intended behaviors.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            TPB built logically upon several prior theoretical traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Theory of Reasoned Action (Fishbein &amp;{' '}
                <Link
                  href="/bibliography-1-1-theory-of-reasoned-action-tra-fishbein-ajzen-1975"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Ajzen, 1975
                </Link>
                ):
              </strong>{' '}
              Provided the foundational structure where intentions mediate the attitude-behavior
              relationship.
            </li>
            <li>
              <strong>
                Self-efficacy theory (
                <a
                  id="cite-ref-bandura-1977-1"
                  href="#ref-bandura-1977"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bandura, 1977
                </a>
                ):
              </strong>{' '}
              Established the importance of beliefs about personal capability to perform actions.
            </li>
            <li>
              <strong>Locus of control research:</strong> Documented how individuals&rsquo; beliefs
              about control over outcomes influence behavior.
            </li>
            <li>
              <strong>Expectancy-value theories:</strong> Grounded the concept that attitudes form
              from expected consequences weighted by their evaluations.
            </li>
            <li>
              <strong>Behavioral decision theory:</strong> Provided foundations for understanding
              how people make deliberate behavior choices.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Theory of Planned Behavior specifies that attitudes, subjective norms, and perceived
            behavioral control determine behavioral intention, which in turn predicts actual
            behavior. Perceived behavioral control additionally exerts direct effects on behavior
            when control accurately reflects actual constraints. This hierarchical structure is:
          </p>
          <p className={`${PARAGRAPH_CLASSES} font-mono text-sm bg-gray-50 p-3 rounded`}>
            Attitudes &amp; Subjective Norms &amp; Perceived Control &rarr; Behavioral Intention
            &rarr; Behavior
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitudes toward behavior:</strong> Evaluative scales capturing
              favorable/unfavorable judgments of performing specific behaviors.
            </li>
            <li>
              <strong>Subjective norms:</strong> Perceived social pressure and normative
              expectations from important referent others.
            </li>
            <li>
              <strong>Perceived behavioral control:</strong> Beliefs about factors facilitating or
              impeding behavior performance and power of each factor.
            </li>
            <li>
              <strong>Behavioral intention:</strong> Readiness and plans to perform behavior
              measured through likelihood and expectancy items.
            </li>
            <li>
              <strong>Actual behavior:</strong> Whether individuals actually perform intended
              behaviors, measured through self-report or behavioral observation.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Theoretical comprehensiveness:</strong> Incorporates personal evaluation,
              social influence, and self-efficacy into single coherent framework.
            </li>
            <li>
              <strong>Clear causal structure:</strong> Articulates explicitly specified
              relationships enabling precise hypothesis testing and systematic investigation.
            </li>
            <li>
              <strong>Measured flexibility:</strong> Can be applied to any specific behavior by
              conducting formative research identifying relevant beliefs and control factors.
            </li>
            <li>
              <strong>Cross-domain validation:</strong> Demonstrates predictive validity across
              health, education, environment, workplace, and consumer domains.
            </li>
            <li>
              <strong>Distinction of indirect and direct effects:</strong> Specifies that perceived
              control affects behavior both through intentions and directly, reflecting control
              factor complexity.
            </li>
            <li>
              <strong>Practical intervention guidance:</strong> Explicitly specifies attitudes,
              norms, and control as change targets, directing practitioners toward psychosocial
              factors requiring modification.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Measurement circularity concerns:</strong> Perceived and actual behavioral
              control may coincide or diverge due to biased perceptions, creating ambiguity about
              what perceived control predicts.
            </li>
            <li>
              <strong>Limited attention to structural barriers:</strong> Treats barriers primarily
              through individual perceptions; real structural barriers preventing adoption receive
              less theoretical attention.
            </li>
            <li>
              <strong>Temporal dynamics underspecified:</strong> Provides limited specification of
              how intentions change over time or how to maintain intentions across extended
              implementation periods.
            </li>
            <li>
              <strong>Past behavior undertheorized:</strong> Focuses on rational deliberation
              processes but provides limited mechanism for habit formation and automaticity in
              repeated behavior.
            </li>
            <li>
              <strong>Affective factors underemphasized:</strong> Attitude construct focuses on
              instrumental evaluations rather than emotional or affective responses to behavior.
            </li>
            <li>
              <strong>Domain-specific inconsistency:</strong> Relative importance of attitudes,
              norms, and control varies substantially across domains, limiting ability to predict
              which factors dominate without empirical investigation.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Control factor integration:</strong> Incorporated perceived behavioral control
              as explicit construct affecting both intentions and behavior directly.
            </li>
            <li>
              <strong>Theoretical extension accomplishment:</strong> Expanded Theory of Reasoned
              Action applicability to behaviors beyond volitional control.
            </li>
            <li>
              <strong>Multi-factor integration framework:</strong> Provided model integrating
              attitudes, norms, and self-efficacy into unified behavioral prediction framework.
            </li>
            <li>
              <strong>Belief system emphasis:</strong> Moved beyond monolithic constructs toward
              understanding them as built from specific belief systems.
            </li>
            <li>
              <strong>General behavior prediction template:</strong> Established general framework
              applicable across health, education, environment, workplace, and consumer domains.
            </li>
            <li>
              <strong>Practical intervention specification:</strong> Explicitly specified
              psychological factors requiring modification to influence behavior, enabling targeted
              intervention design.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Ajzen established TPB&rsquo;s internal validity through multiple strategies:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Theoretical coherence:</strong> Articulates clear causal structure with
              explicitly specified relationships between constructs.
            </li>
            <li>
              <strong>Construct operationalization:</strong> Provides explicit measurement guidance
              for attitudes, norms, and control through multi-item scales with clear theoretical
              basis.
            </li>
            <li>
              <strong>Empirical grounding:</strong> Builds on extensive self-efficacy, locus of
              control, and behavioral research, importing validity support from established
              literature.
            </li>
            <li>
              <strong>Logical extension of established theory:</strong> Maintains TRA core structure
              while adding perceived behavioral control, demonstrating that TPB incorporates TRA as
              special case.
            </li>
            <li>
              <strong>Specification precision:</strong> Precisely specifies which constructs exert
              indirect effects through intentions and which exert direct effects on behavior.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Theory of Planned Behavior established substantial external validity through diverse
            applications:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Cross-domain applicability:</strong> Demonstrated applicability across health,
              occupational, educational, environmental, and consumer behaviors.
            </li>
            <li>
              <strong>Population diversity:</strong> Found consistent relationships across
              demographic groups, educational levels, and cultural contexts.
            </li>
            <li>
              <strong>Behavioral complexity variation:</strong> Applied to simple discrete behaviors
              through complex sustained behaviors requiring multiple action sequences.
            </li>
            <li>
              <strong>Time frame generalization:</strong> Maintained predictive validity across
              immediate behavior through months and years of follow-up.
            </li>
            <li>
              <strong>Laboratory and field study convergence:</strong> Found consistent
              relationships in both controlled settings and real-world behavioral contexts.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            TPB is directly relevant to technology adoption because it explains how attitudes,
            social influences, and perceived capability determine whether individuals intend to
            adopt technologies. Unlike simpler models, TPB acknowledges that individuals may intend
            to adopt but face actual barriers preventing adoption.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified by TPB</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Unfavorable attitudes:</strong> Negative evaluations of adoption consequences
              including job security threats, autonomy loss, or insufficient benefits relative to
              effort.
            </li>
            <li>
              <strong>Negative subjective norms:</strong> Lack of adoption pressure or active
              resistance from supervisors, peers, or organizational leaders.
            </li>
            <li>
              <strong>Low perceived behavioral control:</strong> Beliefs that learning technology
              requires skills one lacks, that insufficient resources exist, or that organizational
              impediments prevent adoption.
            </li>
            <li>
              <strong>Technology anxiety and confidence deficits:</strong> Fears of technology
              malfunction, data loss, or personal inadequacy reducing perceived control despite
              capability.
            </li>
            <li>
              <strong>Interaction barriers:</strong> Strong negative attitudes combined with
              normative pressure against adoption, or control barriers occurring alongside negative
              attitudes.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions TPB Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitude change targeting specific beliefs:</strong> Conduct formative
              research identifying beliefs creating negative attitudes, then design targeted
              interventions addressing specific concerns.
            </li>
            <li>
              <strong>Normative influence interventions:</strong> Secure explicit advocacy from
              organizational influencers, involve respected peers in implementation planning,
              address cultural conflicts explicitly.
            </li>
            <li>
              <strong>Perceived control enhancement:</strong> Provide comprehensive training
              ensuring capability development, create support systems, remove actual environmental
              obstacles.
            </li>
            <li>
              <strong>Multi-factor intervention design:</strong> Address all three barrier types
              simultaneously rather than focusing on single-factor solutions.
            </li>
            <li>
              <strong>Monitoring and adaptive management:</strong> Measure attitudes, norms, and
              control periodically to assess whether interventions effectively address barriers and
              enable course correction.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            TPB provided the structural foundation for numerous extensions and integrated models:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Technology Acceptance Model extensions:</strong> Applied TPB structures to
              technology-specific adoption contexts.
            </li>
            <li>
              <strong>Unified Theory of Acceptance and Use of Technology (UTAUT):</strong>{' '}
              Integrated TPB with other adoption models into comprehensive framework.
            </li>
            <li>
              <strong>Task-Technology Fit models:</strong> Built on TPB by incorporating how
              technology characteristics align with job requirements.
            </li>
            <li>
              <strong>Protection Motivation Theory applications:</strong> Extended TPB structures to
              threat-and-coping contexts.
            </li>
            <li>
              <strong>Health behavior adoption models:</strong> Applied TPB to diverse health
              behaviors and organizational health promotion.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-ajzen-1991">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              https://doi.org/10.1016/0749-5978(91)90020-T
            </li>
            <li id="ref-bandura-1977">
              Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change.
              <em>Psychological Review</em>, 84(2), 191-215.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-bandura-1977-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
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
            <li id="ref-ajzen-1980">
              Ajzen, I., &amp; Fishbein, M. (1980). Understanding attitudes and predicting social
              behavior. Prentice-Hall.
            </li>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-triandis-1977">
              Triandis, H. C. (1977). Interpersonal behavior. Brooks/Cole.
            </li>
            <li id="ref-armitage-2001">
              Armitage, C. J., &amp; Conner, M. (2001). Efficacy of the theory of planned behaviour:
              A meta-analytic review. <em>British Journal of Social Psychology</em>, 40(4), 471-499.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-6-technology-acceptance-model-tam-davis-1989"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Technology Acceptance Model (Davis)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-8-personal-computing-acceptance-thompson-1991"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Personal Computing Acceptance (Thompson et al.) &rarr;
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
