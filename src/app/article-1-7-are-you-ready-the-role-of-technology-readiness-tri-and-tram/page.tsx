import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'
import ArticleTOC from '@/components/article-toc'

export const metadata: Metadata = {
  title: 'Article 1.7: Are You Ready? - The Role of Technology Readiness (TRI & TRAM)',
  description:
    'Exploring how individual technology readiness-combining optimism, innovativeness, discomfort, and insecurity-shapes adoption decisions across contexts.',
}

const Article17Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.7: Are You Ready? - The Role of Technology Readiness (TRI &amp; TRAM)
        </h1>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Introduction: The Persistent Individual Differences</h2>
          <p className={PARAGRAPH_CLASSES}>
            We have journeyed through the landscape of technology adoption research from
            foundational frameworks establishing that perceived usefulness and ease of use drive
            adoption, through increasingly sophisticated models recognizing the role of social
            influences, gender, and contextual fit. Yet one critical dimension has emerged
            repeatedly in background observations: some people embrace new technologies eagerly
            while others resist them, and these differences persist regardless of the specific
            technology or context. A person uncomfortable with email systems often struggles equally
            with smartphones, cloud computing, and emerging technologies they have never
            encountered. Someone who enthusiastically adopts the latest software innovations tends
            to be similarly enthusiastic about other new technologies. These observations point
            toward something deeper than situation-specific perceptions of usefulness or ease of
            use: underlying personality or dispositional characteristics that shape how individuals
            approach technology broadly.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This article explores <strong>technology readiness</strong>: the individual
            propensities, attitudes, and beliefs that predispose some people toward technology
            adoption and inhibit others. Understanding technology readiness as a fundamental
            antecedent helps explain adoption patterns that purely utilitarian models struggle to
            address. Why does someone reject a clearly useful and easy-to-use technology? Why does
            someone enthusiastically adopt a technology with questionable utility? Why do some
            market segments adopt rapidly while others remain stubbornly resistant? Technology
            readiness provides crucial insights into these questions.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            The Technology Readiness Index: Capturing the Multi-Faceted Nature of Technology
            Attitudes
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            A. Parasuraman&apos;s Technology Readiness Index (TRI), introduced in 2000, emerged from
            a fundamental observation: consumers&apos; reactions to technology are paradoxical,
            multifaceted, and often contradictory. People simultaneously hold positive and negative
            views about technology. Someone might believe that technology offers tremendous benefits
            (optimistic) while also fearing its complexity and security risks (discomfort and
            insecurity). Someone might be excited about innovation (innovative) while doubting
            whether technology actually works as promised (insecurity). These internal
            contradictions, which Parasuraman termed &ldquo;technology paradoxes,&rdquo; cannot be
            captured by single-dimensional measures of technology attitudes.
          </p>

          <h3 className={H3_CLASSES}>The Eight Technology Paradoxes</h3>
          <p className={PARAGRAPH_CLASSES}>
            The development of the TRI grew from extensive qualitative research with consumers from
            various sectors, combined with a National Technology Readiness Survey of approximately
            3,000 college graduates and young professionals. Through analysis of consumer focus
            groups and survey data, Parasuraman identified eight fundamental paradoxes in how
            consumers view technology:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Freedom versus enslavement</strong>-technology offers freedom and flexibility,
              yet creates dependency and loss of autonomy.
            </li>
            <li>
              <strong>Control versus chaos</strong>-technology can enhance personal control and
              organization, yet creates confusion and information overload.
            </li>
            <li>
              <strong>Competence versus incompetence</strong>-technology can enhance personal
              capability, yet creates feelings of inadequacy and incompetence.
            </li>
            <li>
              <strong>Innovation versus obsolescence</strong>-technology enables innovation and
              staying current, yet obsoletes people&apos;s existing skills and knowledge.
            </li>
            <li>
              <strong>Assimilation versus alienation</strong>-technology connects people, yet
              creates isolation and fragmentation.
            </li>
            <li>
              <strong>Intelligence versus stupidity</strong>-technology demonstrates human
              ingenuity, yet devalues human intelligence.
            </li>
            <li>
              <strong>Efficiency versus laziness</strong>-technology enables productivity, yet
              encourages passive consumption.
            </li>
            <li>
              <strong>Progress versus destruction</strong>-technology advances human progress, yet
              creates risks and destruction.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>The Four Dimensions of Technology Readiness</h3>
          <p className={PARAGRAPH_CLASSES}>
            These paradoxes revealed that technology readiness could not be reduced to a single
            dimension. People&apos;s propensity to embrace new technologies reflects a complex
            gestalt of often-contradictory beliefs and attitudes. Some individuals resolve these
            paradoxes by emphasizing benefits and minimizing concerns (high overall technology
            readiness). Others emphasize concerns and discount benefits (low overall technology
            readiness). Still others hold contradictory positions simultaneously-believing in
            benefits while fearing drawbacks.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Parasuraman operationalized technology readiness through a comprehensive 36-item scale
            measuring four core dimensions. <strong>Optimism</strong> (10 items) captures a positive
            view of technology and belief that it offers increased control, flexibility, and
            efficiency. Optimistic individuals believe technology makes life easier, provides
            freedom and mobility, and offers convenience. <strong>Innovativeness</strong> (5 items)
            measures a tendency to be a technology pioneer and thought leader. Innovative
            individuals come to others for advice about technology, are among the first in their
            peer groups to acquire new technology, and enjoy the intellectual challenge of figuring
            out new systems. These two dimensions serve as <em>drivers</em> or <em>enablers</em> of
            technology readiness.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            In contrast, <strong>Discomfort</strong> (8 items) measures a perceived lack of control
            over technology and feeling overwhelmed by it. Discomfort includes concerns about
            technical support limitations, fears that technology is not designed for ordinary
            people, and anxieties about transaction security and technological complexity.{' '}
            <strong>Insecurity</strong> (5 items) measures distrust of technology and skepticism
            about whether it works properly and securely. Insecurity involves worries about security
            breaches, financial risks, and concerns about harmful consequences from technology use.
            These two dimensions serve as <em>inhibitors</em> or <em>constraints</em> on technology
            readiness.
          </p>

          <h3 className={H3_CLASSES}>Multi-Dimensional Independence</h3>
          <p className={PARAGRAPH_CLASSES}>
            Critically, the TRI measures these dimensions as relatively independent characteristics.
            An individual can be simultaneously high in optimism and high in discomfort-believing
            that technology offers tremendous benefits while also feeling overwhelmed by complexity.
            An individual can be high in innovativeness but low in optimism-enjoying the challenge
            of mastering new technologies without believing they offer meaningful life benefits.
            This multi-dimensional structure captures the paradoxical nature of technology attitudes
            that single-dimensional scales cannot represent.
          </p>

          <h3 className={H3_CLASSES}>Validation and Predictive Power</h3>
          <p className={PARAGRAPH_CLASSES}>
            The TRI demonstrated strong psychometric properties and predictive validity. Individuals
            with higher TRI scores showed significantly greater ownership of technology-based
            products and services, engagement in online activities, and willingness to adopt new
            technologies. TRI scores effectively segmented customer populations: current owners of
            technology-based products had higher TR scores than those planning to purchase, who had
            higher scores than those with no plans to purchase. Geographic and demographic
            validation confirmed the scale&apos;s applicability across diverse populations. The TRI
            became widely adopted in academic research and business practice as a tool for
            understanding and predicting technology adoption across consumer and organizational
            contexts.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            Technology Readiness Index 2.0: Updating for a Changed World
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Despite the TRI&apos;s success, Parasuraman and Charles Colby recognized by the
            mid-2010s that the 36-item instrument required updating. Technology landscapes had
            transformed dramatically since 2000. Mobile internet, social media, cloud computing, and
            ubiquitous connectivity had fundamentally changed how people engaged with technology.
            Consumer populations had evolved, with digital natives entering the consumer marketplace
            and technology literacy increasing substantially. The original TRI items, while
            conceptually sound, referenced specific technologies and concerns that had become
            obsolete or less salient.
          </p>

          <h3 className={H3_CLASSES}>Development Process</h3>
          <p className={PARAGRAPH_CLASSES}>
            The development of TRI 2.0 involved a two-phase research program. The qualitative phase
            used online forums where consumers discussed what motivated and inhibited their
            technology adoption. Thematic analysis identified contemporary technology themes:
            improving quality of life, maintaining social connections, cost barriers, security and
            privacy concerns, dependency concerns, and distraction concerns. The quantitative phase
            involved developing new items addressing contemporary themes while maintaining the
            original four-dimensional structure. Through factor analysis and item refinement, the
            authors developed a streamlined 16-item scale-4 items per dimension-that retained the
            reliability and validity of the original while substantially reducing respondent burden.
          </p>

          <h3 className={H3_CLASSES}>Stability Despite Change</h3>
          <p className={PARAGRAPH_CLASSES}>
            The key innovation of TRI 2.0 was demonstrating that the underlying structure of
            technology readiness-the four dimensions and their relationships-remained stable despite
            dramatic technological and societal changes. Comparison of equivalent items from TRI 1.0
            (measured in 1999) and TRI 2.0 (measured in 2012) showed that the constructs measured
            remained consistent despite the 13-year interval. The fundamental aspects of technology
            readiness-optimism about benefits, innovativeness as a characteristic, discomfort with
            complexity, and insecurity about safety-persisted as salient dimensions shaping
            technology adoption even as the specific technologies and concerns evolved.
          </p>

          <h3 className={H3_CLASSES}>Five Consumer Segments</h3>
          <p className={PARAGRAPH_CLASSES}>
            TRI 2.0 demonstrated sophisticated segmentation utility through latent class analysis,
            identifying five distinct consumer segments with different technology readiness
            profiles:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Skeptics (38% of consumers)</strong>-detached and cautious about technology,
              neither optimistic nor particularly innovative, low in both motivation dimensions.
            </li>
            <li>
              <strong>Explorers (18%)</strong>-high in optimism and innovativeness, low in inhibitor
              dimensions, enthusiastically embracing technological innovation.
            </li>
            <li>
              <strong>Avoiders (16%)</strong>-high in both discomfort and insecurity, low in
              optimism, actively resisting technology adoption.
            </li>
            <li>
              <strong>Pioneers (16%)</strong>-holding simultaneously strong positive views
              (optimism, innovativeness) and strong negative views (discomfort, insecurity),
              embodying the technology paradoxes most intensely.
            </li>
            <li>
              <strong>Hesitators (13%)</strong>-low in innovativeness even if moderately optimistic,
              cautious about being early adopters.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            These five segments showed dramatically different demographic characteristics and
            technology adoption behaviors, validating the segmentation value of the framework.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            The Technology Readiness and Acceptance Model: Integrating Personality and Perception
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Chien-Hung Lin, Hsi-Peng Shih, and Peter Sher&apos;s 2007 Technology Readiness and
            Acceptance Model (TRAM) represents an important synthesis, integrating technology
            readiness dimensions with technology acceptance constructs. The insight driving TRAM is
            that both general technology dispositions (TRI) and system-specific perceptions
            (TAM&apos;s perceived usefulness and ease of use) influence adoption, and that these
            operate through distinct but complementary mechanisms.
          </p>

          <h3 className={H3_CLASSES}>Technology Readiness as Perceptual Lens</h3>
          <p className={PARAGRAPH_CLASSES}>
            TRAM proposes that technology readiness acts as an upstream antecedent influencing how
            individuals perceive specific technologies. An individual high in optimism and
            innovativeness will tend to perceive a new technology more favorably, interpret
            ambiguous information optimistically, and give the technology benefit of the doubt. An
            individual high in discomfort and insecurity will tend to perceive the same technology
            more critically, interpret ambiguities pessimistically, and remain skeptical about
            claims. In essence, technology readiness biases perception. It operates like a lens
            through which individuals interpret technology characteristics.
          </p>

          <h3 className={H3_CLASSES}>Empirical Validation</h3>
          <p className={PARAGRAPH_CLASSES}>
            The TRAM research conducted on online shopping adoption demonstrated this mechanism
            empirically. Individual differences in the four technology readiness dimensions
            predicted perceived usefulness and perceived ease of use of online shopping systems.
            Optimism, for instance, positively predicted perceived usefulness-optimistic individuals
            tended to perceive online shopping as more useful than skeptical individuals, even
            controlling for actual system characteristics. Discomfort negatively predicted perceived
            ease of use-individuals high in discomfort perceived online shopping as more difficult
            and complex, even for straightforward transactions.
          </p>

          <h3 className={H3_CLASSES}>Direct and Indirect Effects</h3>
          <p className={PARAGRAPH_CLASSES}>
            More importantly, TRAM showed that technology readiness influenced adoption intention
            both directly and indirectly through perceived usefulness and ease of use. The{' '}
            <strong>indirect path</strong>-technology readiness → perceived usefulness and ease of
            use → adoption intention-captured the mechanism where readiness shapes perception, which
            shapes adoption decisions. The <strong>direct path</strong>
            -technology readiness → adoption intention-captured residual effects where readiness
            influences adoption above and beyond effects mediated through perception.
          </p>

          <h3 className={H3_CLASSES}>Multi-Level Barriers</h3>
          <p className={PARAGRAPH_CLASSES}>
            The practical implication is profound: adoption barriers exist at multiple levels. At
            the perception level, system-specific characteristics matter-perceived usefulness and
            ease of use influence adoption decisions. At the disposition level, general technology
            readiness matters-optimistic individuals are more likely to adopt, while
            discomfort-oriented individuals are more resistant. Addressing adoption barriers
            requires attention to both levels. An organization can improve perceived ease of use
            through superior interface design, but if target users have high discomfort, they may
            still resist adoption because of general anxiety about technology. Conversely, building
            technology readiness through training and support, if not paired with systems that are
            actually useful and easy to use, will also fail.
          </p>

          <h3 className={H3_CLASSES}>Increased Explanatory Power</h3>
          <p className={PARAGRAPH_CLASSES}>
            TRAM explained approximately 55% of variance in adoption intention-substantially more
            than typical TAM-only models explaining 30-50% of variance. This increased explanatory
            power demonstrated that integrating personality-based technology readiness captured
            meaningful additional variance in adoption. Different segments required different
            strategic responses: for high-readiness segments, emphasizing system sophistication and
            innovative features resonated, while for low-readiness segments, emphasizing simplicity
            and reliability proved necessary.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            What Technology Readiness Reveals About Adoption Motivation
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Stepping back from the specific models, technology readiness research reveals critical
            insights about how people approach technology adoption.
          </p>

          <h3 className={H3_CLASSES}>Technology is Affective and Psychological</h3>
          <p className={PARAGRAPH_CLASSES}>
            First, it demonstrates that technology is fundamentally affective and psychological, not
            just instrumental. How people <em>feel</em> about technology-whether they are excited or
            anxious, confident or insecure-shapes adoption as powerfully as whether they believe the
            technology is useful. This explains patterns that purely rational utilitarian models
            struggle to address. Someone might rationally understand that a technology is useful and
            easy to use, yet emotionally resist adoption because of anxiety or distrust. Someone
            might be enthusiastic about technology generally, making them willing to try new systems
            despite uncertain utility or ease of use.
          </p>

          <h3 className={H3_CLASSES}>Personality and Disposition Matter</h3>
          <p className={PARAGRAPH_CLASSES}>
            Second, technology readiness reveals that personality and disposition matter as much as
            circumstances. Someone high in technology readiness will be more likely to adopt
            innovations across contexts and technologies. Someone low in readiness will face
            barriers to adoption across diverse contexts. This means that addressing adoption at
            scale requires not just improving specific systems (making them more useful and easy to
            use) but also building general technology readiness in populations. An organization that
            invests only in system design while ignoring the technology readiness of its user
            population will achieve less than one addressing both dimensions.
          </p>

          <h3 className={H3_CLASSES}>Profound Heterogeneity in Orientations</h3>
          <p className={PARAGRAPH_CLASSES}>
            Third, technology readiness research reveals profound heterogeneity in how different
            people approach technology. The five segments identified in TRI 2.0-skeptics, explorers,
            avoiders, pioneers, and hesitators-are not minor variations in a generally similar
            population. They represent fundamentally different orientations toward technology.
            Explorers (18%) eagerly embrace technological innovation and seek out cutting-edge
            technologies. Avoiders (16%) actively resist technology and prefer human alternatives.
            Skeptics (38%) are detached and cautious, neither enthusiastically embracing nor
            actively rejecting technology. Pioneers (16%) hold contradictory views, simultaneously
            excited and worried. Hesitators (13%) are willing to adopt but reluctant to be early
            adopters.
          </p>

          <h3 className={H3_CLASSES}>Segment-Specific Strategies Required</h3>
          <p className={PARAGRAPH_CLASSES}>
            Organizations attempting to move entire populations toward technology adoption using
            undifferentiated strategies will disappoint themselves. What motivates and persuades
            explorers alienates avoiders. What reassures skeptics feels patronizing to pioneers.
            This means that effective technology adoption strategies must be segment-specific,
            recognizing that different populations require different approaches. Explorers respond
            to messages about innovation and cutting-edge features. Avoiders require assurance that
            human alternatives remain available. Skeptics need evidence and proof of value. Pioneers
            need balanced acknowledgment of both benefits and limitations. Hesitators need social
            proof and demonstrations from others like them successfully adopting.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Building Technology Readiness: From Barrier to Enabler</h2>
          <p className={PARAGRAPH_CLASSES}>
            Perhaps the most important insight from technology readiness research is that readiness
            is not fixed. While technology readiness is relatively stable in the short term (people
            do not dramatically shift their technology attitudes week to week), it is changeable
            over the medium to long term. Individuals can develop greater optimism and confidence
            through positive technology experiences. Discomfort can be reduced through training and
            support that build competence. Insecurity can be overcome through demonstrations of
            security and reliability. Innovativeness can be cultivated through social influence and
            exposure to enthusiastic early adopters.
          </p>

          <h3 className={H3_CLASSES}>Readiness-Building as Strategic Investment</h3>
          <p className={PARAGRAPH_CLASSES}>
            This has profound implications for technology implementation. Rather than accepting
            technology readiness as an immutable constraint, organizations can view
            readiness-building as a strategic investment. An organization implementing a significant
            technology change might assess the technology readiness profile of its user population,
            then design interventions to build readiness alongside system rollout. For
            high-discomfort users, this might mean extensive training, hands-on support, and
            demonstrations that the system is genuinely easy to use. For high-insecurity users, this
            might mean transparent communication about security measures and assurance about system
            reliability. For low-optimism users, this might mean demonstrations of concrete value
            and testimonials from successful adopters.
          </p>

          <h3 className={H3_CLASSES}>Institutionalizing Readiness-Building</h3>
          <p className={PARAGRAPH_CLASSES}>
            Some organizations have institutionalized readiness-building as ongoing practice. They
            recognize that as new technologies continuously emerge, population readiness determines
            how quickly they can adopt and what support they require. An organization with higher
            average technology readiness can accelerate technology adoption and requires less
            intensive support. An organization with lower average readiness requires more gradual
            implementation with more extensive training and support. But rather than accepting this
            as a permanent limitation, they invest in building readiness through technology
            education programs, early-adoption initiatives where initial enthusiasts model
            technology use for colleagues, and support structures that help anxious users gain
            confidence.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            The Trajectory: From General Models to Personality-Based Understanding
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            The progression from TAM to TRI to TRAM to contemporary applications reflects a
            maturation in adoption research from seeking universal principles to understanding the
            personality-based foundations of adoption. Early technology acceptance research sought
            universal principles: all users care about usefulness and ease of use; these factors
            universally drive adoption. This proved remarkably successful at explaining variance in
            adoption, but something was missing. Usefulness and ease of use explain much, but not
            all. Individual differences emerged as residual variance that general models could not
            capture.
          </p>

          <h3 className={H3_CLASSES}>Recognition of Dispositional Factors</h3>
          <p className={PARAGRAPH_CLASSES}>
            Technology readiness research addressed this gap by recognizing dispositional factors as
            foundational. Rather than treating individual differences as noise or error, TRI
            conceptualized them as systematic variation reflecting personality-based propensities
            toward technology. The progression from TAM to TRAM represents integration: maintaining
            the insights that usefulness and ease of use matter while recognizing that underlying
            dispositions shape how individuals perceive usefulness and ease, and directly influence
            adoption independent of perceptions.
          </p>

          <h3 className={H3_CLASSES}>Contemporary Applications</h3>
          <p className={PARAGRAPH_CLASSES}>
            Contemporary applications of technology readiness frameworks continue expanding.
            Research applies TRI to emerging technologies-artificial intelligence adoption,
            autonomous vehicle acceptance, smart home technology adoption-demonstrating that
            readiness continues predicting adoption across technological contexts. Cross-cultural
            research examines how technology readiness profiles vary across national cultures and
            whether the four-dimensional structure holds universally. Applied research develops
            interventions to build technology readiness in specific populations-training programs to
            reduce discomfort, communication strategies to enhance optimism, support systems to
            address insecurity.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            Conclusion: The Indispensable Role of Individual Disposition
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Technology readiness research demonstrates that individual dispositions toward
            technology-optimism, innovativeness, discomfort, and insecurity-are not peripheral
            factors but fundamental determinants of technology adoption. Understanding adoption
            requires understanding both what technologies offer (usefulness and ease of use) and how
            people are disposed toward technology generally (technology readiness).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For practitioners implementing technology, this means adoption strategies must be
            multi-dimensional. Improving system characteristics (functionality, usability,
            reliability) addresses the technology side. Understanding and building technology
            readiness addresses the individual side. Neither alone is sufficient. Organizations that
            attend to both dimensions-creating useful, usable systems while building population
            readiness-achieve higher adoption and better outcomes than those attending to only one
            dimension.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For researchers, technology readiness provides a bridge between general adoption models
            and individual psychology. It explains variance that usefulness and ease of use cannot
            capture. It provides theoretical grounding for why adoption varies systematically across
            individuals facing identical technologies and contexts. And it offers pathways for
            intervention-readiness is not fixed, so understanding how to build it provides
            actionable guidance.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            As we conclude this exploration of individual adoption frameworks, we have traversed
            from foundational theories through comprehensive integrative models to specialized
            context-specific frameworks and personality-based foundations. Together, these
            frameworks provide a rich understanding of how individuals decide whether to adopt new
            technologies. The next branch in our literature review shifts focus from individual
            adoption to organizational adoption, examining how organizations collectively navigate
            technology change and the frameworks guiding organizational-level technology decisions.
          </p>
        </section>

        <SeriesNavigation />

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              Parasuraman, A. (2000). Technology readiness index (TRI): A multiple-item scale to
              measure readiness to embrace new technologies. <em>Journal of Service Research</em>,
              2(4), 307-320.
            </li>
            <li>
              Parasuraman, A., &amp; Colby, C. L. (2015). An updated and streamlined technology
              readiness index: TRI 2.0. <em>Journal of Service Research</em>, 18(1), 59-74.
            </li>
            <li>
              Lin, C.-H., Shih, H.-Y., &amp; Sher, P. J. (2007). Integrating technology readiness
              into technology acceptance: The TRAM model. <em>Psychology &amp; Marketing</em>,
              24(7), 641-657.
            </li>
            <li>
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
            </li>
            <li>
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </li>
            <li>
              Mick, D. G., &amp; Fournier, S. (1998). Paradoxes of technology: Consumer cognizance,
              emotions, and coping strategies. <em>Journal of Consumer Research</em>, 25(2),
              123-143.
            </li>
            <li>
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.
            </li>
          </ol>
        </section>
      </article>
      <ArticleTOC />
    </main>
  )
}

export default Article17Page
