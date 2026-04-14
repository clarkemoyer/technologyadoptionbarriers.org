import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'
import ArticleTOC from '@/components/article-toc'

export const metadata: Metadata = {
  title: 'Article 2.5: The Modern Mandate - Frameworks for Cybersecurity and Risk',
  description:
    'Frameworks for cybersecurity and risk management - NIST RMF, NIST CSF, CMMC, and ISO 27001 - that shape organizational technology adoption decisions.',
}

const Article25Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 2.5: The Modern Mandate - Frameworks for Cybersecurity and Risk
        </h1>

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            In 2013, a major retailer suffered a breach that exposed customer credit card data from
            millions of transactions. The investigation revealed that the attacker had accessed the
            system months earlier but remained undetected. The retailer had security technology -
            firewalls, intrusion detection systems, antivirus software - yet the breach still
            occurred. The problem was not lack of technology; it was lack of systematic security
            practice. The organization had security tools but no coherent security framework, no
            systematic monitoring approach, no clear understanding of critical assets needing
            protection, no documented incident response procedures.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This breach exemplified a lesson that organizations learned repeatedly throughout the
            2010s and 2020s: security is not something you buy. It is something you do. No firewall,
            no matter how sophisticated, can prevent all attacks. No encryption, no matter how
            strong, makes sense if you don&apos;t know what needs encrypting. No incident response
            team, no matter how talented, can act effectively without clear protocols and decision
            authorities. Effective security requires organizational practice grounded in frameworks
            that provide systematic guidance.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This realization led to the emergence of mature cybersecurity and technology risk
            frameworks. Unlike point-in-time security guidance addressing specific vulnerabilities,
            these frameworks provide comprehensive approaches to identifying, managing, and
            monitoring technology risk. They treat security not as an IT problem but as a
            fundamental business challenge requiring systematic, organization-wide management. This
            article surveys the frameworks that have shaped how organizations approach cybersecurity
            and technology risk in the modern era.
          </p>

          <h2 className={H2_CLASSES}>Risk as a Strategic Business Imperative</h2>
          <p className={PARAGRAPH_CLASSES}>
            To understand contemporary security frameworks, we must first reframe how organizations
            think about security. For decades, many organizations viewed security as an IT
            department responsibility. Security specialists implemented technologies and policies;
            everyone else largely ignored security until something went wrong. Contemporary
            frameworks reject this perspective. They treat security as a business risk requiring
            management at the most senior levels of organizations.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This reframing is critical. When security is viewed as an IT problem, organizations make
            technology-first decisions. They deploy firewalls, intrusion detection systems, and
            complex access control systems. These technologies are necessary but insufficient.
            Effective security requires that business leaders understand which assets matter most,
            are willing to accept certain risks strategically, allocate adequate resources to
            security, establish governance structures for security decisions, and create
            organizational cultures where security considerations influence routine business
            decisions [1].
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Modern cybersecurity frameworks provide organizational leaders with structures for
            managing security as a strategic business concern. They specify what organizations
            should do to manage risk systematically. They provide maturity models so organizations
            can assess whether they are managing risk at appropriate levels. They offer guidance on
            governance, organizational structure, and decision-making approaches necessary for
            effective security management [1][2][3].
          </p>

          <h2 className={H2_CLASSES}>NIST Risk Management Framework: The Federal Gold Standard</h2>
          <p className={PARAGRAPH_CLASSES}>
            The National Institute of Standards and Technology (NIST), the U.S. agency responsible
            for developing technical standards, published the Risk Management Framework (RMF) in
            2010 and updated it substantially in 2018 [1]. The RMF emerged from decades of federal
            government experience implementing information security across thousands of agencies,
            contractors, and systems. It synthesizes lessons from military security practices,
            civilian government experience, and commercial security expertise into a framework
            applicable to organizations of all sizes and sectors.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The NIST RMF specifies a structured process for managing information security risk [1]:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Prepare </strong>involves establishing the context for security management.
            Organizations assess their risk environment, establish organizational risk tolerance,
            define organizational roles and responsibilities for security, and identify which
            information systems are critical to organizational success.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Categorize </strong>involves classifying information systems based on the impact
            their compromise, loss, or degradation would have on organizational operations. A system
            whose failure would significantly disrupt critical operations requires stronger security
            controls than systems whose failure would create minor inconvenience.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Select </strong>involves selecting appropriate security controls based on
            categorization and risk assessment. If a system is categorized as high-impact,
            organizations select stronger controls than for low-impact systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Implement </strong>involves actually implementing selected security controls
            within the organization&apos;s information systems.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Assess </strong>involves evaluating whether implemented controls are actually
            effective. Organizations assess whether controls are designed correctly, implemented
            correctly, and operating effectively [1].
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Authorize </strong>involves senior management formally accepting residual risk
            and authorizing continued system operation. Rather than assuming perfect security, the
            RMF acknowledges that all systems operate with some residual risk. Senior leaders must
            formally accept that risk based on understanding the controls in place and the residual
            vulnerabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Monitor </strong>involves continuously monitoring systems to ensure controls
            remain effective and to detect security incidents early [1].
          </p>
          <p className={PARAGRAPH_CLASSES}>
            What makes the RMF powerful is its recognition that security is not a one-time
            implementation. Rather, it is a continuous cycle of assessment, improvement, and
            monitoring. Systems are not &quot;secured&quot; in some permanent sense; rather,
            organizations must continuously verify that security controls remain appropriate and
            effective as threats evolve, technologies change, and organizational requirements shift.
          </p>

          <h2 className={H2_CLASSES}>
            NIST Cybersecurity Framework: Security for Every Organization
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            While the RMF provides detailed technical guidance suited to federal agencies, NIST
            recognized that many organizations needed higher-level guidance that did not presuppose
            the technical sophistication of federal agencies. In 2014, NIST published the
            Cybersecurity Framework (CSF), which it updated in 2018 [2]. The CSF focuses on
            high-level functions rather than detailed technical controls.
          </p>
          <p className={PARAGRAPH_CLASSES}>The CSF specifies five core functions [2]:</p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Identify </strong>involves understanding organizational assets, systems, and
            data. Organizations cannot protect what they do not know they have. Many organizations
            struggle with asset visibility - they do not have complete inventories of systems,
            applications, and data. The Identify function requires organizations to establish
            comprehensive understanding of what they are trying to protect.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Protect </strong>involves implementing security controls to prevent unauthorized
            access, theft, damage, or disruption. This function includes access controls,
            encryption, security awareness training, and other preventive measures.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Detect </strong>involves identifying when security incidents have occurred.
            Detection is critical because prevention is never perfect; attackers will sometimes
            breach defenses. Organizations must have capabilities to notice when breaches occur so
            they can respond before significant damage is done.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Respond </strong>involves responding to detected incidents. This includes
            containment, eradication, and notification [2].
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Recover </strong>involves recovering from security incidents and restoring
            systems to normal operation.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            What distinguishes the CSF is its voluntary nature and its applicability across sectors.
            The CSF has achieved remarkable adoption across healthcare, finance, critical
            infrastructure, manufacturing, and numerous other sectors. Its flexibility allows
            organizations to implement the functions in ways appropriate to their sector, size, and
            risk tolerance [2].
          </p>

          <h2 className={H2_CLASSES}>CMMC: Verification, Not Just Trust</h2>
          <p className={PARAGRAPH_CLASSES}>
            In 2019, the U.S. Department of Defense issued guidance establishing the Cybersecurity
            Maturity Model Certification (CMMC) as a requirement for organizations in the Defense
            Industrial Base - companies that supply products and services to the Department of
            Defense [3]. CMMC emerged from recognition that the previous approach of &quot;trust but
            verify&quot; was insufficient. The DoD had required contractors to claim they
            implemented certain security practices, but had limited ability to verify those claims.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            CMMC establishes a different model: third-party certification. Contractors must be
            assessed by external auditors against defined maturity levels and demonstrate compliance
            through certification, not just self-assessment.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            CMMC specifies maturity levels building upon NIST standards [3]:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Level 1 (Foundational) </strong>requires implementation of basic security
            practices covering areas like access control, identification, and incident response.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Level 2 (Advanced) </strong>requires more sophisticated practices like
            configuration management, vulnerability assessment, and risk assessment.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Levels 3-5 (Progressive) </strong>require progressively more sophisticated
            practices appropriate to organizations handling highly sensitive information or
            operating in critical infrastructure contexts [3].
          </p>
          <p className={PARAGRAPH_CLASSES}>
            CMMC&apos;s model of third-party certification is becoming increasingly influential
            beyond the Defense Industrial Base. Supply chain security concerns have motivated many
            organizations to require security assessments of critical vendors and service providers.
          </p>

          <h2 className={H2_CLASSES}>ISO 27001: The International Standard</h2>
          <p className={PARAGRAPH_CLASSES}>
            While NIST frameworks emerged from U.S. context, many multinational organizations
            required internationally applicable guidance. The International Organization for
            Standardization published ISO/IEC 27001, an international standard for information
            security management systems [4]. ISO 27001 specifies requirements for implementing,
            maintaining, and continuously improving information security management systems.
            Organizations can be formally certified as ISO 27001 compliant through third-party
            audits.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The value of ISO 27001 lies in its international recognition. Organizations with global
            operations, organizations serving international markets, and organizations in
            jurisdictions that recognize ISO standards can use ISO 27001 as a common security
            framework. Many organizations implement both NIST and ISO frameworks, recognizing that
            they are complementary rather than competitive - they address the same security
            challenges from slightly different angles.
          </p>

          <h2 className={H2_CLASSES}>Synthesis: Layered Defense and Organizational Maturity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Contemporary security frameworks share several common characteristics. First, they treat
            security as an organizational concern requiring management from top leadership, not just
            technical implementation. Second, they recognize that security requires multiple
            complementary approaches - technical controls, procedural controls, and organizational
            practices all matter. Third, they recognize that security is not static; it requires
            continuous improvement and adaptation as threats evolve.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            These frameworks are not in competition. The NIST RMF and CSF are complementary - the
            RMF provides detailed technical guidance while the CSF provides a high-level functional
            framework. CMMC builds on NIST standards by adding third-party certification. ISO 27001
            provides international applicability. Organizations often implement multiple frameworks
            simultaneously, recognizing that each provides value.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The most important insight from these frameworks is that compliance alone is
            insufficient. An organization can implement every control specified by a framework and
            still suffer significant security incidents. True security requires viewing frameworks
            as baselines - minimum expectations - and going beyond compliance to build
            organizational security cultures where protecting information assets is viewed as
            everyone&apos;s responsibility [1][2][3][4].
          </p>

          <h2 className={H2_CLASSES}>The Risk Management Imperative</h2>
          <p className={PARAGRAPH_CLASSES}>
            Underlying all these frameworks is a fundamental principle: all organizations face
            information security risks. Organizations cannot eliminate risk; they can only manage
            it. The goal is not perfect security - an impossible and economically unjustifiable
            pursuit. The goal is to understand risks, make informed decisions about which risks to
            accept and which to mitigate, implement controls appropriate to organizational risk
            tolerance, monitor continuously for threats, and continuously improve security
            practices.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Organizations that excel at security management implement frameworks not because
            compliance requires them but because they recognize security as fundamental to
            organizational resilience. They use frameworks to structure thinking about what matters
            most. They make informed decisions about resource allocation to security. They build
            security considerations into procurement, system design, and operational decisions. They
            create governance structures ensuring that security concerns are heard alongside
            business, financial, and operational concerns when organizations make significant
            decisions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This is the mandate of contemporary security frameworks: to help organizations
            systematically manage information security risk as a business imperative. They move
            security from the status of a technical afterthought to a strategic organizational
            responsibility requiring leadership attention, governance structures, and continuous
            improvement. In an era when information is among organizations&apos; most valuable
            assets and when security breaches can have severe financial and reputational
            consequences, this framework-driven approach to security management is not optional - it
            is essential.
          </p>
        </section>

        <SeriesNavigation />

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              NIST. (2018). Risk Management Framework for Information Systems and Organizations (SP
              800-37, Rev. 2). National Institute of Standards and Technology.
            </li>
            <li>
              NIST. (2018). Framework for Improving Critical Infrastructure Cybersecurity, Version
              1.1. National Institute of Standards and Technology.
            </li>
            <li>
              U.S. Department of Defense. (n.d.). Cybersecurity Maturity Model Certification (CMMC)
              2.0. DoD Contract Management Guidance.
            </li>
            <li>
              ISO/IEC. (2022). ISO/IEC 27001:2022 - Information Security Management Systems.
              International Organization for Standardization.
            </li>
          </ol>
        </section>
      </article>
      <ArticleTOC />
    </main>
  )
}

export default Article25Page
