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
  title: 'Bibliography: Technology Acceptance Model 2 (TAM2) - Venkatesh & Davis (2000)',
  description:
    'In-depth exploration of the Technology Acceptance Model 2 (TAM2), extending the original TAM with social influence and cognitive instrumental processes through four longitudinal field studies.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Technology Acceptance Model 2 (TAM2) - Venkatesh &amp; Davis (2000)
        </h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Technology Acceptance Model 2
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TAM2
            </p>
            <p>
              <strong>Target of Model:</strong> Determinants of Perceived Usefulness and User
              Acceptance in Mandatory and Voluntary Adoption Contexts
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Technology Adoption,
              Organizational Behavior
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Viswanath Venkatesh and Fred D. Davis
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2000
            </p>
            <p>
              <strong>Official Title:</strong> A theoretical extension of the technology acceptance
              model: Four longitudinal field studies
            </p>
            <p>
              <strong>Journal:</strong> Management Science
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 46, No. 2
            </p>
            <p>
              <strong>Pages:</strong> 186-204
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1287/mnsc.46.2.186.11926"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1287/mnsc.46.2.186.11926
              </a>
            </p>
            <p>
              <strong>JSTOR:</strong>{' '}
              <a
                href="https://www.jstor.org/stable/2634758"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://www.jstor.org/stable/2634758
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
                Venkatesh, V., &amp; Davis, F. D. (
                <a href="#ref-venkatesh-2000" className="text-tabs-teal-deep hover:underline">
                  2000
                </a>
                ). A theoretical extension of the technology acceptance model: Four longitudinal
                field studies. <em>Management Science</em>, 46(2), 186-204.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Venkatesh, Viswanath, and Fred D. Davis. 2000. &ldquo;A Theoretical Extension of the
                Technology Acceptance Model: Four Longitudinal Field Studies.&rdquo;
                <em>Management Science</em> 46, no. 2: 186-204.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Venkatesh and Davis developed TAM2 to address critical limitations in the original
            Technology Acceptance Model. While the original TAM identified perceived usefulness and
            perceived ease of use as primary determinants of technology adoption intentions, it
            provided insufficient theoretical explanation of what drives perceived usefulness in
            organizational contexts. The authors recognized that technology adoption in real
            organizations involves both voluntary user choices and mandatory organizational
            requirements, and that adoption outcomes differ substantially between these contexts.
            Additionally, early TAM research lacked adequate longitudinal validation demonstrating
            that perceived usefulness and ease of use actually predict real usage behavior over
            extended time periods in organizational settings.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The original TAM also overlooked critical social influence processes operating in
            organizational technology adoption. When employees encounter mandatory technology
            implementations, social norms, peer influence, and supervisor expectations significantly
            shape adoption intentions beyond individual perceptions of usefulness and ease of use.
            Similarly, cognitive instrumental processes such as job relevance, output quality, and
            result demonstrability strengthen the usefulness-to-intention relationship. TAM2 was
            created to incorporate these social influence and cognitive instrumental mechanisms into
            an extended theoretical model capable of explaining technology adoption across both
            mandatory and voluntary usage contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            To validate TAM2, Venkatesh and Davis conducted four longitudinal field studies tracking
            the same users across multiple measurement occasions spanning several months of actual
            system use. Two studies examined mandatory technology adoptions where employees were
            required to use newly implemented organizational systems. Two studies examined voluntary
            adoptions where users chose whether to adopt available technologies. This multi-study,
            longitudinal design provided robust evidence that TAM2 constructs and relationships hold
            across diverse adoption contexts and predict actual usage behavior over time, addressing
            a major gap in early TAM research that relied on cross-sectional intention measures.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 operationalizes technology acceptance through the original TAM constructs plus six
            additional determinants organized into two categories:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Perceived Usefulness:</strong> The degree to which a person believes using a
              technology will enhance his or her job performance. Usefulness is the primary
              determinant of adoption intention, as users adopt technologies they believe will make
              work more effective or productive.
            </li>
            <li>
              <strong>Perceived Ease of Use:</strong> The degree to which a person believes using a
              technology will be free of effort. Ease of use influences adoption intention both
              directly and indirectly through its effect on perceived usefulness, as systems
              requiring less effort to master are perceived as more useful.
            </li>
            <li>
              <strong>Subjective Norm:</strong> A person&rsquo;s perception that important others
              (supervisors, peers, senior colleagues) believe he or she should use the technology.
              Social norms exert direct influence on adoption intention in mandatory contexts but
              weaker influence in voluntary contexts where intrinsic motivation dominates.
            </li>
            <li>
              <strong>Image:</strong> The degree to which using a technology enhances one&rsquo;s
              status or professional image within a social group. Users adopt technologies that
              improve how others perceive them professionally or that signal competence and
              progressiveness.
            </li>
            <li>
              <strong>Job Relevance:</strong> A user&rsquo;s perception that a technology is
              applicable to his or her job responsibilities and work activities. Technologies
              perceived as highly job relevant strengthen beliefs about usefulness and adoption
              likelihood.
            </li>
            <li>
              <strong>Output Quality:</strong> The degree to which a user believes a technology
              produces high-quality, accurate, and reliable work outputs. Quality outputs enhance
              perceived usefulness by demonstrating concrete performance improvements.
            </li>
            <li>
              <strong>Result Demonstrability:</strong> The degree to which a user can observe and
              understand the results of using a technology. Demonstrated, tangible results
              strengthen the connection between usefulness beliefs and adoption intentions.
            </li>
            <li>
              <strong>Experience and Voluntariness Moderators:</strong> The strength of
              relationships between social influences (subjective norm, image) and adoption
              intentions moderates based on user experience with the technology and whether adoption
              is mandatory or voluntary. Social influence effects weaken with increased experience
              and in voluntary adoption contexts.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 built directly upon the original Technology Acceptance Model and relevant
            theoretical traditions:
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
              Established perceived usefulness and perceived ease of use as primary determinants of
              technology adoption intentions, providing the foundational framework TAM2 extends with
              social influence and cognitive instrumental processes.
            </li>
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
              Provided the theoretical basis for attitude and intention as antecedents of behavior.
              TAM2 applies TRA logic within technology adoption contexts and introduces subjective
              norm as a direct intention predictor.
            </li>
            <li>
              <strong>
                Diffusion of Innovation (
                <a
                  id="cite-ref-rogers-1995-1"
                  href="#ref-rogers-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rogers, 1995
                </a>
                ):
              </strong>{' '}
              Rogers&rsquo;s diffusion framework was operationalized for IS contexts by Moore and
              Benbasat (1991), from whom TAM2 adapted the image, result demonstrability, and
              voluntariness scales (p.194). TAM2 does not cite Rogers (1995) directly.
            </li>
            <li>
              <strong>Social Psychology Literature on Conformity and Compliance:</strong> Provided
              theoretical foundations for subjective norm and image effects as social influence
              mechanisms. TAM2 explicitly invokes Kelman&rsquo;s (1958) three-process framework
              (compliance, internalization, identification) to differentiate direct and indirect
              effects of subjective norm (p.187-190).
            </li>
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
              TAM2 does not cite Goodhue and Thompson (1995) directly; it does cite Goodhue (1995,
              Management Science). The job relevance and output quality scales were adapted from
              Davis, Bagozzi, and Warshaw (1992), not Goodhue.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 proposes that technology adoption intention is determined by perceived usefulness,
            perceived ease of use, and subjective norm. The model further specifies that perceived
            usefulness is influenced by subjective norm, image, job relevance, output quality, and
            result demonstrability. Perceived ease of use influences adoption intention directly and
            indirectly through perceived usefulness. Additionally, experience with technology
            moderates the subjective norm-to-intention relationship, with social influence effects
            diminishing as experience increases. Voluntariness of adoption moderates the subjective
            norm-to-intention relationship, with mandatory contexts showing stronger social norm
            effects than voluntary contexts.
          </p>

          <h3 className={H3_CLASSES}>TAM2 Determinant Mechanisms</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Social Influence Processes (Subjective Norm, Image):</strong> Direct and
              indirect effects on adoption intention through perceived usefulness. Stronger in
              mandatory contexts and with inexperienced users; weaken as experience increases or in
              voluntary contexts.
            </li>
            <li>
              <strong>
                Cognitive Instrumental Processes (Job Relevance, Output Quality, Result
                Demonstrability):
              </strong>{' '}
              Direct effects on perceived usefulness. Users evaluate technologies by job
              applicability, output quality, and tangible result demonstration, enhancing beliefs
              about usefulness.
            </li>
            <li>
              <strong>Core TAM Relationships (Usefulness, Ease of Use, Intention):</strong>{' '}
              Perceived usefulness and intention relationship is mediated partially by subjective
              norm, image, job relevance, output quality, and result demonstrability.
            </li>
            <li>
              <strong>Experience Moderation:</strong> Subjective norm effect on intention
              strengthens with low experience and weakens with high experience as users develop
              independent usefulness assessments.
            </li>
            <li>
              <strong>Voluntariness Moderation:</strong> Subjective norm effect on intention is
              stronger in mandatory adoption contexts and weaker in voluntary contexts where
              intrinsic motivation dominates.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Longitudinal validation across contexts:</strong> Four field studies with
              multiple measurement occasions demonstrated that TAM2 relationships predict actual
              usage behavior over time in both mandatory and voluntary adoption contexts.
            </li>
            <li>
              <strong>Explained variance improvements:</strong> TAM2 explained 40-60% of variance in
              perceived usefulness and 34-52% of variance in usage intentions, substantially
              improving upon original TAM predictive power.
            </li>
            <li>
              <strong>Context-sensitive modeling:</strong> Incorporation of experience and
              voluntariness as moderators acknowledges that adoption mechanisms differ between
              mandatory organizational requirements and voluntary user choices.
            </li>
            <li>
              <strong>Comprehensive theoretical mechanisms:</strong> Integrates social influence and
              cognitive instrumental processes, providing richer theoretical explanation of what
              drives technology adoption beyond individual perceptions.
            </li>
            <li>
              <strong>Practical implementation guidance:</strong> Identifies actionable mechanisms
              (demonstrating results, emphasizing job relevance, communicating output quality) that
              organizations can leverage to enhance adoption.
            </li>
            <li>
              <strong>Empirical rigor:</strong> Four longitudinal field studies across four
              organizations (total N=156), multiple measurement occasions, and real organizational
              technology implementations provide strong empirical foundation.
            </li>
            <li>
              <strong>Moderator testing:</strong> Direct empirical tests of experience and
              voluntariness moderating effects, demonstrating that adoption mechanisms vary by
              context.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Model complexity and parameter estimation:</strong> TAM2 introduces multiple
              constructs and moderating relationships, increasing complexity and likelihood of model
              misspecification or estimation difficulties in applied contexts.
            </li>
            <li>
              <strong>Limited theoretical explanation of ease of use determinants:</strong> While
              TAM2 extends usefulness with multiple antecedents, ease of use remains theoretically
              underdeveloped with limited explanation of what drives ease of use perceptions.
            </li>
            <li>
              <strong>Cross-cultural generalizability:</strong> Developed with primarily U.S.
              organizational samples; social norm and image effects may differ substantially in
              cultures with different power distances, collectivism orientations, and conformity
              norms.
            </li>
            <li>
              <strong>Time-bound technology context:</strong> Year 2000 organizational technology
              landscape (enterprise systems, desktop applications) differs from contemporary mobile,
              cloud, and AI technologies where adoption mechanisms may operate differently.
            </li>
            <li>
              <strong>Self-reported usage measure:</strong> The studies used self-reported usage
              (&ldquo;On average, how much time do you spend on the system every day?&rdquo;) rather
              than objectively measured usage, which the authors note as a limitation (p.199).
              Common-method variance was mitigated by separating intention and usage measurements by
              at least one month, but self-reported usage may not fully reflect actual behavior.
            </li>
            <li>
              <strong>Missing organizational and contextual factors:</strong> Model does not
              incorporate organizational support, training quality, system reliability, or change
              management approaches that may significantly influence adoption outcomes.
            </li>
            <li>
              <strong>Moderator effect sizes:</strong> While experience and voluntariness moderate
              relationships, the magnitude of moderation effects varies across studies, suggesting
              moderating effects may depend on additional unmeasured contextual factors.
            </li>
            <li>
              <strong>Common method variance:</strong> Reliance on self-reported perceived
              usefulness, ease of use, and norm perceptions may introduce common method bias,
              potentially inflating observed relationships.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Longitudinal empirical validation of TAM:</strong> Demonstrated through
              multiple field studies that perceived usefulness and ease of use relationships predict
              actual system usage over months of real organizational use, establishing TAM as
              empirically valid beyond cross-sectional intention studies.
            </li>
            <li>
              <strong>Social influence mechanisms in adoption:</strong> Introduced subjective norm
              and image as adoption predictors, demonstrating that technology adoption is not purely
              rational calculation but incorporates social and status-related motivations.
            </li>
            <li>
              <strong>Cognitive instrumental processes specification:</strong> Identified and
              operationalized job relevance, output quality, and result demonstrability as
              usefulness antecedents, providing concrete mechanisms explaining how users evaluate
              technology usefulness.
            </li>
            <li>
              <strong>Context-dependent adoption mechanisms:</strong> Demonstrated through moderator
              testing that adoption mechanisms differ between mandatory and voluntary contexts,
              suggesting theory must account for enforcement and choice conditions.
            </li>
            <li>
              <strong>Experience-based adoption dynamics:</strong> Showed that social influence
              effects diminish as users gain experience, indicating adoption is a dynamic process
              where mechanisms change over time as experience accumulates.
            </li>
            <li>
              <strong>Mandatory vs. voluntary distinction:</strong> Explicitly modeled how
              subjective norm effects dominate in mandatory contexts while intrinsic motivation
              dominates in voluntary adoption, challenging assumptions that single adoption model
              applies universally.
            </li>
            <li>
              <strong>Field-based organizational validation:</strong> Conducted research in real
              organizational settings during actual system implementations rather than laboratory
              conditions, establishing practical relevance to organizational technology management.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 employed rigorous methodology to establish internal validity:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Longitudinal design with multiple measurement occasions:</strong> Rather than
              cross-sectional snapshots, all four field studies measured model constructs at three
              points in time (T1: post-training/preimplementation; T2: one month postimplementation;
              T3: three months postimplementation), with self-reported usage additionally measured
              at T4 (five months postimplementation), allowing assessment of temporal relationships
              and experience effects.
            </li>
            <li>
              <strong>Multi-study design:</strong> Four longitudinal field studies across four
              organizations with usable responses of n=38, 39, 43, and 36 at all points of
              measurement (total N=156), providing sufficient data to detect hypothesized
              relationships and moderating effects.
            </li>
            <li>
              <strong>Real organizational implementations:</strong> Studies used actual system
              introductions in naturalistic workplace settings (a manufacturing firm, a financial
              services firm, an accounting services firm, and an investment banking firm) rather
              than artificial laboratory contexts, ensuring adoption pressures and outcomes reflect
              reality.
            </li>
            <li>
              <strong>Separation of intention and usage measurement:</strong> To mitigate
              common-method variance, intention was measured at one time period and self-reported
              usage was measured in the subsequent wave (T1&rarr;T2, T2&rarr;T3, T3&rarr;T4),
              separating the two measures by at least one month.
            </li>
            <li>
              <strong>Hypothesized moderation tests:</strong> Explicitly tested proposed moderation
              of the subjective norm&ndash;intention relationship by voluntariness and experience,
              and of the subjective norm&ndash;usefulness relationship by experience, via regression
              analyses at each time period and pooled across studies (n=468 pooled).
            </li>
            <li>
              <strong>Psychometric validation:</strong> All measurement scales exhibited Cronbach
              alpha coefficients above 0.80 across all four studies and three time periods (Appendix
              1). Construct validity was supported by principal components analysis with direct
              oblimin rotation (all cross-loadings below 0.30, Appendix 2) and by
              multitrait-multimethod matrix analysis (p.194).
            </li>
            <li>
              <strong>Pooled summary model:</strong> Pooling across four studies and three time
              periods yielded n=468, with Adjusted R&sup2; of 0.51 for perceived usefulness and 0.49
              for behavioral intention (Figure 2 notes, p.197).
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations require careful interpretation of generalizability:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Organizational setting generalization:</strong> Four studies conducted in
              different organizations (a medium-sized manufacturing firm, a large financial services
              firm, a small accounting services firm, and a small international investment banking
              firm) provide some industry diversity, but all are commercial organizations and sample
              sizes per study were modest (n=36 to n=43 usable at all measurement points).
            </li>
            <li>
              <strong>Technology type limitations:</strong> Studies examined workplace business
              systems (floor scheduling, Windows mainframe migration, customer account management,
              and investment portfolio analysis), two mandatory and two voluntary within
              organizational settings. Generalization to consumer technology, non-work contexts, or
              radically new technology categories (AI, VR) requires investigation.
            </li>
            <li>
              <strong>Cultural generalizability:</strong> U.S.-based samples limit generalization to
              international contexts with different cultural values regarding conformity, authority,
              and status consciousness that may modify social norm and image effects.
            </li>
            <li>
              <strong>Time period considerations:</strong> Year 2000 organizational context where
              enterprise systems and desktop applications were novel. Contemporary technology
              landscapes with ubiquitous, consumer-like technologies may show different adoption
              dynamics.
            </li>
            <li>
              <strong>User population diversity:</strong> Samples primarily comprised organizational
              employees in information-intensive roles. Generalization to non-technical users, older
              workers, or populations with low technology exposure requires verification.
            </li>
            <li>
              <strong>Implementation context variation:</strong> While studies included both
              mandatory and voluntary adoptions, organizational support, training, and change
              management quality varied. Generalization requires considering implementation quality
              as contextual moderator.
            </li>
            <li>
              <strong>Measurement period duration:</strong> Studies tracked adoption over 3-4
              months. Longer-term dynamics, discontinuance, and evolution of adoption beyond initial
              implementation period remain unexplored.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 directly addresses organizational technology adoption barriers by identifying
            specific psychological and social mechanisms that inhibit or facilitate acceptance. The
            model distinguishes between intrinsic factors (perceived usefulness, ease of use) and
            extrinsic factors (subjective norm, image), recognizing that different adoption contexts
            activate different mechanisms. Organizations implementing new technologies encounter
            divergent adoption patterns based on whether adoption is mandatory or voluntary, and
            TAM2 explains these differences through differential social norm effects.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Low perceived job relevance:</strong> When users do not see technology as
              applicable to their work responsibilities, usefulness perceptions remain low
              regardless of system quality or ease of use.
            </li>
            <li>
              <strong>Unclear output quality or demonstrability:</strong> Users resist technologies
              whose outputs they view as low-quality or whose results lack visibility, preventing
              development of strong usefulness beliefs.
            </li>
            <li>
              <strong>High complexity perception:</strong> Perceived ease of use barriers reduce
              adoption intentions directly and indirectly by lowering usefulness perceptions as
              users worry about implementation difficulty.
            </li>
            <li>
              <strong>Negative peer and supervisor norms:</strong> In mandatory contexts, if
              colleagues and supervisors communicate skepticism or resistance, social norm effects
              strongly inhibit individual adoption intentions.
            </li>
            <li>
              <strong>Status threat perception:</strong> If technology adoption signals
              incompetence, job loss risk, or reduced status, image concerns may overcome positive
              usefulness beliefs.
            </li>
            <li>
              <strong>Weak result demonstrability:</strong> Technologies whose benefits remain
              invisible or unclear to decision makers face adoption resistance despite objective
              usefulness.
            </li>
            <li>
              <strong>Mandatory adoption fatigue:</strong> In organizational contexts with frequent
              mandatory technology changes, users develop cynicism about promised benefits and
              resist each new implementation.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Demonstrate job relevance clearly:</strong> Explicitly connect technology to
              job responsibilities and show how tools address actual work challenges users face
              daily.
            </li>
            <li>
              <strong>Emphasize result demonstrability:</strong> Provide concrete evidence of
              technology output quality through pilot programs, case studies, and visible
              performance improvements.
            </li>
            <li>
              <strong>Communicate through social influence strategically:</strong> In mandatory
              contexts, ensure supervisors and influential peers actively communicate support and
              positive expectations, leveraging subjective norm effects.
            </li>
            <li>
              <strong>Address status and image concerns:</strong> Frame technology adoption as
              advancing professional capability or signaling innovation leadership rather than
              threatening status.
            </li>
            <li>
              <strong>Reduce complexity perception:</strong> Provide comprehensive training,
              accessible support, and system interfaces that minimize perceived ease of use
              barriers.
            </li>
            <li>
              <strong>Build experience gradually:</strong> Recognize that social influence effects
              weaken as users gain experience, so prioritize early intensive support and community
              building during initial adoption phases.
            </li>
            <li>
              <strong>Create visible output quality:</strong> Design systems to produce
              high-quality, tangible results that users can readily observe and attribute to system
              use.
            </li>
            <li>
              <strong>Differentiate mandatory vs. voluntary contexts:</strong> In mandatory
              contexts, use social influence and organizational authority; in voluntary contexts,
              emphasize intrinsic benefits and usefulness to overcome adoption resistance.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            TAM2 significantly influenced subsequent technology adoption research:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Unified Theory of Acceptance and Use of Technology (
                <a
                  id="cite-ref-venkatesh-2003-1"
                  href="#ref-venkatesh-2003"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Venkatesh et al., 2003
                </a>
                ):
              </strong>{' '}
              Integrated TAM2, Theory of Planned Behavior, and other adoption models into a unified
              framework with additional moderators including age, gender, and experience.
            </li>
            <li>
              <strong>
                Technology Acceptance Model 3 (Venkatesh &amp;{' '}
                <Link
                  href="/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bala, 2008
                </Link>
                ):
              </strong>{' '}
              Extended TAM2 by adding system characteristics, perceived credibility, and external
              variables as determinants of ease of use, addressing the underdeveloped theoretical
              explanation of ease of use origins.
            </li>
            <li>
              <strong>TAM extensions to emerging technologies:</strong> Researchers applied TAM2
              framework to understand adoption of new technology categories including cloud
              computing, mobile applications, artificial intelligence, and blockchain, validating
              mechanisms across diverse innovations.
            </li>
            <li>
              <strong>Virtual reality and immersive technology adoption:</strong> Contemporary
              researchers used TAM2 as foundational framework for understanding adoption barriers
              and facilitators in emerging extended reality technologies.
            </li>
            <li>
              <strong>IS continuance literature:</strong> TAM2&rsquo;s distinction between adoption
              and sustained use influenced post-adoption research examining how initial adoption
              leads to continued technology utilization.
            </li>
            <li>
              <strong>Organizational change management theory:</strong> TAM2&rsquo;s social
              influence and moderation findings informed change management approaches recognizing
              adoption as context-dependent and time-dependent process.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-venkatesh-2000">
              Venkatesh, V., &amp; Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. <em>Management Science</em>, 46(2),
              186-204.{' '}
              <a
                href="https://doi.org/10.1287/mnsc.46.2.186.11926"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1287/mnsc.46.2.186.11926
              </a>
            </li>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-davis-1989-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to in-text citation for Davis (1989)"
                >
                  &#x21A9;
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
            <li id="ref-rogers-1995">
              Rogers, E. M. (1995). Diffusion of innovations (4th ed.). Free Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rogers-1995-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to in-text citation for Rogers (1995)"
                >
                  &#x21A9;
                </a>
              </span>
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-venkatesh-2003-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to in-text citation for Venkatesh et al. (2003)"
                >
                  &#x21A9;
                </a>
              </span>{' '}
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

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
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
            <li id="ref-venkatesh-2008">
              Venkatesh, V., &amp; Bala, H. (2008). Technology acceptance model 3 and a research
              agenda on interventions. <em>Decision Sciences</em>, 39(2), 273-315.{' '}
              <a
                href="https://doi.org/10.1111/j.1540-5915.2008.00192.x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1111/j.1540-5915.2008.00192.x
              </a>
            </li>
            <li id="ref-compeau-1995">
              Compeau, D. R., &amp; Higgins, C. A. (1995). Computer self-efficacy: Development of a
              measure and initial test. <em>MIS Quarterly</em>, 19(2), 189-211.{' '}
              <a
                href="https://doi.org/10.2307/249688"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249688
              </a>
            </li>
            <li id="ref-bandura-1997">
              Bandura, A. (1997). Self-efficacy: The exercise of control. W.H. Freeman.
            </li>
            <li id="ref-triandis-1977">
              Triandis, H. C. (1977). Interpersonal behavior. Brooks-Cole.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-12-technology-readiness-index-tri-parasuraman-2000"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Technology Readiness Index (Parasuraman)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Expectation-Confirmation Model (Bhattacherjee) &rarr;
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
