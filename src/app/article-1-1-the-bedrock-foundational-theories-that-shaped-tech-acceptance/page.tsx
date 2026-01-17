import React from 'react'
import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'

export const metadata: Metadata = {
  title: 'Article 1.1: The Bedrock — Foundational Theories That Shaped Tech Acceptance',
  description:
    'An overview of pre-TAM theories that laid the groundwork for technology acceptance research, including key constructs that influenced later adoption models.',
}

const FoundationalTheoriesPage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.1: The Bedrock – Foundational Theories That Shaped Tech Acceptance
        </h1>

        <section className="mb-6 sm:mb-10 text-gray-800">
          <p className="mb-3 sm:mb-6">
            Before the Technology Acceptance Model (TAM) provided a focused lens for information
            systems research, the study of why people choose to use a new technology was grounded in
            a broader and more diverse set of foundational theories. These “grandparent” models,
            drawn from sociology, social psychology, and management, provided the essential
            intellectual DNA for everything that followed. To understand the evolution of adoption
            research, we must first appreciate this bedrock—the core constructs and perspectives
            that early researchers adapted to the specific challenge of technology use.
          </p>
          <p className="mb-3 sm:mb-6">
            This article analyzes the key pre-TAM theories, explaining their core constructs and how
            they collectively laid the groundwork for the more specialized models that now define
            the field.
          </p>

          <h2 className={H2_CLASSES}>Diffusion of Innovations (DOI) Theory</h2>
          <p className="mb-3 sm:mb-6">
            Originating from a sociological perspective, Everett Rogers’ Diffusion of Innovations
            Theory [1] is one of the oldest and most influential theories in the field. It is not
            focused on a single adoption decision but on the macro-level process of how an
            innovation spreads through a social system over time. DOI describes the process by which
            individuals and organizations adopt new ideas, products, or practices.
          </p>
          <p className="mb-3 sm:mb-4">
            Its most enduring contribution to the field is the identification of five key perceived
            attributes of an innovation that influence its rate of adoption:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Relative Advantage:</strong> The degree to which an innovation is perceived as
              better than the idea it supersedes.
            </li>
            <li>
              <strong>Compatibility:</strong> The degree to which an innovation is perceived as
              consistent with existing values, past experiences, and needs.
            </li>
            <li>
              <strong>Complexity:</strong> The degree to which an innovation is perceived as
              difficult to understand and use.
            </li>
            <li>
              <strong>Trialability:</strong> The degree to which an innovation may be experimented
              with on a limited basis.
            </li>
            <li>
              <strong>Observability:</strong> The degree to which the results of an innovation are
              visible to others.
            </li>
          </ol>
          <p className="mb-3 sm:mb-6">
            Beyond these attributes, DOI is renowned for categorizing adopters based on their
            propensity to adopt innovations. The categories are:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Innovators (2.5%):</strong> Venturesome risk-takers who are the very first to
              adopt an innovation.
            </li>
            <li>
              <strong>Early Adopters (13.5%):</strong> Respected social leaders and opinion makers
              who adopt early but with more discretion than innovators.
            </li>
            <li>
              <strong>Early Majority (34%):</strong> Deliberate individuals who adopt new ideas just
              before the average member of a system.
            </li>
            <li>
              <strong>Late Majority (34%):</strong> Skeptical individuals who adopt an innovation
              only after a majority of people have tried it.
            </li>
            <li>
              <strong>Laggards (16%):</strong> Traditionalists who are the last to adopt an
              innovation, often with suspicion.
            </li>
          </ul>

          <h2 className={H2_CLASSES}>Theory of Reasoned Action (TRA)</h2>
          <p className="mb-3 sm:mb-6">
            Developed by Fishbein and Ajzen [2], the Theory of Reasoned Action was a landmark
            general theory in social psychology designed to explain the specifics of individual
            behavior. Its central premise is that the most immediate predictor of a person’s
            behavior is their behavioral intention—their subjective probability that they will
            perform the behavior in question.
          </p>
          <p className="mb-3 sm:mb-4">This intention, in turn, is determined by two key factors:</p>
          <ol className="list-decimal pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Attitude Toward the Behavior:</strong> The individual’s positive or negative
              feelings about performing the behavior. This is shaped by their behavioral beliefs
              (e.g., “Using this new software will make me more productive”).
            </li>
            <li>
              <strong>Subjective Norm:</strong> The individual’s perception of the social pressure
              to perform or not perform the behavior. This is shaped by their normative beliefs
              (e.g., “My manager and respected colleagues think I should use this new software”).
            </li>
          </ol>
          <p className="mb-3 sm:mb-6">
            TRA’s primary contribution was its elegant causal chain: beliefs influence attitudes and
            subjective norms, which together shape intentions, which in turn lead to behavior. It
            established the critical role of intention as a mediator and provided the basic
            two-pronged structure—personal attitude and social influence—that would become a staple
            of future adoption models.
          </p>

          <h2 className={H2_CLASSES}>Theory of Planned Behavior (TPB)</h2>
          <p className="mb-3 sm:mb-6">
            A decade and a half after TRA, Ajzen extended his own model to address a significant
            limitation: its assumption that behaviors are under a person’s complete volitional
            control. The resulting Theory of Planned Behavior [3] kept the core structure of TRA but
            added a critical third determinant of behavioral intention:
          </p>
          <p className="mb-3 sm:mb-6">
            <strong>1. Perceived Behavioral Control (PBC):</strong> An individual’s perception of
            the ease or difficulty of performing the behavior. This construct accounts for the
            presence or absence of requisite resources and opportunities (e.g., “I have the time,
            training, and technical support needed to learn this system”).
          </p>
          <p className="mb-3 sm:mb-6">
            PBC influences behavior directly and indirectly by influencing behavioral intention.
            This addition was profoundly important for technology adoption research, as it formally
            introduced the concepts of self-efficacy and facilitating conditions—barriers and
            enablers—into the dominant theoretical model.
          </p>

          <h2 className={H2_CLASSES}>Social Cognitive Theory (SCT)</h2>
          <p className="mb-3 sm:mb-6">
            While TRA and TPB focused on a linear path from belief to behavior, Bandura’s Social
            Cognitive Theory [4] proposed a more dynamic model of triadic reciprocal determinism.
            SCT posits that behavior is the result of a continuous interaction between three
            factors:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Personal Factors:</strong> An individual’s cognitive, affective, and
              biological attributes (e.g., self-efficacy, knowledge).
            </li>
            <li>
              <strong>Environmental Factors:</strong> The external social and physical environment
              (e.g., social norms, access to resources).
            </li>
            <li>
              <strong>Behavior:</strong> The individual’s actions.
            </li>
          </ol>
          <p className="mb-3 sm:mb-6">
            A key contribution of SCT to technology adoption was its emphasis on self-efficacy—an
            individual’s belief in their own capability to execute the actions required to achieve a
            specific goal. This concept is a more refined version of TPB’s Perceived Behavioral
            Control and became a cornerstone construct in many subsequent models.
          </p>

          <h2 className={H2_CLASSES}>Motivational Model (MM)</h2>
          <p className="mb-3 sm:mb-6">
            While many theories focused on instrumental drivers, the Motivational Model, as applied
            by Davis, Bagozzi, and Warshaw [5], highlighted a different set of drivers. Drawing from
            Self-Determination Theory, the MM argues that behavior is also influenced by:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 font-sans text-base">
            <li>
              <strong>Extrinsic Motivation:</strong> The drive to perform a behavior because it is
              perceived to be instrumental in achieving valued outcomes (e.g., usefulness).
            </li>
            <li>
              <strong>Intrinsic Motivation:</strong> The drive to perform a behavior for its own
              sake, simply for the pleasure and satisfaction derived from the process (e.g.,
              enjoyment).
            </li>
          </ul>
          <p className="mb-3 sm:mb-6">
            The MM’s crucial contribution was the formal introduction of intrinsic motivation, or
            perceived enjoyment, as a direct determinant of technology use.
          </p>

          <h2 className={H2_CLASSES}>Model of PC Utilization (MPCU)</h2>
          <p className="mb-3 sm:mb-6">
            The Model of PC Utilization [6] represents a key early attempt to move from general
            theories to a specific model of information systems use. Thompson, Higgins, and Howell
            synthesized constructs from several of the theories mentioned above, including DOI and
            TPB, to create a more comprehensive model.
          </p>
          <p className="mb-3 sm:mb-6">
            The MPCU is significant not for its dominance—it was soon overshadowed—but for its role
            as a conceptual bridge. It demonstrated the value of integrating multiple theoretical
            perspectives and tailoring them to the specific context of computer use, setting the
            stage for the parsimonious and powerful model that would come to define the field: the
            Technology Acceptance Model.
          </p>
        </section>

        <SeriesNavigation />

        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            References
          </h2>
          <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-600 space-y-3 font-sans">
            <li>Rogers, E. M. (1962). Diffusion of Innovations. Free Press of Glencoe.</li>
            <li>
              Fishbein, M., & Ajzen, I. (1975). Belief, Attitude, Intention, and Behavior: An
              Introduction to Theory and Research. Addison-Wesley.
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
              Bandura, A. (1986). Social foundations of thought and action: A social cognitive
              theory. Prentice-Hall.
            </li>
            <li>
              Davis, F. D., Bagozzi, R. P., & Warshaw, P. R. (1992). Extrinsic and intrinsic
              motivation to use computers in the workplace. Journal of Applied Social Psychology,
              22(14), 1111-1132.{' '}
              <a
                href="https://doi.org/10.1111/j.1559-1816.1992.tb00945.x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.1111/j.1559-1816.1992.tb00945.x
              </a>
            </li>
            <li>
              Thompson, R. L., Higgins, C. A., & Howell, J. M. (1991). Personal computing: Toward a
              conceptual model of utilization. MIS Quarterly, 15(1), 125-143.{' '}
              <a
                href="https://doi.org/10.2307/249443"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doi.org/10.2307/249443
              </a>
            </li>
          </ol>
        </section>
      </article>
    </main>
  )
}

export default FoundationalTheoriesPage
