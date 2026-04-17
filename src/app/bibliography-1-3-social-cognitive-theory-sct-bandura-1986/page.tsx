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
  title: 'Bibliography: Social Cognitive Theory (SCT) - Bandura (1986)',
  description:
    'Deep dive into Social Cognitive Theory by Albert Bandura (1986), exploring self-efficacy and its critical role in technology adoption decisions.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Social Cognitive Theory (SCT) - Bandura (1986)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Social Cognitive Theory
            </p>
            <p>
              <strong>Model Abbreviation:</strong> SCT
            </p>
            <p>
              <strong>Target of Model:</strong> Human behavior and learning (later applied to
              individual technology adoption)
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Psychological Theory
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Albert Bandura
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1986
            </p>
            <p>
              <strong>Official Title:</strong> Social Foundations of Thought and Action: A Social
              Cognitive Theory
            </p>
            <p>
              <strong>Publisher:</strong> Prentice-Hall
            </p>
            <p>
              <strong>ISBN:</strong> 978-0-13-815614-5
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
                Bandura, A. (
                <a href="#ref-bandura-1986" className="text-tabs-teal-deep hover:underline">
                  1986
                </a>
                ). <em>Social foundations of thought and action: A social cognitive theory</em>.
                Prentice-Hall.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Bandura, Albert. 1986.{' '}
                <em>Social Foundations of Thought and Action: A Social Cognitive Theory</em>.
                Prentice-Hall.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Albert Bandura developed Social Cognitive Theory in 1986 to provide a comprehensive
            psychological framework that addresses a fundamental limitation in behavioral and
            cognitive psychology: the tendency to emphasize either environmental factors or personal
            factors in isolation. Bandura observed that human behavior, learning, and motivation
            could not be adequately explained by focusing exclusively on either external
            environmental determinants or internal cognitive processes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The development of SCT was driven by Bandura&rsquo;s research observations that
            people&rsquo;s behavior, cognition, and environment exist in constant interaction, what
            he termed &ldquo;triadic reciprocal determinism.&rdquo; This framework emerged from
            decades of social learning research that demonstrated individuals are neither passive
            products of their environment nor entirely autonomous agents acting independently of
            their surroundings. Bandura sought to create a theory that could explain why individuals
            with similar skills, knowledge, and environmental opportunities demonstrated vastly
            different behavioral outcomes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Although SCT was developed as a general theory of human behavior - covering domains from
            health to education to moral development - its emphasis on self-efficacy made it
            particularly valuable for understanding technology adoption. Compeau and Higgins (1995)
            developed the first comprehensive measure of computer self-efficacy grounded in SCT,
            surveying 1,020 Canadian business professionals and demonstrating that computer
            self-efficacy significantly predicted usage behavior, affect, and anxiety. Their work
            established self-efficacy - an individual&rsquo;s belief in their capability to execute
            the behaviors necessary to produce specific outcomes - as a central construct in
            information systems research on technology adoption.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Social Cognitive Theory operationalizes several foundational constructs:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Self-Efficacy:</strong> An individual&rsquo;s confidence in their capability
              to execute behaviors necessary to produce specific outcomes. The core of SCT,
              self-efficacy operates as a proximal mechanism influencing whether individuals attempt
              behaviors, how much effort they expend, and how long they persist when encountering
              obstacles.
            </li>
            <li>
              <strong>Outcome Expectations:</strong> An individual&rsquo;s beliefs about the likely
              consequences of performing a behavior. Distinct from self-efficacy, outcome
              expectations reflect what an individual expects will happen if they adopt a
              technology.
            </li>
            <li>
              <strong>Triadic Reciprocal Determinism:</strong> The dynamic interplay among personal
              factors (cognitions, values, self-efficacy), environmental factors (organizational
              support, social influences), and behavior. No single element determines behavior;
              instead, all three continuously influence each other.
            </li>
            <li>
              <strong>Mastery Experiences:</strong> Direct successful experiences performing a
              behavior. The most powerful source of self-efficacy development, mastery experiences
              through repeated successful performance build confidence in capability.
            </li>
            <li>
              <strong>Vicarious Experiences:</strong> Observing others successfully perform
              behaviors. Seeing similar others succeed builds observer self-efficacy through social
              modeling.
            </li>
            <li>
              <strong>Verbal Persuasion:</strong> Encouragement and coaching from credible others.
              When respected individuals persuade others that they are capable of performing
              behaviors, efficacy beliefs strengthen.
            </li>
            <li>
              <strong>Physiological and Emotional States:</strong> The physical and emotional states
              accompanying behavior attempts. Anxiety, stress, and negative emotional responses
              reduce efficacy beliefs, while calm and positive states enhance them.
            </li>
            <li>
              <strong>Behavioral Goals and Self-Regulation:</strong> The mechanisms through which
              individuals set targets for their own behavior and regulate their actions toward goal
              attainment.
            </li>
            <li>
              <strong>Environmental Supports and Barriers:</strong> The organizational and social
              structures that either facilitate or impede behavior adoption.
            </li>
          </ul>
        </section>

        {/* 6. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Social Cognitive Theory is a measurement-oriented framework. Bandura (1986) and
            subsequent scale-development papers specify how each construct is operationalized. Core
            measured constructs include:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Self-Efficacy:</strong> Belief in one&rsquo;s capability to execute the
              courses of action required to produce given attainments. Measured via task-specific
              self-efficacy scales using confidence ratings across increasingly demanding tasks.
              Compeau &amp; Higgins (1995) provide a computer self-efficacy scale widely used in
              technology adoption research.
            </li>
            <li>
              <strong>Outcome Expectations:</strong> Beliefs about the likely consequences of
              performing a behavior. Typically split into performance outcomes and personal
              outcomes; measured via multi-item Likert scales.
            </li>
            <li>
              <strong>Personal Goals:</strong> Goal intentions or goal commitment relative to the
              behavior, measured via self-report of intent, specificity, and challenge level.
            </li>
            <li>
              <strong>Self-Regulation:</strong> Self-monitoring, self-evaluation, and self-reaction
              - often measured via diary methods or multi-item self-regulation scales.
            </li>
            <li>
              <strong>Social Modeling Exposure:</strong> Degree of observational learning
              opportunity (observing others perform the behavior); measured via self-reported
              exposure to role models and peer behavior.
            </li>
            <li>
              <strong>Reciprocal Determinism:</strong> The triadic interaction among personal,
              behavioral, and environmental factors - not directly measured as a single construct;
              operationalized by jointly modeling the three sets of variables and their mutual
              influences.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Bandura and subsequent scale developers provide reliability and validity evidence for
            SCT scales across diverse behavioral domains. In technology adoption contexts, computer
            self-efficacy (Compeau &amp; Higgins, 1995) is the most widely adapted SCT construct.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            SCT synthesized and extended several prior psychological traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Behavioral Learning Theories:</strong> Classical behaviorism emphasized
              environmental determinism; SCT retained recognition that environment shapes behavior
              but rejected strict determinism.
            </li>
            <li>
              <strong>Cognitive Theories:</strong> Earlier cognitive approaches overemphasized
              internal thought processes; SCT integrated cognition with environment and behavior in
              reciprocal relationships.
            </li>
            <li>
              <strong>Social Learning Theory (Bandura, 1977):</strong> Bandura&rsquo;s own earlier
              work emphasized learning through observation and modeling; SCT embedded these
              mechanisms within a broader theoretical framework.
            </li>
            <li>
              <strong>Attitude Theories:</strong> Earlier attitude research assumed favorable
              attitudes automatically produce behavior; SCT distinguished between outcome
              expectations and self-efficacy.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Social Cognitive Theory explains behavior through the dynamic interaction of personal,
            environmental, and behavioral factors operating through triadic reciprocal determinism.
            Rather than behavior resulting from a single cause, SCT emphasizes that personal factors
            (including self-efficacy beliefs), environmental circumstances, and behavioral choices
            continuously influence each other.
          </p>

          <h3 className={H3_CLASSES}>Self-Efficacy: The Core Mechanism</h3>
          <p className={PARAGRAPH_CLASSES}>
            Self-efficacy operates as the central mechanism influencing technology adoption.
            Individuals with high self-efficacy regarding a technology are more likely to attempt
            adoption, persist through difficulties, expend greater effort, and recover quickly from
            setbacks. Conversely, low self-efficacy produces adoption resistance, minimal effort,
            and early discontinuance when facing obstacles.
          </p>

          <h3 className={H3_CLASSES}>The Four Sources of Self-Efficacy</h3>
          <p className={PARAGRAPH_CLASSES}>
            Self-efficacy develops through four specific pathways:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Mastery experiences:</strong> Direct successful performance is the most
              powerful source. Each successful task completion strengthens efficacy for that domain.
            </li>
            <li>
              <strong>Vicarious experiences:</strong> Observing similar others succeed builds
              observer efficacy. The closer the similarity, the more powerful the effect.
            </li>
            <li>
              <strong>Verbal persuasion:</strong> Encouragement from credible sources enhances
              efficacy. Credibility of the persuader substantially affects persuasion strength.
            </li>
            <li>
              <strong>Physiological and emotional states:</strong> Anxiety, stress, and negative
              emotions undermine efficacy. Managing emotional responses during learning improves
              efficacy development.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Explains adoption heterogeneity:</strong> Powerfully explains why individuals
              with identical skills and access demonstrate different adoption outcomes through
              self-efficacy differences.
            </li>
            <li>
              <strong>Empirically robust mechanisms:</strong> Provides multiple validated
              psychological pathways, more reliable than simpler single-construct models.
            </li>
            <li>
              <strong>Actionable intervention framework:</strong> The four sources of self-efficacy
              translate directly into practical, implementable strategies.
            </li>
            <li>
              <strong>Cross-technology applicability:</strong> Provides unified framework explaining
              adoption of diverse technologies without requiring separate models.
            </li>
            <li>
              <strong>Integration of individual and environmental factors:</strong> Avoids false
              dichotomy between purely individual and purely environmental determinism.
            </li>
            <li>
              <strong>Longitudinal predictive validity:</strong> Self-efficacy measured
              prospectively predicts adoption behaviors months and years later.
            </li>
            <li>
              <strong>Distinction between efficacy and expectations:</strong> Separates &ldquo;can I
              do this?&rdquo; from &ldquo;will it be valuable?&rdquo;, explaining cases where
              positive outcome expectations fail to produce adoption.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Temporal precedence challenges:</strong> Field studies often measure
              self-efficacy after adoption begins, creating difficulty distinguishing whether low
              efficacy causes non-adoption or results from it.
            </li>
            <li>
              <strong>Limited attention to technology characteristics:</strong> Emphasizes personal
              and environmental factors but gives relatively little attention to technology
              features, design, and usability.
            </li>
            <li>
              <strong>Incomplete environmental specification:</strong> While acknowledging
              environmental influence, provides less specific guidance about which environmental
              factors matter most.
            </li>
            <li>
              <strong>Insufficient attention to non-volitional barriers:</strong> Assumes behavior
              flows from beliefs and support; less equipped to address resource constraints,
              incompatibility, or organizational decisions beyond individual control.
            </li>
            <li>
              <strong>Measurement challenges:</strong> Self-efficacy proves difficult to measure
              validly, can be overly general or overly specific, and individuals often overestimate
              their efficacy.
            </li>
            <li>
              <strong>Limited specification of moderating factors:</strong> Identifies key variables
              but provides less guidance about when and for whom these factors matter most.
            </li>
            <li>
              <strong>Insufficient organizational integration:</strong> Explains individual
              psychology well but integrates less thoroughly with organizational behavior theories
              addressing incentives, hierarchy, and political factors.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Articulated the efficacy-outcome distinction:</strong> Argued that
              individuals might believe a technology will be valuable but doubt their personal
              capability, offering an explanation for cases where positive attitudes fail to
              produce adoption.
            </li>
            <li>
              <strong>Mechanism-based intervention design:</strong> Specified four concrete,
              empirically validated pathways for building self-efficacy, enabling targeted
              intervention design.
            </li>
            <li>
              <strong>Triadic reciprocal determinism:</strong> Provided overarching theoretical
              framework recognizing mutual influence among personal factors, environment, and
              behavior.
            </li>
            <li>
              <strong>Agentic perspective:</strong> Emphasized that individuals actively shape their
              circumstances rather than passively responding to them.
            </li>
            <li>
              <strong>Self-regulation and goal-setting mechanisms:</strong> Detailed how individuals
              set behavioral goals and self-regulate toward goal attainment.
            </li>
            <li>
              <strong>Temporal dynamics:</strong> Provided greater attention to how initial
              self-efficacy enables attempts, success experiences build efficacy, and this cycle
              creates sustained behavior change.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            SCT&rsquo;s internal validity was established through rigorous research spanning
            decades:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Experimental manipulation studies:</strong> Bandura and colleagues conducted
              controlled experiments where self-efficacy was systematically manipulated,
              demonstrating that manipulations produced predicted behavior changes.
            </li>
            <li>
              <strong>Path analytic studies:</strong> Research using path analysis demonstrated that
              relationships between self-efficacy, outcome expectations, and behavioral choices
              operated as theory predicted.
            </li>
            <li>
              <strong>Mechanism validation:</strong> Studies specifically tested proposed mechanisms
              through which self-efficacy operates, validating these intermediate processes.
            </li>
            <li>
              <strong>Longitudinal designs:</strong> Extended studies tracking individuals over time
              demonstrated that prospective self-efficacy predicted subsequent adoption and
              outcomes.
            </li>
            <li>
              <strong>Triangulation across domains:</strong> Consistent relationships between
              self-efficacy and behavior across diverse domains (phobia treatment, academic
              performance, health, organizational settings, technology adoption) strengthened
              internal validity claims.
            </li>
            <li>
              <strong>Theoretical coherence:</strong> The theory&rsquo;s core mechanisms explained
              not only technology adoption but numerous other behavioral domains, suggesting robust
              underlying mechanisms.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            SCT achieved remarkable external validity through diverse applications:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Cross-cultural research:</strong> Studies across individualistic and
              collectivistic cultures demonstrated that self-efficacy&rsquo;s relationship to
              behavior persisted across cultural boundaries.
            </li>
            <li>
              <strong>Longitudinal field studies:</strong> Researchers tested SCT in naturalistic
              organizational settings, educational environments, and health contexts, demonstrating
              real-world predictive validity.
            </li>
            <li>
              <strong>Diverse populations:</strong> Validity tested across ages, socioeconomic
              statuses, educational levels, and professional backgrounds with consistent findings.
            </li>
            <li>
              <strong>Technology-specific validation:</strong> Self-efficacy consistently predicted
              adoption of various technologies: computers, software, internet, mobile devices.
            </li>
            <li>
              <strong>Real-world implementation outcomes:</strong> Studies tracking actual
              technology use demonstrated that self-efficacy predicted not just intentions but
              actual usage behaviors and proficiency development.
            </li>
            <li>
              <strong>Longitudinal persistence:</strong> SCT-based interventions produced behavioral
              changes persisting months and years later, demonstrating explanation of enduring
              shifts.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            SCT is directly relevant to technology adoption by identifying self-efficacy as a key
            psychological mechanism determining whether individuals will attempt adoption, how
            persistently they will engage with technology challenges, and whether they will sustain
            use over time.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified by SCT</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Low self-efficacy:</strong> Insufficient confidence in ability to accomplish
              technology tasks, independent from actual ability.
            </li>
            <li>
              <strong>Negative outcome expectations:</strong> Belief that technology adoption
              won&rsquo;t produce valued outcomes despite being capable.
            </li>
            <li>
              <strong>Insufficient mastery experiences:</strong> Lack of structured opportunities
              for successful hands-on experience prevents efficacy building.
            </li>
            <li>
              <strong>Inadequate modeling:</strong> Absence of visible role models successfully
              using technology prevents efficacy development through observation.
            </li>
            <li>
              <strong>Insufficient social support:</strong> Lack of encouragement, coaching, and
              recognition limits efficacy development through social channels.
            </li>
            <li>
              <strong>Anxiety and physiological barriers:</strong> High anxiety or stress impedes
              adoption by undermining efficacy and motivation.
            </li>
            <li>
              <strong>Environmental barriers:</strong> Inadequate training resources, insufficient
              time, lack of access, or incompatibility with existing systems prevent adoption.
            </li>
            <li>
              <strong>Misaligned outcome expectations:</strong> When individuals anticipate negative
              personal outcomes from adoption, barriers emerge despite adequate self-efficacy.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions SCT Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Build self-efficacy through mastery experiences:</strong> Structure
              implementation with graduated difficulty, ensuring early successes before advancing to
              complex features.
            </li>
            <li>
              <strong>Facilitate vicarious experiences and peer modeling:</strong> Recruit
              successful adopters as visible role models; pair less-confident employees with
              successful peers.
            </li>
            <li>
              <strong>Provide expert verbal persuasion:</strong> Offer consistent encouragement and
              coaching from credible sources with quality training and mentoring.
            </li>
            <li>
              <strong>Manage emotional states:</strong> Create low-pressure learning environments
              that reduce anxiety and normalize technology learning challenges.
            </li>
            <li>
              <strong>Remove environmental barriers:</strong> Allocate sufficient training time and
              resources; ensure technology accessibility; remove adoption-discouraging policies.
            </li>
            <li>
              <strong>Set clear, valued outcome expectations:</strong> Transparently communicate why
              technology adoption matters and how it will benefit individuals and the organization.
            </li>
            <li>
              <strong>Create sustained support infrastructure:</strong> Provide ongoing training
              access, help desk systems, peer learning communities, and continuous efficacy-building
              opportunities.
            </li>
            <li>
              <strong>Customize support based on efficacy assessment:</strong> Assess individual
              self-efficacy and provide targeted support based on identified needs.
            </li>
            <li>
              <strong>Model adoption behavior:</strong> Leaders themselves should visibly use,
              advocate for, and demonstrate learning with adopted technologies.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            SCT provided foundational concepts integrated into numerous subsequent technology
            adoption models:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Technology Acceptance Model (
                <Link
                  href="/bibliography-1-6-technology-acceptance-model-tam-davis-1989"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Davis, 1989
                </Link>
                ):
              </strong>{' '}
              Perceived ease of use shares conceptual overlap with self-efficacy. Venkatesh (
              <a href="#ref-venkatesh-2000" className="text-tabs-teal-deep hover:underline">
                2000
              </a>
              ) demonstrated that computer self-efficacy serves as an anchor for perceived ease of
              use judgments in the TAM tradition.
            </li>
            <li>
              <strong>
                Unified Theory of Acceptance and Use of Technology (UTAUT) (
                <Link
                  href="/bibliography-1-15-unified-theory-utaut-venkatesh-2003"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Venkatesh et al., 2003
                </Link>
                ):
              </strong>{' '}
              Tested self-efficacy as a predictor but found its effect was subsumed under Effort
              Expectancy rather than operating as a direct determinant of behavioral intention.
            </li>
            <li>
              <strong>
                Technology Acceptance Model 3 (TAM3) (Venkatesh &amp;{' '}
                <Link
                  href="/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bala, 2008
                </Link>
                ):
              </strong>{' '}
              Explicitly modeled computer self-efficacy as an anchor determinant of perceived ease
              of use.
            </li>
            <li>
              <strong>Computer Self-Efficacy research (Compeau &amp; Higgins, 1995):</strong>{' '}
              Developed and validated a measure of computer self-efficacy based directly on SCT,
              demonstrating that self-efficacy significantly predicted computer usage, affect, and
              anxiety in a survey of 1,020 Canadian business professionals.
            </li>
            <li>
              <strong>Compeau, Higgins, &amp; Huff (1999):</strong> Extended the 1995
              cross-sectional study into a longitudinal design, confirming that SCT-based
              self-efficacy predicted computing behavior over time.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-bandura-1986">
              Bandura, A. (1986).{' '}
              <em>Social foundations of thought and action: A social cognitive theory</em>.
              Prentice-Hall. ISBN: 978-0-13-815614-5
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-venkatesh-2000">
              Venkatesh, V. (2000). Determinants of perceived ease of use: Integrating control,
              intrinsic motivation, and emotion into the technology acceptance model.{' '}
              <em>Information Systems Research</em>, 11(4), 342-365.
              https://doi.org/10.1287/isre.11.4.342.11872
            </li>
            <li id="ref-bandura-1997">
              Bandura, A. (1997). <em>Self-efficacy: The exercise of control</em>. W.H. Freeman.
            </li>
            <li id="ref-bandura-2001">
              Bandura, A. (2001). Social cognitive theory: An agentic perspective.{' '}
              <em>Annual Review of Psychology</em>, 52, 1-26.
            </li>
            <li id="ref-compeau-1995">
              Compeau, D. R., &amp; Higgins, C. A. (1995). Computer self-efficacy: Development of a
              measure and initial test. <em>MIS Quarterly</em>, 19(2), 189-211.
              https://doi.org/10.2307/249688
            </li>
            <li id="ref-compeau-1999">
              Compeau, D. R., Higgins, C. A., &amp; Huff, S. (1999). Social cognitive theory and
              individual reactions to computing technology: A longitudinal study.{' '}
              <em>MIS Quarterly</em>, 23(2), 145-158.
            </li>
            <li id="ref-gist-1992">
              Gist, M. E., &amp; Mitchell, T. R. (1992). Self-efficacy: A theoretical analysis of
              its determinants and malleability. <em>Academy of Management Review</em>, 17(2),
              183-211.
            </li>
            <li id="ref-marakas-1998">
              Marakas, G. M., Yi, M. Y., &amp; Johnson, R. D. (1998). The multilevel and
              multifaceted character of computer self-efficacy: Toward clarification of the
              construct and an integrative framework. <em>Information Systems Research</em>, 9(2),
              126-163.
            </li>
            <li id="ref-agarwal-1999">
              Agarwal, R., &amp; Prasad, J. (1999). Are individual differences germane to the
              acceptance of new information technologies? <em>Decision Sciences</em>, 30(2),
              361-391.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <p className={PARAGRAPH_CLASSES}>
            This article is part of a comprehensive bibliography examining foundational and
            contemporary models of technology adoption:
          </p>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-2-diffusion-of-innovations-rogers"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Diffusion of Innovations (DOI)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-4-model-of-innovation-resistance-ram-sheth-1989"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Model of Innovation Resistance (RAM) &rarr;
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
