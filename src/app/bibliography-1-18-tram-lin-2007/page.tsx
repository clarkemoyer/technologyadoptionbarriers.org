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
  title: 'Bibliography: Technology Readiness and Acceptance Model (TRAM) - Lin et al. (2007)',
  description:
    'Comprehensive overview of the Technology Readiness and Acceptance Model (TRAM), integrating personality dimensions of technology readiness with technology acceptance constructs to predict technology adoption across demographic segments.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Technology Readiness and Acceptance Model (TRAM) - Lin et al. (2007)
        </h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Technology Readiness and Acceptance Model
            </p>
            <p>
              <strong>Model Abbreviation:</strong> TRAM
            </p>
            <p>
              <strong>Target of Model:</strong> Integration of technology readiness personality
              dimensions with technology acceptance constructs to predict adoption intention and
              technology acceptance across user populations
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Information Systems, Technology Adoption,
              Consumer Behavior, Marketing Psychology
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Chien-Hsin Lin, Hsin-Yu Shih, and Peter J. Sher
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2007
            </p>
            <p>
              <strong>Official Title:</strong> Integrating technology readiness into technology
              acceptance: The TRAM model
            </p>
            <p>
              <strong>Journal:</strong> Psychology &amp; Marketing
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 24, No. 7
            </p>
            <p>
              <strong>Pages:</strong> 641-657
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1002/mar.20177"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.1002/mar.20177
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
                Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (
                <a href="#ref-lin-2007" className="text-tabs-teal-deep hover:underline">
                  2007
                </a>
                ). Integrating technology readiness into technology acceptance: The TRAM model.{' '}
                <em>Psychology &amp; Marketing</em>, 24(7), 641-657.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Lin, Chien-Hsin, Hsin-Yu Shih, and Peter J. Sher. 2007. &ldquo;Integrating
                Technology Readiness into Technology Acceptance: The TRAM Model.&rdquo;
                <em>Psychology &amp; Marketing</em> 24, no. 7: 641-657.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Lin, Shih, and Sher developed the Technology Readiness and Acceptance Model to address a
            significant gap in technology adoption research. The Technology Acceptance Model had
            established that perceived usefulness and perceived ease of use predicted adoption
            intention, successfully explaining significant variance in acceptance behavior. However,
            TAM researchers had noted that individual differences in predisposition toward
            technology affected how users processed usefulness and ease of use perceptions. Some
            users appeared naturally optimistic about technology benefits and eager to learn new
            systems, while others remained skeptical, anxious, and resistant despite clear
            performance advantages. These individual differences seemed to influence whether users
            would adopt technology even when presented with identical benefits and usability
            information.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Parasuraman&rsquo;s Technology Readiness Index offered a complementary perspective by
            measuring personality dimensions that shape technology adoption orientation: optimism
            (positive attitudes toward technology), innovativeness (propensity to adopt
            innovations), discomfort (psychological discomfort with technology), and insecurity
            (skepticism about technology capabilities). The TRI identified people high in optimism
            and innovativeness and low in discomfort and insecurity as more technology-ready.
            However, the TRI focused on trait-level predispositions without explicitly integrating
            with behavioral acceptance mechanisms like perceived usefulness and ease of use. Lin,
            Shih, and Sher recognized that technology readiness and technology acceptance were
            complementary but independent frameworks: readiness reflected personality traits shaping
            general technology orientation, while acceptance reflected situation-specific
            evaluations of particular technologies.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors developed TRAM to bridge these frameworks by hypothesizing that technology
            readiness dimensions would shape how individuals formed perceived usefulness and
            perceived ease of use judgments. Specifically, they proposed that users high in optimism
            and innovativeness would more readily perceive technologies as useful, while users high
            in discomfort and insecurity would perceive greater complexity and difficulty. By
            integrating readiness and acceptance, TRAM would provide more complete explanation of
            technology adoption, capturing both personality-driven predispositions and
            situation-specific technology evaluations. Testing occurred via Web-based surveys in
            March-April 2004 with 406 members of online investment discussion forums in Taiwan,
            examining adoption of online stock trading systems - a context where readiness
            personality dimensions might significantly shape perceptions of utility and usability.
          </p>
        </section>

        {/* 5. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM measures seven latent constructs using 7-point Likert scales (strongly disagree = 1
            to strongly agree = 7). Measures originally in English were translated into Chinese and
            back-translated (Brislin, 1980) for the Taiwan-based Web survey. Cronbach&rsquo;s alpha
            reliabilities were strong across all constructs (all &ge;0.90):
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Optimism</strong> (10 items, α=0.95): From Parasuraman&rsquo;s (2000)
              Technology Readiness Index (TRI); positive view of technology and its control,
              flexibility, and efficiency benefits.
            </li>
            <li>
              <strong>Innovativeness</strong> (7 items, α=0.95): From TRI; tendency to be a
              technology pioneer and thought leader.
            </li>
            <li>
              <strong>Discomfort</strong> (10 items, α=0.90): From TRI; perception of lack of
              control over technology and feeling overwhelmed.
            </li>
            <li>
              <strong>Insecurity</strong> (9 items, α=0.92): From TRI; distrust of technology and
              skepticism about its ability to work properly.
            </li>
            <li>
              <strong>Perceived Usefulness</strong> (6 items, α=0.95): Adapted from Davis (1989);
              belief that the e-service enhances performance.
            </li>
            <li>
              <strong>Perceived Ease of Use</strong> (6 items, α=0.96): Adapted from Davis (1989);
              belief that using the e-service is free of effort.
            </li>
            <li>
              <strong>Use Intention</strong> (2 items, α=0.92): Study-specific items regarding
              intent to use an online stock trading system on the next trade and in the next few
              months.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Confirmatory factor analysis in Amos 4 indicated adequate fit: GFI=0.90, CFI=0.96,
            TLI=0.95, RMSEA=0.07, χ²(126)=404.81, p&lt;0.01. Average standardized factor loading was
            0.80 with all loadings highly significant (p&lt;0.01); discriminant validity was
            confirmed by confidence-interval tests that excluded 1.0 for each pairwise construct
            correlation (Anderson &amp; Gerbing, 1988).
          </p>
        </section>

        {/* 6. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM integrates technology readiness personality dimensions with technology acceptance
            mechanisms:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Optimism:</strong> A personality dimension reflecting positive attitudes
              toward technology, belief that technology offers increased control, flexibility, and
              efficiency, and confidence that technology will provide benefits. Optimistic
              individuals perceive greater usefulness in technologies and are more receptive to
              adoption opportunities.
            </li>
            <li>
              <strong>Innovativeness:</strong> A personality dimension reflecting predisposition to
              adopt innovations, tendency to be among first users of new technologies, and
              willingness to experiment with novel applications. Innovativeness directly relates to
              perceiving new technologies as useful for exploring capabilities and achieving
              performance advantages.
            </li>
            <li>
              <strong>Discomfort:</strong> A personality dimension reflecting psychological
              discomfort when interacting with technology, concerns about losing control or
              understanding, and perception of technology as complex and difficult. Discomfort
              directly increases perception of ease of use barriers and reduces willingness to
              engage with technologies.
            </li>
            <li>
              <strong>Insecurity:</strong> A personality dimension reflecting skepticism about
              technology capabilities, doubts that technology will perform as promised, and concerns
              about security and privacy risks. Insecurity reduces perception of usefulness and
              increases fear that technology adoption will expose users to unacceptable risks.
            </li>
            <li>
              <strong>Perceived Usefulness (TAM):</strong> Individual beliefs that using a
              particular technology will improve job performance or achieve valued outcomes.
              Perceived usefulness represents situation-specific evaluation of technology benefits
              shaped by underlying optimism and innovativeness predispositions.
            </li>
            <li>
              <strong>Perceived Ease of Use (TAM):</strong> Individual beliefs about the degree of
              effort required to learn and operate a technology. Perceived ease of use represents
              situation-specific evaluation of technology complexity shaped by underlying discomfort
              and insecurity predispositions.
            </li>
            <li>
              <strong>Adoption Intention:</strong> The degree to which an individual intends to
              adopt and use technology, determined jointly by perceived usefulness and perceived
              ease of use, which in turn are shaped by technology readiness personality dimensions.
            </li>
          </ul>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>TRAM explicitly builds on two prior frameworks:</p>
          <ul className={BODY_LIST_CLASSES}>
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
              Established perceived usefulness and perceived ease of use as primary predictors of
              adoption intention and behavior. TAM demonstrated that technology-specific beliefs
              about performance benefits and learning requirements predicted acceptance across
              diverse technologies. TRAM incorporates TAM&rsquo;s core mechanisms while adding
              personality-level antecedents.
            </li>
            <li>
              <strong>
                Technology Readiness Index (
                <a
                  id="cite-ref-parasuraman-2000-1"
                  href="#ref-parasuraman-2000"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Parasuraman, 2000
                </a>
                ):
              </strong>{' '}
              Identified four personality dimensions influencing general technology orientation:
              optimism, innovativeness, discomfort, and insecurity. The TRI demonstrated that
              individuals varied systematically in readiness to adopt new technologies based on
              these stable personality traits. TRAM operationalizes TRI dimensions as antecedents
              shaping TAM belief formation.
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
              Foundational framework establishing that behavioral intention determined by attitudes
              and subjective norms predicts actual behavior. Both TAM and TRAM incorporate
              TRA&rsquo;s intention-behavior logic as fundamental mechanism.
            </li>
            <li>
              <strong>
                Consumer Innovation Research (
                <a
                  id="cite-ref-rogers-1995-1"
                  href="#ref-rogers-1995"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rogers, 1995
                </a>
                ):
              </strong>{' '}
              Established that consumer innovativeness predicted adoption of new products and
              services. TRAM draws on this tradition by incorporating innovativeness as personality
              dimension shaping technology adoption.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM proposes that Technology Readiness (TR), treated as a higher-order construct with
            four reflective sub-dimensions (optimism, innovativeness, discomfort, insecurity),
            directly influences how individuals form technology-specific beliefs about usefulness
            and ease of use, which in turn determine adoption intention. The paper (Figure 1, p.646)
            hypothesizes paths from the aggregate TR construct to perceived usefulness (H5) and to
            perceived ease of use (H6), rather than separate paths from each sub-dimension. The
            sub-dimensions serve as indicators of TR: optimism and innovativeness are drivers (more
            TR); discomfort and insecurity are inhibitors (less TR). Perceived usefulness and
            perceived ease of use then predict use intention per the standard TAM mechanisms.
          </p>

          <h3 className={H3_CLASSES}>TRAM Hypotheses (as tested in Lin et al., 2007)</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>H1: TR &rarr; Use Intention (direct):</strong> Consumers&rsquo; technology
              readiness propensities are positively correlated with their intentions to use a
              specific e-service. This direct path is replicated from prior TR research.
            </li>
            <li>
              <strong>H2: Perceived Usefulness &rarr; Use Intention:</strong> Standard TAM path; PU
              positively correlates with intention to use the e-service.
            </li>
            <li>
              <strong>H3: Perceived Ease of Use &rarr; Use Intention:</strong> Standard TAM path;
              PEOU positively correlates with intention to use the e-service.
            </li>
            <li>
              <strong>H4: Perceived Ease of Use &rarr; Perceived Usefulness:</strong> Standard TAM
              path; PEOU positively influences PU.
            </li>
            <li>
              <strong>H5: TR &rarr; Perceived Usefulness:</strong> The paper&rsquo;s focal
              hypothesis. Technology readiness (aggregate construct) positively correlates with
              perceptions of usefulness about a specific e-service.
            </li>
            <li>
              <strong>H6: TR &rarr; Perceived Ease of Use:</strong> The paper&rsquo;s focal
              hypothesis. Technology readiness (aggregate construct) positively correlates with
              perceptions of ease of use about a specific e-service.
            </li>
            <li>
              <strong>H7: Full mediation:</strong> PU and PEOU together completely mediate the
              TR-to-intention relationship, such that the direct H1 path becomes non-significant
              once H5 and H6 are estimated. Tested via Baron and Kenny (1986) mediation procedure
              and Sobel tests.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Results (Trimmed Model, Table 2 p.650)</h3>
          <p className={PARAGRAPH_CLASSES}>
            The trimmed integrated model (with the TR-to-UI path constrained to zero) was preferred
            over the full model on parsimony grounds (Δχ²=1.97, df=1, p=0.16). Standardized path
            coefficients were all significant at p&lt;0.01:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>TR &rarr; PEOU: 0.74 (strongest effect - H6 supported)</li>
            <li>PU &rarr; UI: 0.59 (standard TAM path - H2 supported)</li>
            <li>TR &rarr; PU: 0.52 (H5 supported)</li>
            <li>PEOU &rarr; PU: 0.30 (standard TAM path - H4 supported)</li>
            <li>PEOU &rarr; UI: 0.23 (standard TAM path - H3 supported)</li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Standardized total effects on Use Intention</strong> (p.651): TR = 0.60, PU =
            0.59, PEOU = 0.40. The paper&rsquo;s key insight: TR&rsquo;s effect on intention
            operates <em>primarily through PEOU</em>, not through PU, because TR&rsquo;s direct
            impact on PEOU (0.74) is much stronger than its impact on PU (0.52). The overall
            psychological process is consistent with a TR &rarr; PEOU &rarr; PU &rarr; UI chain of
            causality.
          </p>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Bridges personality and situation-specific factors:</strong> TRAM elegantly
              integrates stable personality dimensions with situation-specific technology beliefs,
              showing how dispositional traits shape evaluations of particular technologies.
            </li>
            <li>
              <strong>Explains individual differences in technology perception:</strong> Model
              accounts for why identical technologies receive different acceptance evaluations from
              different users, rooted in underlying personality differences.
            </li>
            <li>
              <strong>Parsimoniousness with comprehensive coverage:</strong> TRAM adds only four
              personality dimensions to TAM rather than creating entirely new framework, maintaining
              relative simplicity while substantially expanding explanatory scope.
            </li>
            <li>
              <strong>Empirical validation in consumer context:</strong> Testing with 406 Taiwanese
              investors examining online stock trading system adoption demonstrates applicability to
              voluntary consumer adoption contexts, not just organizational mandatory settings.
            </li>
            <li>
              <strong>Structural equation modeling with fit indices:</strong> Study reported
              appropriate SEM model fit statistics, demonstrating that proposed relationships among
              constructs fit data better than alternative specifications.
            </li>
            <li>
              <strong>Differential effects by readiness dimension:</strong> Results demonstrated
              that readiness dimensions affected acceptance through theorized pathways, with
              optimism influencing both usefulness and ease of use, innovativeness influencing
              usefulness, discomfort influencing ease of use, and insecurity influencing usefulness.
            </li>
            <li>
              <strong>Practical segmentation implications:</strong> Model suggests that market
              segmentation by technology readiness personality could predict which customers would
              adopt technologies and which require different approaches.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Limited sample diversity:</strong> Single study with 406 respondents in Taiwan
              recruited from online investment forums; limits generalization to organizational
              information systems, other technologies, or non-Asian markets.
            </li>
            <li>
              <strong>Cross-cultural replicability unclear:</strong> Technology readiness dimensions
              may operate differently in different cultural contexts with varying attitudes toward
              technology and different gender role norms.
            </li>
            <li>
              <strong>Personality stability assumptions untested:</strong> Model assumes technology
              readiness dimensions remain stable across contexts and time, but does not test whether
              readiness changes through experience or organizational socialization.
            </li>
            <li>
              <strong>No actual behavior measurement:</strong> Study measured adoption intention but
              not actual adoption or usage behavior, limiting ability to confirm that
              intention-behavior relationships extend to TRAM context.
            </li>
            <li>
              <strong>Causality direction not definitively established:</strong> While theoretical
              model proposes personality shapes belief formation, cross-sectional design cannot rule
              out reverse causality where technology experiences shape personality perceptions.
            </li>
            <li>
              <strong>Mediation mechanisms not fully explored:</strong> Model specifies that
              readiness dimensions affect adoption through usefulness and ease of use perceptions
              but does not deeply examine what psychological mechanisms produce these relationships.
            </li>
            <li>
              <strong>Missing moderators:</strong> Model does not consider organizational context,
              implementation support, peer influence, or training effects that might moderate
              readiness-belief relationships.
            </li>
            <li>
              <strong>Technology specificity unexamined:</strong> Single e-service context studied.
              Readiness dimensions might affect different technology types differently, with
              discomfort particularly important for complex systems and innovativeness more critical
              for novel technologies.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Integration of personality and technology adoption:</strong> Demonstrated that
              personality dimensions predict technology adoption through their influence on
              technology-specific beliefs, integrating trait psychology with technology adoption
              research.
            </li>
            <li>
              <strong>Operationalization of TRI in adoption context:</strong> Showed how Technology
              Readiness Index dimensions function as antecedents in established adoption models,
              operationalizing consumer personality research within technology acceptance
              frameworks.
            </li>
            <li>
              <strong>Full-mediation evidence:</strong> Provided empirical evidence (via Baron and
              Kenny 1986 tests plus Sobel tests) that perceived usefulness and perceived ease of use
              together fully mediate the TR-to-intention relationship, supporting H7. Direct
              TR-to-intention effects become non-significant when TAM beliefs are controlled.
            </li>
            <li>
              <strong>Consumer e-service adoption explanation:</strong> Applied technology
              acceptance to the voluntary consumer adoption context of online stock trading,
              extending adoption research beyond organizational mandatory settings.
            </li>
            <li>
              <strong>Practical segmentation approach:</strong> Demonstrated that technology
              readiness personality could segment customer populations likely to resist or readily
              adopt e-services, enabling targeted marketing strategies.
            </li>
            <li>
              <strong>Bridge between marketing and IS disciplines:</strong> Connected consumer
              behavior and personality research from marketing with information systems technology
              adoption research, facilitating cross-disciplinary dialogue.
            </li>
            <li>
              <strong>Expanded TAM explanatory scope:</strong> Maintained TAM core mechanisms while
              accounting for individual differences through personality antecedents, improving model
              completeness without abandoning proven framework.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM study employed appropriate methodology to establish relationships among constructs:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Measurement of established constructs:</strong> Perceived usefulness,
              perceived ease of use, and adoption intention measured using validated TAM scales
              established in prior research.
            </li>
            <li>
              <strong>Technology readiness operationalization:</strong> Technology Readiness Index
              dimensions measured using established Parasuraman TRI items validated in prior
              consumer research.
            </li>
            <li>
              <strong>Adequate sample size:</strong> N=406 online investor respondents (64% male,
              57% aged 21-30) provided sufficient power to detect relationships and test structural
              equation model fit; 85% had prior stock trading experience and 80% had online stock
              trading experience.
            </li>
            <li>
              <strong>Structural equation modeling in Amos 4:</strong> The integrated model was
              estimated in Amos 4 (Arbuckle &amp; Wothke, 1999). Full and trimmed (nested) models
              were estimated: the trimmed model constrained the TR-to-UI path to zero. The chi-
              square difference was non-significant (Δχ²=1.97, df=1, p=0.16), so the trimmed model
              was preferred.
            </li>
            <li>
              <strong>Real e-service context:</strong> Study examined an actual online stock trading
              system rather than hypothetical or artificial technologies, ensuring adoption context
              realism.
            </li>
            <li>
              <strong>Mediation testing:</strong> Baron and Kenny (1986) three-equation mediation
              procedure plus Sobel (1982) tests (z=5.23 for TR→PU→UI; z=2.73 for TR→PEOU→UI; both
              p&lt;0.01) supported H7 (full mediation via PU and PEOU).
            </li>
            <li>
              <strong>Effect direction consistency:</strong> Results confirmed the a priori
              hypothesized positive path from aggregate TR to both perceived usefulness (H5) and
              perceived ease of use (H6), with optimism and innovativeness as positive reflective
              indicators and discomfort and insecurity as negative reflective indicators of TR.
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
              <strong>Single technology domain limitation:</strong> Study examined online stock
              trading systems specifically. Readiness dimensions may affect different technology
              types differently, with results requiring verification across diverse technologies.
            </li>
            <li>
              <strong>Geographic and cultural context:</strong> Taiwan e-service users may show
              different readiness-acceptance relationships than users in Western contexts with
              different cultural attitudes toward technology and different gender role norms.
            </li>
            <li>
              <strong>Consumer versus organizational adoption:</strong> TRAM addresses voluntary
              consumer technology adoption. Applicability to mandatory organizational adoption
              contexts requires testing.
            </li>
            <li>
              <strong>Technology novelty considerations:</strong> Study examined relatively
              established e-services in 2007. Readiness dimensions might affect adoption of
              radically novel technologies differently than established services.
            </li>
            <li>
              <strong>Internet experience skew:</strong> 80% of respondents had online stock trading
              experience and 85% had prior stock trading experience, creating a sample skewed toward
              technology-experienced users. Generalization to low-technology-experience populations
              is uncertain.
            </li>
            <li>
              <strong>Demographic skew:</strong> 64% male, 57% aged 21-30, 18% aged 31-40, 17% under
              21; drawn from online investment discussion forums. Results may not generalize to
              older adults, women, or less technology-engaged demographic groups.
            </li>
            <li>
              <strong>Cross-sectional design limitations:</strong> Single-point measurement limits
              ability to assess whether personality-belief-adoption relationships sustain over time
              or whether experience changes readiness and adoption dynamics.
            </li>
            <li>
              <strong>Personality stability across contexts:</strong> Assumptions about technology
              readiness stability untested. Individuals might show different readiness dimensions
              for different technologies or in different organizational settings.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM directly addresses technology adoption barriers by illuminating how personality
            dimensions create differential technology adoption risks. The model demonstrates that
            technology adoption barriers manifest through personality-shaped belief formation:
            optimistic individuals perceive fewer barriers regardless of objective technology
            complexity, while anxious and skeptical individuals perceive greater barriers even when
            technologies are genuinely useful and easy. This suggests adoption barriers operate
            partly through personality lenses rather than purely through technology characteristics.
            Organizations implementing technology must address personality-driven barriers,
            recognizing that identical implementation approaches will differentially affect users
            with different readiness profiles. Users high in discomfort and insecurity require
            greater assurance about ease of use and security, while skeptical users need credible
            performance evidence. The model suggests that targeted communication, training, and
            implementation support should align with readiness personality profiles.
          </p>

          <h3 className={H3_CLASSES}>Personality-Driven Adoption Barriers</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Discomfort-driven complexity perception:</strong> Users high in discomfort
              perceive greater complexity even in user-friendly systems, creating significant
              adoption barriers for anxious populations.
            </li>
            <li>
              <strong>Insecurity-driven performance doubts:</strong> Skeptical users doubt
              performance benefits even when objective evidence supports usefulness claims,
              requiring extraordinary persuasion to overcome adoption resistance.
            </li>
            <li>
              <strong>Low innovativeness limitations:</strong> Non-innovative users may resist
              adoption of genuinely useful technologies if positioned as cutting-edge or novel,
              preferring familiar approaches.
            </li>
            <li>
              <strong>Pessimism-driven negative evaluation:</strong> Users low in optimism interpret
              ambiguous technology characteristics negatively, focusing on potential drawbacks
              rather than benefits.
            </li>
            <li>
              <strong>Personality-media fit mismatch:</strong> Technologies requiring independent
              learning or self-driven adoption face barriers with discomfort-prone users who need
              direct support and reassurance.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Segment users by technology readiness profile:</strong> Identify which users
              are technology-ready (high optimism, innovativeness; low discomfort, insecurity) and
              which require additional support, enabling tailored implementation approaches.
            </li>
            <li>
              <strong>Emphasize ease of use with discomfort-prone users:</strong> For anxious
              populations, prioritize usability design, comprehensive training, readily available
              support, and frequent reassurance that systems are manageable.
            </li>
            <li>
              <strong>Provide credible performance evidence to skeptical users:</strong> Users high
              in insecurity require objective performance data, pilot programs demonstrating
              benefits, and peer validation rather than vendor promises.
            </li>
            <li>
              <strong>Frame adoption for different readiness profiles:</strong> Position technology
              as innovative and capability-expanding to innovators, while emphasizing proven
              benefits and ease of integration for conservative users.
            </li>
            <li>
              <strong>Dedicate resources to lower-readiness populations:</strong> Users low in
              optimism, innovativeness, and high in discomfort and insecurity require
              disproportionate implementation support, training, and encouragement compared to
              technology-ready populations.
            </li>
            <li>
              <strong>Build confidence through early wins:</strong> Enable lower-readiness users to
              achieve quick success with simple technology features before attempting complex
              functionality, building confidence that technology is manageable.
            </li>
            <li>
              <strong>Use peer champions strategically:</strong> High-readiness users can model
              adoption and serve as champions, providing confidence to anxious users that adoption
              is achievable.
            </li>
            <li>
              <strong>Communicate security and stability to insecure users:</strong> Users skeptical
              about technology performance require assurance about data security, system
              reliability, and vendor stability rather than performance potential.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            TRAM contributed to several subsequent research directions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Personality-extended adoption models:</strong> Researchers incorporated
              additional personality dimensions (technology anxiety, computer self-efficacy,
              personal innovativeness) into technology acceptance frameworks following TRAM&rsquo;s
              integration approach.
            </li>
            <li>
              <strong>Technology readiness in organizational contexts:</strong> Subsequent studies
              examined whether Parasuraman&rsquo;s TRI predicts adoption of enterprise systems,
              cloud services, and IT-enabled organizational changes.
            </li>
            <li>
              <strong>Consumer e-service adoption expansion:</strong> Research extended TRAM logic
              to mobile banking adoption, online shopping commitment, digital payment systems, and
              social media adoption in consumer contexts.
            </li>
            <li>
              <strong>Readiness &times; technology fit research:</strong> Studies investigated
              whether personality readiness dimensions interact with technology characteristics,
              with discomfort creating particular barriers for complex systems while innovativeness
              drives adoption of novel technologies.
            </li>
            <li>
              <strong>Segmentation and targeting approaches:</strong> Marketing and IT leaders
              adopted readiness-based segmentation to tailor adoption strategies and support
              resources to user populations with different personality profiles.
            </li>
            <li>
              <strong>Cross-cultural readiness studies:</strong> Researchers examined whether
              technology readiness dimensions operate consistently across cultures or whether
              cultural values moderate personality effects on adoption.
            </li>
            <li>
              <strong>Longitudinal personality-adoption research:</strong> Studies investigated
              whether personality dimensions predict sustained technology use beyond initial
              adoption and whether technology experience modifies personality readiness.
            </li>
            <li>
              <strong>Emotional and affective adoption models:</strong> Research integrated
              emotional responses and technology anxiety alongside TRAM&rsquo;s personality
              dimensions to explain adoption resistance.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-parasuraman-2000">
              Parasuraman, A. (2000). Technology readiness index (TRI): A multiple-item scale to
              measure readiness to embrace new technologies. <em>Journal of Service Research</em>,
              2(4), 307-320.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-parasuraman-2000-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>{' '}
              https://doi.org/10.1177/109467050024001
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
            <li id="ref-rogers-1995">
              Rogers, E. M. (1995). Diffusion of innovations (4th ed.). Free Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rogers-1995-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-lin-2007">
              Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (2007). Integrating technology readiness
              into technology acceptance: The TRAM model. <em>Psychology &amp; Marketing</em>,
              24(7), 641-657. https://doi.org/10.1002/mar.20177
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478. https://doi.org/10.2307/30036540
            </li>
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-ajzen-1991">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              https://doi.org/10.1016/0749-5978(91)90020-T
            </li>
            <li id="ref-bandura-1986">
              Bandura, A. (1986). Social foundations of thought and action: A social cognitive
              theory. Prentice Hall.
            </li>
            <li id="ref-compeau-1995">
              Compeau, D. R., &amp; Higgins, C. A. (1995). Computer self-efficacy: Development of a
              measure and initial test. <em>MIS Quarterly</em>, 19(2), 189-211.
              https://doi.org/10.2307/249688
            </li>
            <li id="ref-taylor-1995">
              Taylor, S., &amp; Todd, P. A. (1995). Understanding information technology usage: A
              test of competing models. <em>Information Systems Research</em>, 6(2), 144-176.
              https://doi.org/10.1287/isre.6.2.144
            </li>
            <li id="ref-thompson-1991">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal computing:
              Toward a conceptual model of utilization. <em>MIS Quarterly</em>, 15(1), 125-143.
            </li>
            <li id="ref-brown-2005">
              Brown, S. A., &amp; Venkatesh, V. (2005). Model of adoption of technology in
              households: A baseline model and research extensions. <em>MIS Quarterly</em>, 29(4),
              573-596. https://doi.org/10.2307/25148690
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-17-value-based-adoption-kim-2007"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Value-Based Adoption Model (Kim)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Technology Acceptance Model 3 (Venkatesh &amp; Bala) &rarr;
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
