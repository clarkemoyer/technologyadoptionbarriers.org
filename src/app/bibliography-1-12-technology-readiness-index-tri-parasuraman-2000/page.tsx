import type { Metadata } from 'next'
import type { ReactNode } from 'react'
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

type BackLink = { href: string; label: string }

type ReferenceEntry = {
  id: string
  text: ReactNode
  backLink?: BackLink
  doi?: string
}

const RefEntry = ({ entry }: { entry: ReferenceEntry }) => (
  <li id={entry.id}>
    {entry.text}
    {entry.backLink && (
      <span className="text-xs ml-1">
        <a
          href={entry.backLink.href}
          className="text-tabs-teal-deep hover:underline"
          aria-label={entry.backLink.label}
        >
          {'\u21A9'}
        </a>
      </span>
    )}
    {entry.doi && (
      <>
        {' '}
        <a
          href={entry.doi}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tabs-teal-deep hover:underline"
        >
          {entry.doi}
        </a>
      </>
    )}
  </li>
)

const REFERENCES: ReferenceEntry[] = [
  {
    id: 'ref-parasuraman-2000',
    text: (
      <>
        Parasuraman, A. (2000). Technology readiness index (TRI): A multiple-item scale to measure
        readiness to embrace new technologies. <em>Journal of Service Research</em>, 2(4), 307-320.
      </>
    ),
    doi: 'https://doi.org/10.1177/109467050024001',
  },
  {
    id: 'ref-rogers-1995',
    text: <>Rogers, E. M. (1995). Diffusion of innovations (4th ed.). Free Press.</>,
    backLink: { href: '#cite-ref-rogers-1995-1', label: 'Back to citation' },
  },
  {
    id: 'ref-davis-1989',
    text: (
      <>
        Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of
        information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
      </>
    ),
    backLink: { href: '#cite-ref-davis-1989-1', label: 'Back to citation' },
    doi: 'https://doi.org/10.2307/249008',
  },
  {
    id: 'ref-rotter-1966',
    text: (
      <>
        Rotter, J. B. (1966). Generalized expectancies for internal versus external control of
        reinforcement. <em>Psychological Monographs: General and Applied</em>, 80(1), 1-28.
      </>
    ),
    backLink: { href: '#cite-ref-rotter-1966-1', label: 'Back to citation' },
  },
  {
    id: 'ref-agarwal-1998',
    text: (
      <>
        Agarwal, R., &amp; Prasad, J. (1998). A conceptual and operational definition of personal
        innovativeness in the domain of information technology.{' '}
        <em>Information Systems Research</em>, 9(2), 204-215.
      </>
    ),
    backLink: { href: '#cite-ref-agarwal-1998-1', label: 'Back to citation' },
  },
]

const FURTHER_READING: ReferenceEntry[] = [
  {
    id: 'ref-meuter-1998',
    text: (
      <>
        Meuter, M. L., &amp; Bitner, M. J. (1998). Consumer attitudes toward self-service
        technologies. <em>Journal of Retailing</em>, 74(2), 161-183.
      </>
    ),
    backLink: { href: '#cite-ref-meuter-1998-1', label: 'Back to citation' },
  },
  {
    id: 'ref-parasuraman-2015',
    text: (
      <>
        Parasuraman, A., &amp; Colby, C. L. (2015). An updated and streamlined technology readiness
        index: TRI 2.0. <em>Journal of Service Research</em>, 18(1), 59-74.
      </>
    ),
    doi: 'https://doi.org/10.1177/1094670514539730',
  },
  {
    id: 'ref-venkatesh-2003',
    text: (
      <>
        Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance of
        information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3), 425-478.
      </>
    ),
    doi: 'https://doi.org/10.2307/30036540',
  },
  {
    id: 'ref-fishbein-1975',
    text: (
      <>
        Fishbein, M., &amp; Ajzen, I. (1975).{' '}
        <em>Belief, attitude, intention, and behavior: An introduction to theory and research</em>.
        Addison-Wesley.
      </>
    ),
  },
  {
    id: 'ref-goodhue-1995',
    text: (
      <>
        Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
        performance. <em>MIS Quarterly</em>, 19(2), 213-236.
      </>
    ),
    doi: 'https://doi.org/10.2307/249689',
  },
  {
    id: 'ref-lin-2007',
    text: (
      <>
        Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (2007). Integrating technology readiness into
        technology acceptance: The TRAM model. <em>Psychology &amp; Marketing</em>, 24(7).
      </>
    ),
    doi: 'https://doi.org/10.1002/mar.20177',
  },
]

export const metadata: Metadata = {
  title: 'Bibliography: Technology Readiness Index (TRI) - Parasuraman (2000)',
  description:
    'In-depth exploration of the Technology Readiness Index (TRI), a foundational scale measuring individual predispositions to embrace or resist technology innovations across four dimensions.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Technology Readiness Index (TRI) - Parasuraman (2000)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Technology Readiness Index
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TRI
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Psychological Readiness and Propensity to
              Adopt Technology
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Consumer Behavior, Service Marketing, Technology
              Adoption
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> A. Parasuraman
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2000
            </p>
            <p>
              <strong>Official Title:</strong> Technology readiness index (TRI): A multiple-item
              scale to measure readiness to embrace new technologies
            </p>
            <p>
              <strong>Journal:</strong> Journal of Service Research
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 2, No. 4
            </p>
            <p>
              <strong>Pages:</strong> 307-320
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1177/109467050024001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.1177/109467050024001
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
                Parasuraman, A. (
                <a href="#ref-parasuraman-2000" className="text-tabs-teal-deep hover:underline">
                  2000
                </a>
                ). Technology readiness index (TRI): A multiple-item scale to measure readiness to
                embrace new technologies. <em>Journal of Service Research</em>, 2(4), 307-320.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Parasuraman, A. 2000. &ldquo;Technology Readiness Index (TRI): A Multiple-Item Scale
                to Measure Readiness to Embrace New Technologies.&rdquo;{' '}
                <em>Journal of Service Research</em> 2, no. 4: 307-320.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Parasuraman developed the Technology Readiness Index to address a fundamental gap in
            understanding why individuals vary dramatically in their willingness to embrace new
            technologies. Prior research had focused extensively on technology characteristics and
            adoption barriers, but lacked a comprehensive, validated instrument measuring stable
            individual predispositions that influence whether people readily or reluctantly adopt
            innovations. Service companies implementing self-service technologies (telephone
            banking, online shopping, automated customer support) needed frameworks predicting which
            customer segments would embrace these technologies and which would resist.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The author recognized that technology adoption is not solely determined by technology
            features or organizational factors, but significantly shaped by underlying psychological
            traits and beliefs individuals bring to adoption situations. Some people are generally
            optimistic about technology, seeking the benefits innovations provide. Others harbor
            skepticism, concern about complexity, anxiety about privacy and security, or discomfort
            with impersonal technology interactions. The TRI was created to operationalize these
            distinct psychological dimensions into a standardized, psychometrically sound
            measurement instrument.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Parasuraman conducted extensive qualitative and quantitative research with national
            telephone samples of 1,000 United States adults, exploring beliefs and attitudes toward
            various technology categories. Through factor analysis, the author identified four core
            dimensions underlying technology readiness, developed reliable measurement scales, and
            validated the instrument across diverse technology contexts including online banking,
            voice-activated systems, and e-commerce. The resulting 36-item TRI became foundational
            for technology adoption research and marketing segmentation.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index operationalizes technology readiness through four primary
            psychological dimensions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Optimism:</strong> A positive view of technology and the belief that it
              increases control, provides flexibility, and improves quality of life. Optimistic
              individuals see technology as offering benefits and enhancing effectiveness in
              personal and professional activities.
            </li>
            <li>
              <strong>Innovativeness:</strong> A tendency to be among the first to try new
              technologies and eagerness to experiment with novel applications. Innovative
              individuals enjoy exploring technological possibilities and seeking cutting-edge
              solutions.
            </li>
            <li>
              <strong>Discomfort:</strong> A perceived lack of control over technology and feeling
              overwhelmed by its complexity. Individuals high in discomfort believe technology is
              difficult to understand, tends to fail unexpectedly, and requires constant effort to
              master.
            </li>
            <li>
              <strong>Insecurity:</strong> Skepticism about technology safety, concerns regarding
              potential negative consequences, and distrust of technology providers. Individuals
              high in insecurity worry about privacy violations, information security risks, and
              unreliability of technology systems.
            </li>
          </ul>
          <p className={`${PARAGRAPH_CLASSES} mt-4`}>
            The four dimensions combine to form a net readiness score: Optimism and Innovativeness
            are positive enablers (contributors to readiness), while Discomfort and Insecurity are
            negative inhibitors (detractors from readiness). The index measures individual
            differences in predisposition to embrace technology broadly, not specific technologies
            in isolation.
          </p>
        </section>

        {/* 6. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index (TRI) is a psychometric scale. Parasuraman (2000)
            develops a 36-item Likert instrument measuring a general personality-trait construct
            of technology readiness, composed of four dimensions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Optimism (contributor):</strong> A positive view of technology and a
              belief that it offers people increased control, flexibility, and efficiency.
              Measured via multi-item scale.
            </li>
            <li>
              <strong>Innovativeness (contributor):</strong> A tendency to be a technology
              pioneer and thought leader.
            </li>
            <li>
              <strong>Discomfort (inhibitor):</strong> A perceived lack of control over
              technology and a feeling of being overwhelmed by it.
            </li>
            <li>
              <strong>Insecurity (inhibitor):</strong> Distrust of technology and skepticism
              about its ability to work properly, often tied to privacy and transaction-integrity
              concerns.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            TRI produces a composite technology-readiness score and four subscale scores. The
            2000 instrument was developed and validated with a nationally representative
            US sample (&gt;1,000 consumers); Parasuraman &amp; Colby subsequently produced TRI 2.0
            (2015, bibliography 1-21) - a shorter 16-item instrument. The original 36-item scale
            reports Cronbach&rsquo;s alpha values above conventional thresholds for each subscale
            in the validation sample.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index built upon foundational frameworks from technology
            adoption and consumer psychology:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Diffusion of Innovation theory (
                <a
                  id="cite-ref-rogers-1995-1"
                  href="#ref-rogers-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rogers, 1995
                </a>
                ):
              </strong>{' '}
              Established categories of adopters (innovators, early adopters, early majority, late
              majority, laggards) based on individual characteristics and risk tolerance. TRI
              operationalizes these differences more precisely through multi-dimensional
              measurement.
            </li>
            <li>
              <strong>
                Locus of control theory (
                <a
                  id="cite-ref-rotter-1966-1"
                  href="#ref-rotter-1966"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rotter, 1966
                </a>
                ):
              </strong>{' '}
              Provided psychological foundations for understanding whether individuals perceive
              themselves as controlling technology outcomes (internal locus) or believing technology
              controls them (external locus).
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
              Established perceived usefulness and perceived ease of use as adoption predictors, but
              did not fully explore underlying personality dispositions driving these perceptions.
            </li>
            <li>
              <strong>
                Technology Anxiety research (
                <a
                  id="cite-ref-meuter-1998-1"
                  href="#ref-meuter-1998"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Meuter &amp; Bitner
                </a>
                ):
              </strong>{' '}
              Highlighted that consumer anxiety toward technology is multidimensional, encompassing
              both competence concerns and security concerns.
            </li>
            <li>
              <strong>
                Personal Innovativeness in IT research (
                <a
                  id="cite-ref-agarwal-1998-1"
                  href="#ref-agarwal-1998"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Agarwal &amp; Prasad, 1998
                </a>
                ):
              </strong>{' '}
              Demonstrated that individual innovativeness toward information technology is a stable
              personality trait predicting adoption across systems.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index is a psychometric instrument measuring four dimensions of
            individual disposition toward technology innovation. The original 36-item scale presents
            statements describing technology-related beliefs and attitudes, with respondents rating
            agreement on five-point Likert scales. The instrument can be administered independently
            or embedded within broader technology adoption studies. Respondents receive dimensional
            scores for Optimism, Innovativeness, Discomfort, and Insecurity, plus a composite
            Technology Readiness score computed by summing enablers (Optimism + Innovativeness) and
            subtracting inhibitors (Discomfort + Insecurity).
          </p>

          <h3 className={H3_CLASSES}>What does the model measure?</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Optimism (10 items):</strong> Belief that technology increases control and
              effectiveness, improves access to information, and enhances quality of life through
              greater flexibility and convenience.
            </li>
            <li>
              <strong>Innovativeness (7 items):</strong> Willingness to try new technologies early,
              excitement about exploring innovations, and preference for being among first adopters
              rather than waiting for established maturity.
            </li>
            <li>
              <strong>Discomfort (10 items):</strong> Perceived difficulty in understanding and
              learning technology, belief that systems are unreliable or prone to failure, and
              feeling overwhelmed by technical complexity.
            </li>
            <li>
              <strong>Insecurity (9 items):</strong> Concerns about privacy, information security,
              fraud, and potential misuse of personal information through technology systems and
              providers.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Comprehensive dimensional framework:</strong> Captures four theoretically
              distinct psychological dimensions rather than unidimensional technology acceptance or
              anxiety measures.
            </li>
            <li>
              <strong>Robust psychometric properties:</strong> 36-item scale demonstrates
              Cronbach&rsquo;s alpha values of .74-.83 across the four dimensions (Table 3),
              indicating acceptable to good internal consistency and measurement reliability.
            </li>
            <li>
              <strong>Large representative sample:</strong> Developed and validated with 1,000 U.S.
              adults representing diverse demographics, providing strong generalizability
              foundation.
            </li>
            <li>
              <strong>Cross-technology applicability:</strong> Validated across multiple technology
              categories (online banking, voice-activated systems, e-commerce, information
              appliances), demonstrating broad relevance.
            </li>
            <li>
              <strong>Balanced dimension coverage:</strong> Includes both positive enablers
              (Optimism, Innovativeness) and negative inhibitors (Discomfort, Insecurity), providing
              nuanced readiness assessment.
            </li>
            <li>
              <strong>Practical segmentation utility:</strong> Enables market segmentation and
              targeting, allowing organizations to identify which customer segments are likely to
              adopt self-service technologies.
            </li>
            <li>
              <strong>Theoretical grounding:</strong> Built on well-established psychological
              theories of innovation adoption, locus of control, and anxiety measurement.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Length and respondent burden:</strong> 36-item instrument requires substantial
              completion time, potentially limiting use in time-constrained survey contexts or
              reducing response rates in online panels.
            </li>
            <li>
              <strong>Technology-specific limitations:</strong> While intended as general, TRI may
              show different factor structures across technology categories (consumer electronics,
              medical devices, business systems).
            </li>
            <li>
              <strong>Cultural generalizability:</strong> Developed with U.S. samples; applicability
              to other cultures with different technology adoption patterns, privacy concerns, and
              risk perceptions requires validation.
            </li>
            <li>
              <strong>Temporal stability unclear:</strong> Cross-sectional validation does not
              confirm whether technology readiness is truly stable over time or changes with
              experience and technology maturation.
            </li>
            <li>
              <strong>Dimensionality debate:</strong> Some research suggests alternative factor
              structures, with Discomfort and Insecurity sometimes loading on single inhibitor
              factor rather than separate dimensions.
            </li>
            <li>
              <strong>Behavioral prediction limitations:</strong> TRI predicts intentions and
              self-reported beliefs better than actual system usage behavior, which may diverge from
              readiness perceptions.
            </li>
            <li>
              <strong>Social desirability bias:</strong> Self-reported scales may suffer from
              respondents portraying themselves as more innovative or less anxious than actual
              behavior demonstrates.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Personality trait operationalization:</strong> Translated abstract individual
              differences in technology adoption propensity into concrete, measurable psychological
              dimensions with strong psychometric properties.
            </li>
            <li>
              <strong>Multidimensional readiness concept:</strong> Demonstrated that technology
              readiness is not unidimensional (acceptance/resistance) but comprises distinct
              psychological components (optimism, innovativeness, discomfort, insecurity).
            </li>
            <li>
              <strong>Enabler-inhibitor framework:</strong> Introduced the insight that readiness
              results from balancing positive dispositions (enablers) against negative concerns
              (inhibitors) rather than simple accumulation.
            </li>
            <li>
              <strong>Cross-technology generalization:</strong> Provided evidence that readiness is
              a stable individual characteristic generalizing across diverse technology categories
              rather than technology-specific.
            </li>
            <li>
              <strong>Market segmentation tool:</strong> Enabled organizations to segment customer
              populations and predict receptiveness to self-service technology initiatives based on
              readiness profiles.
            </li>
            <li>
              <strong>Theoretical advancement:</strong> Connected consumer behavior and innovation
              adoption literatures by demonstrating that individual personality traits significantly
              influence technology adoption trajectories.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Parasuraman employed rigorous psychometric development and validation procedures:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Exploratory factor analysis:</strong> Used EFA on large national sample data
              to identify underlying dimensional structure, with clear factor separation supporting
              four-dimension model.
            </li>
            <li>
              <strong>Internal consistency:</strong> Reported Cronbach&rsquo;s alpha coefficients of
              .74-.83 across dimensions, exceeding .70 threshold for acceptable scale reliability.
            </li>
            <li>
              <strong>Item-total correlations:</strong> All items showed appropriate correlations
              with their respective dimension scores, indicating items measure intended constructs.
            </li>
            <li>
              <strong>Discriminant validity:</strong> Dimensions showed moderate correlations (not
              excessively high), supporting distinctness of Optimism, Innovativeness, Discomfort,
              and Insecurity as separate constructs.
            </li>
            <li>
              <strong>Convergent validity:</strong> Dimensions showed expected correlations with
              technology adoption intentions and usage behavior, supporting construct validity.
            </li>
            <li>
              <strong>Cross-sample validation:</strong> Scale validated across multiple technology
              contexts (banking, retail, information appliances), showing consistency of factor
              structure.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations require careful interpretation of generalizability:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>U.S.-centric sample:</strong> 1,000 U.S. adults provides strong U.S.
              generalizability but limited evidence regarding applicability in other cultural
              contexts with different technology adoption norms, privacy concerns, and innovation
              orientations.
            </li>
            <li>
              <strong>Temporal generalizability:</strong> Year 2000 U.S. technology context (early
              e-commerce, emerging online banking) differs substantially from contemporary
              technology landscape. Readiness dimensions may shift with technology maturation and
              ubiquity.
            </li>
            <li>
              <strong>Technology category generalization:</strong> While validated across multiple
              technologies, strongest evidence exists for consumer-facing self-service systems.
              Generalization to enterprise systems, specialized professional tools, or highly
              technical applications requires investigation.
            </li>
            <li>
              <strong>Demographic representation:</strong> National probability samples in 2000 had
              varying internet access and technology exposure. Digital divides may affect readiness
              distributions in current populations.
            </li>
            <li>
              <strong>Behavioral prediction:</strong> TRI predicts intentions and beliefs reliably
              but shows moderate correlations with actual technology usage behavior, limiting
              external validity for behavioral outcomes.
            </li>
            <li>
              <strong>Longitudinal stability:</strong> Cross-sectional design does not establish
              whether readiness scores remain stable over time or fluctuate with technology
              experience, age, or major life transitions.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index directly identifies psychological barriers and enablers
            to technology adoption rooted in stable individual characteristics. Organizations
            implementing new technologies encounter dramatically different receptiveness across
            populations, and TRI provides a framework for understanding and segmenting based on
            underlying readiness profiles.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Low optimism about technology benefits:</strong> Individuals skeptical that
              technologies improve effectiveness or quality of life show reduced adoption intentions
              regardless of features.
            </li>
            <li>
              <strong>Low innovativeness and late-adopter disposition:</strong> Individuals
              preferring proven, mature technologies over innovations avoid early adoption
              opportunities and require extensive evidence before embracing change.
            </li>
            <li>
              <strong>High discomfort with complexity:</strong> Individuals perceiving technology as
              difficult, unreliable, or overwhelming create support demands and show lower
              utilization of advanced features.
            </li>
            <li>
              <strong>High insecurity and privacy concerns:</strong> Individuals worrying about data
              security, privacy violations, and provider trustworthiness resist technology adoption
              despite objective security measures.
            </li>
            <li>
              <strong>Lack of control perception:</strong> Individuals with external locus of
              control regarding technology outcomes (believing technology controls them) show higher
              anxiety and adoption resistance.
            </li>
            <li>
              <strong>General technology skepticism:</strong> Individuals combining low optimism
              with high discomfort and insecurity represent fundamentally low readiness segments
              resisting adoption across technology categories.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Segment populations by readiness:</strong> Assess technology readiness in
              target populations to identify which segments are naturally receptive and which
              require support.
            </li>
            <li>
              <strong>Address discomfort through training:</strong> Provide comprehensive, hands-on
              training reducing perceived complexity for high-discomfort segments, focusing on
              building confidence and control perception.
            </li>
            <li>
              <strong>Communicate security and trust:</strong> For high-insecurity segments,
              prominently communicate privacy protections, security measures, and provider
              reputation to reduce adoption barriers.
            </li>
            <li>
              <strong>Emphasize benefits and business case:</strong> Build optimism through clear
              evidence that technology improves job performance, saves time, and enhances quality of
              work.
            </li>
            <li>
              <strong>Create early adopter champions:</strong> Leverage high-innovativeness
              individuals as visible champions and peer mentors, building social proof and reducing
              uncertainty for cautious segments.
            </li>
            <li>
              <strong>Tailor change management approaches:</strong> Use different adoption
              strategies for different readiness segments rather than one-size-fits-all
              implementations.
            </li>
            <li>
              <strong>Build perceived control:</strong> Design systems with clear feedback,
              transparent operations, and user control mechanisms that build perception of managing
              technology rather than being controlled by it.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Technology Readiness Index significantly influenced subsequent adoption research:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Technology Readiness Index 2.0 (Parasuraman &amp;{' '}
                <Link
                  href="/bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Colby, 2015
                </Link>
                ):
              </strong>{' '}
              Updated TRI with revised items and validation on contemporary technology landscape,
              maintaining four-dimension structure while improving item quality.
            </li>
            <li>
              <strong>Personal Innovativeness in IT extensions:</strong> Researchers incorporated
              TRI readiness dimensions into PIIT models, combining personality traits with specific
              information technology acceptance.
            </li>
            <li>
              <strong>UTAUT moderators expansion:</strong> UTAUT and related models incorporated
              technology readiness as potential moderator of adoption relationships alongside age,
              gender, and experience.
            </li>
            <li>
              <strong>Customer experience research:</strong> Service marketing researchers used TRI
              segmentation to predict receptiveness to self-service technologies, informational
              kiosks, and digital customer channels.
            </li>
            <li>
              <strong>Virtual reality adoption studies:</strong> Contemporary research applied TRI
              readiness dimensions to understand adoption of emerging technologies including
              augmented reality, virtual reality, and artificial intelligence.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            {REFERENCES.map((entry) => (
              <RefEntry key={entry.id} entry={entry} />
            ))}
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            {FURTHER_READING.map((entry) => (
              <RefEntry key={entry.id} entry={entry} />
            ))}
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Task-Technology Fit (Goodhue &amp; Thompson)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Technology Acceptance Model 2 (Venkatesh &amp; Davis) &rarr;
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
