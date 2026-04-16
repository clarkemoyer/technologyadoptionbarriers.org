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
  title: 'Bibliography: Intrinsic & Extrinsic Motivation - Davis et al. (1992)',
  description:
    'Deep dive into intrinsic and extrinsic motivation in technology adoption, examining how enjoyment and perceived usefulness jointly predict computer usage intentions.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Intrinsic &amp; Extrinsic Motivation - Davis et al. (1992)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Extrinsic and Intrinsic Motivation Extension to the
              Technology Acceptance Model
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TAM with Motivation Dynamics
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Motivation and System Usage Intentions
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Motivation Psychology,
              Behavioral Research
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Fred D. Davis, Richard P. Bagozzi, Paul R. Warshaw
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1992
            </p>
            <p>
              <strong>Official Title:</strong> Extrinsic and Intrinsic Motivation to Use Computers
              in the Workplace
            </p>
            <p>
              <strong>Journal:</strong> Journal of Applied Social Psychology
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 22, No. 14
            </p>
            <p>
              <strong>Pages:</strong> 1111-1132
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1111/j.1559-1816.1992.tb00945.x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.1111/j.1559-1816.1992.tb00945.x
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
                Davis, F. D., Bagozzi, R. P., &amp; Warshaw, P. R. (
                <a href="#ref-davis-1992" className="text-tabs-teal-deep hover:underline">
                  1992
                </a>
                ). Extrinsic and intrinsic motivation to use computers in the workplace.{' '}
                <em>Journal of Applied Social Psychology</em>, 22(14), 1111-1132.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Davis, Fred D., Richard P. Bagozzi, and Paul R. Warshaw. 1992. &ldquo;Extrinsic and
                Intrinsic Motivation to Use Computers in the Workplace.&rdquo;{' '}
                <em>Journal of Applied Social Psychology</em> 22, no. 14: 1111-1132.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Davis, Bagozzi, and Warshaw extended the Technology Acceptance Model (TAM) to
            incorporate motivational psychology, addressing a theoretical gap in understanding what
            actually drives continued technology use. While earlier TAM research focused primarily
            on perceived usefulness and perceived ease of use, this extension recognized that user
            motivation operates on two distinct psychological dimensions: extrinsic motivation
            (using technology as a means to achieve desired outcomes) and intrinsic motivation
            (using technology because the activity itself is enjoyable).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors recognized that accepting a technology and actually using it are distinct
            outcomes driven by different motivational structures. Particularly, they theorized that
            perceived enjoyment - an intrinsic motivation factor - had been underemphasized in prior
            acceptance research despite its importance in sustained usage patterns. Organizations
            deploying expensive systems needed frameworks predicting not just initial adoption but
            ongoing utilization and enthusiastic engagement.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Building on motivational theories from psychology, the authors conducted empirical
            research with 200 MBA students using two software applications to test whether intrinsic
            motivation independently predicts usage intentions above and beyond extrinsic motivation
            variables. Their findings demonstrated that enjoyment significantly predicts computer
            usage intentions, opening new theoretical directions for understanding technology
            adoption as a function of both practical utility and experiential pleasure.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The intrinsic-extrinsic motivation extension operationalizes five primary constructs:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Perceived Usefulness (Extrinsic):</strong> The degree to which users believe a
              system enhances job performance and productivity. This extrinsic motivation reflects
              instrumental value - using technology to accomplish work tasks effectively.
            </li>
            <li>
              <strong>Perceived Ease of Use:</strong> The degree to which users perceive the system
              is easy to learn and operate. In this model, PEOU operates as an antecedent whose
              effects on intentions are fully mediated by usefulness and enjoyment.
            </li>
            <li>
              <strong>Perceived Enjoyment (Intrinsic):</strong> The extent to which users find the
              activity of using the system to be inherently fun or pleasurable independent of
              performance consequences. This intrinsic motivation reflects experience quality and
              hedonic aspects.
            </li>
            <li>
              <strong>Attitude Toward Using the System:</strong> Overall favorable or unfavorable
              evaluations of using the technology, predicted by usefulness, ease of use, and
              enjoyment beliefs.
            </li>
            <li>
              <strong>Behavioral Intention to Use:</strong> User likelihood of continuing to use the
              system, predicted by attitudes and perceived usefulness through both
              intention-normative and intention-affective pathways.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Davis et al. extension built systematically upon multiple foundational frameworks:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Original Technology Acceptance Model (
                <a
                  id="cite-ref-davis-1989-1"
                  href="#ref-davis-1989"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Davis, 1989
                </a>
                ):
              </strong>{' '}
              Established that perceived usefulness and perceived ease of use predict attitudes and
              intentions to use information systems.
            </li>
            <li>
              <strong>Intrinsic motivation theory (Deci &amp; Ryan):</strong> Provided psychological
              foundations showing that intrinsic motivation is a distinct motivational force from
              extrinsic reward structures.
            </li>
            <li>
              <strong>Hedonic motivation research:</strong> Grounded the concept that pleasurable
              experiences independently drive behavior separate from utilitarian outcomes.
            </li>
            <li>
              <strong>Theory of reasoned action (Fishbein &amp; Ajzen):</strong> Provided the
              attitudinal framework showing beliefs predict attitudes which predict behavioral
              intentions.
            </li>
            <li>
              <strong>Self-determination theory (Deci &amp; Ryan):</strong> Offered psychological
              theorizing that humans have basic needs for autonomy, competence, and relatedness
              driving behavior.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The model proposes that usage intentions are determined by two distinct psychological
            pathways operating simultaneously. The extrinsic pathway operates through perceived
            usefulness, perceived ease of use, and attitudes - representing rational evaluation of
            instrumental benefits. The intrinsic pathway operates through perceived enjoyment
            influencing attitude and behavioral intentions - representing emotional and experiential
            motivations. Both pathways have significant effects, with perceived enjoyment showing
            direct effects on intentions even controlling for attitudes.
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Extrinsic motivation beliefs:</strong> Perceived usefulness and ease of use
              capturing rational, instrumental motivations for technology adoption.
            </li>
            <li>
              <strong>Intrinsic motivation beliefs:</strong> Perceived enjoyment capturing
              emotional, hedonic, and experiential quality of technology interaction.
            </li>
            <li>
              <strong>Affective responses:</strong> Attitudes toward the system reflecting combined
              influence of usefulness, ease of use, and enjoyment beliefs.
            </li>
            <li>
              <strong>Behavioral intentions:</strong> Direct intentions to use the system predicted
              by both rational and emotional motivations.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Theoretical integration:</strong> Synthesizes information systems acceptance
              frameworks with psychological motivation theory, bridging two literatures.
            </li>
            <li>
              <strong>Motivation duality recognition:</strong> Acknowledges that technology adoption
              is driven by both practical utility and experiential pleasure, not utility alone.
            </li>
            <li>
              <strong>Empirical support for enjoyment:</strong> Provides robust evidence that
              perceived enjoyment independently predicts intentions controlling for usefulness and
              ease.
            </li>
            <li>
              <strong>Dual-pathway structure:</strong> Shows that both extrinsic and intrinsic
              motivation matter, with neither completely mediating the other.
            </li>
            <li>
              <strong>Clean methodological design:</strong> Tested model with two software
              applications (an information system and a word processor) demonstrating
              generalizability across system types.
            </li>
            <li>
              <strong>Student and professional validation:</strong> Used MBA student sample
              representing business professionals with relevant work experience.
            </li>
            <li>
              <strong>Mediation pathway analysis:</strong> Examined both direct and indirect effects
              showing complex motivational structures.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Limited sample diversity:</strong> 200 MBA students from single university may
              not represent diverse professions, industries, and organizational contexts.
            </li>
            <li>
              <strong>Narrow application contexts:</strong> Two software systems (both
              business-focused) limit generalization to other technology categories like
              entertainment or social systems.
            </li>
            <li>
              <strong>Measurement limitation:</strong> Enjoyment may be system-specific;
              entertainment software might show stronger enjoyment effects than complex business
              systems.
            </li>
            <li>
              <strong>Short-term focus:</strong> Cross-sectional design captures intentions rather
              than actual sustained usage over time or adoption trajectories.
            </li>
            <li>
              <strong>Self-report bias:</strong> All measures relied on self-reported beliefs and
              intentions rather than objective system usage logs or behavior tracking.
            </li>
            <li>
              <strong>Unexplored moderators:</strong> Did not examine whether intrinsic-extrinsic
              balance differs across user experience levels, task types, or organizational contexts.
            </li>
            <li>
              <strong>Construct overlap concerns:</strong> Perceived ease of use and perceived
              enjoyment may share variance not fully separated in measurement.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Hedonic motivation integration:</strong> Demonstrated that technology adoption
              requires understanding both utility (extrinsic) and pleasure (intrinsic) motivations.
            </li>
            <li>
              <strong>Enjoyment as adoption driver:</strong> Provided empirical evidence that
              perceived enjoyment directly predicts usage intentions independent of usefulness.
            </li>
            <li>
              <strong>Expanded TAM theoretical reach:</strong> Extended the Technology Acceptance
              Model beyond rational decision-making to include emotional and affective dimensions.
            </li>
            <li>
              <strong>Motivation psychology bridge:</strong> Connected established motivational
              psychology literature (intrinsic-extrinsic distinction) to information systems
              acceptance.
            </li>
            <li>
              <strong>Dual-pathway conceptualization:</strong> Articulated how rational and
              emotional motivations operate as distinct but related paths to usage intentions.
            </li>
            <li>
              <strong>Practical implications:</strong> Provided guidance that system designers
              should consider both utility and enjoyment in creating systems users will embrace.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The researchers employed rigorous measurement and analysis procedures:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multi-item scales:</strong> Operationalized each construct using multiple
              survey items rather than single indicators, allowing measurement error assessment.
            </li>
            <li>
              <strong>Reliability testing:</strong> Reported Cronbach&rsquo;s alpha coefficients for
              all scales, with most exceeding .80 threshold, demonstrating internal consistency.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Provided correlation matrices and confidence
              intervals showing constructs are distinct (e.g., enjoyment separate from usefulness).
            </li>
            <li>
              <strong>Path analysis with SEM:</strong> Used structural equation modeling allowing
              simultaneous testing of measurement and structural models.
            </li>
            <li>
              <strong>Cross-system replication:</strong> Tested model with two different software
              applications, showing consistent effects across contexts.
            </li>
            <li>
              <strong>Significance testing:</strong> Reported standardized path coefficients,
              standard errors, and t-statistics for hypothesis testing.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity claims and limitations require careful consideration:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Student sample limitation:</strong> MBA students may be more
              computer-proficient and motivated than average workforce, potentially amplifying
              enjoyment effects.
            </li>
            <li>
              <strong>Business software focus:</strong> Two productivity applications may not
              generalize to entertainment systems, social media, or specialized professional
              software.
            </li>
            <li>
              <strong>Laboratory-like contexts:</strong> University computing lab settings lack
              organizational pressures, mandatory usage requirements, and real job integration.
            </li>
            <li>
              <strong>Cross-system consistency:</strong> Replication across two applications
              provides modest generalization evidence, though both remained business-focused
              systems.
            </li>
            <li>
              <strong>Theoretical generalizability:</strong> The intrinsic-extrinsic distinction is
              grounded in well-established motivation psychology, suggesting broader applicability.
            </li>
            <li>
              <strong>Temporal generalizability:</strong> Cross-sectional design at single time
              point limits understanding of whether enjoyment effects persist over extended usage
              periods.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The intrinsic-extrinsic motivation framework is directly relevant to technology adoption
            because it identifies distinct barriers rooted in different motivational deficits.
            Organizations implementing systems that satisfy either extrinsic (practical utility) or
            intrinsic (enjoyable experience) motivations show improved adoption outcomes.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Low perceived usefulness:</strong> Users viewing systems as not improving job
              performance or productivity show reduced usage intentions regardless of enjoyment.
            </li>
            <li>
              <strong>High perceived complexity:</strong> Systems perceived as difficult to learn
              and operate create ease-of-use barriers reducing both attitudes and intentions.
            </li>
            <li>
              <strong>Lack of perceived enjoyment:</strong> Systems designed as purely functional
              without any pleasurable interaction experience create adoption friction.
            </li>
            <li>
              <strong>Negative user experience:</strong> Cumbersome interfaces, frustrating error
              handling, and unintuitive workflows undermine intrinsic motivation.
            </li>
            <li>
              <strong>Disconnection from job tasks:</strong> When users perceive systems as
              tangential rather than central to their actual work, usefulness perceptions decline.
            </li>
            <li>
              <strong>Absence of playfulness:</strong> Highly utilitarian systems without any
              engaging, pleasant, or gamified elements lose the intrinsic motivation component.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Establish clear use case fit:</strong> Communicate explicitly how systems
              improve job performance, save time, or enhance effectiveness to build usefulness
              perceptions.
            </li>
            <li>
              <strong>Optimize user experience design:</strong> Ensure systems are intuitive,
              responsive, and pleasant to interact with, reducing complexity barriers.
            </li>
            <li>
              <strong>Incorporate engaging elements:</strong> Add gamification, visual appeal, or
              pleasurable interaction patterns that build intrinsic motivation.
            </li>
            <li>
              <strong>Provide comprehensive training:</strong> Reduce perceived ease-of-use barriers
              through hands-on practice, clear documentation, and accessible support.
            </li>
            <li>
              <strong>Demonstrate tangible benefits:</strong> Show real examples of productivity
              gains, time savings, or improved outcomes to strengthen usefulness beliefs.
            </li>
            <li>
              <strong>Create positive first experiences:</strong> Ensure initial interactions are
              smooth and successful, building positive attitudes and enjoyment perceptions.
            </li>
            <li>
              <strong>Balance utility and experience:</strong> Recognize that systems need both
              practical value (extrinsic) and pleasant experiences (intrinsic) for strong adoption.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Davis et al. motivation extension directly shaped subsequent technology adoption
            research:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Task-Technology Fit extensions (Goodhue &amp;{' '}
                <Link
                  href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Thompson, 1995
                </Link>
                ):
              </strong>{' '}
              Incorporated hedonic fit alongside utilitarian task-technology fit recognition.
            </li>
            <li>
              <strong>TAM 2 and TAM 3 models (Venkatesh &amp; Bala):</strong> Expanded perceived
              usefulness antecedents to include social influence and cognitive experience factors.
            </li>
            <li>
              <strong>Unified Theory of Acceptance and Use of Technology (UTAUT):</strong> Included
              both utilitarian (performance expectancy) and hedonic (hedonic motivation) dimensions.
            </li>
            <li>
              <strong>Flow theory in technology (Csikszentmihalyi-based research):</strong> Extended
              intrinsic motivation investigations to examine optimal experience in system use.
            </li>
            <li>
              <strong>Gamification in technology adoption:</strong> Applied intrinsic motivation
              principles to design game-like elements improving engagement and adoption.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              <span className="ml-1 text-xs">
                <a
                  href="#cite-ref-davis-1989-1"
                  className="inline-block text-tabs-teal-deep hover:underline focus-visible:underline"
                  aria-label="Back to citation 1"
                >
                  ↩︎
                </a>
              </span>{' '}
              <a
                href="https://doi.org/10.2307/249008"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.2307/249008
              </a>
            </li>
            <li id="ref-davis-1992">
              Davis, F. D., Bagozzi, R. P., &amp; Warshaw, P. R. (1992). Extrinsic and intrinsic
              motivation to use computers in the workplace.{' '}
              <em>Journal of Applied Social Psychology</em>, 22(14), 1111-1132.{' '}
              <a
                href="https://doi.org/10.1111/j.1559-1816.1992.tb00945.x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
              </a>
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-deci-1985">
              Deci, E. L., &amp; Ryan, R. M. (1985). Intrinsic motivation and self-determination in
              human behavior. Plenum Press.
            </li>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-csikszentmihalyi-1990">
              Csikszentmihalyi, M. (1990). Flow: The psychology of optimal experience. Harper &amp;
              Row.
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.{' '}
              <a
                href="https://doi.org/10.2307/30036540"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.2307/30036540
              </a>
            </li>
            <li id="ref-goodhue-1995">
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
              performance. <em>MIS Quarterly</em>, 19(2), 213-236.{' '}
              <a
                href="https://doi.org/10.2307/249689"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.2307/249689
              </a>
            </li>
            <li id="ref-ryan-2000">
              Ryan, R. M., &amp; Deci, E. L. (2000). Intrinsic and extrinsic motivations: Classic
              definitions and new directions. <em>Contemporary Educational Psychology</em>, 25(1),
              54-67.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-8-personal-computing-acceptance-thompson-1991"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Personal Computing Utilization (Thompson et al.)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-10-decomposed-tpb-taylor-todd-1995"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Decomposed Theory of Planned Behavior (Taylor &amp; Todd) &rarr;
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
