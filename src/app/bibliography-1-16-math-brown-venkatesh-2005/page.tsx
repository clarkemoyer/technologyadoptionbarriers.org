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
  title:
    'Bibliography: Model of Adoption of Technology in Households (MATH) - Brown & Venkatesh (2005)',
  description:
    'In-depth exploration of the Model of Adoption of Technology in Households (MATH), identifying attitudinal, normative, and control beliefs as predictors of PC adoption in household contexts distinct from organizational technology adoption.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Model of Adoption of Technology in Households (MATH) - Brown &amp; Venkatesh (2005)
        </h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Model of Adoption of Technology in Households
            </p>
            <p>
              <strong>Model Abbreviation:</strong> MATH
            </p>
            <p>
              <strong>Target of Model:</strong> Determinants of personal computer adoption decisions
              in household contexts, distinguishing household technology adoption from
              organizational technology adoption through attitudinal, normative, and control beliefs
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Consumer Behavior, Household Economics,
              Technology Adoption, Consumer Research
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> Susan A. Brown and Viswanath Venkatesh
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 2005
            </p>
            <p>
              <strong>Official Title:</strong> Model of adoption of technology in households: A
              baseline model test and extension incorporating household life cycle
            </p>
            <p>
              <strong>Journal:</strong> MIS Quarterly
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 29, No. 3
            </p>
            <p>
              <strong>Pages:</strong> 399-426
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.2307/3250959"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.2307/3250959
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
                Brown, S. A., &amp; Venkatesh, V. (
                <a href="#ref-brown-2005" className="text-tabs-teal-deep hover:underline">
                  2005
                </a>
                ). Model of adoption of technology in households: A baseline model test and
                extension incorporating household life cycle. <em>MIS Quarterly</em>, 29(3),
                399-426.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Brown, Susan A., and Viswanath Venkatesh. 2005. &ldquo;Model of Adoption of
                Technology in Households: A Baseline Model Test and Extension Incorporating
                Household Life Cycle.&rdquo;
                <em>MIS Quarterly</em> 29, no. 3: 399-426.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Venkatesh and Brown developed MATH to address a critical theoretical gap in technology
            adoption research. Prior adoption research focused almost exclusively on organizational
            contexts where employers mandated technology use, provided training and support,
            established clear performance expectations, and had existing IT infrastructure. Yet in
            the 1990s and early 2000s, household adoption of personal computers represented the
            fastest-growing technology market, driven by consumer purchasing decisions without
            organizational structure, mandate, or support systems. Researchers recognized that
            organizational adoption models could not adequately explain household technology
            adoption because household decision-making processes, social influences, and adoption
            barriers differed fundamentally from organizational contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The authors observed that household technology adoption involved different decision
            makers (family members with conflicting interests), different social influences (friends
            and family rather than supervisors and colleagues), different performance expectations
            (personal productivity, entertainment, education rather than job performance), and
            different control barriers (cost, technical knowledge, support access). Venkatesh and
            Brown hypothesized that household adoption required models explicitly conceptualizing
            these distinctive features rather than importing organizational adoption frameworks.
            They drew on consumer behavior theory, household economics, and the Theory of Reasoned
            Action to develop a model grounded in attitudinal beliefs (perceived usefulness for work
            and non-work activities), normative beliefs (family member and secondary source
            influences), and control beliefs (perceived cost, knowledge, and support barriers).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            MATH was created through longitudinal research tracking 746 U.S. households over
            multiple years, measuring PC adoption decisions at household and individual family
            member levels. The model distinguished households that adopted PCs from those that
            rejected adoption, identified different clusters of adopters (work-focused,
            learning-focused, entertainment-focused), and examined how family composition, income,
            education, and secondary source influences shaped adoption decisions. This longitudinal
            household-level study provided the first empirical validation of technology adoption
            models explicitly designed for non-organizational consumer contexts.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH operationalizes household technology adoption through three belief categories plus
            household characteristics:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Attitudinal Beliefs About Usefulness:</strong> Perceptions that PC ownership
              would provide benefits for work-related productivity, personal learning and
              self-improvement, family entertainment, or children&rsquo;s educational development.
              Unlike organizational contexts emphasizing single-purpose job performance, household
              attitudinal beliefs encompass multiple benefit dimensions reflecting diverse household
              member interests.
            </li>
            <li>
              <strong>Normative Beliefs and Social Influence:</strong> Perceptions that important
              reference groups (family members, neighbors, friends, secondary sources like media and
              colleagues) believe the household should adopt PC technology. Social influence
              operates differently in households where multiple family members may hold conflicting
              opinions and must negotiate adoption decisions collectively.
            </li>
            <li>
              <strong>Control Beliefs and Perceived Behavioral Control:</strong> Beliefs about
              barriers and enablers of PC adoption including perceived cost burden, technical
              knowledge and learning ability, availability of support and training, and
              compatibility with household needs. Control beliefs directly reflect
              household-specific barriers like personal computer prices, availability of accessible
              training, and required troubleshooting knowledge.
            </li>
            <li>
              <strong>Family Composition and Income Pressures:</strong> Household economic
              circumstances, number of children, educational levels, and employment status of
              household members shape both adoption capability and motivation. Higher-income,
              more-educated households with children show different adoption motivations than
              lower-income elderly households.
            </li>
            <li>
              <strong>Secondary Source Influence:</strong> Information, recommendations, and
              adoption encouragement from sources outside the household including media coverage,
              marketing messages, technology-enthusiast opinion leaders, and workplace colleague
              experiences. Secondary sources operate more powerfully in household contexts where
              expertise and experience within the household may be limited.
            </li>
            <li>
              <strong>Adopter Heterogeneity by Motivation:</strong> Households adopt PCs for
              different primary reasons: work-related productivity, children&rsquo;s education,
              entertainment and leisure, or general curiosity. These different motivation clusters
              show different PC usage patterns and post-adoption satisfaction trajectories.
            </li>
            <li>
              <strong>Household Versus Individual Adoption:</strong> Technology adoption at the
              household level involves collective decision-making where family members may have
              divergent preferences. Individual family members may desire PC adoption for specific
              purposes while others question necessity or cost-benefit tradeoffs.
            </li>
          </ul>
        </section>

        {/* 6. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Brown and Venkatesh (2005) develop MATH as a decomposed belief-structure measurement
            model for household technology adoption. The framework adapts TPB and extends it with
            household-specific belief decompositions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Utilitarian Outcomes (attitudinal):</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>Utility for Children (e.g., educational use)</li>
                <li>Utility for Work-Related Use</li>
                <li>Applications for Personal Use</li>
              </ul>
            </li>
            <li>
              <strong>Hedonic Outcomes (attitudinal):</strong> Fun, enjoyment, and excitement of
              using the technology at home.
            </li>
            <li>
              <strong>Social Outcomes (attitudinal):</strong> Status gains from being seen as
              technologically savvy within one&rsquo;s household/social network.
            </li>
            <li>
              <strong>Normative Beliefs:</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>Friends and Family Influences</li>
                <li>Secondary Sources&rsquo; Influences (e.g., media, vendors)</li>
                <li>Workplace Referents&rsquo; Influences</li>
              </ul>
            </li>
            <li>
              <strong>Control Beliefs:</strong>
              <ul className={BODY_LIST_CLASSES}>
                <li>Fear of Technological Advances (Rapid Change)</li>
                <li>Declining Cost / Cost</li>
                <li>Perceived Ease of Use / Self-Efficacy</li>
                <li>Requisite Knowledge for Use</li>
              </ul>
            </li>
            <li>
              <strong>Attitude, Subjective Norm, Perceived Behavioral Control, and Behavioral
              Intention:</strong> Standard TPB dependent constructs.
            </li>
            <li>
              <strong>Moderators:</strong> Age, Income, Marital Status, Life-Stage, and Presence
              of Children - proposed to moderate relationships between specific beliefs and the
              TPB second-order constructs.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Brown and Venkatesh (2005) report a survey-based study with &gt;700 US household
            respondents and provide validity evidence and path-coefficient estimates for the
            decomposed belief structure. The household framing distinguishes MATH from UTAUT and
            other workplace-oriented models.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH built upon consumer behavior and household technology adoption research:
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
              Foundational for MATH&rsquo;s structure using attitudes (attitudinal beliefs),
              subjective norms (normative beliefs), and resulting behavioral intention. MATH
              operationalizes TRA within household decision-making contexts.
            </li>
            <li>
              <strong>
                Theory of Planned Behavior (
                <a
                  id="cite-ref-ajzen-1991-1"
                  href="#ref-ajzen-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Ajzen, 1991
                </a>
                ):
              </strong>{' '}
              Extended TRA to include perceived behavioral control as direct predictor of behavior.
              MATH incorporates control beliefs about cost, knowledge, and support barriers directly
              affecting adoption decisions.
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
              Identified perceived usefulness as key adoption driver. MATH broadens usefulness
              beyond job performance to encompass work, education, entertainment, and family benefit
              dimensions relevant to household decision-making.
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
              Identified relative advantage, complexity, trialability, and observability as
              innovation characteristics. MATH incorporates relative advantage through perceived
              usefulness and complexity through control beliefs about knowledge requirements.
            </li>
            <li>
              <strong>Household Economics and Consumer Behavior Literature:</strong> Provided
              grounding for understanding household decision-making as distinct from individual
              choice, incorporating family structure, income constraints, and collective preference
              reconciliation.
            </li>
            <li>
              <strong>
                Social Learning Theory (
                <a
                  id="cite-ref-bandura-1986-1"
                  href="#ref-bandura-1986"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bandura, 1986
                </a>
                ):
              </strong>{' '}
              Emphasized observational learning from others&rsquo; experiences. MATH incorporates
              this through secondary source influence where households learn from colleagues&rsquo;
              and friends&rsquo; PC experiences.
            </li>
            <li>
              <strong>Household Decision-Making Research:</strong> Prior literature examining how
              family members negotiate purchases, resolve preference conflicts, and allocate
              household resources informed MATH&rsquo;s collective household adoption lens.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH proposes that household PC adoption decisions result from three primary belief
            categories. Attitudinal beliefs about PC usefulness for work, learning, entertainment,
            or family benefit create positive motivation for adoption. Normative beliefs about what
            family members and secondary sources think influence adoption attitudes and intentions.
            Control beliefs about cost, technical knowledge, and support barriers influence adoption
            feasibility and intention. Households distinguish between adopters and non-adopters with
            different belief profiles. Among adopters, heterogeneous motivation clusters emerge:
            work-focused adopters emphasize productivity benefits, education-focused adopters
            prioritize children&rsquo;s learning, entertainment-focused adopters value leisure
            benefits, and general-interest adopters view PCs as culturally important household
            items. Household characteristics including income, education, family composition, and
            existing technology infrastructure moderate these belief-to-adoption relationships.
          </p>

          <h3 className={H3_CLASSES}>MATH Determinant Mechanisms</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Multiple Benefit Dimensions:</strong> Unlike organizational contexts
              emphasizing single-purpose performance benefits, household adoption involves
              evaluating multiple benefit dimensions (work productivity, educational advancement,
              entertainment, family togetherness) where different household members prioritize
              different benefits.
            </li>
            <li>
              <strong>Collective Decision-Making:</strong> Household adoption reflects negotiation
              among family members with potentially conflicting preferences. Influential household
              members (often parents or highest-income earner) make final adoption decisions
              weighing family interest diversity.
            </li>
            <li>
              <strong>Cost as Primary Control Barrier:</strong> PC cost represents direct household
              financial burden competing with other consumption priorities. Higher-income households
              perceive lower cost barriers while lower-income households view PC expense as major
              adoption impediment.
            </li>
            <li>
              <strong>Technical Knowledge as Control Barrier:</strong> Household members perceiving
              themselves as lacking computer skills experience control barriers to adoption. This
              creates bootstrapping problem: households without computers lack experiential
              knowledge to evaluate PC fit.
            </li>
            <li>
              <strong>Secondary Source Influence Importance:</strong> Households lacking internal
              technology expertise rely heavily on external information sources including media,
              marketing, and friends&rsquo; experiences to form usefulness beliefs and overcome
              control concerns.
            </li>
            <li>
              <strong>Family Composition Moderation:</strong> Households with school-age children
              show stronger educational benefit beliefs. Households with employed members emphasize
              work productivity. Elderly households prioritize different benefits than young
              families.
            </li>
            <li>
              <strong>Income Moderation of Control Beliefs:</strong> Higher-income households
              experience lower cost barriers and greater ability to purchase support services.
              Lower-income households perceive greater financial constraint.
            </li>
            <li>
              <strong>Education Moderation of Technical Knowledge Confidence:</strong> More highly
              educated household members feel greater confidence in learning computer skills and
              overcoming technical barriers.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Household-specific framework:</strong> First major model explicitly designed
              for household technology adoption contexts rather than adapting organizational models
              to consumer domains.
            </li>
            <li>
              <strong>Longitudinal household-level study:</strong> Tracked actual adoption decisions
              in 746 U.S. households over extended time period, providing longitudinal evidence of
              belief-to-adoption pathways.
            </li>
            <li>
              <strong>Heterogeneous adopter identification:</strong> Distinguished different
              household adopter clusters (work-focused, education-focused, entertainment-focused,
              general-interest) with different PC usage patterns and post-adoption satisfaction.
            </li>
            <li>
              <strong>Multiple benefit dimensions:</strong> Recognized household adoption involves
              evaluating work, education, entertainment, and family benefits rather than single job
              performance criterion.
            </li>
            <li>
              <strong>Household decision-making lens:</strong> Explicitly modeled household adoption
              as collective decision rather than individual choice, acknowledging family member
              preference negotiation.
            </li>
            <li>
              <strong>Practical relevance to consumer markets:</strong> Addressed rapidly growing
              consumer PC market with insights directly applicable to technology companies,
              retailers, and marketers.
            </li>
            <li>
              <strong>Household characteristics as moderators:</strong> Examined how income,
              education, family composition, and existing technology infrastructure shape adoption
              processes.
            </li>
            <li>
              <strong>Secondary source influence quantification:</strong> Provided empirical
              evidence that media, marketing, and colleague experiences significantly influence
              household adoption beliefs.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Time-period specific technology:</strong> Model developed for 1990s-era PC
              adoption. Contemporary household adoption of smart devices, mobile, and cloud services
              may operate differently than PC adoption did.
            </li>
            <li>
              <strong>U.S.-specific household structure:</strong> MATH developed and tested on U.S.
              households with Western family structures. Generalization to cultures with extended
              family co-residence, different household decision-making hierarchies, or collectivist
              values uncertain.
            </li>
            <li>
              <strong>Limited theory of household conflict resolution:</strong> While acknowledging
              collective decision-making, MATH provides limited theoretical explanation of how
              households reconcile conflicting member preferences or who ultimately influences
              adoption decisions.
            </li>
            <li>
              <strong>Static household conceptualization:</strong> Model treats household
              composition as fixed characteristic. Actual households experience births, children
              moving to college, divorces, and other transitions affecting adoption decisions and PC
              usage.
            </li>
            <li>
              <strong>Secondary source influence mechanisms underspecified:</strong> While finding
              secondary sources matter, model provides limited explanation of why different
              households respond differently to media and marketing or how secondary sources
              interact with family beliefs.
            </li>
            <li>
              <strong>Post-adoption outcomes limited:</strong> Model focuses on adoption decision
              without extending to PC usage intensity, discontinuance, or satisfaction outcomes
              beyond immediate post-adoption period.
            </li>
            <li>
              <strong>Technology-specific benefits:</strong> Usefulness dimensions identified for PC
              adoption may not generalize to other household technologies with different benefit
              profiles.
            </li>
            <li>
              <strong>Measurement of control beliefs:</strong> Cost and knowledge control beliefs
              may suffer from social desirability bias where households understate financial
              constraints or knowledge limitations.
            </li>
            <li>
              <strong>Network effects and complementarities:</strong> Model does not address how
              broader technology adoption in friendship networks or workplace colleague PC use
              influences household adoption.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>First household-specific adoption model:</strong> Established that household
              technology adoption required distinct theoretical framework from organizational
              adoption, challenging assumptions that single models apply universally.
            </li>
            <li>
              <strong>Multiple benefit dimensions in consumer adoption:</strong> Demonstrated that
              household adoption decisions involve evaluating multiple benefit dimensions (work,
              education, entertainment, family) rather than single performance criterion in
              organizational adoption.
            </li>
            <li>
              <strong>Collective household decision-making framework:</strong> Established household
              adoption as collective family decision rather than individual choice, requiring
              understanding of preference negotiation and family influence dynamics.
            </li>
            <li>
              <strong>Cost as primary household adoption barrier:</strong> Empirically demonstrated
              that financial cost represents critical household adoption barrier distinct from
              organizational contexts where cost decisions are separated from usage decisions.
            </li>
            <li>
              <strong>Technical knowledge and confidence barriers:</strong> Identified lack of
              technical knowledge and confidence as significant household control barriers, creating
              adoption reluctance even among groups with capacity to learn.
            </li>
            <li>
              <strong>Secondary source influence quantification:</strong> Provided first empirical
              evidence quantifying media, marketing, and colleague experience influence on household
              adoption beliefs and decisions.
            </li>
            <li>
              <strong>Heterogeneous adopter clusters:</strong> Distinguished different household
              adopter motivations (work-focused, education-focused, entertainment-focused) showing
              different usage patterns and satisfaction, establishing adopter heterogeneity.
            </li>
            <li>
              <strong>Practical guidance for consumer technology markets:</strong> Provided
              marketers, retailers, and technology companies with empirical insights for targeting
              different household segments with different value propositions.
            </li>
            <li>
              <strong>Longitudinal household-level research methodology:</strong> Established
              longitudinal household-level research as viable methodological approach in technology
              adoption research.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH employed rigorous methodology to establish internal validity:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Longitudinal household tracking:</strong> Tracked same 746 households over
              extended time period with multiple measurement occasions, allowing assessment of
              belief-to-adoption relationships over time.
            </li>
            <li>
              <strong>Household-level and individual-level measurement:</strong> Collected data from
              multiple household members, enabling assessment of household decision-making and
              individual member belief divergence.
            </li>
            <li>
              <strong>Large, nationally representative sample:</strong> 746 households drawn to
              represent U.S. demographic diversity in income, education, family composition, and
              employment.
            </li>
            <li>
              <strong>Actual adoption outcomes:</strong> Measured whether households actually
              adopted PCs rather than adoption intentions, establishing behavioral validation.
            </li>
            <li>
              <strong>Qualitative supplementation:</strong> Combined quantitative survey data with
              qualitative interviews and focus groups to understand household decision-making
              dynamics and preference negotiation.
            </li>
            <li>
              <strong>Post-adoption usage patterns:</strong> Measured PC usage patterns among
              adopting households, distinguishing light users from heavy users and work-focused from
              entertainment-focused use.
            </li>
            <li>
              <strong>Household characteristics measurement:</strong> Collected data on income,
              education, employment, family composition, and existing technology infrastructure to
              examine moderating effects.
            </li>
            <li>
              <strong>Belief measurement through theory-grounded survey items:</strong> Developed
              survey questions grounded in Theory of Reasoned Action and Theory of Planned Behavior
              to measure attitudinal, normative, and control beliefs.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations require nuanced interpretation of generalizability:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Time-period specificity:</strong> 1990s-era PC adoption context differs
              substantially from contemporary household adoption of smart devices, mobile
              technology, and cloud services where adoption barriers and benefit dimensions may
              differ significantly.
            </li>
            <li>
              <strong>Technology-specific mechanisms:</strong> PC adoption benefit dimensions
              (productivity, learning, entertainment) may not generalize to other household
              technologies with fundamentally different benefit profiles.
            </li>
            <li>
              <strong>U.S. household structure focus:</strong> Model developed and tested on U.S.
              households. Generalization to cultures with extended family structures, different
              household hierarchies, or non-Western family decision-making processes requires
              investigation.
            </li>
            <li>
              <strong>Income and education generalization:</strong> Sample included range of
              household income and education levels but concentrated on middle-class U.S.
              households. Generalization to very-low-income or very-high-income households
              uncertain.
            </li>
            <li>
              <strong>Family composition representation:</strong> Sample represented various family
              structures but was primarily nuclear families. Generalization to single-person
              households, same-sex families, or extended family households requires verification.
            </li>
            <li>
              <strong>Geographic variation:</strong> U.S.-based sample limits generalization to
              different geographic regions where PC access, pricing, and secondary source influence
              might differ.
            </li>
            <li>
              <strong>Temporal stability:</strong> Study spanned early-to-mid 1990s. Technology
              adoption dynamics may have changed with broader internet diffusion, declining PC
              prices, and increased secondary source availability.
            </li>
            <li>
              <strong>Household market evolution:</strong> Early PC market characteristics (high
              cost, limited applications, strong expertise barriers) differ from current technology
              household adoption where devices are cheaper and more user-friendly.
            </li>
            <li>
              <strong>Secondary source change:</strong> Secondary source influence was primarily
              media and workplace in 1990s. Contemporary adoption involves internet reviews, social
              media, and online communities with different influence dynamics.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH directly addresses household and consumer technology adoption barriers by
            identifying that household adoption involves fundamentally different decision processes
            than organizational adoption. Households encounter multiple distinct barriers:
            uncertainty about whether technology benefits justify costs, concern that required
            technical knowledge exceeds household member capability, family member disagreement
            about adoption necessity, and lack of trusted information sources to evaluate usefulness
            claims. MATH demonstrates that consumer technology adoption cannot be effectively
            addressed using organizational adoption frameworks; instead, organizations must
            understand household benefit evaluation processes, cost sensitivity, technical
            confidence concerns, and family decision-making dynamics to successfully position
            technologies for household markets.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>High cost relative to household income:</strong> Household budgets are finite
              with competing priorities. Technologies with high cost-to-benefit ratios face adoption
              resistance regardless of absolute value.
            </li>
            <li>
              <strong>Unclear household benefit justification:</strong> When household members
              cannot articulate specific benefits (work, education, entertainment) relevant to their
              needs, adoption appears unjustified.
            </li>
            <li>
              <strong>Technical knowledge and learning concerns:</strong> Household members
              anticipating difficulty learning technology operation or fearing technical failure
              without support face knowledge barriers.
            </li>
            <li>
              <strong>Lack of accessible technical support:</strong> Households lacking access to
              help (family tech-savvy member, customer support) perceive higher risk of unresolved
              technical problems.
            </li>
            <li>
              <strong>Family preference conflict:</strong> When household members disagree on
              adoption benefit, cost-justification, or technical necessity, decision-making
              deadlocks occur.
            </li>
            <li>
              <strong>Information poverty:</strong> Households without access to trusted information
              sources struggle to evaluate usefulness claims and differentiate marketing hype from
              actual benefits.
            </li>
            <li>
              <strong>Social isolation from technology communities:</strong> Households lacking
              friends or colleagues with technology experience cannot learn vicariously about
              benefits and barriers.
            </li>
            <li>
              <strong>Status anxiety or cultural resistance:</strong> Some household members may
              resist adoption perception as unnecessary, wasteful, or symbolizing undesired social
              change.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Model Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Segment households by adoption motivation:</strong> Different household types
              (work-focused, education-focused, entertainment-focused) require different value
              propositions and marketing messages.
            </li>
            <li>
              <strong>Articulate clear benefit dimensions:</strong> Market technologies by
              highlighting multiple benefit categories relevant to different household member
              interests rather than single benefit proposition.
            </li>
            <li>
              <strong>Address cost barriers directly:</strong> Offer financing options, payment
              plans, or entry-level versions making adoption financially feasible for cost-sensitive
              households.
            </li>
            <li>
              <strong>Reduce technical knowledge barriers:</strong> Provide comprehensive setup
              support, user-friendly documentation, and accessible customer support enabling
              households with limited technical confidence.
            </li>
            <li>
              <strong>Mobilize secondary source influence:</strong> Build consumer reviews, peer
              testimonials, and media coverage establishing social proof that households similar to
              prospect households find value.
            </li>
            <li>
              <strong>Provide trial and demonstration opportunities:</strong> Enable households to
              experience technology benefits directly through library programs, store
              demonstrations, or in-home trials reducing perceived risk.
            </li>
            <li>
              <strong>Target influential household decision-makers:</strong> Identify and market to
              household members most influential in adoption decisions (typically higher-income
              earner or parent with child education interests).
            </li>
            <li>
              <strong>Emphasize complementary ecosystem benefits:</strong> Highlight how technology
              enables desired activities or connects to other household member interests.
            </li>
            <li>
              <strong>Provide ongoing support and education:</strong> Recognize households need
              extended support beyond initial purchase to build technical confidence and realize
              diverse benefits.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            MATH fundamentally shifted technology adoption research toward consumer and household
            contexts:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Brown &amp; Venkatesh (
                <a href="#ref-brown-2005" className="text-tabs-teal-deep hover:underline">
                  2005
                </a>
                ) lifecycle extension:
              </strong>{' '}
              Extended MATH with life-cycle stage moderators (young family, empty nest, retirement)
              showing how household circumstances and technology needs vary across family
              development stages.
            </li>
            <li>
              <strong>Consumer technology adoption research:</strong> Researchers adopted MATH
              framework to understand household adoption of broadband, mobile devices, smart home
              technology, streaming services, and other consumer technologies.
            </li>
            <li>
              <strong>Household technology ecosystem research:</strong> Built on MATH to examine how
              multiple household technologies (e-mail, internet, entertainment systems) interact and
              co-evolve within household adoption decisions.
            </li>
            <li>
              <strong>Digital divide research:</strong> MATH framing of adoption barriers (cost,
              knowledge, support) became central to understanding digital inequality and disparities
              in household technology access.
            </li>
            <li>
              <strong>Family and household decision-making research:</strong> MATH contributed to
              broader family economics and household decision-making literature examining how
              families negotiate major purchases and lifestyle changes.
            </li>
            <li>
              <strong>Mobile and consumer device adoption:</strong> Researchers extended MATH logic
              to understand household smartphone adoption, tablet adoption, and smart device
              diffusion with different cost and benefit profiles than PC adoption.
            </li>
            <li>
              <strong>Elderly and aging technology research:</strong> MATH framework informed
              research on technology adoption by older adults and elderly households examining
              life-stage specific benefits and knowledge barriers.
            </li>
            <li>
              <strong>Secondary source influence quantification:</strong> MATH motivated broader
              research on media influence, peer effects, and social networks in technology adoption
              across organizational and consumer domains.
            </li>
            <li>
              <strong>UTAUT consumer extension (UTAUT2):</strong> When developing UTAUT2 for
              consumer contexts, Venkatesh and colleagues extended MATH insights on household
              decision-making into broader consumer technology model.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-venkatesh-2001">
              Venkatesh, V., &amp; Brown, S. A. (2001). A longitudinal investigation of personal
              computers in baseline model test and extension incorporating household life cycle.{' '}
              <em>MIS Quarterly</em>, 25(1), 71-102. https://doi.org/10.2307/3250959
            </li>
            <li id="ref-brown-2005">
              Brown, S. A., &amp; Venkatesh, V. (2005). Model of adoption of technology in
              households: A baseline model test and extension incorporating household life cycle.
              <em>MIS Quarterly</em>, 29(3), 399-426. https://doi.org/10.2307/25148690
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
            <li id="ref-ajzen-1991">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-ajzen-1991-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>{' '}
              https://doi.org/10.1016/0749-5978(91)90020-T
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
            <li id="ref-bandura-1986">
              Bandura, A. (1986). Social foundations of thought and action: A social cognitive
              theory. Prentice Hall.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-bandura-1986-1"
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
            <li id="ref-fishbein-1975">
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
            <li id="ref-venkatesh-2003">
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478. https://doi.org/10.2307/30036540
            </li>
            <li id="ref-thompson-1991">
              Thompson, R. L., Higgins, C. A., &amp; Howell, J. M. (1991). Personal computing:
              Toward a conceptual model of utilization. <em>MIS Quarterly</em>, 15(1), 125-143.
            </li>
            <li id="ref-compeau-1995">
              Compeau, D. R., &amp; Higgins, C. A. (1995). Computer self-efficacy: Development of a
              measure and initial test. <em>MIS Quarterly</em>, 19(2), 189-211.
              https://doi.org/10.2307/249688
            </li>
            <li id="ref-putnam-2000">
              Putnam, R. D. (2000). Bowling alone: The collapse and revival of American community.
              Simon &amp; Schuster.
            </li>
            <li id="ref-katz-1997">
              Katz, J. E., &amp; Aspden, P. (1997). A nation of strangers?{' '}
              <em>Communications of the ACM</em>, 40(12), 81-86.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-15-unified-theory-utaut-venkatesh-2003"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Unified Theory of Acceptance and Use of Technology (Venkatesh et
                al.)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-17-value-based-adoption-kim-2007"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Value-Based Adoption Model (Kim, Chan, &amp; Gupta) &rarr;
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
