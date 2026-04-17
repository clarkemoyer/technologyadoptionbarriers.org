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
  title: 'Bibliography: Total Quality Management (TQM) - Deming (1982)',
  description:
    'Comprehensive overview of W. Edwards Deming\u2019s quality-management philosophy as introduced in Quality, Productivity, and Competitive Position (1982) and expanded in Out of the Crisis (1986): the 14 Points for Management, the PDCA cycle inherited from Shewhart, and statistical thinking about common-cause versus special-cause variation. The later System of Profound Knowledge (Deming, 1993) is discussed for context but is not in the 1982/1986 books.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Total Quality Management (TQM) - Deming (1982)</h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Total Quality Management (Deming Philosophy)
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> TQM
            </p>
            <p>
              <strong>Target of Framework:</strong> Holistic management philosophy for
              organizational transformation through continuous improvement, elimination of waste,
              reduction of variation, and psychological and statistical methods enabling sustained
              competitive advantage through superior quality and customer satisfaction
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Quality Management, Operations Management,
              Organizational Psychology, Statistical Process Control, Manufacturing Management
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> W. Edwards Deming
            </p>
            <p>
              <strong>Primary source for this entry:</strong> Deming, W. E. (1982).{' '}
              <em>Quality, Productivity, and Competitive Position</em>. MIT Center for Advanced
              Engineering Study. ISBN 0-911379-00-6.
            </p>
            <p>
              <strong>Expanded / renamed edition:</strong> Deming, W. E. (1986).{' '}
              <em>Out of the Crisis</em>. MIT Center for Advanced Engineering Study. Significantly
              expanded reissue of the 1982 book under a new title.
            </p>
            <p>
              <strong>Later MIT Press reprint:</strong> Deming, W. E. (2000).{' '}
              <em>Out of the Crisis</em>. MIT Press. ISBN 978-0-262-54115-2. (Reprint of the 1986
              edition; used by many contemporary readers.)
            </p>
            <p>
              <strong>Separate later work (not this entry):</strong> Deming, W. E. (1993).{' '}
              <em>The New Economics for Industry, Government, Education</em>. MIT Center for
              Advanced Engineering Study. This is the book in which Deming introduces the System of
              Profound Knowledge; the 1982 and 1986 works do not use that framework.
            </p>
            <p>
              <strong>Book Format:</strong> Authored book, not journal article.
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
                Deming, W. E. (
                <a href="#ref-deming-1982" className="text-tabs-teal-deep hover:underline">
                  1982
                </a>
                ). <em>Quality, productivity, and competitive position</em>. MIT Center for Advanced
                Engineering Study.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Deming, W. Edwards. 1982. <em>Quality, Productivity, and Competitive Position</em>.
                Cambridge, MA: MIT Center for Advanced Engineering Study.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            W. Edwards Deming developed his Total Quality Management philosophy in direct response
            to the post-World War II crisis facing American manufacturing. Post-war, American
            manufacturers dominated global markets through economies of scale and cost advantages.
            However, by the 1970s and 1980s, Japanese manufacturers were outcompeting American firms
            on both cost and quality. Japanese automobiles, electronics, and consumer goods achieved
            superior reliability and durability while maintaining competitive pricing. American
            manufacturers struggled to understand how Japanese firms were simultaneously achieving
            lower costs and superior quality - an outcome that appeared impossible under prevailing
            manufacturing assumptions.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Deming recognized that Japanese success was not due to cultural factors or labor cost
            advantages, but rather stemmed from fundamentally different approaches to manufacturing
            and management. During the post-war American occupation of Japan, American management
            consultants including Deming introduced Japanese managers to statistical process control
            and quality improvement methodologies. Japanese managers embraced these approaches while
            American manufacturers largely ignored them. Deming&rsquo;s work was largely forgotten
            in America while transforming Japanese industrial practices. Only after Japanese
            manufacturers demonstrated clear competitive superiority did American firms and
            researchers return to Deming&rsquo;s methodology.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Deming argued that the crisis facing American manufacturing derived not from worker
            laziness or incompetence, but from fundamentally flawed management philosophy. American
            management operated under outdated assumptions: that workers would work harder for more
            money, that quality resulted from final inspection rather than process control, that
            competition between workers and departments created efficiency, and that optimal
            outcomes came from optimizing individual performance metrics. These assumptions, Deming
            argued, destroyed American competitiveness. The solution required wholesale
            transformation of management philosophy, replacing command-and-control with systems
            thinking, replacing worker blame with process improvement, replacing cost reduction with
            quality emphasis, and replacing individual competition with organizational cooperation.
            This philosophical transformation would require organizational courage, leadership
            commitment, and willingness to abandon comfortable but destructive management practices.
          </p>
        </section>

        {/* 5. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Deming&rsquo;s 1982 book is a management-philosophy monograph, not a measurement model.
            It does not propose scales, latent constructs, or statistical operationalizations of
            &ldquo;quality&rdquo;, &ldquo;leadership&rdquo;, or &ldquo;culture&rdquo;. What it does
            propose is an operational vocabulary and a small number of quantitative tools:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Statistical Process Control (SPC) charts:</strong> Shewhart control charts
              (X-bar and R charts) used to distinguish common-cause variation (inherent to the
              process) from special-cause variation (signals requiring investigation). This is the
              only formally quantitative piece of the framework.
            </li>
            <li>
              <strong>14 Points for Management:</strong> A normative checklist for managerial
              practice, not a scale. Each point is a qualitative principle; there is no score, no
              weighting, no psychometric claim.
            </li>
            <li>
              <strong>Seven Deadly Diseases and lesser obstacles:</strong> Deming&rsquo;s catalog of
              managerial practices he considered destructive (lack of constancy of purpose, emphasis
              on short-term profits, performance appraisal, mobility of management, running a
              company on visible figures alone, excessive medical costs, excessive legal costs).
              Again, a qualitative catalog.
            </li>
            <li>
              <strong>Process and system diagrams:</strong> Flow diagrams, cause-and-effect
              (&ldquo;Ishikawa&rdquo;) diagrams, and Pareto charts for localizing problems. Tools,
              not measurement instruments.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Empirical work attempting to validate TQM has therefore had to construct its own
            instruments (e.g. Saraph, Benson &amp; Schroeder, 1989; Flynn, Schroeder &amp;
            Sakakibara, 1994; Powell, 1995) rather than use scales supplied by Deming himself. The
            Malcolm Baldrige National Quality Award criteria (est. 1987) are often treated as a de
            facto operationalization but post-date the 1982 book.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            <strong>Note on source availability:</strong> A PDF of Deming&rsquo;s 1982 book is not
            attached to the project&rsquo;s Zotero library. The factual claims on this page are
            drawn from widely documented secondary sources and the published book; detailed
            page-level verification was not possible in this review.
          </p>
        </section>

        {/* 6. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Total Quality Management philosophy is built on fundamental concepts about how
            organizations achieve excellence:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Quality:</strong> Meeting and exceeding customer expectations and needs.
              Quality extends beyond absence of defects to encompass reliability, durability,
              functionality, fit, and overall customer satisfaction. Organizations must understand
              customer needs and design systems to consistently deliver against those needs.
            </li>
            <li>
              <strong>Continuous Improvement (Kaizen):</strong> Ongoing process of incremental
              enhancement of products, processes, and systems. Organizations assume that improvement
              is always possible, no matter current performance levels. Continuous improvement is
              driven by workers closest to processes rather than external consultants.
            </li>
            <li>
              <strong>Statistical Variation:</strong> All processes produce variation in output.
              Some variation is inherent to processes (common cause variation) while other variation
              results from special circumstances (special cause variation). Understanding and
              reducing variation is central to quality improvement.
            </li>
            <li>
              <strong>Process Focus:</strong> Quality outcomes result from process design and
              control, not from individual effort or blame. If process is well-designed, quality
              naturally results. If process is poorly designed, even hardworking employees cannot
              consistently produce quality. Management responsibility centers on process
              improvement, not worker motivation.
            </li>
            <li>
              <strong>Systems Thinking:</strong> Organizations are interdependent systems rather
              than collections of independent departments. Optimizing individual departments may
              suboptimize system performance. Management must optimize overall system performance
              rather than individual parts.
            </li>
            <li>
              <strong>Customer Focus:</strong> Understanding customer needs and designing systems to
              meet those needs drives competitive advantage. Quality is defined by customer
              requirements rather than internal standards. Organizations must maintain direct
              relationship with customers to understand evolving needs.
            </li>
            <li>
              <strong>Long-term Perspective:</strong> Competitive advantage comes from long-term
              organizational commitment to quality and improvement rather than short-term profit
              maximization. Myopic focus on quarterly profits undermines long-term competitiveness
              and organizational viability.
            </li>
          </ul>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Total Quality Management drew on and synthesized previous quality management and
            organizational theories:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Scientific Management and Taylorism (
                <a
                  id="cite-ref-taylor-1911-1"
                  href="#ref-taylor-1911"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Taylor, 1911
                </a>
                ):
              </strong>{' '}
              Deming built on and critiqued Taylor&rsquo;s scientific management. While accepting
              that work processes could be scientifically studied, Deming rejected Taylor&rsquo;s
              assumptions about individual financial incentives and blamed-based worker motivation.
            </li>
            <li>
              <strong>
                Statistical Process Control (
                <a
                  id="cite-ref-shewhart-1931-1"
                  href="#ref-shewhart-1931"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Shewhart, 1931
                </a>
                , 1939):
              </strong>{' '}
              Deming was a direct student and collaborator of Walter Shewhart at Bell Labs and the
              Department of Agriculture. Shewhart&rsquo;s control-chart methods (Shewhart, 1931) and
              his Plan-Do-Check-Act cycle (Shewhart, 1939) are central to Deming&rsquo;s philosophy.
              Deming later renamed the cycle to Plan-Do-Study-Act (PDSA) in his 1993 book{' '}
              <em>The New Economics</em>; the 1982 and 1986 books retain the Plan-Do-Check-Act
              (PDCA) name used by Shewhart.
            </li>
            <li>
              <strong>Human Relations School (Mayo, 1933):</strong> Deming incorporated Human
              Relations School insights emphasizing worker psychology and group dynamics. Deming
              emphasized that workers wanted to do good work and that management systems either
              enabled or prevented quality work.
            </li>
            <li>
              <strong>
                Systems Theory (
                <a
                  id="cite-ref-bertalanffy-1968-1"
                  href="#ref-bertalanffy-1968"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Bertalanffy, 1968
                </a>
                ):
              </strong>{' '}
              Deming incorporated general systems theory concepts emphasizing that organizations are
              interconnected systems with properties that emerge from interactions rather than from
              individual parts.
            </li>
            <li>
              <strong>Quality Management Literature (Juran, Crosby):</strong> Deming drew on and
              extended previous quality management frameworks developed by Joseph Juran and Philip
              Crosby while emphasizing distinctive focus on statistical methods and psychological
              transformation.
            </li>
            <li>
              <strong>Organizational Behavior Theory:</strong> Incorporated psychological and
              behavioral insights about motivation, group dynamics, organizational culture, and
              organizational learning into quality improvement framework.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Total Quality Management proposes that sustained competitive advantage comes from
            organizational commitment to quality, continuous improvement, and customer satisfaction
            enabled through statistical process control, system optimization, and worker engagement.
            Rather than viewing quality as cost or burden, TQM argues that quality is source of
            competitive advantage. Organizations reducing variation, improving processes, and
            exceeding customer expectations simultaneously reduce costs and increase customer
            loyalty. Deming rejected the assumption that quality and cost were tradeoffs; superior
            quality and lower costs were simultaneous achievements through process excellence.
          </p>

          <h3 className={H3_CLASSES}>Deming&rsquo;s 14 Points for Management</h3>
          <p className={PARAGRAPH_CLASSES}>
            The canonical form of the 14 Points is as curated by{' '}
            <a
              id="cite-ref-deming-institute-2018-1"
              href="#ref-deming-institute-2018"
              className="text-tabs-teal-deep hover:underline"
            >
              The W. Edwards Deming Institute (2018)
            </a>
            . The Institute attributes the list to &ldquo;Dr. Deming&rsquo;s seminal book,{' '}
            <em>Out of the Crisis</em>&rdquo; - i.e., the 1986 edition - as the first presentation
            of this canonical form. The points are reproduced verbatim below; each is annotated with
            a short secondary-source explanation. Because a PDF of Deming (1982) or (1986) is not
            attached to the project&rsquo;s Zotero library, this page treats the Deming Institute
            one-pager as the ground truth for the list.
          </p>
          <ol className={BODY_LIST_CLASSES}>
            <li>
              <strong>Create constancy of purpose for improving products and services.</strong>{' '}
              Long-term commitment to improvement rather than quarterly results.
            </li>
            <li>
              <strong>Adopt the new philosophy.</strong> Abandon tolerance for commonly accepted
              levels of delays, mistakes, defective material, and workmanship.
            </li>
            <li>
              <strong>Cease dependence on inspection to achieve quality.</strong> Build quality into
              the process rather than inspect it in at the end.
            </li>
            <li>
              <strong>
                End the practice of awarding business on price alone; instead, minimize total cost
                by working with a single supplier.
              </strong>{' '}
              Establish long-term supplier relationships based on a loyalty-and-trust relation
              rather than on price.
            </li>
            <li>
              <strong>
                Improve constantly and forever every process for planning, production, and service.
              </strong>{' '}
              Continuous improvement of every activity, not only production.
            </li>
            <li>
              <strong>Institute training on the job.</strong> Train workers on the job to standard,
              as part of the process of doing the work.
            </li>
            <li>
              <strong>Adopt and institute leadership.</strong> Supervision of management and workers
              should be aimed at helping people and systems do a better job, not at finding fault.
            </li>
            <li>
              <strong>Drive out fear.</strong> Create psychological safety so people can raise
              problems, suggest improvements, and ask questions.
            </li>
            <li>
              <strong>Break down barriers between staff areas.</strong> Research, design, sales, and
              production must work as a team to foresee production and service problems.
            </li>
            <li>
              <strong>Eliminate slogans, exhortations, and targets for the workforce.</strong>{' '}
              Exhortations without means to do better create adversarial relations and shift the
              burden from the system to the worker.
            </li>
            <li>
              <strong>
                Eliminate numerical quotas for the workforce and numerical goals for management.
              </strong>{' '}
              Both distort process behavior and become substitutes for leadership.
            </li>
            <li>
              <strong>
                Remove barriers that rob people of pride of workmanship, and eliminate the annual
                rating or merit system.
              </strong>{' '}
              Barriers include bad supervision, defective tooling, and the merit rating itself,
              which rewards performance apparent to the rater rather than to the system.
            </li>
            <li>
              <strong>
                Institute a vigorous program of education and self-improvement for everyone.
              </strong>{' '}
              Continuous learning is an investment in the enterprise, not a cost.
            </li>
            <li>
              <strong>
                Put everybody in the company to work accomplishing the transformation.
              </strong>{' '}
              The transformation is everybody&rsquo;s job.
            </li>
          </ol>
          <p className={PARAGRAPH_CLASSES}>
            Deming explicitly framed the 14 Points as applied Profound Knowledge: &ldquo;My 14
            Points for Management follow naturally as application of the System of Profound
            Knowledge for transformation from the present style of management to one of
            optimization&rdquo; (Deming, quoted on the Deming Institute one-pager). Note that this
            framing is retrospective - Profound Knowledge was introduced in Deming (1993),
            <em>The New Economics</em>, whereas the 14 Points appeared earlier in the 1986{' '}
            <em>Out of the Crisis</em> (per the Deming Institute) and in earlier form in the 1982{' '}
            <em>Quality, Productivity, and Competitive Position</em>.
          </p>

          <h3 className={H3_CLASSES}>
            System of Profound Knowledge (added by Deming, 1993, not in the 1982/1986 books)
          </h3>
          <p className={PARAGRAPH_CLASSES}>
            The System of Profound Knowledge is a later Deming formulation, introduced in{' '}
            <em>The New Economics for Industry, Government, Education</em> (Deming, 1993), not in{' '}
            <em>Quality, Productivity, and Competitive Position</em> (1982) or in{' '}
            <em>Out of the Crisis</em> (1986). It is included on this page because it is frequently
            taught alongside the 14 Points as part of Deming&rsquo;s mature philosophy, but readers
            should note the attribution. Deming proposed four interrelated bodies of knowledge:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Appreciation for a System:</strong> Organizations function as interdependent
              systems rather than collections of independent departments. Understanding system
              interactions and optimizing overall system performance rather than individual parts is
              essential to management.
            </li>
            <li>
              <strong>Knowledge of Variation:</strong> All processes produce variation.
              Understanding sources of variation (common cause versus special cause), statistical
              tools for analyzing variation, and methods for reducing variation is essential to
              quality improvement. (Drawn directly from Shewhart.)
            </li>
            <li>
              <strong>Theory of Knowledge:</strong> Organizational improvement requires scientific
              method and hypothesis testing rather than experience alone. Understanding prediction,
              testing, and learning enables evidence-based improvement. (Drawn from C. I. Lewis,{' '}
              <em>Mind and the World Order</em>, cited by Deming.)
            </li>
            <li>
              <strong>Psychology:</strong> Understanding human motivation, group dynamics,
              organizational behavior, and psychological needs enables effective management. Poor
              management systems cause worker behavior problems.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Key Mechanisms</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Plan-Do-Check-Act Cycle (PDCA) - later renamed Plan-Do-Study-Act (PDSA):
              </strong>{' '}
              Organizations continuously cycle through planning improvements, implementing changes,
              checking / studying results, and acting on learning. The cycle was introduced by
              Shewhart (1939) as PDCA and adopted by Deming in the 1982 and 1986 books under that
              name; Deming renamed the "Check" step to "Study" starting in his 1993 book{' '}
              <em>The New Economics</em>. Both forms are widely used.
            </li>
            <li>
              <strong>Statistical Process Control:</strong> Using statistical tools to monitor
              process performance, identify variation sources, and distinguish common cause
              variation (part of process) from special cause variation (requiring investigation and
              correction).
            </li>
            <li>
              <strong>Worker Engagement and Empowerment:</strong> Workers closest to processes
              possess valuable knowledge about improvement opportunities. Engaging workers in
              improvement generates ideas and ensures implementation success.
            </li>
            <li>
              <strong>Cultural Transformation:</strong> Quality improvement requires fundamental
              cultural change from command-and-control to cooperation, from blame to
              problem-solving, and from short-term optimization to long-term system improvement.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Addresses root causes of poor quality:</strong> Shifts focus from worker blame
              to process improvement, addressing actual sources of quality problems.
            </li>
            <li>
              <strong>Practical and implementable:</strong> Provides concrete tools (statistical
              process control, PDSA cycle) enabling organizations to systematically improve quality
              and reduce variation.
            </li>
            <li>
              <strong>Integrates quality with cost reduction:</strong> Demonstrates that quality
              improvement and cost reduction are compatible rather than tradeoffs. Superior quality
              often reduces costs through waste elimination and defect reduction.
            </li>
            <li>
              <strong>Empirically validated:</strong> Japanese manufacturing demonstrated that TQM
              principles enable superior quality and cost simultaneously. American manufacturers
              subsequently adopted TQM with significant competitive improvement.
            </li>
            <li>
              <strong>Holistic organizational framework:</strong> Addresses systems, processes,
              people, and culture rather than isolated quality programs.
            </li>
            <li>
              <strong>Focus on customer satisfaction:</strong> Emphasizes customer needs and
              expectations as driving force for organizational improvement and quality definition.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Slow implementation timeline:</strong> Cultural transformation and continuous
              improvement require sustained effort over years. Organizations seeking quick fixes
              find TQM unsatisfying.
            </li>
            <li>
              <strong>Difficult organizational change:</strong> TQM requires fundamental management
              philosophy change that many organizations find threatening. Established power
              structures and management practices are challenged.
            </li>
            <li>
              <strong>Resistance from middle management:</strong> Middle managers may resist TQM
              because it reduces their command-and-control authority and emphasizes systems thinking
              over individual authority.
            </li>
            <li>
              <strong>Limited applicability in some contexts:</strong> TQM emerged from
              manufacturing contexts. Applicability to service organizations, professional services,
              or knowledge work remains less developed.
            </li>
            <li>
              <strong>Statistical process control complexity:</strong> Some organizations struggle
              with statistical tools required for process control and variation analysis. Technical
              capability required may exceed some organizations.
            </li>
            <li>
              <strong>Measurement and attribution difficulties:</strong> Isolating TQM benefits from
              other organizational changes and attributing performance improvements specifically to
              TQM implementation can be challenging.
            </li>
            <li>
              <strong>Over-emphasis on statistics:</strong> Critics argue Deming over-emphasized
              statistical methods while under-emphasizing strategic positioning and competitive
              dynamics.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Paradigm shift in quality thinking:</strong> Changed quality from cost burden
              to competitive advantage, fundamentally shifting organizational priorities and
              management philosophy.
            </li>
            <li>
              <strong>Statistical process control legitimacy:</strong> Established statistical
              methods as central to organizational quality improvement, elevating quantitative rigor
              in quality management.
            </li>
            <li>
              <strong>Worker psychology integration:</strong> Incorporated psychological and
              behavioral insights into quality management, emphasizing worker engagement,
              motivation, and dignity.
            </li>
            <li>
              <strong>Systems thinking in management:</strong> Brought systems theory and systems
              thinking into management practice, emphasizing organizational interdependencies and
              system optimization.
            </li>
            <li>
              <strong>Quality-cost integration:</strong> Demonstrated that quality improvement and
              cost reduction were simultaneous achievements, not tradeoffs, through process
              excellence.
            </li>
            <li>
              <strong>Supplier relationship transformation:</strong> Changed supplier relationships
              from adversarial price-based competition to collaborative quality-based partnerships.
            </li>
            <li>
              <strong>Long-term competitive advantage framework:</strong> Established long-term
              thinking and sustained commitment as sources of competitive advantage, countering
              short-term profit maximization.
            </li>
            <li>
              <strong>Foundation for future quality frameworks:</strong> Created foundation for
              subsequent quality frameworks including Six Sigma, Lean Manufacturing, and continuous
              improvement methodologies.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            As a practical management philosophy and methodology, TQM demonstrates strong internal
            validity through logical coherence and consistency with organizational experience:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Logical consistency:</strong> The core argument that well-designed processes
              enable quality consistently, that variation reduction improves quality, and that
              worker engagement improves process design are logically sound and mutually
              reinforcing.
            </li>
            <li>
              <strong>Empirical validation through Japanese manufacturing:</strong> Japanese
              manufacturing demonstrated convincingly that TQM principles enabled simultaneous
              achievement of quality and cost advantages, validating core theoretical claims.
            </li>
            <li>
              <strong>Grounding in psychological theory:</strong> TQM incorporates well-established
              psychological and organizational behavior principles about motivation, group dynamics,
              and learning.
            </li>
            <li>
              <strong>Consistency with statistical theory:</strong> Statistical foundations of TQM
              rest on established statistical science and control theory.
            </li>
            <li>
              <strong>Addresses documented management problems:</strong> TQM explains and provides
              solutions to well-documented organizational problems: worker disengagement, process
              variation, quality-cost tradeoffs, and organizational silos.
            </li>
            <li>
              <strong>Systems thinking foundation:</strong> Incorporation of systems theory provides
              coherent framework for understanding organizational complexity and interdependencies.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations concern generalizability of TQM across diverse
            organizational and industry contexts:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Manufacturing origin and applicability:</strong> TQM emerged in manufacturing
              contexts with strong applicability to manufacturing. Applicability to service
              industries, professional services, or knowledge work is less developed and more
              contested.
            </li>
            <li>
              <strong>Organizational culture and readiness:</strong> TQM requires significant
              cultural change and management commitment. Organizations with resistant cultures,
              short-term focus, or hierarchical resistance may struggle with implementation.
            </li>
            <li>
              <strong>Industry variation:</strong> TQM applicability may vary by industry.
              Industries with stable processes and clear customer requirements may benefit more
              readily than industries with rapidly changing conditions or ambiguous requirements.
            </li>
            <li>
              <strong>Organizational size variation:</strong> TQM frameworks developed primarily in
              large manufacturing organizations. Applicability to small organizations or startups
              remains less developed.
            </li>
            <li>
              <strong>Geographic and cultural context:</strong> TQM was adapted into Japanese
              manufacturing and later American manufacturing. Applicability to different cultural,
              economic, or governance contexts requires investigation.
            </li>
            <li>
              <strong>Time horizon challenges:</strong> TQM requires sustained long-term commitment
              that organizations operating under pressures for short-term results may struggle to
              maintain.
            </li>
            <li>
              <strong>Measurement and attribution:</strong> Isolating TQM benefits from other
              organizational changes remains methodologically challenging. Empirical research
              establishing clear causality is limited.
            </li>
            <li>
              <strong>Knowledge work applicability:</strong> Statistical process control and
              variation analysis work well for manufacturing processes but may be less applicable to
              creative knowledge work or professional services.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            TQM explains organizational success with technology adoption through process excellence
            and continuous improvement. Technology adoption succeeds when organizations view
            technology implementation as process requiring systematic improvement, statistical
            monitoring, worker engagement, and ongoing refinement. Organizations treating technology
            adoption as one-time project with fixed endpoints often achieve poor results, while
            organizations treating technology adoption as continuous improvement process achieve
            better outcomes. TQM emphasizes that technology success requires process redesign,
            worker training, customer feedback integration, and ongoing monitoring and refinement -
            exactly the sustained commitment and improvement orientation that technology adoption
            requires.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Lack of process focus:</strong> Organizations may view technology as
              substitute for process redesign, expecting technology alone to improve performance.
              Technology requires supporting process redesign.
            </li>
            <li>
              <strong>Insufficient worker engagement:</strong> Workers closest to processes possess
              valuable information about technology requirements and implementation barriers.
              Excluding workers from technology decisions creates implementation problems.
            </li>
            <li>
              <strong>Absence of continuous improvement orientation:</strong> Organizations treating
              technology adoption as one-time project fail to engage in ongoing refinement and
              optimization.
            </li>
            <li>
              <strong>Inadequate training and education:</strong> Workers require training in
              technology use and in new processes enabled by technology. Organizations underfunding
              training struggle with adoption.
            </li>
            <li>
              <strong>Lack of measurement and monitoring:</strong> Without metrics monitoring
              technology performance, implementation success, and impact, organizations cannot
              identify problems and adjust implementation.
            </li>
            <li>
              <strong>Short-term performance focus:</strong> Organizations focused on short-term
              results may abandon technology adoption before benefits materialize if implementation
              requires extended timeline.
            </li>
            <li>
              <strong>Blame culture:</strong> Organizations with blame cultures where workers fear
              reporting problems inhibit honest feedback about technology implementation challenges.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Treat technology adoption as process improvement:</strong> Frame technology
              adoption as opportunity to redesign processes, not as technical project. Engage
              process redesign rigorously.
            </li>
            <li>
              <strong>Engage workers in technology adoption:</strong> Include workers in
              requirements definition, design, testing, and refinement. Workers provide crucial
              insights on implementation barriers and improvement opportunities.
            </li>
            <li>
              <strong>Invest in training and education:</strong> Provide comprehensive training in
              both technology use and in new processes enabled by technology.
            </li>
            <li>
              <strong>Establish measurement and monitoring:</strong> Define metrics monitoring
              technology performance, implementation success, user adoption, and business impact.
              Use metrics to guide ongoing refinement.
            </li>
            <li>
              <strong>Create psychological safety:</strong> Ensure workers feel comfortable
              reporting implementation problems and challenges. Drive out fear of technology change
              and reporting problems.
            </li>
            <li>
              <strong>Commit to continuous improvement:</strong> After implementation, establish
              continuous improvement processes for ongoing refinement and optimization.
            </li>
            <li>
              <strong>Adopt systems perspective:</strong> Recognize that technology success requires
              integrating technology with process redesign, worker capability, organizational
              structure, and culture.
            </li>
            <li>
              <strong>Maintain long-term commitment:</strong> Sustain leadership commitment to
              technology adoption through extended implementation timeline. Avoid abandoning
              adoption due to short-term challenges.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Total Quality Management has spawned significant theoretical developments and extensions
            building on and refining the original framework:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Six Sigma (Motorola, 1986; General Electric, 1995):</strong> Extended TQM by
              emphasizing statistical rigor and near-perfect quality targets. Six Sigma focuses on
              reducing variation to levels where only 3.4 defects per million opportunities occur.
            </li>
            <li>
              <strong>
                Lean Manufacturing (Toyota Production System,{' '}
                <a
                  id="cite-ref-womack-1996-1"
                  href="#ref-womack-1996"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Womack &amp; Jones, 1996
                </a>
                ):
              </strong>{' '}
              Applied TQM principles specifically to waste elimination and value creation. Lean
              emphasizes eliminating non-value-added activities and streamlining operations.
            </li>
            <li>
              <strong>Continuous Improvement Culture (Kaizen):</strong> Extended TQM emphasis on
              continuous improvement into systematic organizational culture and philosophy.
            </li>
            <li>
              <strong>Malcolm Baldrige National Quality Award:</strong> Created comprehensive
              framework for organizational quality assessment and improvement based on TQM
              principles.
            </li>
            <li>
              <strong>ISO 9000 Quality Management Standards:</strong> Formalized TQM principles into
              documented quality management systems and standards enabling standardization across
              organizations.
            </li>
            <li>
              <strong>Lean Six Sigma:</strong> Integrated Lean Manufacturing and Six Sigma
              methodologies for combined waste elimination and quality improvement.
            </li>
            <li>
              <strong>Business Process Management (BPM):</strong> Applied TQM principles to broad
              business process design and optimization beyond manufacturing.
            </li>
            <li>
              <strong>Toyota Production System and Lean Operations:</strong> Detailed implementation
              of TQM principles in automotive manufacturing, demonstrating sustained competitive
              advantage through quality and continuous improvement.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-deming-1982">
              Deming, W. E. (1982). <em>Quality, Productivity, and Competitive Position</em>. MIT
              Center for Advanced Engineering Study. ISBN 0-911379-00-6.
            </li>
            <li id="ref-deming-1986">
              Deming, W. E. (1986). <em>Out of the Crisis</em>. MIT Center for Advanced Engineering
              Study. (Expanded reissue of the 1982 book under a new title.)
            </li>
            <li id="ref-deming-1993">
              Deming, W. E. (1993). <em>The New Economics for Industry, Government, Education</em>.
              MIT Center for Advanced Engineering Study. (Introduces the System of Profound
              Knowledge and renames Shewhart&rsquo;s PDCA cycle to PDSA.)
            </li>
            <li id="ref-deming-institute-2018">
              The W. Edwards Deming Institute. (2018).{' '}
              <em>Deming&rsquo;s 14 Points for the Transformation of Management</em> [One-page
              canonical statement].{' '}
              <a
                href="https://deming.org/fourteen-points/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://deming.org/fourteen-points/
              </a>
              . PDF:{' '}
              <a
                href="https://deming.org/wp-content/uploads/2020/06/One-Pager-14Points.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                One-Pager-14Points.pdf
              </a>
              . Used as the ground-truth canonical text for the 14 Points on this page, since no PDF
              of Deming (1982) or Deming (1986) is attached to the project&rsquo;s Zotero library.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-deming-institute-2018-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-shewhart-1931">
              Shewhart, W. A. (1931). <em>Economic Control of Quality of Manufactured Product</em>.
              D. Van Nostrand Company.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-shewhart-1931-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-shewhart-1939">
              Shewhart, W. A. (1939).{' '}
              <em>Statistical Method from the Viewpoint of Quality Control</em>. Graduate School,
              U.S. Department of Agriculture. (Source of the Plan-Do-Check-Act cycle.)
            </li>
            <li id="ref-taylor-1911">
              Taylor, F. W. (1911). <em>The Principles of Scientific Management</em>. Harper &amp;
              Brothers.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-taylor-1911-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-bertalanffy-1968">
              Bertalanffy, L. V. (1968).{' '}
              <em>General System Theory: Foundations, Development, Applications</em>. George
              Braziller.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-bertalanffy-1968-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-womack-1996">
              Womack, J. P., &amp; Jones, D. T. (1996).{' '}
              <em>Lean Thinking: Banish Waste and Create Wealth in Your Corporation</em>. Simon
              &amp; Schuster.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-womack-1996-1"
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
            <li id="ref-juran-1999">
              Juran, J. M., &amp; Godfrey, A. B. (1999). <em>Juran&rsquo;s Quality Handbook</em>{' '}
              (5th ed.). McGraw-Hill.
            </li>
            <li id="ref-crosby-1979">
              Crosby, P. B. (1979). <em>Quality is Free: The Art of Making Quality Certain</em>.
              McGraw-Hill.
            </li>
            <li id="ref-imai-1986">
              Imai, M. (1986). <em>Kaizen: The Key to Japan&rsquo;s Competitive Success</em>. Random
              House.
            </li>
            <li id="ref-ishikawa-1985">
              Ishikawa, K. (1985). <em>What Is Total Quality Control? The Japanese Way</em>.
              Prentice-Hall.
            </li>
            <li id="ref-feigenbaum-1951">
              Feigenbaum, A. V. (1951).{' '}
              <em>Quality Control: Principles, Practice, and Administration</em>. McGraw-Hill.
              (Origin of the term &ldquo;Total Quality Control&rdquo;.)
            </li>
            <li id="ref-argyris-1978">
              Argyris, C., &amp; Sch&ouml;n, D. A. (1978).{' '}
              <em>Organizational Learning: A Theory of Action Perspective</em>. Addison-Wesley.
            </li>
            <li id="ref-national-2023">
              National Institute of Standards and Technology. (2023).{' '}
              <em>Baldrige Excellence Framework</em>. U.S. Department of Commerce.
            </li>
            <li id="ref-international-2015">
              International Organization for Standardization. (2015).{' '}
              <em>ISO 9001:2015 Quality Management Systems</em>. ISO.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-3-dynamic-capabilities-teece-1997"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Dynamic Capabilities (Teece, Pisano, &amp; Shuen, 1997)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-5-capability-maturity-model-cmm-humphrey-1989"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Capability Maturity Model (CMM) (Humphrey, 1989) &rarr;
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
