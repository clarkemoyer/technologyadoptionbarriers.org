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
  title: 'Article 1.3: Expanding the Classic - The Evolution to TAM 2, TAM 3, and C-TAM-TPB',
  description:
    'Exploring the evolution of the Technology Acceptance Model through TAM 2, TAM 3, and the integrated C-TAM-TPB framework, revealing how organizational context, social influences, and system design shape technology adoption.',
}

const Article13Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.3: Expanding the Classic - The Evolution to TAM 2, TAM 3, and C-TAM-TPB
        </h1>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Introduction: The Need for Enhancement</h2>
          <p className={PARAGRAPH_CLASSES}>
            By the late 1990s, TAM had proven its worth across hundreds of studies and real-world
            implementations. Yet as researchers applied the model to increasingly diverse
            technologies and organizational contexts, questions emerged about what the model was not
            capturing.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Why did some organizations with systems that users perceived as useful and easy to use
            still struggle with adoption? Why did the strength of relationships between constructs
            shift over time as users gained experience? Why did social influences matter more in
            some contexts than others? Why did the model perform differently when system adoption
            was mandatory versus voluntary?
          </p>
          <p className={PARAGRAPH_CLASSES}>
            These questions pointed to the same conclusion: TAM was powerful but incomplete. It
            explained a substantial portion of adoption variance, but not all of it. The missing
            pieces fell into two categories: (1) the external factors that shape perceived
            usefulness and ease of use, and (2) the integration of TAM with other theoretical
            perspectives that might capture additional influences.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Between 2000 and 2008, researchers-particularly Viswanath Venkatesh and his
            colleagues-undertook a comprehensive research program to address these gaps. The result
            was a series of increasingly sophisticated models that maintained TAM&apos;s core
            insights while dramatically expanding its theoretical scope. This article traces that
            evolution through three increasingly comprehensive frameworks: TAM 2, TAM 3, and the
            integrated C-TAM-TPB model.
          </p>

          <h2 className={H2_CLASSES}>TAM 2: Explaining Perceived Usefulness</h2>
          <p className={PARAGRAPH_CLASSES}>
            In 2000, Venkatesh and Davis published TAM 2-a longitudinal study across four
            organizations examining what determines perceived usefulness.[2] Their central insight
            was deceptively simple: perceived usefulness does not emerge from nowhere. It is shaped
            by organizational context, system characteristics, and social influences.
          </p>

          <h3 className={H3_CLASSES}>Social Influence Processes</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 2 identified that social influences shape perceived usefulness through two distinct
            mechanisms:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Subjective Norm: </strong>This represents what users believe important others
            think they should do. A manager saying &ldquo;this system is important for our
            department&rdquo; or colleagues saying &ldquo;I am finding this really useful&rdquo;
            creates normative pressure that shapes usefulness perceptions. But critically, the
            research showed that this influence operates through two pathways.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            First, there is direct normative pressure-the social force itself. When important
            referents advocate for system adoption, users feel obligated to comply, and this
            obligation can directly influence intentions independent of perceived usefulness,
            particularly in mandatory adoption contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Second, there is informational influence-relying on others&apos; judgments. When
            colleagues you trust say a system is useful, you adopt their judgment, increasing your
            own perceived usefulness. This is especially powerful when colleagues are similar to you
            and have already adopted the system.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Image: </strong>The degree to which system use enhances one&apos;s professional
            status or image. This proved more influential than many researchers anticipated. Using a
            cutting-edge system, demonstrating technological sophistication, or being seen as an
            early adopter can enhance professional standing. When this image enhancement is salient,
            users perceive the system as more useful-not because the system&apos;s functional
            benefits changed, but because the status implications increase its value.
          </p>

          <h3 className={H3_CLASSES}>Cognitive Instrumental Processes</h3>
          <p className={PARAGRAPH_CLASSES}>
            Beyond social influences, TAM 2 identified three organizational and task-related factors
            shaping perceived usefulness:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Job Relevance: </strong>The degree to which users perceive that the system
            applies to their actual job responsibilities. A system might be technically capable but
            irrelevant to a user&apos;s primary work. A document management system is highly
            relevant for administrative staff but less relevant for salespeople whose primary work
            involves client contact. When systems are relevant to core job functions, usefulness
            perceptions increase dramatically.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Output Quality: </strong>The degree to which systems produce outputs meeting
            organizational standards for quality and accuracy. A system might be designed to improve
            productivity, but if its outputs lack accuracy or require extensive manual correction,
            perceived usefulness diminishes. Conversely, when systems consistently produce
            high-quality outputs, perceived usefulness soars because users see them as truly
            enhancing performance.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Result Demonstrability: </strong>The ease and tangibility with which system
            benefits can be demonstrated and communicated. Some system benefits are immediately
            visible-a spreadsheet calculation that would take hours manually completes in seconds.
            Other benefits are diffuse or long-term-gradual improvements in data consistency across
            an organization. When benefits are clearly demonstrable, perceived usefulness increases
            substantially because users and observers directly observe the improvements.
          </p>

          <h3 className={H3_CLASSES}>Temporal Dynamics: Experience Matters</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 2 made an important temporal discovery: the relationships between constructs change
            as users gain experience with systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Specifically, the effect of perceived ease of use on perceived usefulness is strongest
            early in adoption and weakens substantially as experience accumulates. Early adopters
            base usefulness judgments heavily on how easily they can master the system-if learning
            is difficult, they struggle to achieve proficiency and perceive the system as less
            useful. But as users gain experience and become proficient, ease of use becomes less
            important. Their usefulness judgments shift toward actual task-technology fit and real
            performance outcomes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This temporal insight has profound practical implications. Early implementation
            strategies should emphasize making systems easy to use, because ease directly influences
            usefulness perceptions during critical adoption periods. But as implementation
            progresses, organizations should shift focus toward demonstrating actual usefulness
            through performance evidence and results.
          </p>

          <h2 className={H2_CLASSES}>TAM 3: Understanding Perceived Ease of Use</h2>
          <p className={PARAGRAPH_CLASSES}>
            While TAM 2 explained what shaped perceived usefulness, it left perceived ease of use as
            relatively unexplored. TAM 3 (2008) addressed this gap, providing comprehensive
            understanding of what determines how difficult users perceive systems to be.[3]
          </p>

          <h3 className={H3_CLASSES}>Anchors: Individual Capability and Control Beliefs</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 3 identified three constructs that form the &ldquo;anchors&rdquo; for perceived ease
            of use-foundational factors determining how easily users perceive system use:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Computer Self-Efficacy: </strong>This represents individual confidence in
            one&apos;s ability to use computers effectively. Users with high computer
            self-efficacy-those who believe they can learn computer systems, troubleshoot problems,
            and use technology flexibly-perceive systems as easier to use. Conversely, users with
            low self-efficacy perceive identical systems as more difficult, more threatening, and
            more cognitively demanding.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This is not about objective system complexity; it is about perceived capability. Two
            users facing identical technology might perceive dramatically different ease levels
            depending on their confidence in their abilities. This insight explains why the same
            system is easy for experienced technology users but difficult for technophobes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Perceptions of External Control: </strong>This captures the degree to which
            users believe they have resources and support to use systems effectively. External
            control encompasses:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>Availability of technical support and help desk services</li>
            <li>Quality and accessibility of training</li>
            <li>Compatibility with existing systems and infrastructure</li>
            <li>Availability of necessary hardware and software</li>
            <li>Access to knowledgeable mentors and peers</li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            When these facilitating conditions are strong, perceived ease of use increases because
            users know they can obtain help when needed. When they are weak, perceived ease of use
            decreases because users doubt they can resolve problems independently.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Intrinsic Motivation: </strong>The degree to which system use is inherently
            enjoyable, playful, or engaging. Systems perceived as engaging or interesting are
            perceived as easier to use. This reflects a psychological principle: when we enjoy an
            activity, we perceive it as requiring less effort. Conversely, when we find activities
            tedious or unpleasant, they seem more effortful.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This construct helps explain why some technically simple systems are perceived as
            difficult (because they are boring and unmotivating) while some technically complex
            systems are perceived as easier (because they are engaging and compelling).
          </p>

          <h3 className={H3_CLASSES}>Adjustments: System Design and Experience</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 3 also identified factors that adjust perceived ease of use during use:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Perceived Enjoyment: </strong>The affective response during actual system use.
            Even if initial perceptions of ease are moderate, if users find the experience enjoyable
            as they interact with systems, ease of use perceptions improve. Conversely, if
            interaction is frustrating, ease perceptions decline.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Objective Usability: </strong>The actual system design quality. While TAM
            emphasizes perceptions, objective design characteristics matter. Well-designed
            interfaces with intuitive navigation reduce cognitive load and objectively make systems
            easier to use. Poor design objectively increases required effort. While perceptions are
            central, they are partially shaped by objective design quality.
          </p>

          <h3 className={H3_CLASSES}>System Design Characteristics</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 3 specified that several design features directly influence perceived ease of use:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>System Flexibility: </strong>Systems that can be customized to user
              preferences are perceived as easier
            </li>
            <li>
              <strong>System Aesthetics: </strong>Visual design, layout quality, and overall
              presentation influence perceived ease
            </li>
            <li>
              <strong>Consistency: </strong>Consistent design patterns across system functions
              reduce cognitive load
            </li>
            <li>
              <strong>Feedback Mechanisms: </strong>Systems providing clear feedback on user actions
              reduce uncertainty and perceived effort
            </li>
          </ul>

          <h2 className={H2_CLASSES}>The Integrated Path: C-TAM-TPB</h2>
          <p className={PARAGRAPH_CLASSES}>
            While Venkatesh and colleagues were enhancing TAM, other researchers were exploring
            integration with alternative frameworks. A particularly important integration came from
            Taylor and Todd&apos;s 1995 work comparing TAM with the Theory of Planned Behavior
            (TPB).[4]
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This comparison model-sometimes called C-TAM-TPB or the Integrated TAM-TPB-combined
            TAM&apos;s belief structures with TPB&apos;s recognition of behavioral control.
          </p>

          <h3 className={H3_CLASSES}>Structure of the Integrated Model</h3>
          <p className={PARAGRAPH_CLASSES}>
            The integrated model maintains TAM&apos;s core constructs (Perceived Usefulness,
            Perceived Ease of Use, Attitude) but adds TPB&apos;s dimensions:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>From TAM:</strong>
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>Perceived Usefulness: Outcome expectations about system benefits</li>
            <li>Perceived Ease of Use: Effort expectations about system usability</li>
            <li>Attitude: Overall favorable/unfavorable evaluation</li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            <strong>From TPB:</strong>
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>Subjective Norm: Social pressure regarding adoption</li>
            <li>
              Perceived Behavioral Control: Beliefs about capability and resource availability
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            These operate together in predicting behavioral intention, which predicts actual usage.
          </p>

          <h3 className={H3_CLASSES}>Comparative Performance</h3>
          <p className={PARAGRAPH_CLASSES}>
            Importantly, the integrated model addressed a key research question: Does TAM or TPB
            provide superior explanation?
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The answer proved nuanced. In mandatory adoption contexts, TAM elements (perceived
            usefulness and ease of use) dominated-explaining most adoption variance. Subjective
            norms still influenced intentions but less strongly than usefulness perceptions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            In voluntary contexts, subjective norms and perceived behavioral control gained
            influence. When adoption is optional, what others think matters more. Social pressure
            and available resources become more critical determinants.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This context-dependency has important practical implications. For mandatory technology
            implementations, organizations should focus heavily on ensuring the system is perceived
            as useful and easy. For voluntary technologies, they must also cultivate normative
            support and ensure adequate resources.
          </p>

          <h3 className={H3_CLASSES}>The Decomposed Model Perspective</h3>
          <p className={PARAGRAPH_CLASSES}>
            An important aspect of the Taylor and Todd research was the decomposition of constructs
            into more specific dimensions. Rather than treating perceived usefulness as monolithic,
            they examined specific types of outcome expectations. Rather than treating behavioral
            control as a single construct, they examined specific resource and capability beliefs.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This decomposition revealed that different specific beliefs predict adoption for
            different reasons-important insight for designing targeted interventions.
          </p>

          <h2 className={H2_CLASSES}>Synthesis: What the Evolution Reveals</h2>
          <p className={PARAGRAPH_CLASSES}>
            These three models-TAM 2, TAM 3, and C-TAM-TPB-maintained TAM&apos;s core framework
            while dramatically expanding its explanatory scope. Several patterns emerge:
          </p>

          <h3 className={H3_CLASSES}>The Importance of External Factors</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM suggested that user perceptions determine adoption. TAM 2 and 3 revealed that user
            perceptions do not emerge randomly-they are shaped by organizational context, system
            design, social influences, and resource availability. This insight does not undermine
            TAM&apos;s emphasis on perceptions; it specifies what shapes them.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For leaders, this means adoption is not predetermined by technology characteristics. By
            managing organizational context and social influences, leaders can shape the perceptions
            that drive adoption.
          </p>

          <h3 className={H3_CLASSES}>Temporal Dynamics Matter</h3>
          <p className={PARAGRAPH_CLASSES}>
            TAM 2&apos;s temporal findings revealed that adoption is not a static psychological
            state but a dynamic process. What influences adoption in week one differs from week
            twelve. Early implementation strategies differ from sustained adoption strategies.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Moreover, the relative influence of constructs shifts. Early ease of use is critical;
            later, actual performance matters more. This suggests phased implementation strategies
            aligned with how adoption processes unfold.
          </p>

          <h3 className={H3_CLASSES}>Context-Dependency of Relationships</h3>
          <p className={PARAGRAPH_CLASSES}>
            The integrated TAM-TPB model revealed that organizational context (mandatory vs.
            voluntary) moderates which factors dominate adoption. This context-dependency extends
            beyond that dimension-technology complexity, organizational maturity, implementation
            quality, and user populations all influence which model aspects prove most salient.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            There is no universally optimal adoption strategy; rather, strategies should be tailored
            to specific contexts.
          </p>

          <h3 className={H3_CLASSES}>The Persisting Primacy of Perceived Usefulness</h3>
          <p className={PARAGRAPH_CLASSES}>
            Throughout all these extensions, one finding remained remarkably consistent: perceived
            usefulness is the strongest predictor of adoption. Whether measured directly or through
            combinations of job relevance, output quality, and result demonstrability, whether in
            mandatory or voluntary contexts, whether early or late in adoption, perceived usefulness
            consistently dominates.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This does not mean ease of use or social factors do not matter. But for practitioners,
            it suggests that ensuring users understand the system&apos;s performance benefits should
            be the primary focus.
          </p>

          <h3 className={H3_CLASSES}>Moving Beyond Extensions: The Next Challenges</h3>
          <p className={PARAGRAPH_CLASSES}>
            By 2008, with TAM 3, the TAM research program had become remarkably comprehensive. The
            core model was enhanced with explanations of determinants, integration with alternative
            frameworks, and specification of temporal dynamics.
          </p>
          <p className={PARAGRAPH_CLASSES}>Yet questions remained:</p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              How do individual differences moderate these relationships? Age, education, technology
              anxiety, and prior experience all influence adoption. Should different user groups
              receive different implementation strategies?
            </li>
            <li>
              How does organizational culture affect adoption? TAM accounts for specific
              organizational factors but not broader cultural dimensions that support or inhibit
              technology adoption.
            </li>
            <li>
              How does implementation quality translate beliefs into actual integrated work
              practices? A user might believe a system is useful but fail to use it if
              implementation is poor or organizational processes are not redesigned.
            </li>
            <li>
              Can these frameworks extend beyond organizational contexts to consumer technology? TAM
              was developed for organizational mandatory systems. Do the relationships hold for
              voluntary consumer technologies?
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            These questions led to further theoretical development. TAM evolved toward broader
            frameworks like UTAUT, consumer-focused models like UTAUT2, and context-specific
            extensions examining how adoption plays out in healthcare, education, mobile contexts,
            and many others.
          </p>

          <h2 className={H2_CLASSES}>Conclusion: Building the Architecture</h2>
          <p className={PARAGRAPH_CLASSES}>
            The evolution from TAM to TAM 2 to TAM 3 represents theoretical architecture
            construction. Davis provided the foundation-a parsimonious, empirically validated core
            explaining how user perceptions drive adoption. Subsequent researchers built elaborately
            on that foundation, explaining what shapes those perceptions, how they evolve over time,
            and how they interact with organizational and social contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            None of these extensions invalidated TAM. Instead, they answered &ldquo;yes,
            but&hellip;&rdquo; to TAM&apos;s core findings. Yes, perceived usefulness drives
            adoption, but organizational factors shape that perception. Yes, ease of use influences
            adoption, but its influence changes as users gain experience. Yes, individual beliefs
            matter, but social and organizational contexts shape those beliefs.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For technology leaders implementing systems today, these models suggest several
            practical principles:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            First, focus intensively on perceived usefulness. Demonstrate benefits clearly. Align
            systems with actual job requirements. Provide evidence through pilots and early adopter
            success stories.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Second, simplify perceived ease of use. Invest in user-centered design. Provide
            comprehensive, accessible training. Create robust support infrastructure.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Third, recognize that adoption evolves. Early implementation differs from sustained
            adoption. What drives initial acceptance differs from what sustains long-term usage.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Fourth, attend to organizational context. Social influences matter. Normative support
            matters. Resources and facilitating conditions matter. Technology&apos;s adoption
            depends as much on the ecosystem surrounding it as on the technology itself.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Fifth, recognize that different contexts demand different strategies. Mandatory systems
            can rely more heavily on ensuring usefulness. Voluntary systems must also cultivate
            normative support. The specific implementation approach should match organizational
            context.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The evolution from TAM to its extensions reveals that technology adoption is not a
            simple phenomenon explained by a two-factor model. It is complex, contextual, and
            dynamic. Yet it remains predictable. Understanding the factors that shape adoption-and
            the organizational actions that influence those factors-provides the foundation for
            effective technology implementation.
          </p>
        </section>

        <SeriesNavigation />

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. MIS Quarterly, 13(3), 319-340.
            </li>
            <li>
              Venkatesh, V., &amp; Davis, F. D. (2000). A theoretical extension of the technology
              acceptance model: Four longitudinal field studies. Management Science, 46(2), 186-204.
            </li>
            <li>
              Venkatesh, V., &amp; Bala, H. (2008). Technology Acceptance Model 3 and a research
              agenda on interventions. MIS Quarterly, 32(1), 157-178.
            </li>
            <li>
              Taylor, S., &amp; Todd, P. A. (1995). Understanding information technology usage: A
              test of competing models. Information Systems Research, 6(2), 144-176.
            </li>
            <li>
              Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human
              Decision Processes, 50(2), 179-211.{' '}
              <a
                href="https://doi.org/10.1016/0749-5978(91)90020-T"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1016/0749-5978(91)90020-T
              </a>
            </li>
            <li>
              Fishbein, M., &amp; Ajzen, I. (1975). Belief, attitude, intention, and behavior: An
              introduction to theory and research. Addison-Wesley.
            </li>
          </ol>
        </section>
      </article>
      <ArticleTOC />
    </main>
  )
}

export default Article13Page
