import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
  REFERENCES_H2_CLASSES,
  REFERENCES_OL_CLASSES,
} from '@/lib/articleStyles'
import SeriesNavigation from '@/components/series-navigation'
import ArticleTOC from '@/components/article-toc'

export const metadata: Metadata = {
  title: 'Article 1.6: Context is King - Specialized Individual Adoption Models',
  description:
    'Exploring specialized models that address context-specific adoption factors: Task-Technology Fit, household adoption dynamics, and value-based frameworks.',
}

const Article16Page = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Article 1.6: Context is King - Specialized Individual Adoption Models
        </h1>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Introduction: The Limits of Universal Models</h2>
          <p className={PARAGRAPH_CLASSES}>
            As researchers refined technology adoption frameworks throughout the 1990s and early
            2000s, they pursued increasingly universal models-theories explaining adoption across
            diverse technologies, user populations, and organizational contexts. The Technology
            Acceptance Model demonstrated that perceived usefulness and ease of use predict adoption
            across systems from email to enterprise resource planning. The Unified Theory of
            Acceptance and Use of Technology integrated eight models into a comprehensive framework
            explaining adoption across organizational and demographic contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Yet even as these unifying frameworks succeeded at predicting adoption broadly, they
            sometimes struggled to capture adoption dynamics in specific contexts. Researchers began
            observing patterns that general models could not fully explain: Why did systems with
            high perceived usefulness and ease of use sometimes fail to improve actual job
            performance? Why did household technology adoption follow fundamentally different
            patterns than workplace adoption? Why did some individuals enthusiastically adopt
            technologies that violated their deeper values and purposes?
          </p>
          <p className={PARAGRAPH_CLASSES}>
            These questions motivated development of specialized adoption models addressing
            context-specific factors that general frameworks minimized or overlooked. Rather than
            seeking universal applicability, these models deliberately focused on particular
            adoption domains-organizational work tasks, household environments, personal value
            alignment-where contextual factors shaped adoption processes in distinctive ways.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This article examines three influential specialized models: the Task-Technology Fit
            model emphasizing alignment between task requirements and technology capabilities, the
            Model of Adoption of Technology in Households addressing family decision-making and
            non-utilitarian motivations, and the Value-Based Adoption Model grounding technology
            acceptance in personal values. Together, these models demonstrate that while universal
            frameworks provide broad insight, understanding adoption in specific contexts requires
            attention to factors that general models treat as peripheral but that prove central in
            particular domains.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            Task-Technology Fit: The Principle That Fit Beats Universal Usefulness
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Dale Goodhue and Ronald Thompson&apos;s 1995 Task-Technology Fit (TTF) model emerges
            from a deceptively simple observation: technologies receiving strong adoption often fail
            to improve performance, while technologies not perceived as particularly useful
            sometimes enhance performance dramatically. This paradox revealed a fundamental gap in
            adoption research. The field had become expert at predicting whether people would use a
            system but had largely ignored whether that use would actually improve their
            performance.
          </p>

          <h3 className={H3_CLASSES}>The Core Insight: Fit Matters More Than Usefulness</h3>
          <p className={PARAGRAPH_CLASSES}>
            The insight driving TTF is disarmingly elegant: it is not enough for technology to be
            easy to use or useful in some abstract sense. The technology must provide capabilities
            matched to the specific tasks a user performs. A spreadsheet program is tremendously
            useful for financial analysis but useless for writing poetry. An email system fits
            perfectly with asynchronous communication but poorly with real-time collaboration
            requiring immediate back-and-forth exchange. Usefulness, in other words, is not a
            property inherent to the technology itself but rather a relationship between task
            requirements and technology capabilities.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Goodhue and Thompson conducted a large-scale empirical study of 662 respondents using 25
            information technologies across a transportation company (Company A, n=400) and an
            insurance company (Company B, n=262). Across 8 regression models (Table 3, p.227), the
            fit-as-matching conception of task-technology fit predicted self-reported individual
            performance impacts more consistently than utilization alone, with adjusted R-squared
            values ranging from 0.04 to 0.25 across the regressions. In other words, how well the
            system matched the work people actually did mattered more than how much people used it.
            Users could employ a poorly-fitting system intensively and still fail to improve
            performance. Conversely, users of a well-fitting system improved performance even with
            more modest utilization.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This finding flipped conventional adoption wisdom on its head. Organizations typically
            measure adoption success through utilization rates-how many employees use the system,
            how frequently, how extensively. But Goodhue and Thompson demonstrated that utilization
            without fit is largely wasted effort. A person forced to conduct their work through an
            inadequate system may become more &ldquo;efficient&rdquo; at working around its
            limitations, but the technology itself provides little performance benefit.
          </p>

          <h3 className={H3_CLASSES}>The Framework: Three Core Determinants</h3>
          <p className={PARAGRAPH_CLASSES}>
            The task-technology fit framework identifies three core determinants of whether a
            technology will improve performance. <strong>Task characteristics</strong>-the
            complexity, variety, interdependence, and information requirements of the work-define
            what capabilities a technology must possess. Complex tasks requiring integration of
            diverse information sources demand more sophisticated technology. Simple, routine tasks
            may be adequately supported by straightforward technology.{' '}
            <strong>Technology characteristics</strong>-functionality, reliability, data quality,
            and user interface-define what the system can actually do.{' '}
            <strong>Task-technology fit </strong>itself represents the degree of alignment between
            task requirements and technology capabilities.
          </p>

          <h3 className={H3_CLASSES}>Implications for Practice</h3>
          <p className={PARAGRAPH_CLASSES}>
            What makes TTF particularly valuable for practitioners is that it reframes technology
            selection and implementation decisions. Rather than asking &ldquo;Will our employees
            adopt this system?&rdquo; or &ldquo;Do users perceive this as useful and easy to
            use?&rdquo;, the TTF framework demands asking &ldquo;Does this system actually support
            the specific work our users perform?&rdquo; This shifts focus from adoption metrics to
            impact metrics, from activity to outcomes.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For organizations, the implications are profound. Technology selection should prioritize
            fit over adoptability. A system that perfectly matches task requirements but requires
            extensive training is preferable to an easy-to-use system that cannot adequately support
            critical work. Implementation strategies should maximize utilization of well-fitting
            systems while recognizing that forcing greater utilization of poor-fitting systems may
            actually harm performance by locking people into inadequate processes. When fit is poor,
            the appropriate organizational response is not increased training or incentives for use
            but rather system modification, task redesign, or system replacement.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The TTF model also addresses a critical tension in technology management. Organizations
            invest substantially in systems expecting performance improvements. Yet they often
            evaluate success through adoption metrics rather than performance metrics. A system
            widely adopted but failing to improve productivity represents investment failure, not
            success. Conversely, a system with less universal adoption but strong fit may deliver
            substantial organizational benefits. TTF provides theoretical justification for shifting
            accountability from adoption to impact.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            Household Adoption: Technology in Non-Organizational Contexts
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            Susan Brown and Viswanath Venkatesh&apos;s 2005 Model of Adoption of Technology in
            Households (MATH) addresses a critical blind spot in technology adoption research. While
            extensive research examined organizational contexts where supervisors mandate technology
            use and job performance depends on adoption, household technology adoption operates
            under fundamentally different conditions. Families make voluntary adoption decisions,
            involve multiple decision-makers with potentially conflicting preferences, consider both
            utilitarian and hedonic benefits, and weigh costs directly against household budgets.
          </p>

          <h3 className={H3_CLASSES}>Why Household Adoption is Different</h3>
          <p className={PARAGRAPH_CLASSES}>
            The MATH model recognizes that household technology adoption cannot be adequately
            understood through workplace-derived models. Organizations can impose technology
            adoption through policies and procedures. Households cannot. Organizational adoption
            focuses on job performance and productivity. Household adoption embraces entertainment,
            communication, lifestyle enhancement, and convenience. Organizational decision-making
            follows hierarchical authority. Household decision-making involves negotiation and
            consensus-seeking. The context is sufficiently different that specialized theoretical
            frameworks become necessary.
          </p>

          <h3 className={H3_CLASSES}>The MATH Framework: Extended TAM for Households</h3>
          <p className={PARAGRAPH_CLASSES}>
            MATH integrates insights from multiple theoretical traditions. It retains the TAM
            framework&apos;s emphasis on perceived usefulness and ease of use but extends it
            significantly. The model incorporates <strong>hedonic outcomes</strong>
            -entertainment value, enjoyment, fun-recognizing that household technology adoption is
            motivated not just by practical utility but by pleasure. It measures{' '}
            <strong>cost considerations </strong>explicitly, acknowledging that price sensitivity is
            central to household purchasing decisions in ways it is not in organizational technology
            adoption. It identifies <strong>self-efficacy</strong>-confidence in one&apos;s ability
            to use technology-as critical to household adoption, recognizing that many household
            members lack technical expertise. And it incorporates{' '}
            <strong>normative influences </strong>from friends, family, secondary sources, and
            workplace referents, capturing the social context in which household adoption occurs.
          </p>

          <h3 className={H3_CLASSES}>The Role of Household Life Cycle</h3>
          <p className={PARAGRAPH_CLASSES}>
            Perhaps most innovatively, MATH incorporates <strong>household life cycle </strong>as a
            fundamental moderator of adoption decisions and drivers. Young couples without children
            face different technology needs and priorities than families with dependent children or
            mature households preparing for retirement. The availability of applicable uses-what the
            technology can do for the household&apos;s specific needs-varies by life stage.
            Teenagers in the household increase demand for entertainment applications; young
            children increase demand for educational applications; working parents increase demand
            for household management applications. The same technology may be perceived as essential
            in one household life stage and unnecessary in another.
          </p>

          <h3 className={H3_CLASSES}>Context Shapes Adoption</h3>
          <p className={PARAGRAPH_CLASSES}>
            What Brown and Venkatesh demonstrate through MATH is that context fundamentally shapes
            adoption. A technology that is easy to use but expensive will have low adoption in
            cost-conscious households despite high perceived ease of use. A technology offering
            utilitarian benefits will have low adoption in households valuing hedonic outcomes
            unless it also provides entertainment value. A technology that improves personal
            productivity will have limited household adoption unless family members perceive its
            benefits. The household context makes adoption a multi-dimensional decision involving
            multiple stakeholders with different values and preferences.
          </p>

          <h3 className={H3_CLASSES}>Marketing and Development Implications</h3>
          <p className={PARAGRAPH_CLASSES}>
            For marketers and technology developers, MATH provides crucial insight into segmentation
            and positioning. Marketing to young families with children requires different messaging
            than marketing to mature households. Emphasizing educational benefits and family sharing
            capabilities resonates with family-stage households. Emphasizing convenience and
            time-saving appeals to busy professional households. Emphasizing entertainment and
            social connection appeals to younger households prioritizing leisure activities.
            Recognizing household composition and life stage as critical contextual factors allows
            targeted strategies that speak to what different households actually value.
          </p>

          <h3 className={H3_CLASSES}>Household-Specific Barriers</h3>
          <p className={PARAGRAPH_CLASSES}>
            MATH also identifies barriers specific to household adoption.{' '}
            <strong>Cost barriers </strong>are direct and salient-families making purchasing
            decisions with limited discretionary income directly perceive the price impact.{' '}
            <strong>Perceived usefulness barriers </strong>emerge when households cannot identify
            how technology serves their specific needs. <strong>Ease of use barriers</strong>{' '}
            operate particularly strongly when household members lack technical expertise.{' '}
            <strong>Fear and anxiety about technology advancement </strong>prove salient, especially
            for older household members who perceive technology as advancing faster than they can
            learn. <strong>Self-efficacy barriers </strong>reflect confidence gaps that
            organizational mandates can override but household choice cannot.{' '}
            <strong>Social barriers </strong>operate differently than in organizations-not everyone
            in the household may share enthusiasm for technology adoption, and disagreement about
            whether a technology is worth the cost and learning effort can prevent household-level
            adoption.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Value-Based Adoption: Beyond Utility to Personal Purpose</h2>
          <p className={PARAGRAPH_CLASSES}>
            Hee-Su Kim, Yolande Chan, and Nitin Gupta&apos;s 2007 Value-Based Adoption of Mobile
            Internet (VAM) model moves adoption research in a different direction entirely,
            grounding adoption decisions in personal values rather than instrumental perceptions.
            The insight driving VAM is that individuals adopt technologies not just because they
            perceive them as useful and easy to use, but because the technologies serve what
            individuals fundamentally value in life.
          </p>

          <h3 className={H3_CLASSES}>A Fundamental Shift: From Utility to Values</h3>
          <p className={PARAGRAPH_CLASSES}>
            This represents a profound shift in how we understand adoption. The TAM framework asks
            &ldquo;Is this useful and easy?&rdquo; VAM asks &ldquo;Does this support what I care
            about?&rdquo; Different individuals adopt the same technology for fundamentally
            different reasons reflecting different value systems. One person adopts mobile internet
            to increase productivity and success at work (achievement values). Another adopts to
            maintain relationships with distant family members (benevolence and connection values).
            A third adopts for entertainment and enjoyment (hedonic values). A fourth adopts to
            maintain independence and autonomy (self-direction values). A fifth refuses to adopt out
            of concerns that constant connectivity undermines family time (traditional values).
          </p>

          <h3 className={H3_CLASSES}>Schwartz&apos;s Theory of Human Values</h3>
          <p className={PARAGRAPH_CLASSES}>
            VAM draws on Schwartz&apos;s comprehensive theory of human values, which identifies
            distinct value dimensions that motivate human behavior.{' '}
            <strong>Achievement values </strong>emphasize success, ambition, and accomplishment.{' '}
            <strong>Self-direction values </strong>emphasize autonomy, independence, and control.{' '}
            <strong>Benevolence values </strong>emphasize helping others and community welfare.{' '}
            <strong>Hedonic values </strong>emphasize pleasure, enjoyment, and fun.{' '}
            <strong>Stimulation values </strong>emphasize excitement and novelty.{' '}
            <strong>Security values </strong>emphasize safety, stability, and protection.{' '}
            <strong>Conformity values </strong>emphasize social order and obligation.{' '}
            <strong>Tradition values </strong>emphasize cultural preservation.{' '}
            <strong>Universalism values </strong>emphasize understanding, environmental protection,
            and concern for all humanity. <strong>Power values </strong>emphasize status, influence,
            and prestige.
          </p>

          <h3 className={H3_CLASSES}>Values as Adoption Drivers</h3>
          <p className={PARAGRAPH_CLASSES}>
            The VAM model proposes that individuals evaluate technologies not just through
            utilitarian lenses but through value lenses. When mobile internet adoption aligns with
            what an individual values, adoption occurs. When adoption would undermine personal
            values, resistance emerges-regardless of whether the technology is useful and easy to
            use. Someone who deeply values family time and tradition may reject mobile internet
            because they perceive it as undermining these values, even if colleagues report it is
            useful and easy to use.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Kim, Chan, and Gupta demonstrated this empirically by showing that personal values
            predict adoption intention above and beyond perceived usefulness and ease of use.
            Different value segments adopted for different reasons. Achievement-oriented consumers
            adopted mobile internet to become more efficient and productive. Socially-motivated
            consumers adopted to strengthen relationships and maintain connection. Pleasure-oriented
            consumers adopted for entertainment. Security-focused consumers adopted only with strong
            privacy and security assurances. The research revealed that a one-size-fits-all
            marketing approach emphasizing the same utilitarian benefits would fail to resonate
            across value segments.
          </p>

          <h3 className={H3_CLASSES}>Perceived Value as the Central Construct</h3>
          <p className={PARAGRAPH_CLASSES}>
            VAM introduces <strong>perceived value </strong>as the central mediating construct
            between beliefs and adoption intention. Perceived value represents the overall
            assessment of a technology&apos;s worth based on perceptions of what is received
            (benefits) and what is given (costs). Benefits include not just functional utility but
            emotional satisfaction, social outcomes, and alignment with personal identity. Costs
            include not just monetary price but time investment, cognitive effort, social risks, and
            potential value conflicts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Different individuals weight these benefit and cost components differently based on
            their values. Someone valuing achievement weights productivity benefits heavily and
            discounts entertainment benefits. Someone valuing pleasure weights entertainment
            benefits heavily and views productivity as secondary. Someone valuing tradition may
            perceive potential social disruption as a significant cost that outweighs utilitarian
            benefits. VAM suggests that understanding what individuals value is essential to
            understanding how they calculate perceived value and, ultimately, whether they adopt.
          </p>

          <h3 className={H3_CLASSES}>Practical Applications</h3>
          <p className={PARAGRAPH_CLASSES}>
            For technology marketers and designers, the VAM framework suggests segmentation and
            positioning strategies grounded in value alignment rather than demographic categories or
            usage patterns. Rather than marketing mobile internet identically to all potential
            users, marketers should develop value-specific messaging. Achievement-oriented segments
            respond to messages emphasizing productivity, success, and competitive advantage.
            Socially-oriented segments respond to messages emphasizing connection, relationships,
            and community. Pleasure-oriented segments respond to messages emphasizing entertainment,
            enjoyment, and lifestyle enhancement. Security-oriented segments respond to messages
            emphasizing safety, privacy protection, and reliability.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Technology design can also reflect value sensitivity. Systems designed for
            achievement-oriented users should emphasize efficiency, performance metrics, and
            integration with productivity tools. Systems designed for socially-oriented users should
            emphasize communication features, social sharing, and relationship management. Systems
            designed for pleasure-oriented users should emphasize entertainment, aesthetics, and
            enjoyable interaction. Systems designed for security-oriented users should emphasize
            privacy controls, data protection, and transparent security features.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>The Convergence: Context-Specific Factors Shape Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            Task-Technology Fit, the Model of Adoption of Technology in Households, and Value-Based
            Adoption models converge on a shared insight: adoption determinants vary systematically
            across contexts, and understanding these contextual variations requires frameworks
            tailored to specific adoption domains. General models like TAM and UTAUT provide broad
            predictive power by identifying factors operating across diverse contexts. Specialized
            models provide deeper insight into particular domains by incorporating factors that
            matter intensely in specific contexts but may be peripheral in others.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Task-Technology Fit demonstrates that in organizational work contexts, the alignment
            between task requirements and technology capabilities determines performance outcomes in
            ways that general perceptions of usefulness cannot fully capture. Organizations
            implementing technology to improve work performance must attend to fit, not just to
            adoption.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The Model of Adoption of Technology in Households demonstrates that in family contexts,
            hedonic outcomes, cost sensitivity, household life cycle, and multi-stakeholder
            decision-making fundamentally shape adoption processes. Technology providers targeting
            household markets must understand these dynamics rather than assuming organizational
            adoption frameworks apply.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Value-Based Adoption demonstrates that when technologies engage deeply with
            individuals&apos; fundamental values and life purposes, value alignment becomes a
            primary adoption driver. Marketers and designers must understand what different value
            segments care about rather than assuming utilitarian benefits universally motivate.
          </p>

          <h3 className={H3_CLASSES}>When to Use Specialized Models</h3>
          <p className={PARAGRAPH_CLASSES}>
            Practitioners face a choice: when should they apply general frameworks like TAM or
            UTAUT, and when should they employ specialized models? The answer depends on whether
            context-specific factors are central or peripheral to the adoption decision.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            When implementing systems where performance improvement is the primary objective and
            different users perform substantially different tasks, Task-Technology Fit thinking
            becomes essential. Organizations should assess fit for different user groups and task
            types rather than assuming high adoption equals successful implementation.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            When marketing technology to households where purchase decisions involve families,
            discretionary spending, and both utilitarian and hedonic motivations, the Model of
            Adoption of Technology in Households provides essential insight. Consumer technology
            companies should segment by household life cycle and develop positioning strategies
            reflecting household-specific decision dynamics.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            When technologies engage fundamentally with how people live their lives and what they
            value-health technologies, communication platforms, lifestyle applications-Value-Based
            Adoption thinking reveals why different segments adopt for different reasons and why
            some segments resist technologies that others embrace. Markets should be understood
            through value segmentation rather than demographic segmentation alone.
          </p>

          <h3 className={H3_CLASSES}>The Complementarity of General and Specialized Models</h3>
          <p className={PARAGRAPH_CLASSES}>
            These specialized models do not replace general frameworks but complement them. TAM,
            UTAUT, and related models identify adoption drivers operating broadly across contexts.
            Specialized models identify additional context-specific factors that matter in
            particular domains. A comprehensive understanding of adoption in a specific context
            often requires integrating both perspectives-understanding general adoption mechanisms
            while recognizing how context shapes their operation and introduces additional
            considerations.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For researchers, this suggests that theory development should balance parsimony and
            comprehensiveness. Universal models achieve parsimony by identifying common factors
            across contexts. Specialized models achieve comprehensiveness by incorporating
            context-specific factors. Both contribute essential knowledge.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            For practitioners, this suggests that technology adoption strategies should be
            context-sensitive. Rather than applying identical adoption strategies across all
            contexts, organizations should recognize when context-specific factors matter and adapt
            their approaches accordingly. Task analysis matters more when performance is paramount.
            Household dynamics matter more when targeting families. Value alignment matters more
            when technologies engage fundamental life purposes. Recognizing these distinctions
            enables more effective adoption strategies.
          </p>
        </section>

        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>
            Looking Ahead: The Integration of Person, Context, and Technology
          </h2>
          <p className={PARAGRAPH_CLASSES}>
            The specialized models examined in this article-Task-Technology Fit, the Model of
            Adoption of Technology in Households, and Value-Based Adoption-represent important
            advances in understanding how context shapes technology adoption. They move beyond
            one-size-fits-all frameworks to recognize that adoption dynamics differ systematically
            across work contexts, household contexts, and value contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Yet even these specialized models focus primarily on situational and contextual factors.
            Task-Technology Fit emphasizes the match between tasks and technology. MATH emphasizes
            household characteristics and life cycle. VAM emphasizes personal values. What remains
            relatively unexplored is the role of stable individual differences-personality
            characteristics, dispositional traits, and general orientations toward technology-that
            shape how individuals approach technology adoption across diverse contexts.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            This gap motivated development of technology readiness frameworks examining how
            individual dispositions and personality characteristics toward technology act as
            fundamental antecedents influencing adoption across contexts. The next article in this
            series explores how technology readiness-individuals&apos; propensity to embrace and use
            new technologies for accomplishing goals-provides crucial insight into adoption patterns
            that purely situational models struggle to address.
          </p>
        </section>

        <SeriesNavigation />

        <section className="pt-8 border-t border-gray-200">
          <h2 className={REFERENCES_H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li>
              Goodhue, D. L., &amp; Thompson, R. L. (1995). Task-technology fit and individual
              performance. <em>MIS Quarterly</em>, 19(2), 213-236.
            </li>
            <li>
              Brown, S. A., &amp; Venkatesh, V. (2005). A model of adoption of technology in
              households: A baseline model test and extension incorporating household life cycle.{' '}
              <em>MIS Quarterly</em>, 29(3), 399-426.
            </li>
            <li>
              Kim, H.-W., Chan, H. C., &amp; Gupta, S. (2007). Value-based adoption of mobile
              internet: An empirical investigation. <em>Decision Support Systems</em>, 43(1),
              111-126.
            </li>
            <li>
              Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance
              of information technology. <em>MIS Quarterly</em>, 13(3), 319-340.
            </li>
            <li>
              Venkatesh, V., Morris, M. G., Davis, G. B., &amp; Davis, F. D. (2003). User acceptance
              of information technology: Toward a unified view. <em>MIS Quarterly</em>, 27(3),
              425-478.
            </li>
            <li>
              Rogers, E. M. (1962). <em>Diffusion of innovations</em>. Free Press.
            </li>
            <li>
              Schwartz, S. H. (2003). A proposal for measuring value orientations across nations. In{' '}
              <em>Questionnaire Development Report of the European Social Survey Project</em>.
            </li>
          </ol>
        </section>
      </article>
      <ArticleTOC />
    </main>
  )
}

export default Article16Page
