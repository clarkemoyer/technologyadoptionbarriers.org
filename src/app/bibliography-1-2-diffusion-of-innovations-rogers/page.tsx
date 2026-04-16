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
  title: 'Bibliography: Diffusion of Innovations - Rogers (1962)',
  description:
    'Deep dive into Diffusion of Innovations by Everett M. Rogers (1962), a foundational framework for understanding how innovations spread across individuals and organizations.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Diffusion of Innovations - Rogers (1962)</h1>

        {/* 1. Model Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Model Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Model Name:</strong> Diffusion of Innovations
            </p>
            <p>
              <strong>Model Abbreviation:</strong> DOI
            </p>
            <p>
              <strong>Target of Model:</strong> Individual Innovation Adoption (organizational
              adoption covered in{' '}
              <Link
                href="/bibliography-2-21-diffusion-of-innovations-organizational-rogers-1962"
                className="text-tabs-teal-deep hover:underline"
              >
                Bibliography 2-21
              </Link>
              )
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Interdisciplinary (synthesizing agricultural
              economics, rural sociology, public health, anthropology, communication, marketing)
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Everett M. Rogers
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1962
            </p>
            <p>
              <strong>Official Title:</strong> Diffusion of Innovations
            </p>
            <p>
              <strong>Publisher:</strong> The Free Press
            </p>
            <p>
              <strong>ISBN:</strong> 978-0-7432-2209-9 (5th edition, 2003)
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
                Rogers, E. M. (
                <a href="#ref-rogers-1962" className="text-tabs-teal-deep hover:underline">
                  1962
                </a>
                ). <em>Diffusion of innovations</em>. The Free Press.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Rogers, Everett M. 1962. <em>Diffusion of Innovations</em>. The Free Press.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Rogers developed the Diffusion of Innovations framework to address a fundamental gap in
            understanding how innovations spread across diverse contexts. The core problem
            motivating this model was simple yet profound: there is a wide gap between when
            innovations become available and when they are actually adopted. Many innovations
            require lengthy periods, sometimes years, from their introduction until they achieve
            widespread adoption. This gap creates practical challenges for individuals and
            organizations seeking to accelerate adoption rates.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The framework emerged from Rogers&rsquo;s recognition that understanding how innovations
            spread through populations required examining multiple dimensions simultaneously. Prior
            research in various fields (agriculture, public health, sociology, anthropology,
            marketing, education) had generated substantial empirical findings, but these remained
            disconnected across disciplines. Rogers synthesized this body of research to create an
            integrated theoretical framework that could explain diffusion processes across
            innovation types, populations, and contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The model was fundamentally motivated by practical concerns facing change agencies,
            organizational leaders, and development programs. These practitioners needed guidance on
            how to speed up innovation adoption and understand the factors affecting adoption rates.
            The framework provided both theoretical understanding and practical guidance. Rogers
            explicitly framed diffusion as encompassing both the planned and spontaneous spread of
            new ideas, making the model applicable to diverse real-world situations.
          </p>
        </section>

        {/* 5. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Diffusion of Innovations operationalizes several central constructs with precise
            definitions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Innovation:</strong> An idea, practice, or object perceived as new by the
              individual or organization considering its adoption. Newness is defined
              psychologically, not chronologically.
            </li>
            <li>
              <strong>Diffusion:</strong> The process by which an innovation is communicated through
              certain channels over time among members of a social system. Encompasses both planned
              change efforts and spontaneous spread.
            </li>
            <li>
              <strong>Communication Channels:</strong> The means by which messages about innovations
              get from one individual to another. Includes mass media channels (reaching many
              simultaneously) and interpersonal channels (face-to-face communication).
            </li>
            <li>
              <strong>Time:</strong> A fundamental dimension encompassing the innovation-decision
              process stages, the rate of adoption, and the innovation period. Rogers elevated time
              to central theoretical importance.
            </li>
            <li>
              <strong>Social System:</strong> The population in which adoption occurs, with defined
              structure, norms, culture, and social integration characteristics affecting diffusion
              patterns.
            </li>
            <li>
              <strong>Adoption Rate:</strong> The speed at which an innovation is adopted by members
              of a social system, typically measured as the number of individuals adopting within a
              given time period.
            </li>
            <li>
              <strong>Adopter Categories:</strong> Classifications of individuals based on their
              relative earliness in adoption: innovators (2.5%), early adopters (13.5%), early
              majority (34%), late majority (34%), and laggards (16%).
            </li>
            <li>
              <strong>Relative Advantage:</strong> The degree to which an innovation is perceived as
              better than the idea it supersedes.
            </li>
            <li>
              <strong>Compatibility:</strong> The degree to which an innovation is perceived as
              consistent with existing values, past experiences, and needs of potential adopters.
            </li>
            <li>
              <strong>Complexity:</strong> The degree to which an innovation is perceived as
              difficult to understand and use.
            </li>
            <li>
              <strong>Trialability:</strong> The degree to which an innovation may be experimented
              with on a limited basis before full commitment.
            </li>
            <li>
              <strong>Observability:</strong> The degree to which results of an innovation are
              visible to others.
            </li>
            <li>
              <strong>Homophily:</strong> The principle that individuals communicate more frequently
              with similar others (similar in values, beliefs, education, social status) than with
              dissimilar others.
            </li>
          </ul>
        </section>

        {/* 6. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Diffusion of Innovations built upon several prior intellectual traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Gabriel Tarde&rsquo;s &ldquo;The Laws of Imitation&rdquo; (1890):</strong>{' '}
              Early European conceptualization of how ideas spread through imitation and social
              influence.
            </li>
            <li>
              <strong>European diffusion research traditions:</strong> British and German-Austrian
              diffusionists who examined cultural and technological diffusion from anthropological
              perspectives.
            </li>
            <li>
              <strong>Early sociology and anthropology research:</strong> Foundational work on
              innovation adoption patterns in diverse cultural and social contexts.
            </li>
            <li>
              <strong>Agricultural economics research:</strong> Empirical studies of how farmers
              adopted new farming practices and technologies.
            </li>
            <li>
              <strong>Public health and medical sociology:</strong> Research on adoption of new
              medical practices and health interventions.
            </li>
            <li>
              <strong>Consumer behavior and marketing research:</strong> Studies of how consumers
              adopted new products and product categories.
            </li>
          </ul>
        </section>

        {/* 7. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Diffusion of Innovations model conceptualizes innovation adoption as a process
            unfolding over time within a social system, influenced by innovation characteristics,
            individual attributes, communication processes, and social structures. The model
            emphasizes that adoption is neither instantaneous nor uniform across populations.
          </p>

          <h3 className={H3_CLASSES}>The Innovation-Decision Process</h3>
          <p className={PARAGRAPH_CLASSES}>
            Rogers specifies five stages through which individuals move in deciding to adopt or
            reject an innovation:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Knowledge stage:</strong> The individual becomes aware of the innovation and
              has some understanding of its basic functions.
            </li>
            <li>
              <strong>Persuasion stage:</strong> The individual forms a favorable or unfavorable
              attitude toward the innovation, influenced by perceived characteristics and social
              influences.
            </li>
            <li>
              <strong>Decision stage:</strong> The individual engages in mental and behavioral
              activity to adopt or reject the innovation, sometimes involving trial or pilot use.
            </li>
            <li>
              <strong>Implementation stage:</strong> The individual puts the innovation to use,
              often requiring training and technical support.
            </li>
            <li>
              <strong>Confirmation stage:</strong> The individual seeks reinforcement for the
              adoption decision, potentially discontinuing use if outcomes disappoint or
              contradictions emerge.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Adoption Rate and the S-Curve</h3>
          <p className={PARAGRAPH_CLASSES}>
            A central empirical finding is that innovation adoption follows an S-shaped (sigmoid)
            curve when graphed over time. Initially, adoption is slow. Then, as awareness spreads
            and social proof accumulates, adoption accelerates. Eventually, as the population of
            potential adopters shrinks, adoption slows again, approaching saturation. The steepness
            of the curve and the timing of the rapid adoption phase vary across innovations and
            social systems.
          </p>

          <h3 className={H3_CLASSES}>Adopter Categories</h3>
          <p className={PARAGRAPH_CLASSES}>
            Populations distribute across five adopter categories based on relative adoption timing:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Innovators (2.5%):</strong> Earliest adopters, often motivated by novelty and
              risk tolerance, with high education and broad social networks bridging multiple
              groups.
            </li>
            <li>
              <strong>Early Adopters (13.5%):</strong> Opinion leaders within their social systems,
              seeking information actively, and viewed as credible by others who follow their
              example.
            </li>
            <li>
              <strong>Early Majority (34%):</strong> Adopt before the average, deliberative in
              decision-making, and socially connected but not opinion leaders.
            </li>
            <li>
              <strong>Late Majority (34%):</strong> Adopt after the average, skeptical until social
              pressure builds, and economically constrained more than earlier adopters.
            </li>
            <li>
              <strong>Laggards (16%):</strong> Final adopters or non-adopters, motivated by
              tradition, with limited social networks and economic resources.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Comprehensive integrative framework:</strong> Successfully synthesizes
              empirical findings from hundreds of studies across disciplines into a coherent
              theoretical model.
            </li>
            <li>
              <strong>Clear conceptual structure:</strong> Articulates precisely defined core
              concepts enabling consistent measurement and comparison across diverse contexts.
            </li>
            <li>
              <strong>Practical applicability:</strong> Provides actionable guidance for change
              agents and organizational leaders to accelerate beneficial adoption.
            </li>
            <li>
              <strong>Explanatory power across contexts:</strong> Demonstrates strong applicability
              across diverse innovations, social systems, and time periods.
            </li>
            <li>
              <strong>Recognition of time as fundamental:</strong> Elevates temporal processes to
              central theoretical importance rather than treating adoption as an instantaneous
              event.
            </li>
            <li>
              <strong>Heterophily acknowledgment:</strong> Recognizes that innovation spread often
              requires communication between dissimilar individuals, explaining the role of change
              agents and opinion leaders.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Pro-innovation bias:</strong> The model assumes innovations are inherently
              desirable and should be widely diffused, limiting applicability to situations where
              diffusion is genuinely beneficial and sometimes failing to recognize that rejection
              may be rational.
            </li>
            <li>
              <strong>Individual-level focus with incomplete organizational theory:</strong> While
              accommodating organizational adoption, the organizational sections remain less
              developed than individual-level analysis, overlooking power structures and complex
              decision-making.
            </li>
            <li>
              <strong>Incomplete treatment of structural barriers:</strong> Emphasizes individual
              characteristics and psychological factors but gives less attention to structural
              barriers like economic constraints and infrastructure limitations.
            </li>
            <li>
              <strong>Limited predictive precision:</strong> While identifying factors affecting
              adoption rates, predictive accuracy for specific innovations in specific contexts
              remains moderate.
            </li>
            <li>
              <strong>Adoption rate measurement challenges:</strong> Defining &ldquo;adoption&rdquo;
              and measuring actual adoption versus stated intention proves complex, particularly for
              non-tangible innovations.
            </li>
            <li>
              <strong>Cultural and context limitations:</strong> While broadly applicable, the model
              emerged from Western research traditions; relative importance of factors may vary
              across cultural contexts.
            </li>
          </ul>
        </section>

        {/* 8. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Systematic integration across disciplines:</strong> Unified isolated diffusion
              research traditions (agricultural, medical, educational, consumer) into a coherent
              framework revealing universal diffusion patterns.
            </li>
            <li>
              <strong>Explicit time dimension:</strong> Elevated temporal processes to central
              theoretical importance through the five-stage innovation-decision process.
            </li>
            <li>
              <strong>Communication channel analysis:</strong> Provided systematic analysis of how
              communication types (mass media versus interpersonal) differentially support adoption
              at different decision stages.
            </li>
            <li>
              <strong>Innovation characteristics framework:</strong> Established a parsimonious set
              of five innovation attributes (relative advantage, compatibility, complexity,
              trialability, observability) predicting adoption rates.
            </li>
            <li>
              <strong>Adopter categorization system:</strong> Created a standardized classification
              of adopters based on timing that enables systematic comparison across innovations and
              populations.
            </li>
            <li>
              <strong>Social system focus:</strong> Emphasized that adoption outcomes reflect not
              just individual psychology but broader cultural, social, and structural contexts.
            </li>
            <li>
              <strong>Methodological legacy:</strong> Established rigorous measurement practices and
              research designs that remain standard in adoption and implementation science research.
            </li>
          </ul>
        </section>

        {/* 9. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Rogers&rsquo;s approach to establishing internal validity involved extensive synthesis
            and meta-analysis of existing diffusion research rather than conducting single
            validation studies:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Synthesis of empirical literature:</strong> Rogers synthesized findings from
              approximately 405 empirical diffusion studies conducted across multiple disciplines,
              providing convergent evidence for core concepts.
            </li>
            <li>
              <strong>Clear conceptual definitions:</strong> Established precisely defined core
              concepts (innovation, communication channels, time, social system) enabling consistent
              measurement and comparison across studies.
            </li>
            <li>
              <strong>Multi-disciplinary convergence:</strong> Demonstrated that research in
              education, rural sociology, public health, communication, marketing, and geography all
              produced findings supporting similar diffusion patterns.
            </li>
            <li>
              <strong>Consistent relationships across behaviors:</strong> Showed consistent adopter
              category patterns and innovation characteristic effects across diverse behaviors
              (agricultural adoption, medical innovation, educational technology, voting, family
              planning).
            </li>
            <li>
              <strong>Cross-population consistency:</strong> Documented consistent relationships
              across ages, educational levels, cultural backgrounds, and socioeconomic statuses.
            </li>
          </ul>
        </section>

        {/* 10. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Diffusion of Innovations achieved substantial external validity through diverse
            applications:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Diverse innovation types:</strong> The framework demonstrated applicability
              across technological innovations (hybrid seeds), medical innovations (new drugs and
              procedures), educational innovations, and organizational innovations.
            </li>
            <li>
              <strong>Cross-cultural case examples:</strong> The Los Molinos water-boiling case
              study from Peru exemplified diffusion in developing nations with different cultural
              systems, demonstrating applicability beyond Western industrialized societies.
            </li>
            <li>
              <strong>Multiple levels of analysis:</strong> Showed applicability to both
              individual-level adoption decisions and organizational-level adoption, demonstrating
              generalizability across analytical levels.
            </li>
            <li>
              <strong>Temporal generalizability:</strong> Demonstrated consistent patterns across
              both contemporary and historical cases spanning centuries, suggesting robust external
              validity across time periods.
            </li>
            <li>
              <strong>Real-world behavior measurement:</strong> Studies measured actual adoption
              (actual blood donation, voting, technology use) rather than only intentions,
              strengthening external validity claims.
            </li>
            <li>
              <strong>Implementation context validation:</strong> Organizational deployments of the
              model demonstrated effectiveness of Rogers&rsquo;s prescriptions for accelerating
              beneficial innovation adoption in real-world settings.
            </li>
          </ul>
        </section>

        {/* 11. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            Diffusion of Innovations is directly relevant to technology adoption because it explains
            how innovations spread through populations and identifies factors shaping adoption rates
            and patterns. The model provides organizational leaders with a comprehensive framework
            for understanding adoption barriers and designing effective acceleration strategies.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified by DOI</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Complexity barriers:</strong> Innovations perceived as difficult to understand
              and use encounter greater resistance. Complex technologies require more training and
              support.
            </li>
            <li>
              <strong>Low relative advantage:</strong> If individuals see little benefit from
              adoption, motivation decreases regardless of technology quality.
            </li>
            <li>
              <strong>Compatibility barriers:</strong> Innovations incompatible with existing
              values, beliefs, work processes, or organizational cultures face substantial adoption
              resistance.
            </li>
            <li>
              <strong>Low observability:</strong> Innovations whose benefits are not visible to
              potential adopters diffuse more slowly.
            </li>
            <li>
              <strong>Limited trialability:</strong> Innovations that cannot be tested on a limited
              basis before full commitment encounter more resistance.
            </li>
            <li>
              <strong>Social and cultural barriers:</strong> Network isolation, incompatible
              cultural values, and status considerations create adoption barriers.
            </li>
            <li>
              <strong>Structural barriers:</strong> Infrastructure limitations, economic
              constraints, and resource unavailability prevent adoption even among motivated
              individuals.
            </li>
            <li>
              <strong>Communication barriers:</strong> Ineffective change agent strategy, poor
              communication matching adoption stages, or geographic isolation prevent awareness and
              persuasion.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions DOI Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Adapt to innovation characteristics:</strong> Identify specific innovation
              characteristics creating barriers and design targeted strategies (training for
              complexity, demonstrations for low observability).
            </li>
            <li>
              <strong>Ensure innovation compatibility:</strong> Assess and address compatibility
              barriers through innovation adaptation or recipient system preparation.
            </li>
            <li>
              <strong>Leverage homophilous communication:</strong> Identify and empower local
              opinion leaders who share target population characteristics to serve as innovation
              advocates.
            </li>
            <li>
              <strong>Structure adoption-decision process:</strong> Differentiate strategies by
              innovation-decision stage, using mass media for knowledge, interpersonal communication
              for persuasion.
            </li>
            <li>
              <strong>Address structural barriers:</strong> Invest in infrastructure, provide
              economic support, and remove policy barriers preventing adoption.
            </li>
            <li>
              <strong>Design culturally appropriate strategies:</strong> Understand local values and
              belief systems; address compatibility barriers through education and cultural
              adaptation.
            </li>
            <li>
              <strong>Select and train change agents:</strong> Choose culturally competent change
              agents who understand local contexts and adopt client-oriented rather than
              innovation-oriented approaches.
            </li>
            <li>
              <strong>Identify and support early adopters:</strong> Support initial adoption among
              early adopters to create visible examples and build social proof.
            </li>
          </ul>
        </section>

        {/* 12. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Diffusion of Innovations provided the foundational framework upon which numerous
            subsequent adoption models built:
          </p>
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
              Adapted DOI&rsquo;s innovation-decision framework to technology contexts, emphasizing
              perceived usefulness and ease of use.
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
              While TPB extends TRA rather than DOI directly, it incorporated the role of perceived
              behavioral control in innovation adoption decisions, complementing DOI&rsquo;s focus on
              innovation characteristics with individual capability assessment.
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
              Integrated DOI with other adoption theories into a unified predictive framework.
            </li>
            <li>
              <strong>Implementation science frameworks:</strong> Applied DOI concepts to
              understanding dissemination and implementation of evidence-based practices in health
              and organizational contexts.
            </li>
            <li>
              <strong>Organizational innovation adoption models:</strong> Extended DOI&rsquo;s
              concepts to organizational and institutional adoption contexts.
            </li>
          </ul>
        </section>

        {/* 13. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-rogers-1962">
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. The Free Press.
            </li>
            <li id="ref-davis-1989">
              Davis, F. D. (1989). Perceived Usefulness, Perceived Ease of Use, and User Acceptance
              of Information Technology. <em>MIS Quarterly</em>, 13(3), 319-340.
              https://doi.org/10.2307/249008
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-davis-1989-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-ajzen-1991">
              Ajzen, I. (1991). The theory of planned behavior.{' '}
              <em>Organizational Behavior and Human Decision Processes</em>, 50(2), 179-211.
              https://doi.org/10.1016/0749-5978(91)90020-T
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-ajzen-1991-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
          </ol>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-rogers-1971">
              Rogers, E. M., &amp; Shoemaker, F. F. (1971).{' '}
              <em>Communication of innovations: A cross-cultural approach</em> (2nd ed.). Free
              Press.
            </li>
            <li id="ref-rogers-1983">
              Rogers, E. M. (1983). <em>Diffusion of innovations</em> (3rd ed.). The Free Press.
            </li>
            <li id="ref-rogers-2003">
              Rogers, E. M. (2003). <em>Diffusion of innovations</em> (5th ed.). Free Press.
            </li>
            <li id="ref-tarde-1890">
              Tarde, G. (1890). <em>The laws of imitation</em>. Henry Holt.
            </li>
            <li id="ref-wellin-1955">
              Wellin, E. (1955). Water boiling in a Peruvian village. In B. D. Paul (Ed.),{' '}
              <em>
                Health, culture, and community: Case studies of public reactions to health programs
              </em>
              . Russell Sage Foundation.
            </li>
          </ol>
        </section>

        {/* 14. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <p className={PARAGRAPH_CLASSES}>
            This article is part of a comprehensive bibliography examining foundational and
            contemporary models of technology adoption:
          </p>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-1-theory-of-reasoned-action-tra-fishbein-ajzen-1975"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Theory of Reasoned Action (TRA)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-3-social-cognitive-theory-sct-bandura-1986"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Social Cognitive Theory (SCT) &rarr;
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
