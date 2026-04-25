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
  title: 'Bibliography: Expectation-Confirmation Model (ECM) - Bhattacherjee (2001)',
  description:
    'In-depth exploration of the Expectation-Confirmation Model (ECM), adapting expectation-confirmation theory to information systems post-adoption continuance behavior.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Expectation-Confirmation Model (ECM) - Bhattacherjee (2001)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Expectation-Confirmation Model
            </p>
            <p>
              <strong>Model Abbreviation:</strong> ECM, IS Continuance Model
            </p>
            <p>
              <strong>Target of Model:</strong> Post-Adoption Continuance Intentions and Sustained
              Technology Use
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Consumer Behavior,
              Technology Adoption
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Anol Bhattacherjee
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2001
            </p>
            <p>
              <strong>Official Title:</strong> Understanding information systems continuance: An
              expectation-confirmation model
            </p>
            <p>
              <strong>Journal:</strong> MIS Quarterly
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 25, No. 3
            </p>
            <p>
              <strong>Pages:</strong> 351-370
            </p>
            <p>
              <strong>URL:</strong>{' '}
              <a
                href="https://doi.org/10.2307/3250921"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/3250921
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
                Bhattacherjee, A. (
                <a href="#ref-bhattacherjee-2001" className="text-tabs-teal-deep hover:underline">
                  2001
                </a>
                ). Understanding information systems continuance: An expectation-confirmation model.{' '}
                <em>MIS Quarterly</em>, 25(3), 351-370.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Bhattacherjee, Anol. 2001. &ldquo;Understanding Information Systems Continuance: An
                Expectation-Confirmation Model.&rdquo; <em>MIS Quarterly</em> 25, no. 3: 351-370.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Bhattacherjee developed the Expectation-Confirmation Model to address a critical gap in
            information systems research that had focused almost exclusively on adoption decisions
            while neglecting post-adoption continuance behavior. The author recognized that
            technology adoption and technology continuance are conceptually distinct phenomena
            requiring different theoretical frameworks. Research had established that many users
            adopt new information systems but discontinue or minimize usage shortly after
            implementation, suggesting that adoption factors do not automatically predict sustained
            use. This discontinuance problem threatens the return on investment from expensive
            technology implementations and undermines organizational efforts to achieve technology
            value realization.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The original Technology Acceptance Model and related adoption theories predict whether
            users will initially accept and use new technologies, but they provide insufficient
            theoretical explanation of what determines whether users will continue using
            technologies after initial adoption. Bhattacherjee recognized that post-adoption
            continuance involves different psychological mechanisms than initial adoption decisions.
            The author proposed adapting expectation-confirmation theory from consumer behavior
            research, where confirmation of expectations about product performance and resulting
            satisfaction have long been established as determinants of consumer repurchase and
            loyalty decisions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            To establish the ECM&rsquo;s validity in information systems contexts, Bhattacherjee
            conducted an empirical study of online banking users, a population representing
            post-adoption users who had chosen to use internet banking systems and were making
            ongoing decisions about continued usage. The study proposed that IS continuance
            intention is determined by user satisfaction with prior IS use and perceived usefulness,
            where satisfaction is determined by confirmation of expectations versus actual
            performance experience. This model explicitly separates adoption antecedents from
            continuance antecedents, establishing the conceptual distinction between initial
            adoption and sustained usage decisions.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model draws on six conceptual constructs from consumer
            behavior and expectation-confirmation theory. Bhattacherjee&rsquo;s research model
            (Figure 2, p. 356) measures four of these directly (Perceived Usefulness, Confirmation,
            Satisfaction, Continuance Intention); the other two (Expectations and Perceived
            Performance) are subsumed into the Confirmation construct, which captures users&rsquo;
            cognitive comparison between the two:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Expectations:</strong> Pre-use beliefs about how well an information system
              will perform and what benefits it will deliver. Expectations are formed before or
              during initial adoption based on marketing claims, peer recommendations, or prior
              experience with similar systems.
            </li>
            <li>
              <strong>Perceived Performance:</strong> Post-use beliefs about how well the
              information system actually performed in delivering expected benefits and meeting user
              needs. Perceived performance reflects actual user experience with the system compared
              to pre-use understanding.
            </li>
            <li>
              <strong>Confirmation:</strong> The degree to which perceived performance matches or
              exceeds prior expectations. Confirmation is a cognitive evaluation of the gap between
              expected and actual performance, where positive confirmation occurs when actual
              performance meets or exceeds expectations, and negative confirmation occurs when
              performance falls short.
            </li>
            <li>
              <strong>Satisfaction:</strong> A user&rsquo;s emotional and evaluative response to
              prior information system use, determined by the degree of confirmation. Satisfaction
              reflects emotional reactions to whether the system lived up to expectations,
              encompassing both affective and evaluative components.
            </li>
            <li>
              <strong>Perceived Usefulness (Post-Adoption):</strong> The degree to which a user
              believes the information system will enhance job performance or create value.
              Post-adoption usefulness reflects updated beliefs based on actual usage experience,
              distinguishing post-adoption usefulness from pre-adoption expectations.
            </li>
            <li>
              <strong>Continuance Intention:</strong> A user&rsquo;s intention to continue using an
              information system in the future. Continuance intention is the key outcome variable,
              reflecting decisions about sustained usage rather than initial adoption.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model built upon established theories from consumer
            behavior and information systems:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Expectation-Confirmation Theory (
                <a
                  id="cite-ref-oliver-1980-1"
                  href="#ref-oliver-1980"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Oliver, 1980
                </a>
                ):
              </strong>{' '}
              Original consumer behavior theory establishing that product satisfaction is determined
              by confirmation of expectations, defined as the difference between expected and
              perceived performance. ECM applies this foundational theory to information systems
              contexts.
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
              Established perceived usefulness as primary determinant of technology adoption. ECM
              extends TAM by incorporating satisfaction and confirmation as post-adoption
              continuance mechanisms.
            </li>
            <li>
              <strong>
                Expectancy Disconfirmation Paradigm (
                <a
                  id="cite-ref-oliver-1977-1"
                  href="#ref-oliver-1977"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Oliver, 1977
                </a>
                ):
              </strong>{' '}
              Proposed that satisfaction results from perceived performance relative to
              expectations. ECM operationalizes disconfirmation paradigm specifically for
              post-adoption IS usage contexts.
            </li>
            <li>
              <strong>
                Consumer Behavior and Loyalty Research (
                <a
                  id="cite-ref-cronin-1992-1"
                  href="#ref-cronin-1992"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Cronin &amp; Taylor, 1992
                </a>
                ):
              </strong>{' '}
              Demonstrated that satisfaction is primary determinant of service repurchase and
              loyalty, providing behavioral intention frameworks applicable to IS continuance.
            </li>
            <li>
              <strong>IS Adoption Research:</strong> Accumulated evidence showing adoption and
              continuance are distinct phenomena with different drivers, motivating development of
              post-adoption specific theoretical frameworks.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model proposes that post-adoption continuance intention is
            determined by two primary factors: user satisfaction with prior IS use and perceived
            usefulness of the system. User satisfaction is determined by confirmation of prior
            expectations through actual use experience. The model incorporates a temporal dynamic:
            users form expectations before or during initial adoption, then accumulate actual usage
            experience that either confirms or disconfirms those expectations. The degree of
            confirmation shapes both perceived usefulness and user satisfaction, while perceived
            usefulness and satisfaction together influence continuance intention. Confirmed
            expectations result in high satisfaction and sustained beliefs in usefulness,
            encouraging continued usage. Disconfirmed expectations result in low satisfaction and
            erosion of usefulness beliefs, increasing discontinuance likelihood.
          </p>

          <h3 className={H3_CLASSES}>ECM Causal Mechanisms</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Expectations-to-Confirmation (theoretical):</strong> At the ECT theoretical
              level, confirmation is the cognitive result of comparing pre-use expectations to
              perceived performance. In the ECM research model (Figure 2, p. 356), confirmation is
              measured directly as a single construct rather than decomposed into separate
              expectations and performance measures.
            </li>
            <li>
              <strong>H1. Satisfaction -&gt; Continuance Intention:</strong> Satisfaction is the
              strongest predictor of continuance intention (standardized path coefficient 0.567, p
              &lt; .001 per Figure 3, p. 363). Reported as beta = 0.57 in prose (p. 364), accounting
              for 32 percent of continuance intention variance.
            </li>
            <li>
              <strong>H2. Confirmation -&gt; Satisfaction:</strong> Confirmation is the dominant
              antecedent of satisfaction (standardized path coefficient 0.451, p &lt; .001 per
              Figure 3; beta = 0.53 in prose, p. 364), accounting for 28 percent of satisfaction
              variance.
            </li>
            <li>
              <strong>H3. Perceived Usefulness -&gt; Satisfaction:</strong> Post-adoption perceived
              usefulness positively influences satisfaction (standardized path coefficient 0.227, p
              &lt; .01 per Figure 3; beta = 0.23 in prose, p. 364), accounting for 5 percent of
              satisfaction variance. In ECM, perceived usefulness influences satisfaction, not the
              reverse.
            </li>
            <li>
              <strong>H4. Perceived Usefulness -&gt; Continuance Intention:</strong> Post-adoption
              perceived usefulness directly predicts continuance intention (standardized path
              coefficient 0.294, p &lt; .001 per Figure 3; beta = 0.29 in prose, p. 364), accounting
              for 9 percent of continuance intention variance.
            </li>
            <li>
              <strong>H5. Confirmation -&gt; Perceived Usefulness:</strong> Confirmation shapes
              post-adoption perceived usefulness (standardized path coefficient 0.525, p &lt; .001
              per Figure 3; reported as beta = 0.45 in the prose on p. 364), accounting for 20
              percent of perceived usefulness variance.
            </li>
            <li>
              <strong>Temporal Dynamics:</strong> Model captures time progression from pre-adoption
              expectations through post-adoption confirmation and satisfaction to continuance
              decisions, reflecting real user experience trajectories.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Addresses post-adoption research gap:</strong> First major information systems
              model explicitly focusing on continuance rather than adoption, establishing
              continuance as distinct research stream.
            </li>
            <li>
              <strong>Solid theoretical foundation:</strong> Grounded in well-established
              expectation-confirmation theory from consumer behavior, which has been widely applied
              to repurchase and loyalty decisions.
            </li>
            <li>
              <strong>Explained continuance variance:</strong> Original study explained 41 percent
              of continuance intention variance (R&sup2; = 0.41), 33 percent of satisfaction
              variance (R&sup2; = 0.33), and 20 percent of perceived usefulness variance (R&sup2; =
              0.20), demonstrating substantial predictive power for post-adoption behaviors.
            </li>
            <li>
              <strong>Temporal validity:</strong> Model captures dynamic user experience progression
              from expectations through performance evaluation to continuance decisions, reflecting
              actual user decision processes.
            </li>
            <li>
              <strong>Practical relevance:</strong> Identifies actionable mechanisms for improving
              user continuance through expectation management and performance delivery aligned with
              user expectations.
            </li>
            <li>
              <strong>Parsimony with explanatory power:</strong> Simple, elegant model with few
              constructs and relationships explains complex post-adoption continuance phenomena
              effectively.
            </li>
            <li>
              <strong>Empirical validation:</strong> Tested in real online banking context with 122
              users engaged in post-adoption usage decisions, establishing behavioral relevance.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Limited sampling diversity:</strong> Original validation used online banking
              users only. Technology types vary substantially in characteristics (social systems,
              productivity tools, infrastructure), potentially moderating model relationships.
            </li>
            <li>
              <strong>Cross-cultural generalizability unclear:</strong> Developed with U.S. sample;
              expectation formation, confirmation interpretation, and satisfaction drivers may
              differ in cultures with different communication norms and service expectations.
            </li>
            <li>
              <strong>Expectations measurement challenges:</strong> Operationalizing pre-use
              expectations and measuring confirmation retrospectively introduces recall bias and
              interpretation challenges. Users may reframe initial expectations to match experienced
              outcomes.
            </li>
            <li>
              <strong>Single time-point post-adoption measurement:</strong> While model is temporal
              in theory, original study measured confirmation and satisfaction at single
              post-adoption occasion. Multiple measurement points would strengthen evidence for
              temporal dynamics.
            </li>
            <li>
              <strong>Discontinuance vs. reduced usage:</strong> Model measures continuance
              intention but does not distinguish between complete discontinuance and
              reduced-frequency usage, which may have different psychological drivers.
            </li>
            <li>
              <strong>Organizational mandates not incorporated:</strong> Model focuses on voluntary
              continued usage decisions. Organizational mandates requiring continued system use
              despite low satisfaction create boundary conditions for model applicability.
            </li>
            <li>
              <strong>Switching cost and habit effects:</strong> Model does not incorporate
              switching costs or habitual usage patterns that may maintain continued usage despite
              low confirmation or satisfaction.
            </li>
            <li>
              <strong>Limited investigation of expectation sources:</strong> Model does not examine
              how initial expectations form or vary by source (marketing claims, peer
              recommendations, prior experience), which may moderate confirmation effects.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Continuance as distinct research domain:</strong> Established that
              post-adoption continuance requires different theoretical frameworks than initial
              adoption, creating entire new research stream examining sustained technology usage
              rather than adoption decisions.
            </li>
            <li>
              <strong>Expectation-confirmation application to IS:</strong> Successfully adapted
              well-established consumer behavior theory to information systems context,
              demonstrating that consumer satisfaction theory applies to post-adoption technology
              usage.
            </li>
            <li>
              <strong>Satisfaction as continuance mechanism:</strong> Identified user satisfaction
              as primary determinant of post-adoption continuance, providing more nuanced
              understanding of post-adoption behavior than adoption models.
            </li>
            <li>
              <strong>Temporal dynamics integration:</strong> Explicitly modeled time progression
              from expectations through confirmation and satisfaction to continuance decisions,
              capturing realistic user experience trajectories over time.
            </li>
            <li>
              <strong>Expectations-performance gap operationalization:</strong> Introduced
              confirmation as specific mechanism through which expectation-performance alignment
              influences post-adoption continuance, operationalizing abstract disconfirmation
              concept.
            </li>
            <li>
              <strong>Distinction from adoption factors:</strong> Demonstrated that continuance
              drivers (satisfaction, confirmation) differ from adoption drivers (ease of use,
              usefulness), challenging assumptions that single model applies across
              adoption-continuance lifecycle.
            </li>
            <li>
              <strong>Acceptance-discontinuance anomaly:</strong> Bhattacherjee frames ECM as an
              explanation for the &ldquo;acceptance-discontinuance anomaly&rdquo; (abstract and p.
              352), the empirical pattern in which users accept a system at adoption but later
              discontinue. TAM cannot explain this, because the same pre-acceptance variables should
              predict both behaviors; ECM explains it through disconfirmation and dissatisfaction
              occurring after use.
            </li>
            <li>
              <strong>Empirical validation of continuance model:</strong> Provided empirical
              evidence that expectation-confirmation model predicts post-adoption continuance
              intentions, establishing behavioral validity for proposed mechanisms.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model employed sound methodology to establish internal
            validity:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Validated theoretical basis:</strong> Grounded in expectation-confirmation
              theory with extensive prior empirical validation in consumer behavior contexts,
              providing strong theoretical foundation.
            </li>
            <li>
              <strong>Appropriate sample selection:</strong> Studied online banking users, a
              population representing actual post-adoption users making real continuance decisions,
              ensuring ecological validity.
            </li>
            <li>
              <strong>Sample size and sampling frame:</strong> 1,000 online banking customers were
              sampled from a mid-sized U.S. bank customer base; 122 usable responses (approximately
              12 percent response rate) were analyzed, providing reasonable statistical power for
              the four-construct covariance-based structural equation model.
            </li>
            <li>
              <strong>Measurement validation:</strong> Reported composite reliabilities (Table 3, p.
              362) of 0.83 (Continuance Intention), 0.87 (Satisfaction), 0.88 (Perceived
              Usefulness), and 0.82 (Confirmation), all above the 0.70 threshold.
            </li>
            <li>
              <strong>Convergent and discriminant validity:</strong> Average variance extracted
              (AVE) values ranged from 0.60 to 0.65 (Table 3, p. 362), all above the 0.50 threshold.
              Chi-square difference tests (Table 4, p. 363) between constrained and unconstrained
              measurement models were significant (p &lt; .001) for all construct pairs, supporting
              discriminant validity.
            </li>
            <li>
              <strong>Structural equation modeling with EQS:</strong> Confirmatory factor analysis
              and structural model estimated with the EQS program (Bentler, 1989) using maximum
              likelihood estimation on the covariance matrix, testing the hypothesized causal
              relationships directly.
            </li>
            <li>
              <strong>Model fit assessment:</strong> Structural model fit (Figure 3, p. 363):
              chi-square = 116.76, df = 68, p &lt; .001; chi-square/df = 1.717; NFI = 0.883, NNFI =
              0.928, CFI = 0.946. All five hypothesized paths were significant (p &lt; .01). The
              model explained 41 percent of continuance intention variance, 33 percent of
              satisfaction variance, and 20 percent of perceived usefulness variance.
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
              <strong>Technology context limitation:</strong> Original validation focused
              specifically on online banking, a relatively mature technology with clear performance
              outcomes. Generalization to emerging technologies, complex enterprise systems, or
              systems with ambiguous performance requires investigation.
            </li>
            <li>
              <strong>Single technology study:</strong> While expectation-confirmation theory
              generalizes across consumer products, information systems vary dramatically in
              complexity, interface design, and performance tangibility. Different IS types may show
              different confirmation-satisfaction-continuance relationships.
            </li>
            <li>
              <strong>Voluntary usage context:</strong> Online banking represents primarily
              voluntary technology use. Applicability to mandatory enterprise system implementations
              where organizational requirements override personal continuance decisions requires
              clarification.
            </li>
            <li>
              <strong>U.S. sample limitations:</strong> Single U.S. study limits generalization to
              international contexts where expectation formation, service quality expectations, and
              satisfaction drivers vary culturally.
            </li>
            <li>
              <strong>Cross-domain generalization:</strong> Model validated in consumer financial
              services context. Generalization to business-to-business systems, social media
              platforms, or professional tools requires empirical confirmation.
            </li>
            <li>
              <strong>Temporal boundary:</strong> Study conducted in early 2000s when online banking
              was novel. Contemporary technology landscape with ubiquitous digital services and high
              user expectations may show different confirmation and satisfaction dynamics.
            </li>
            <li>
              <strong>Experience level variation:</strong> Model not tested across user experience
              levels. Confirmation and satisfaction effects may differ between novice users forming
              initial expectations and experienced users with established system familiarity.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model directly addresses a critical gap in understanding
            technology adoption barriers by explaining why initial adoption often fails to translate
            into sustained technology use. Organizations frequently encounter situations where
            technology implementations appear successful in adoption metrics yet show declining
            usage rates within months. ECM reveals that post-adoption continuance involves different
            psychological mechanisms than initial adoption, requiring distinct management
            strategies. By identifying confirmation of expectations as a continuance driver, the
            model reveals that technology discontinuance often stems not from technology
            deficiencies but from unmet expectations created during adoption phases.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Sustained Technology Use Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Expectation-performance gaps:</strong> When actual system performance falls
              short of pre-adoption expectations, users experience negative confirmation, reducing
              satisfaction and continuance likelihood.
            </li>
            <li>
              <strong>Oversold adoption claims:</strong> Marketing or training communications
              promising performance improvements that systems fail to deliver create negative
              confirmation and user dissatisfaction.
            </li>
            <li>
              <strong>Low perceived post-adoption usefulness:</strong> Even if expectations were
              moderate, if users do not perceive ongoing value from continued use, continuance
              intention remains low.
            </li>
            <li>
              <strong>Hidden implementation costs:</strong> When actual usage time requirements,
              learning demands, or integration challenges exceed expectations, users experience
              dissatisfaction and discontinuance intentions.
            </li>
            <li>
              <strong>System reliability issues:</strong> Performance problems, downtime, or data
              accuracy issues create negative confirmation, undermining belief that system delivers
              expected benefits.
            </li>
            <li>
              <strong>Inadequate user support post-adoption:</strong> When implementation support
              diminishes after initial adoption, users struggle to realize expected benefits,
              reducing satisfaction.
            </li>
            <li>
              <strong>Misaligned expectations across user populations:</strong> Different user
              groups with divergent expectations experience different confirmation patterns, with
              some discontinuing despite successful implementation for others.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Manage expectations carefully during adoption:</strong> Provide realistic,
              evidence-based information about what systems will and will not accomplish rather than
              overselling promised benefits.
            </li>
            <li>
              <strong>Set achievable performance targets:</strong> Define and communicate specific,
              measurable benefits users can expect. Deliver results that meet or exceed these
              defined targets.
            </li>
            <li>
              <strong>Measure actual performance systematically:</strong> Conduct
              post-implementation performance assessments comparing actual to expected outcomes.
              Share results demonstrating that systems deliver expected benefits.
            </li>
            <li>
              <strong>Maintain post-adoption support:</strong> Continue training, support, and
              optimization efforts beyond initial implementation. This enables users to achieve full
              expected benefits, increasing confirmation and satisfaction.
            </li>
            <li>
              <strong>Create feedback loops:</strong> Regularly solicit user feedback on
              confirmation of expectations, identifying gaps early before users make discontinuance
              decisions.
            </li>
            <li>
              <strong>Address system reliability and performance:</strong> Ensure systems perform
              reliably and deliver promised functionality. Technical problems create powerful
              negative confirmation effects.
            </li>
            <li>
              <strong>Segment user populations by expectations:</strong> Different users may have
              different expectations. Tailor support and messaging to ensure each segment achieves
              relevant confirmation.
            </li>
            <li>
              <strong>Distinguish adoption success from continuance success:</strong> Recognize that
              initial adoption metrics do not guarantee sustained usage. Implement post-adoption
              measurement and management programs addressing continuance specifically.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Expectation-Confirmation Model established an influential post-adoption research
            stream:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>ECM extensions and modifications:</strong> Numerous researchers have extended
              ECM by incorporating additional post-adoption factors including habit formation,
              switching costs, social influences, and system updates.
            </li>
            <li>
              <strong>IS continuance research stream:</strong> ECM spawned entire research domain
              examining post-adoption phenomena including extended ECM models, habit-based
              continuance, and discontinuance drivers.
            </li>
            <li>
              <strong>Mobile and consumer technology continuance:</strong> Researchers applied ECM
              to smartphone applications, social media, cloud services, and consumer technology to
              understand what drives continued adoption.
            </li>
            <li>
              <strong>Online service continuance:</strong> ECM became foundational model for
              understanding continuance of online services including e-commerce, streaming, social
              networks, and digital platforms.
            </li>
            <li>
              <strong>Enterprise system continuance:</strong> Organizational researchers adapted ECM
              to examine post-implementation continuance in mandatory organizational technology
              contexts including ERP systems.
            </li>
            <li>
              <strong>Habit and automaticity in continuance:</strong> Later research integrated ECM
              with habit formation theory, demonstrating that habit becomes stronger continuance
              driver than satisfaction as experience accumulates.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-bhattacherjee-2001">
              Bhattacherjee, A. (2001). Understanding information systems continuance: An
              expectation-confirmation model. <em>MIS Quarterly</em>, 25(3), 351-370.{' '}
              <a
                href="https://doi.org/10.2307/3250921"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.2307/3250921
              </a>
            </li>
            <li id="ref-oliver-1980">
              Oliver, R. L. (1980). A cognitive model of the antecedents and consequences of
              satisfaction decisions. <em>Journal of Marketing Research</em>, 17(4), 460-469.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-oliver-1980-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩
                </a>
              </span>{' '}
              <a
                href="https://doi.org/10.1177/002224378001700405"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabs-teal-deep hover:underline"
              >
                https://doi.org/10.1177/002224378001700405
              </a>
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
                  ↩
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
            <li id="ref-oliver-1977">
              Oliver, R. L. (1977). Effect of expectation and disconfirmation on post-exposure
              product evaluations: An alternative interpretation.{' '}
              <em>Journal of Applied Psychology</em>, 62(4), 480-486.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-oliver-1977-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                >
                  ↩
                </a>
              </span>
            </li>
            <li id="ref-cronin-1992">
              Cronin, J. J., &amp; Taylor, S. A. (1992). Measuring service quality: A reexamination
              and extension. <em>Journal of Marketing</em>, 56(3), 55-68.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-cronin-1992-1"
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
            <li id="ref-venkatesh-2000">
              Venkatesh, V., &amp; Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. <em>Management Science</em>, 46(2),
              186-204.
            </li>
            <li id="ref-bhattacherjee-2004">
              Bhattacherjee, A., &amp; Premkumar, G. (2004). Understanding changes in belief and
              attitude toward information technology usage: A study of switch users.
              <em>MIS Quarterly</em>, 28(4), 625-641.
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.{' '}
              <a
                href="https://doi.org/10.2307/30036540"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://doi.org/10.2307/30036540
              </a>
            </li>
            {/* prettier-ignore */}
            <li id="ref-delone-2003">DeLone, W. H., &amp; McLean, E. R. (2003). The DeLone and McLean model of information systems success: A ten-year update. <em>Journal of Management Information Systems</em>, 19(4), 9-30. <a href="https://doi.org/10.1080/07421222.2003.11045748" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">https://doi.org/10.1080/07421222.2003.11045748</a></li>
            <li id="ref-limayem-2007">
              Limayem, M., Hirt, S. G., &amp; Cheung, C. M. (2007). How habit limits the prediction
              of usage: The case of MS Word.{' '}
              <em>ACM SIGMIS Database: the DATABASE for Advances in Information Systems</em>, 38(4),
              29-46.{' '}
              <a
                href="https://doi.org/10.2307/25148817"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://doi.org/10.2307/25148817
              </a>
            </li>
          </ol>
        </section>

        {/* Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Technology Acceptance Model 2 (Venkatesh &amp; Davis)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-15-unified-theory-utaut-venkatesh-2003"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Unified Theory of Acceptance and Use of Technology (Venkatesh et al.) &rarr;
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
