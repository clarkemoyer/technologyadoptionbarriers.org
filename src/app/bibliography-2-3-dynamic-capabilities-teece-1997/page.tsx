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
  title: 'Bibliography: Dynamic Capabilities Framework - Teece, Pisano, & Shuen (1997)',
  description:
    'Comprehensive overview of the Teece, Pisano & Shuen (1997) dynamic capabilities framework, defined as the firm ability to integrate, build, and reconfigure internal and external competences, and organized around the three Ps - processes, positions, paths - as sources of competitive advantage in regimes of rapid technological change.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>
          Dynamic Capabilities Framework - Teece, Pisano, &amp; Shuen (1997)
        </h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Dynamic Capabilities Framework
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> DC
            </p>
            <p>
              <strong>Target of Framework:</strong> Explain sources of competitive advantage in
              regimes of rapid technological change by analyzing a firm&rsquo;s managerial and
              organizational processes, asset positions, and evolution paths. Defines dynamic
              capabilities as the ability to <em>integrate, build, and reconfigure</em> internal and
              external competences (p.516).
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Strategic Management, Organization Theory,
              Technology Management, Economics of Innovation
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Authors:</strong> David J. Teece, Gary Pisano, Amy Shuen
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1997
            </p>
            <p>
              <strong>Official Title:</strong> Dynamic capabilities and strategic management
            </p>
            <p>
              <strong>Journal:</strong> Strategic Management Journal
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 18, No. 7
            </p>
            <p>
              <strong>Pages:</strong> 509-533
            </p>
            <p>
              <strong>DOI:</strong>{' '}
              <a
                href="https://doi.org/10.1002/(SICI)1097-0266(199708)18:7%3C509::AID-SMJ882%3E3.0.CO;2-Z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.1002/(SICI)1097-0266(199708)18:7%3C509::AID-SMJ882%3E3.0.CO;2-Z
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
                Teece, D. J., Pisano, G., &amp; Shuen, A. (
                <a href="#ref-teece-1997" className="text-tabs-teal-deep hover:underline">
                  1997
                </a>
                ). Dynamic capabilities and strategic management.{' '}
                <em>Strategic Management Journal</em>, 18(7), 509-533.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Teece, David J., Gary Pisano, and Amy Shuen. 1997. &ldquo;Dynamic Capabilities and
                Strategic Management.&rdquo; <em>Strategic Management Journal</em> 18, no. 7:
                509-533.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997) open (p.509) with the question &ldquo;how firms achieve
            and sustain competitive advantage&rdquo; in a Schumpeterian world of innovation-based
            competition, price/performance rivalry, increasing returns, and the &ldquo;creative
            destruction&rdquo; of existing competences. The paper argues that then-dominant
            frameworks handled sustaining and safeguarding extant advantage well but had performed
            less well on how firms build advantage under rapid change.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The paper positions itself against three precursor paradigms that it reviews and
            critiques (Sections I-III, pp.509-516):
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Models of strategy emphasizing market power</strong> - the Competitive Forces
              approach (Porter, 1980) and Strategic Conflict game-theoretic approach (Shapiro, 1989)
              - emphasize industry structure and strategic interaction, but treat firms inside an
              industry as relatively interchangeable.
            </li>
            <li>
              <strong>Models of strategy emphasizing efficiency</strong> - the Resource-Based
              Perspectives (Penrose, 1959; Rumelt, 1984; Wernerfelt, 1984, 1989; Teece, 1984) -
              emphasize firm-specific assets and idiosyncratic efficiency, but treat competences and
              asset positions as relatively static.
            </li>
            <li>
              <strong>Dynamic capabilities approach</strong> - proposed by this paper - adds the
              ability to adapt, integrate, and reconfigure competences as external conditions
              change.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Teece et al.&rsquo;s specific argument is that in regimes of rapid technological change,
            private wealth creation depends &ldquo;in large measure on honing internal
            technological, organizational, and managerial processes inside the firm&rdquo; rather
            than on strategizing in the game-theoretic sense (abstract, p.509). The paper presents
            the framework conceptually (pp.509-524) and then illustrates it via examples of
            strategic capabilities in real firms (pp.524-533).
          </p>
        </section>

        {/* 5. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997) is a conceptual framework paper, not a measurement
            model. It does not propose scales, latent constructs, or formal empirical
            operationalizations. Instead, it proposes a vocabulary - the <em>three Ps</em>
            (processes, positions, paths) - for analyzing the sources of competitive advantage in
            regimes of rapid change, and a definition of <em>dynamic capabilities</em> that sits
            above the resource-based view&rsquo;s inventory of static resources.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The paper&rsquo;s canonical definition (p.516): dynamic capabilities are &ldquo;the
            firm&rsquo;s ability to integrate, build, and reconfigure internal and external
            competences to address rapidly changing environments&rdquo;. This is the verbatim 1997
            definition. A popular later refinement by Teece (2007) reorganized the same logic into
            three microfoundations - <em>sensing, seizing, and reconfiguring/transforming</em> -
            which are widely attributed to this 1997 paper but are actually the 2007 paper&rsquo;s
            framing (Teece, 2007, &ldquo;Explicating dynamic capabilities: the nature and
            microfoundations of (sustainable) enterprise performance&rdquo;, SMJ 28:13,
            pp.1319-1350).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The 1997 paper&rsquo;s analytical method is: (i) define the hierarchy of firm-level
            factors that might generate advantage; (ii) distinguish paradigms of strategy; (iii)
            identify the three Ps that shape dynamic capabilities; (iv) show by case-example how
            each of the three Ps generates or erodes competitive advantage in technology-intensive
            industries (semiconductors, biotechnology, consumer electronics).
          </p>
        </section>

        {/* 6. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997, pp.515-518) lay out an explicit vocabulary with six
            levels, distinguishing dynamic capabilities from other firm-level factors:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Factors of production:</strong> Undifferentiated inputs available in
              disaggregate form in factor markets. Land, unskilled labor, capital. Lack a
              firm-specific component. Non-strategic (p.516).
            </li>
            <li>
              <strong>Resources:</strong> Firm-specific assets that are difficult or impossible to
              imitate - trade secrets, specialized production facilities, engineering experience.
              Difficult to transfer because of transactions costs, transfer costs, and tacit
              knowledge (p.516). The authors note they dislike the term &ldquo;resource&rdquo; but
              retain it to keep links to the RBV literature.
            </li>
            <li>
              <strong>Organizational routines / competences:</strong> Integrated clusters of
              firm-specific assets spanning individuals and groups that enable distinctive
              activities. Examples include quality, miniaturization, and systems integration
              (p.516). Typically viable across multiple product lines.
            </li>
            <li>
              <strong>Core competences:</strong> Competences that define a firm&rsquo;s fundamental
              business; must be derived by looking across the firm&rsquo;s and competitors&rsquo;
              product ranges (p.516, Footnote 24 gives Kodak=imaging, IBM=integrated data
              processing, Motorola=untethered communications as illustrative examples).
            </li>
            <li>
              <strong>Dynamic capabilities:</strong> &ldquo;The firm&rsquo;s ability to integrate,
              build, and reconfigure internal and external competences to address rapidly changing
              environments&rdquo; (p.516). Reflect an organization&rsquo;s ability to achieve new
              and innovative forms of competitive advantage given path dependencies and market
              positions (Leonard-Barton, 1992).
            </li>
            <li>
              <strong>Products:</strong> The final goods and services produced by the firm, drawing
              on the competences that it possesses. The performance (price, quality) of products at
              any point in time depends on competences, which in turn depend on capabilities
              (p.516).
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The paper&rsquo;s central analytical device is the <em>three Ps</em> - processes,
            positions, paths - which together shape a firm&rsquo;s competences and dynamic
            capabilities (p.518):
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Processes (managerial and organizational):</strong> The way things are done in
              the firm - routines, patterns of current practice and learning. Processes have three
              roles: <em>coordination/integration</em> (a static concept),
              <em>learning</em> (dynamic), and <em>reconfiguration</em> (transformational)
              (p.518-524).
            </li>
            <li>
              <strong>Positions:</strong> The firm&rsquo;s current specific endowments of
              technology, intellectual property, complementary assets, customer base, and external
              relations with suppliers and complementors. The paper enumerates seven illustrative
              asset classes: technological, complementary, financial, reputational, structural,
              institutional, market-structure, and organizational-boundary assets (p.521-523).
            </li>
            <li>
              <strong>Paths:</strong> The strategic alternatives available to the firm, and the
              presence or absence of increasing returns and path dependencies. Where a firm can go
              is a function of its current position and the paths ahead; current position is often
              shaped by the path traveled (p.522-524).
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Note on terminology: the 1997 paper does <em>not</em> use the &ldquo;sensing - seizing -
            reconfiguring&rdquo; vocabulary that has since become the popular summary of dynamic
            capabilities. That restatement is Teece (2007). The 1997 paper&rsquo;s equivalent
            locution is &ldquo;integrate, build, and reconfigure&rdquo;, with the three Ps as the
            organizing substructure.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997) synthesize and cite a substantial body of prior work.
            The most important precursors they credit:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Resource-Based Perspective (
                <a
                  id="cite-ref-penrose-1959-1"
                  href="#ref-penrose-1959"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Penrose, 1959
                </a>
                ;{' '}
                <a
                  id="cite-ref-wernerfelt-1984-2"
                  href="#ref-wernerfelt-1984"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Wernerfelt, 1984, 1989
                </a>
                ;{' '}
                <a
                  id="cite-ref-rumelt-1984-1"
                  href="#ref-rumelt-1984"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rumelt, 1984
                </a>
                ;{' '}
                <a
                  id="cite-ref-barney-1991-2"
                  href="#ref-barney-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Barney, 1991
                </a>
                ):
              </strong>{' '}
              The &ldquo;models of strategy emphasizing efficiency&rdquo; strand. Supplies the
              firm-specific-asset foundation on which dynamic capabilities builds. Teece et al.
              explicitly position dynamic capabilities as an <em>extension</em> of RBV, not a
              replacement.
            </li>
            <li>
              <strong>
                Competitive forces / industry structure (
                <a
                  id="cite-ref-porter-1980-1"
                  href="#ref-porter-1980"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Porter, 1980
                </a>
                , 1985):
              </strong>{' '}
              The first of the three paradigms reviewed in Section I. Supplies the language of
              industry structure, entry deterrence, and positioning. Teece et al. retain the
              environmental-analysis concerns but shift the analytical focus inside the firm.
            </li>
            <li>
              <strong>
                Strategic conflict / game-theoretic approach (Shapiro, 1989; Ghemawat, 1991):
              </strong>{' '}
              The second paradigm reviewed. Supplies the sequential-move and commitment framework.
              Teece et al. argue it is most powerful when rivals have roughly equal competences and
              least powerful when firms differ fundamentally in capabilities.
            </li>
            <li>
              <strong>
                Evolutionary economics / organizational routines (
                <a
                  id="cite-ref-nelson-1982-1"
                  href="#ref-nelson-1982"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Nelson &amp; Winter, 1982
                </a>
                ):
              </strong>{' '}
              Central reference. Supplies the concept of organizational routines as the unit of
              analysis for competence and for evolutionary selection. Cited repeatedly throughout
              the paper (pp.515, 519, 526, 529).
            </li>
            <li>
              <strong>
                Organizational learning (
                <a
                  id="cite-ref-argyris-1978-1"
                  href="#ref-argyris-1978"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Argyris &amp; Sch&ouml;n, 1978
                </a>
                ;{' '}
                <a
                  id="cite-ref-levitt-1988-1"
                  href="#ref-levitt-1988"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Levitt &amp; March, 1988
                </a>
                ;{' '}
                <a
                  id="cite-ref-leonard-1992-1"
                  href="#ref-leonard-1992"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Leonard-Barton, 1992
                </a>
                ):
              </strong>{' '}
              Supplies the theoretical grounding for the &ldquo;learning&rdquo; role of
              organizational processes. Leonard-Barton&rsquo;s core-capabilities treatment is
              particularly important for the definition of dynamic capabilities (p.516).
            </li>
            <li>
              <strong>
                Increasing returns and path dependency (
                <a
                  id="cite-ref-arthur-1983-1"
                  href="#ref-arthur-1983"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Arthur, 1983
                </a>
                ;{' '}
                <a
                  id="cite-ref-david-1985-1"
                  href="#ref-david-1985"
                  className="text-tabs-teal-deep hover:underline"
                >
                  David, 1985
                </a>
                ):
              </strong>{' '}
              Cited on p.518 and p.522. Supplies the argument that path dependencies matter most
              where conditions of increasing returns obtain. Essential to the &ldquo;paths&rdquo;
              leg of the three-Ps framework.
            </li>
            <li>
              <strong>
                Core competencies (
                <a
                  id="cite-ref-prahalad-1990-1"
                  href="#ref-prahalad-1990"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Prahalad &amp; Hamel, 1990
                </a>
                ):
              </strong>{' '}
              Supplies the &ldquo;core competence&rdquo; vocabulary that the paper builds on and
              refines (p.516 defines core competences by reference to this literature).
            </li>
            <li>
              <strong>
                Teece on complementary assets and appropriability (
                <a
                  id="cite-ref-teece-1986-1"
                  href="#ref-teece-1986"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Teece, 1986
                </a>
                ):
              </strong>{' '}
              Teece&rsquo;s own earlier paper on profiting from technological innovation. Supplies
              the argument that successful commercialization requires complementary assets, a
              central theme in the Positions discussion.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997) develop the framework in four steps: (1) review and
            critique three precursor paradigms of strategy; (2) lay out a hierarchical vocabulary of
            firm-level factors; (3) advance the three-Ps argument - competitive advantage is shaped
            by processes, positions, and paths; (4) apply the framework to illustrative firm cases
            (the paper discusses cases in semiconductors, consumer electronics, and biotechnology,
            pp.524-533).
          </p>

          <h3 className={H3_CLASSES}>Three precursor paradigms critiqued (pp.509-515)</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Competitive forces (Porter, 1980):</strong> Industry structure - the five
              forces of rivalry, supplier power, buyer power, entry threat, and substitute threat -
              determines firm performance. Strategy is industry selection and positioning. Critique:
              treats firms as relatively interchangeable within an industry and is silent on
              within-industry performance dispersion.
            </li>
            <li>
              <strong>
                Strategic conflict / game-theoretic approach (Shapiro, 1989; Ghemawat, 1991):
              </strong>{' '}
              Strategy is understood through the lens of sequential-move and commitment games
              between rivals. Critique: treats strategy as chess against adversaries; produces
              elegant theorems but gives little guidance when firms differ in capabilities, not just
              moves.
            </li>
            <li>
              <strong>
                Resource-based perspectives (Penrose, 1959; Rumelt, 1984; Wernerfelt, 1984, 1989;
                Teece, 1984):
              </strong>{' '}
              Competitive advantage comes from firm-specific assets that are difficult to imitate.
              Critique: useful but relatively static - explains persistence of advantage, not how
              firms build new competences under rapid technological change.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>The three Ps: processes, positions, paths (pp.518-524)</h3>
          <p className={PARAGRAPH_CLASSES}>
            &ldquo;We thus advance the argument that the competitive advantage of firms lies with
            its managerial and organizational processes, shaped by its (specific) asset position,
            and the paths available to it&rdquo; (p.518).
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Processes:</strong> The way things are done in the firm - routines and
              patterns of current practice and learning. Three roles (p.518-520):
              <ul className={BODY_LIST_CLASSES}>
                <li>
                  <em>Coordination / integration</em> (static): how efficiently the firm coordinates
                  internal and external activity. Empirical support from Garvin (1988) on
                  air-conditioner quality, Clark &amp; Fujimoto (1991) on auto development, and
                  Fujimoto (1994) on lean production.
                </li>
                <li>
                  <em>Learning</em> (dynamic): processes by which repetition and experimentation
                  enable tasks to be performed better and faster, and new opportunities identified.
                  Rooted in Nelson &amp; Winter (1982), Argyris &amp; Sch&ouml;n (1978), Levitt
                  &amp; March (1988), Leonard-Barton (1995).
                </li>
                <li>
                  <em>Reconfiguration and transformation</em>: ability to sense the need to
                  reconfigure and accomplish the necessary internal and external transformation.
                  Requires constant surveillance of markets and technologies, and willingness to
                  adopt best practice (p.520).
                </li>
              </ul>
            </li>
            <li>
              <strong>Positions:</strong> Specific asset endowments that shape the firm&rsquo;s
              strategic posture. Seven illustrative classes (p.521-523):{' '}
              <em>technological assets</em>, <em>complementary assets</em>,{' '}
              <em>financial assets</em>,<em>reputational assets</em>, <em>structural assets</em>{' '}
              (formal/informal structure and governance), <em>institutional assets</em> (regulatory,
              IP regimes, education systems), <em>market-structure assets</em>, and{' '}
              <em>organizational boundaries</em>
              (degree of integration).
            </li>
            <li>
              <strong>Paths:</strong> Strategic alternatives given current position and the paths
              ahead. Path dependencies matter when conditions of increasing returns exist (Arthur,
              1983). Technological opportunities matter - they are often not exogenous to the firm
              but shaped by the firm&rsquo;s R&amp;D activities and the state of applied science.
              Replicability and imitatability (the ease with which competitors can copy) determine
              how quickly advantage erodes.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Illustrative mechanisms the paper highlights</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Replicability vs. imitatability:</strong> Replicability is the firm&rsquo;s
              ability to expand internally by copying its own operations; imitatability is the
              competitor&rsquo;s ability to copy the firm&rsquo;s operations. Both are harder when
              routines are tacit and organizationally embedded (p.525-527).
            </li>
            <li>
              <strong>Complementary assets:</strong> Following Teece (1986), successful
              commercialization often requires complementary assets (manufacturing, distribution,
              reputation). A firm with a novel competence but without complementary assets may fail
              to capture the rents.
            </li>
            <li>
              <strong>Co-specialization of assets:</strong> Dynamic capabilities arise from the way
              the firm&rsquo;s processes, positions, and paths are co-specialized to one another;
              reconfiguration involves rebuilding these links when conditions change (p.527).
            </li>
          </ul>

          <h3 className={H3_CLASSES}>On the &ldquo;sense, seize, reconfigure&rdquo; vocabulary</h3>
          <p className={PARAGRAPH_CLASSES}>
            Many textbook summaries of dynamic capabilities reduce the framework to &ldquo;sensing,
            seizing, and reconfiguring / transforming&rdquo;. That reduction comes from Teece
            (2007), which explicated the <em>microfoundations</em> of dynamic capabilities. It is a
            valid later restatement, but it is <em>not</em> what the 1997 paper says - the 1997
            paper uses the three Ps as its organizing substructure and &ldquo;integrate, build, and
            reconfigure&rdquo; as its definitional verb triplet. Be careful not to retroject 2007
            vocabulary onto the 1997 paper.
          </p>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Addresses RBV limitations:</strong> Extends Resource-Based View to dynamic
              environments by explaining how organizations sustain competitive advantage when
              resources continuously become outdated.
            </li>
            <li>
              <strong>Explains within-industry heterogeneity in dynamic environments:</strong>{' '}
              Accounts for why some organizations thrive amid technological disruption while others
              falter. Organizations differ not just in resource positions but in capabilities for
              adaptation and renewal.
            </li>
            <li>
              <strong>Integrates external and internal perspectives:</strong> The three-Ps framework
              combines external opportunity structure (paths, co-specialized positions) with
              internal capabilities and processes (routines, learning, and reconfiguration).
            </li>
            <li>
              <strong>Acknowledges path dependency:</strong> Recognizes that historical choices
              constrain future options while emphasizing that organizations can influence future
              possibilities through current decisions.
            </li>
            <li>
              <strong>Emphasizes process capabilities:</strong> Highlights that organizational
              capabilities for adaptation, learning, and decision-making create competitive value
              beyond static resources.
            </li>
            <li>
              <strong>Applicable to technology-intensive industries:</strong> Provides powerful
              explanatory framework for competitive dynamics in industries characterized by rapid
              technological change.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Complex to operationalize:</strong> The three Ps (processes, positions, paths)
              and the hierarchy of factors-to-capabilities are difficult to measure and observe
              empirically. Boundaries between &ldquo;competences&rdquo;, &ldquo;core
              competences&rdquo;, and &ldquo;dynamic capabilities&rdquo; remain contested.
              Eisenhardt &amp; Martin (2000) was one of several follow-up papers responding
              specifically to this operationalization gap.
            </li>
            <li>
              <strong>Limited empirical test in the paper itself:</strong> The 1997 paper relies on
              illustrative firm-level examples (Xerox, IBM, semiconductor firms, Japanese auto
              makers) rather than systematic empirical tests. Teece et al. explicitly call the piece
              &ldquo;conceptual&rdquo; and identify empirical validation as a research agenda, not a
              deliverable.
            </li>
            <li>
              <strong>Tautology risk:</strong> Similar to RBV, the framework can risk tautology: if
              a firm performs well in rapid change we infer it has good dynamic capabilities, and if
              it has good dynamic capabilities we expect it to perform well. Independent measurement
              of the three Ps is required to break the circle.
            </li>
            <li>
              <strong>Scope limited to rapid-change environments:</strong> The framework is
              explicitly aimed at regimes of rapid technological change (pharmaceuticals,
              semiconductors, consumer electronics). Its value-added in stable or slow-changing
              industries is modest; the 1997 paper does not claim otherwise.
            </li>
            <li>
              <strong>Processes vs. positions vs. paths are interdependent:</strong> The three Ps
              are presented as analytically distinct but empirically co-determine one another
              (current position shapes available processes, paths taken shape current position, and
              so on). This makes causal inference difficult.
            </li>
            <li>
              <strong>No formal treatment of failure:</strong> The paper focuses on how successful
              dynamic capabilities generate advantage; it does not formally treat when
              reconfiguration fails, produces negative returns, or generates core rigidities
              (Leonard-Barton, 1992, is acknowledged but not developed).
            </li>
            <li>
              <strong>Path-dependency and managerial agency tension:</strong> The paper
              simultaneously emphasizes strong path dependency and managerial ability to
              reconfigure. The boundary between these two is not sharp; critics (e.g. Pisano, 1994,
              cited p.520) have noted the difficulty.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The specific contributions of Teece, Pisano &amp; Shuen (1997) to the strategic
            management literature:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Canonical definition of dynamic capabilities:</strong> &ldquo;The firm&rsquo;s
              ability to integrate, build, and reconfigure internal and external competences to
              address rapidly changing environments&rdquo; (p.516). This definition has become the
              most-cited definition in the dynamic capabilities literature.
            </li>
            <li>
              <strong>Three-Ps organizing framework:</strong> Established processes, positions, and
              paths as the three interacting sources of competence and dynamic capabilities (p.518).
              The three Ps remain the dominant organizing device of the 1997 paper, distinct from
              the sensing-seizing-reconfiguring vocabulary popularized by Teece (2007).
            </li>
            <li>
              <strong>Hierarchy of firm-level factors:</strong> Distinguished factors of production,
              resources, routines/competences, core competences, dynamic capabilities, and products
              as six analytically distinct levels (p.515-517). This hierarchy is used to separate
              dynamic capabilities from lower-order concepts.
            </li>
            <li>
              <strong>Three-paradigm synthesis:</strong> Reviewed the competitive forces, strategic
              conflict, and resource-based paradigms and located dynamic capabilities as a fourth
              paradigm addressing rapid change - a synthesis widely adopted in strategy teaching.
            </li>
            <li>
              <strong>Three roles of organizational processes:</strong> Coordination/integration
              (static), learning (dynamic), and reconfiguration (transformational) (p.518-520). Gave
              empirical researchers named, distinct process functions to operationalize.
            </li>
            <li>
              <strong>Seven asset classes for &ldquo;positions&rdquo;:</strong> Technological,
              complementary, financial, reputational, structural, institutional, market, and
              organizational-boundary assets (p.521-523). A useful typology that has influenced
              subsequent capabilities research.
            </li>
            <li>
              <strong>Replicability vs. imitatability distinction:</strong> Separated the
              firm&rsquo;s internal-expansion challenge from the competitor&rsquo;s imitation
              challenge (p.525-527). Both depend on how tacit and socially embedded the relevant
              routines are.
            </li>
            <li>
              <strong>Schumpeterian-rent framing:</strong> Reframed competitive advantage in regimes
              of rapid technological change in terms of Schumpeterian innovation rents, pulling
              strategic management closer to evolutionary economics.
            </li>
            <li>
              <strong>Foundation for the dynamic capabilities tradition:</strong> Provided the
              conceptual ground from which Eisenhardt &amp; Martin (2000), Zollo &amp; Winter
              (2002), Helfat &amp; Peteraf (2003), and Teece (2007) subsequently built; also for the
              sensing-seizing-reconfiguring microfoundations treatment (Teece, 2007), which is often
              incorrectly attributed to the 1997 paper.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Teece, Pisano &amp; Shuen (1997) is a conceptual paper. Its internal validity is
            therefore assessed as logical coherence and fidelity to the literature it synthesizes,
            not as statistical validity. The paper is careful about attribution and limits:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Logical consistency:</strong> The argument chain - three precursor paradigms
              reviewed, their limits identified, hierarchy of firm-level factors defined, three Ps
              introduced as interacting sources of competence, definitional verb triplet
              &ldquo;integrate, build, reconfigure&rdquo; proposed - is internally coherent. Each
              step follows the previous.
            </li>
            <li>
              <strong>Integration with empirical observation:</strong> The framework emerged from
              empirical investigation of how semiconductor, pharmaceutical, and biotechnology firms
              managed innovation and adaptation. Proposed mechanisms reflect observed organizational
              practices in these industries.
            </li>
            <li>
              <strong>Consistency with organizational learning theory:</strong> The framework
              incorporates established insights from organizational learning theory about how
              organizations develop capabilities, learn from experience, and adapt to environmental
              changes.
            </li>
            <li>
              <strong>Addresses documented organizational challenges:</strong> The framework
              explains well-documented phenomena: why incumbent firms struggle with disruptive
              innovation, why startup firms sometimes outpace established competitors despite having
              fewer resources, and why organizational success in one era sometimes predicts
              organizational failure in the next era.
            </li>
            <li>
              <strong>Acknowledges path dependency:</strong> Explicit recognition of path dependency
              and historical constraint on organizational options reflects organizational reality
              and prevents unfounded claims of unlimited strategic optionality.
            </li>
            <li>
              <strong>Balance of mechanism specificity:</strong> The framework is specific enough to
              distinguish processes, positions, and paths as different sources of capability, yet
              flexible enough to encompass diverse organizational forms and industry contexts.
            </li>
            <li>
              <strong>Careful terminology with admitted discomfort:</strong> The authors note they
              &ldquo;do not like the term &rsquo;resource&rsquo; and believe it is misleading&rdquo;
              (p.516 footnote 23) but retain it to preserve links to the RBV literature. This kind
              of flagged-tension is good scholarly practice and is preserved on this page.
            </li>
            <li>
              <strong>Known internal-validity limitations:</strong> The paper is largely
              illustrative rather than formal. Many of the causal claims (e.g. &ldquo;distinctive
              coordinative routines drive quality performance&rdquo;) are supported by field studies
              (Garvin 1988; Clark &amp; Fujimoto 1991) but not by statistical tests within this
              paper itself.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            External validity considerations concern generalizability of Dynamic Capabilities
            framework across diverse organizational contexts and competitive environments:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Industry-dependent applicability:</strong> The framework is particularly
              well-suited to technology-intensive industries characterized by rapid technological
              change and dynamic competitive conditions. Applicability to stable, mature industries
              with predictable competitive dynamics may be more limited.
            </li>
            <li>
              <strong>Organizational size variation:</strong> The framework may apply differently to
              large, established organizations with formalized capabilities compared to small,
              flexible startups with less formal capabilities but potentially greater adaptive
              flexibility.
            </li>
            <li>
              <strong>Measurement and empirical validation challenges:</strong> Operationalizing the
              three Ps (processes, positions, paths) and establishing empirical relationships
              between them and performance remains methodologically challenging. Proposed mechanisms
              are difficult to measure directly; Eisenhardt &amp; Martin (2000), Zollo &amp; Winter
              (2002), and subsequent empirical work attempted to narrow this gap.
            </li>
            <li>
              <strong>Causality direction uncertain:</strong> While the framework proposes that
              dynamic capabilities enable adaptation, establishing clear causality (do organizations
              with strong capabilities adapt faster, or does successful adaptation build stronger
              capabilities?) is complicated.
            </li>
            <li>
              <strong>Cultural and national context variation:</strong> The framework was developed
              in Western research traditions studying American and European technology firms.
              Applicability to different cultural contexts, governance systems, or national
              economies requires investigation.
            </li>
            <li>
              <strong>Organizational structure variation:</strong> The framework assumes certain
              organizational structural characteristics (decentralized decision-making,
              cross-functional teams, tight coupling between R&amp;D and manufacturing) enable
              reconfiguration. Organizations with highly centralized decision structures may
              struggle to leverage dynamic capabilities even when they recognize the need.
            </li>
            <li>
              <strong>Resource constraint effects:</strong> The framework assumes organizations have
              adequate resources to sense opportunities, evaluate opportunities, and execute
              strategies. Severely resource-constrained organizations may lack capacity to fully
              implement the framework.
            </li>
            <li>
              <strong>Institutional and regulatory context:</strong> In heavily regulated industries
              or environments with significant institutional constraints, the freedom to reconfigure
              resources and adapt may be more limited than the framework assumes.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            Applied to organizational technology adoption, the Teece, Pisano &amp; Shuen (1997)
            framework treats adoption as a function of the adopter&rsquo;s three Ps: its{' '}
            <em>processes</em> for evaluating, integrating, and learning about new technology; its{' '}
            <em>positions</em> in the relevant technological, complementary, and institutional asset
            classes; and the <em>paths</em> available to it given its history of prior technology
            adoption and investment. Organizations with strong coordinative, learning, and
            reconfiguring processes (the three roles of organizational processes on pp.518-520) tend
            to integrate new technology faster and more durably. Organizations with favorable
            complementary-asset positions (Teece, 1986) can capture more of the rents from the
            technology. Organizations with history-conditioned paths of cumulative know-how can
            sometimes leverage new technology better than rivals starting from similar positions but
            without the cumulative path.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Weak coordinative / integrative processes:</strong> Organizations that cannot
              coordinate internal functions (engineering, operations, marketing) or external
              partners (suppliers, complementors) struggle to integrate new technologies into
              production. Empirical examples in the paper include differences in
              new-product-development cycle times between firms (Clark &amp; Fujimoto, 1991).
            </li>
            <li>
              <strong>Weak learning processes:</strong> Organizations that do not capture and codify
              experience across repeated uses of a technology fail to improve speed and quality over
              time (Nelson &amp; Winter, 1982; Leonard-Barton, 1995, cited p.519).
            </li>
            <li>
              <strong>Limited reconfiguration capacity:</strong> Organizations embedded in
              entrenched routines cannot rearrange internal structure, processes, and external
              linkages as the technology or its market shifts. Core rigidities (Leonard-Barton,
              1992) and organizational inertia constrain reconfiguration.
            </li>
            <li>
              <strong>Missing complementary assets:</strong> Organizations that possess a technology
              but lack the complementary manufacturing, distribution, or marketing assets (Teece,
              1986) often fail to appropriate rents from the technology - other players capture them
              instead.
            </li>
            <li>
              <strong>Unfavorable path dependencies:</strong> Legacy technology commitments, prior
              capital investments, and accumulated routines can lock an organization into paths that
              made sense historically but foreclose current adoption options (Arthur, 1983; David,
              1985).
            </li>
            <li>
              <strong>Imitatability of capability by rivals:</strong> Even when the focal firm has
              adopted successfully, if its adoption routines are easily imitatable (low tacitness,
              low social complexity), rivals can replicate quickly and erode any first-mover
              advantage.
            </li>
            <li>
              <strong>Institutional / regulatory constraints:</strong> In sectors where
              institutional assets (regulation, IP regime, national innovation system) restrict how
              technology can be deployed, the freedom to reconfigure around the new technology is
              limited regardless of internal capability.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Invest in coordinative processes:</strong> Build cross-functional and
              cross-organizational coordination capability - structures, shared information systems,
              incentive alignment - that let the firm integrate external technology into internal
              operations quickly.
            </li>
            <li>
              <strong>Invest in learning processes:</strong> Put in place systems for capturing,
              codifying, and sharing what is learned during each adoption cycle - pilots,
              post-implementation reviews, centers of expertise.
            </li>
            <li>
              <strong>Build reconfiguration capacity:</strong> Develop explicit competence at
              reorganizing internal structure, process, and external partnerships as the technology
              or its market shifts. Avoid embedding current structure so deeply that future
              reconfiguration becomes prohibitive.
            </li>
            <li>
              <strong>Assess and assemble complementary assets:</strong> Before or during adoption,
              evaluate whether the complementary manufacturing, distribution, reputational, and
              institutional assets needed to appropriate rents are in place; build, lease, or
              partner for the missing ones.
            </li>
            <li>
              <strong>Manage paths with awareness:</strong> Recognize that technology choices commit
              the firm to paths with their own dependencies; make commitments with deliberate
              awareness of the increasing-returns dynamics (Arthur, 1983) that will reinforce or
              trap those choices.
            </li>
            <li>
              <strong>Make adoption routines tacit and socially complex:</strong> To the extent the
              firm wants sustained advantage from its adoption competence, rely on tacit,
              team-based, culturally embedded routines rather than on explicit procedures that
              rivals can easily observe and copy.
            </li>
            <li>
              <strong>Keep position and process co-specialized:</strong> The dynamic capabilities
              argument is that assets, processes, and paths must be co-specialized. Don&rsquo;t hire
              new capabilities without evolving the processes and the asset base they are meant to
              work with (Teece, Pisano &amp; Shuen, 1997, p.527).
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Dynamic Capabilities theory has spawned significant theoretical developments and
            extensions building on and refining the original framework:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Microfoundations of Dynamic Capabilities (
                <a
                  id="cite-ref-teece-2007-1"
                  href="#ref-teece-2007"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Teece, 2007
                </a>
                ):
              </strong>{' '}
              Refined and extended dynamic capabilities theory by developing detailed
              microfoundations explaining which specific organizational routines, processes, and
              governance mechanisms enable sensing, seizing, and reconfiguring. This development
              addressed criticisms that dynamic capabilities were too abstract and difficult to
              observe.
            </li>
            <li>
              <strong>
                Organizational Agility Framework (
                <a
                  id="cite-ref-sambamurthy-2003-1"
                  href="#ref-sambamurthy-2003"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Sambamurthy, Bharadwaj, &amp; Grover, 2003
                </a>
                ):
              </strong>{' '}
              Applied dynamic capabilities concepts to information technology and organizational
              agility, exploring how information technology capabilities enable organizational
              sensing, decision-making, and responsive action.
            </li>
            <li>
              <strong>
                Ambidextrous Organization Theory (O&rsquo;Reilly &amp; Tushman, 2004, 2008):
              </strong>{' '}
              Extended dynamic capabilities to explain how organizations balance exploitation of
              existing capabilities with exploration of new opportunities, arguing that
              ambidexterity requires distinct organizational structures and management processes.
            </li>
            <li>
              <strong>Organizational Resilience Framework:</strong> Applied dynamic capabilities
              concepts to organizational resilience and disaster recovery, examining how
              organizational capabilities for sensing disruptions, deciding responses, and
              reconfiguring operations enable continuation through disruptions.
            </li>
            <li>
              <strong>Innovation Capability Models:</strong> Extended dynamic capabilities framework
              to detailed analysis of innovation processes, exploring how organizations develop
              capabilities for recognizing innovation opportunities, funding innovation projects,
              and integrating innovations into operations.
            </li>
            <li>
              <strong>Digital Transformation Capability Models:</strong> Applied dynamic
              capabilities framework to digital transformation, examining how organizations develop
              capabilities for sensing digital disruption risks, seizing digital opportunities, and
              reconfiguring business models and operations for digital-first competition.
            </li>
            <li>
              <strong>Evolutionary Strategy Theory:</strong> Integration of dynamic capabilities
              with evolutionary economics perspectives on how organizations adapt through variation,
              selection, and retention processes.
            </li>
            <li>
              <strong>Strategic Foresight and Scenario Planning:</strong> Extended dynamic
              capabilities framework to strategic foresight and scenario planning, examining how
              organizations improve sensing capabilities through structured approaches to exploring
              possible future conditions.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <p className={PARAGRAPH_CLASSES}>
            Works cited by Teece, Pisano &amp; Shuen (1997) that are also referenced in-text on this
            page:
          </p>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-teece-1997">
              Teece, D. J., Pisano, G., &amp; Shuen, A. (1997). Dynamic capabilities and strategic
              management. <em>Strategic Management Journal</em>, 18(7), 509-533.
              https://doi.org/10.1002/(SICI)1097-0266(199708)18:7%3C509::AID-SMJ882%3E3.0.CO;2-Z
            </li>
            <li id="ref-argyris-1978">
              Argyris, C., &amp; Sch&ouml;n, D. A. (1978). <em>Organizational learning</em>.
              Addison-Wesley.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-argyris-1978-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-arthur-1983">
              Arthur, W. B. (1983). <em>On competing technologies and historical small events</em>.
              IIASA Working Paper (later published as Arthur, 1989, Economic Journal).
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-arthur-1983-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-barney-1991">
              Barney, J. B. (1991). Firm resources and sustained competitive advantage.{' '}
              <em>Journal of Management</em>, 17(1), 99-120.
              https://doi.org/10.1177/014920639101700108{' '}
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-barney-1991-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>{' '}
                <a
                  href="#cite-ref-barney-1991-2"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 2"
                ></a>
              </span>
            </li>
            <li id="ref-david-1985">
              David, P. A. (1985). Clio and the economics of QWERTY.{' '}
              <em>American Economic Review</em>, 75(2), 332-337.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-david-1985-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-leonard-1992">
              Leonard-Barton, D. (1992). Core capabilities and core rigidities: A paradox in
              managing new product development. <em>Strategic Management Journal</em>, 13(S1),
              111-125.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-leonard-1992-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-levitt-1988">
              Levitt, B., &amp; March, J. G. (1988). Organizational learning.{' '}
              <em>Annual Review of Sociology</em>, 14, 319-340.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-levitt-1988-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-nelson-1982">
              Nelson, R. R., &amp; Winter, S. G. (1982).{' '}
              <em>An evolutionary theory of economic change</em>. Harvard University Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-nelson-1982-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-penrose-1959">
              Penrose, E. T. (1959). <em>The theory of the growth of the firm</em>. Oxford
              University Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-penrose-1959-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-porter-1980">
              Porter, M. E. (1980). <em>Competitive strategy</em>. Free Press.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-porter-1980-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-prahalad-1990">
              Prahalad, C. K., &amp; Hamel, G. (1990). The core competence of the corporation.{' '}
              <em>Harvard Business Review</em>, 68(3), 79-91.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-prahalad-1990-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-rumelt-1984">
              Rumelt, R. P. (1984). Towards a strategic theory of the firm. In R. B. Lamb (Ed.),{' '}
              <em>Competitive strategic management</em> (pp. 556-570). Prentice-Hall.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rumelt-1984-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-teece-1986">
              Teece, D. J. (1986). Profiting from technological innovation: Implications for
              integration, collaboration, licensing and public policy. <em>Research Policy</em>,
              15(6), 285-305.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-teece-1986-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-wernerfelt-1984">
              Wernerfelt, B. (1984). A resource-based view of the firm.{' '}
              <em>Strategic Management Journal</em>, 5(2), 171-180.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-wernerfelt-1984-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>{' '}
                <a
                  href="#cite-ref-wernerfelt-1984-2"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 2"
                ></a>
              </span>
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <p className={PARAGRAPH_CLASSES}>
            The following works are <em>not</em> cited by Teece, Pisano &amp; Shuen (1997). They
            represent the post-1997 dynamic-capabilities tradition and are listed here for readers
            tracing the development of the framework:
          </p>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-teece-2007">
              Teece, D. J. (2007). Explicating dynamic capabilities: The nature and microfoundations
              of (sustainable) enterprise performance. <em>Strategic Management Journal</em>,
              28(13), 1319-1350. https://doi.org/10.1002/smj.640
            </li>
            <li id="ref-eisenhardt-2000">
              Eisenhardt, K. M., &amp; Martin, J. A. (2000). Dynamic capabilities: What are they?{' '}
              <em>Strategic Management Journal</em>, 21(10-11), 1105-1121.
            </li>
            <li id="ref-zollo-2002">
              Zollo, M., &amp; Winter, S. G. (2002). Deliberate learning and the evolution of
              dynamic capabilities. <em>Organization Science</em>, 13(3), 339-351.
            </li>
            <li id="ref-helfat-2003">
              Helfat, C. E., &amp; Peteraf, M. A. (2003). The dynamic resource-based view:
              Capability lifecycles. <em>Strategic Management Journal</em>, 24(10), 997-1010.
            </li>
            <li id="ref-sambamurthy-2003">
              Sambamurthy, V., Bharadwaj, A., &amp; Grover, V. (2003). Shaping agility through
              digital options. <em>MIS Quarterly</em>, 27(2), 237-263.
            </li>
            <li id="ref-oreilly-2004">
              O&rsquo;Reilly, C. A., &amp; Tushman, M. L. (2004). The ambidextrous organization.{' '}
              <em>Harvard Business Review</em>, 82(4), 74-81.
            </li>
            <li id="ref-hamel-1989">
              Hamel, G., &amp; Prahalad, C. K. (1989). Strategic intent.{' '}
              <em>Harvard Business Review</em>, 67(3), 63-76.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-2-vrio-framework-barney-1991"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: VRIO Framework (Barney, 1991)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-4-total-quality-management-tqm-deming-1982"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: Total Quality Management (TQM) (Deming, 1982/1986) &rarr;
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
