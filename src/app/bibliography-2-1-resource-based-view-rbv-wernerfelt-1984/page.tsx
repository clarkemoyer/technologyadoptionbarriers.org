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
  title: 'Bibliography: A Resource-Based View (RBV) - Wernerfelt (1984)',
  description:
    'Comprehensive overview of the Resource-Based View of the Firm, foundational strategic management theory arguing that competitive advantage originates from internal firm resources rather than industry structure, establishing resources as sustainable sources of performance differentiation.',
}

const BibliographyArticlePage = () => {
  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>A Resource-Based View (RBV) - Wernerfelt (1984)</h1>

        {/* 1. Framework Identification */}
        <section className={`${SECTION_CLASSES} bg-gray-50 p-6 rounded-lg`}>
          <h2 className={H2_CLASSES}>Framework Identification</h2>
          <div className="space-y-2">
            <p>
              <strong>Framework Name:</strong> Resource-Based View of the Firm
            </p>
            <p>
              <strong>Framework Abbreviation:</strong> RBV
            </p>
            <p>
              <strong>Target of Framework:</strong> A resource-side counterpart to product-market
              analysis. Introduces the notions of resource position barrier, resource-product
              matrix, and dynamic-strategy patterns (sequential entry, exploit-and-develop, stepping
              stones) as tools for analysing a firm&rsquo;s resource position. The later VRIN/VRIO
              formalization is Barney (1991/1995), not Wernerfelt (1984).
            </p>
            <p>
              <strong>Disciplinary Origin:</strong> Strategic Management, Economics, Organization
              Theory, Business Policy
            </p>
          </div>
        </section>

        {/* 2. Theory Publication Information */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Theory Publication Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Author:</strong> Birger Wernerfelt
            </p>
            <p>
              <strong>Formal Publication Date:</strong> 1984
            </p>
            <p>
              <strong>Official Title:</strong> A resource-based view of the firm
            </p>
            <p>
              <strong>Journal:</strong> Strategic Management Journal
            </p>
            <p>
              <strong>Volume &amp; Issue:</strong> Vol. 5, No. 2
            </p>
            <p>
              <strong>Pages:</strong> 171-180
            </p>
            <p>
              <strong>URL:</strong>{' '}
              <a
                href="https://www.proquest.com/docview/230627518"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://www.proquest.com/docview/230627518
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
                Wernerfelt, B. (
                <a href="#ref-wernerfelt-1984" className="text-tabs-teal-deep hover:underline">
                  1984
                </a>
                ). A resource-based view of the firm. <em>Strategic Management Journal</em>, 5(2),
                171-180.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-900 mb-1">
                Chicago (Author-Date)
              </p>
              <p className="text-sm font-mono">
                Wernerfelt, Birger. 1984. &ldquo;A Resource-Based View of the Firm.&rdquo;
                <em>Strategic Management Journal</em> 5, no. 2: 171-180.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Was the Model Created? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Why Was the Model Created?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) opens with a symmetry argument: &ldquo;For the firm, resources and
            products are two sides of the same coin&rdquo; (p.171). Most products require the
            services of several resources and most resources can be used in several products; by
            specifying a firm&rsquo;s resource profile it is possible to find the optimal
            product-market activities. The strategic management literature of the early 1980s -
            particularly Porter&rsquo;s (1980) industrial-organization-based competitive-strategy
            framework - analysed firms almost exclusively from the product-market side.
            Wernerfelt&rsquo;s aim was not to displace that analysis, but to develop the resource
            side of the coin with the same rigour.
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The paper identifies two categories of precedent for a resource perspective: a
            long-standing tradition in economics (Penrose, 1959; Rubin, 1973; Caves, 1980) that
            analyses firms in terms of their resource endowments, and portfolio / growth-share work
            from strategic management (BCG, 1972; Henderson, 1979) that implicitly trades on
            resource shareability. Wernerfelt argues that a general economic theory of resources has
            received relatively little formal attention, mainly because resources have unpleasant
            properties for modelling purposes - declining returns, difficulty defining them
            precisely, and the problem of identifying them as technological &ldquo;skills&rdquo;
            (p.171).
          </p>
          <p className={PARAGRAPH_CLASSES}>
            The purpose of the paper, stated explicitly in the introduction, is to &ldquo;develop
            some simple economic tools for analysing a firm&rsquo;s resource position and to look at
            some strategic options suggested by this analysis&rdquo; (p.171). Specifically, the
            paper uses Porter&rsquo;s (1980) five competitive forces as the analytical tool but
            applies them at the resource level (p.173), producing the notion of a resource position
            barrier, the resource-product matrix, and the dynamic-strategy illustrations (sequential
            entry, exploit-and-develop, stepping stones). Wernerfelt closes the paper by calling it
            &ldquo;a first cut at a huge can of worms&rdquo; (p.180), with much research still
            needed on the implementability of the strategies suggested.
          </p>
        </section>

        {/* 5. What Does the Model Measure? */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>What Does the Model Measure?</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) is a conceptual framework paper, not a measurement model. It does not
            propose scales, latent constructs, or empirical operationalizations. Instead, it
            proposes a re-orientation of strategic analysis: examining the firm from the resource
            side rather than from the product side (p.171). The paper is structured around four
            diversification questions the resource perspective is meant to answer (p.172):
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              (a) On which of the firm&rsquo;s current resources should diversification be based?
            </li>
            <li>(b) Which resources should be developed through diversification?</li>
            <li>(c) In what sequence and into what markets should diversification take place?</li>
            <li>(d) What types of firms will be desirable for this particular firm to acquire?</li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            The paper&rsquo;s analytical tools are conceptual rather than statistical: (i) the
            notion of a <em>resource position barrier</em> (analogous to an entry barrier, for
            resources rather than product-markets); (ii) the <em>resource-product matrix</em>
            (Figure 1, p.175) showing how a given resource can support multiple products and a given
            product can draw on multiple resources; and (iii) a small set of illustrative diagrams
            for dynamic strategy - <em>sequential entry</em> (Figure 2, p.176),
            <em>exploit-and-develop</em> (Figure 3, p.177), and <em>stepping stones</em> (Figure 4,
            p.178). The paper is presented by the author as &ldquo;a first cut at a huge can of
            worms&rdquo; (p.180), explicitly calling for further research on implementability. The
            later VRIN/VRIO apparatus commonly associated with RBV comes from Barney (1991) and is
            NOT in Wernerfelt (1984).
          </p>
        </section>

        {/* 6. Core Concepts and Definitions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Core Concepts and Definitions</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt&rsquo;s (1984) framework rests on a compact set of concepts introduced over
            the ten pages of the paper:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Resource:</strong> Anything which could be thought of as a strength or
              weakness of a given firm; formally, tangible and intangible assets which are tied
              semipermanently to the firm (Wernerfelt, 1984, p.172, adopting the definition of
              Caves, 1980). Examples Wernerfelt gives: brand names, in-house knowledge of
              technology, employment of skilled personnel, trade contacts, machinery, efficient
              procedures, and capital.
            </li>
            <li>
              <strong>Resource position barrier:</strong> A first-mover advantage tied to a specific
              resource that makes it more expensive or difficult for late-comers to acquire, build,
              or operate that resource. Wernerfelt positions resource position barriers as
              &ldquo;partially analogous&rdquo; to entry barriers, but defined at the resource level
              (p.173). A resource position barrier can exist without an entry barrier (leaving the
              firm vulnerable to diversifying entrants), and an entry barrier can exist without a
              resource position barrier (leaving the firm unable to exploit its position further).
            </li>
            <li>
              <strong>Attractive resource:</strong> A resource around which a resource position
              barrier can be built - one that is self-reproducing or for which a firm which at a
              given time finds itself in some sense ahead of others may use these barriers to cement
              that lead (p.173). Wernerfelt gives four illustrative mechanisms for first-mover
              resource advantages: <em>machine capacity</em>, <em>customer loyalty</em>,
              <em>production experience</em>, and <em>technological leads</em> (pp.173-174).
            </li>
            <li>
              <strong>Resource-product matrix:</strong> The central analytical device of the paper
              (Figure 1, p.175). Rows represent resources, columns represent product-markets; X
              entries mark a resource&rsquo;s role in a product-market. The matrix makes explicit
              that diversification can be analysed from the resource side (reading across a row) as
              well as from the product side (reading down a column), and that products share
              resources just as resource portfolios share products.
            </li>
            <li>
              <strong>Mergers and acquisitions:</strong> Wernerfelt frames M&amp;A as an opportunity
              to trade otherwise non-marketable resources in bundles. Acquisitions allow firms to
              buy or sell resources which have &ldquo;a high degree of transparency&rdquo; only
              between specific pairs of firms, through an imperfect market with few buyers and
              targets (pp.174-175).
            </li>
            <li>
              <strong>Sequential entry, exploit-and-develop, stepping stones:</strong> Three
              dynamic-strategy patterns illustrated using the resource-product matrix (Figures 2-4,
              pp.176-178). Sequential entry uses a single resource in successive markets;
              exploit-and-develop uses profits from an established resource to build a new one;
              stepping stones enter adjacent product-markets to build up resource positions for a
              longer-term target market.
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Concepts frequently associated with RBV in the <em>later</em> literature - including
            &ldquo;valuable, rare, inimitable, non-substitutable&rdquo; (Barney, 1991), causal
            ambiguity (Lippman &amp; Rumelt, 1982; Reed &amp; DeFillippi, 1990), social complexity
            (Barney, 1991), and time-compression diseconomies (Dierickx &amp; Cool, 1989) - are
            <em>not</em> in Wernerfelt (1984). They are treated in the Following Models section with
            their correct attribution.
          </p>
        </section>

        {/* 7. Preceding Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Preceding Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) positions the resource perspective as a <em>complement</em> to - not a
            rejection of - the dominant product-market analyses of the early 1980s (p.171:
            &ldquo;resources and products are two sides of the same coin&rdquo;). The paper draws
            explicitly on the following traditions:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Penrose&rsquo;s Theory of the Growth of the Firm (
                <a
                  id="cite-ref-penrose-1959-1"
                  href="#ref-penrose-1959"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Penrose, 1959
                </a>
                ):
              </strong>{' '}
              Wernerfelt cites Penrose as having &ldquo;relatively little formal attention&rdquo; in
              strategy at the time (p.171) and as the direct source of the resource-bundle
              conception of the firm. Penrose framed firms as bundles of productive resources whose
              use is constrained by managerial capacity.
            </li>
            <li>
              <strong>
                Caves on industrial organization (
                <a
                  id="cite-ref-caves-1980-1"
                  href="#ref-caves-1980"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Caves, 1980
                </a>
                ):
              </strong>{' '}
              Wernerfelt adopts the resource definition of Caves (1980, p.172): &ldquo;tangible and
              intangible assets which are tied semipermanently to the firm&rdquo;. Caves supplies
              both the definitional vocabulary and the link to industrial organization that the
              paper extends to the resource side.
            </li>
            <li>
              <strong>
                Porter&rsquo;s Competitive Strategy (
                <a
                  id="cite-ref-porter-1980-1"
                  href="#ref-porter-1980"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Porter, 1980
                </a>
                ):
              </strong>{' '}
              Wernerfelt explicitly <em>uses</em> Porter&rsquo;s five competitive forces as the
              analytical tool, noting (p.173) that while Porter&rsquo;s forces were originally
              intended for product-market analysis, they apply by analogy at the resource level. The
              paper positions the resource perspective as complementary to Porter&rsquo;s
              product-perspective, not as its opposition.
            </li>
            <li>
              <strong>
                Strategy literature (
                <a
                  id="cite-ref-andrews-1971-1"
                  href="#ref-andrews-1971"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Andrews, 1971
                </a>
                ):
              </strong>{' '}
              Wernerfelt opens by observing that traditional strategy (Andrews, 1971) is phrased in
              terms of the resource position (strengths and weaknesses) of the firm, and that formal
              economic tools operate on the product-market side. The paper aims to bring the two
              perspectives together.
            </li>
            <li>
              <strong>
                Growth-share and experience-curve work (
                <a
                  id="cite-ref-bcg-1972-1"
                  href="#ref-bcg-1972"
                  className="text-tabs-teal-deep hover:underline"
                >
                  BCG, 1972
                </a>
                ;{' '}
                <a
                  id="cite-ref-henderson-1979-1"
                  href="#ref-henderson-1979"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Henderson, 1979
                </a>
                ):
              </strong>{' '}
              BCG&rsquo;s experience-curve and growth-share matrix directly inspired the
              resource-product matrix. Wernerfelt notes that the product portfolio theory
              (Henderson, 1979) &ldquo;underscores the duality between the product and resource
              perspectives on the firm&rdquo; (p.177).
            </li>
            <li>
              <strong>
                Economics of scope and growth (
                <a
                  id="cite-ref-panzar-1981-1"
                  href="#ref-panzar-1981"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Panzar &amp; Willig, 1981
                </a>
                ;{' '}
                <a
                  id="cite-ref-rubin-1973-1"
                  href="#ref-rubin-1973"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rubin, 1973
                </a>
                ):
              </strong>{' '}
              Cited as formal-economic precedents for how multiproduct linkages benefit from
              non-financial (resource) linkages. Panzar &amp; Willig supply the formalization of the
              economics of scope; Rubin supplies an earlier formal treatment of multiproduct firm
              growth.
            </li>
          </ul>
        </section>

        {/* 8. Describe The Model */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Describe The Model</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) develops the framework in four steps: (1) reframe strategic analysis
            from the product side to the resource side; (2) identify classes of resources for which
            resource position barriers can be built; (3) illustrate dynamic strategy with the
            resource-product matrix; (4) extend the analysis to mergers and acquisitions as a means
            of trading otherwise non-marketable resources. The paper uses Porter&rsquo;s (1980) five
            competitive forces as the tool of analysis but applies them at the resource level
            (p.173), positioning RBV as complement to - not replacement of - industrial-organization
            strategy analysis.
          </p>

          <h3 className={H3_CLASSES}>Resource position barriers (pp.172-173)</h3>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt argues that resources, like product-markets, admit analogues of
            Porter&rsquo;s competitive forces: monopoly power in the production of a resource,
            ceteris paribus, diminishes the returns available to its users; the availability of
            substitute resources depresses returns; buyer and supplier power at the resource level
            shape the payoffs of resource ownership (pp.172-173). A{' '}
            <em>resource position barrier</em> is the first-mover analogue at the resource level - a
            mechanism which makes an advantage over another resource holder defensible.
          </p>

          <h3 className={H3_CLASSES}>
            Four illustrative first-mover resource advantages (pp.173-174)
          </h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Machine capacity:</strong> Scale economies in the use of a productive resource
              are a prime example of product-entry barriers (
              <a
                id="cite-ref-spence-1979-1"
                href="#ref-spence-1979"
                className="text-tabs-teal-deep hover:underline"
              >
                Spence, 1979
              </a>
              ). From the resource perspective, the product-entry barrier translates into a
              resource-position barrier: where excess capacity would lead to cut-throat competition
              and low returns, the resource position barrier operates through lower expected
              revenues for prospective acquirers.
            </li>
            <li>
              <strong>Customer loyalty:</strong> The market for customers generates a resource
              position barrier - it is much easier to pioneer a position than to replace someone
              else who already has it (
              <a
                id="cite-ref-ries-trout-1981-1"
                href="#ref-ries-trout-1981"
                className="text-tabs-teal-deep hover:underline"
              >
                Ries and Trout, 1981
              </a>
              ). Related examples are first-mover advantages in government contracts and access to
              raw materials.
            </li>
            <li>
              <strong>Production experience:</strong> If the leader executes the experience curve
              strategy correctly, later resource producers have to pay their experience in an uphill
              battle with earlier producers who have lower costs (BCG, 1972). Ideally, later
              acquirers should pay more for the experience and expect lower returns from it.
            </li>
            <li>
              <strong>Technological leads:</strong> A technological lead allows the firm higher
              returns and enables it to keep better people in a more stimulating setting, so that
              the organization can develop and calibrate more advanced ideas than followers - who
              must often face the reinvention of your ideas easier than you found the original
              invention. The advantage is fragile and must be kept protected.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Resource-product matrix and dynamic strategy (pp.175-178)</h3>
          <p className={PARAGRAPH_CLASSES}>
            The resource-product matrix (Figure 1) is a grid with resources as rows and
            product-markets as columns, with X entries marking a resource&rsquo;s use in a given
            product-market. Three dynamic strategy patterns are then illustrated on top of this
            device:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Sequential entry (Figure 2, p.176):</strong> A single resource is used in
              successive product-markets over time. Wernerfelt gives the example of a firm using
              production skills to enter pen, lighters, and razors sequentially.
            </li>
            <li>
              <strong>Exploit-and-develop (Figure 3, p.177):</strong> Profits from an established
              resource (e.g. &ldquo;domestic contacts&rdquo;) are used to build a new resource (e.g.
              &ldquo;international contacts&rdquo;) through joint cost effects. This balances
              exploitation of existing resources against development of new ones.
            </li>
            <li>
              <strong>Stepping stones (Figure 4, p.178):</strong> A firm enters related
              product-markets not for their own sake but because each market short-term balance
              effects (joint positioning, shared learning) that build resource positions for a
              longer-term target product-market.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Mergers and acquisitions (pp.174-175)</h3>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt treats M&amp;A as the primary vehicle for trading non-marketable resources in
            bundles - brand, technology, skills - under thin-market conditions. Prospective buyers
            limit search to targets satisfying simple criteria: what resources a target has, which
            the firm can take advantage of, the cost of doing so, and what the firm could pay for
            them. Related-supplementary and related-complementary acquisition strategies are
            distinguished (
            <a
              id="cite-ref-salter-weinhold-1979-1"
              href="#ref-salter-weinhold-1979"
              className="text-tabs-teal-deep hover:underline"
            >
              Salter &amp; Weinhold, 1979
            </a>
            ).
          </p>

          <h3 className={H3_CLASSES}>Main Strengths</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Resource-side symmetry with product-market analysis:</strong> By applying
              Porter&rsquo;s (1980) competitive-forces framework at the resource level, Wernerfelt
              provides a clean analytical extension rather than a rival paradigm - a design choice
              that makes the framework easy to integrate with existing strategy teaching and
              analysis (p.173).
            </li>
            <li>
              <strong>Explicit duality:</strong> The &ldquo;two sides of the same coin&rdquo;
              framing (p.171) and the resource-product matrix (Figure 1, p.175) force the analyst to
              see both resources and products simultaneously, surfacing diversification
              opportunities that a product-only analysis would miss.
            </li>
            <li>
              <strong>Concrete first-mover mechanisms:</strong> The four worked examples (machine
              capacity, customer loyalty, production experience, technological leads) on pp.173-174
              give readers ready-made templates rather than purely abstract concepts.
            </li>
            <li>
              <strong>Dynamic-strategy vocabulary:</strong> Figures 2-4 (sequential entry,
              exploit-and-develop, stepping stones) provide a small but coherent set of multi-period
              diversification patterns - a rarity in 1984 strategy literature that was otherwise
              dominated by static positioning.
            </li>
            <li>
              <strong>Complementary, not oppositional, to Porter:</strong> Wernerfelt neither
              dismisses industrial-organization strategy nor tries to replace it; he builds on
              Porter&rsquo;s (1980) five forces to open an additional dimension of analysis. This
              made the framework easier to adopt.
            </li>
            <li>
              <strong>Short, accessible, and generative:</strong> At ten pages the paper is
              unusually compact for a foundational contribution, which helped it spawn a very large
              follow-on literature (Barney 1991, Dierickx &amp; Cool 1989, Peteraf 1993, Teece et
              al. 1997 - see Following Models).
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Main Weaknesses</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>First-cut nature, self-acknowledged:</strong> Wernerfelt himself calls the
              paper &ldquo;a first cut at a huge can of worms&rdquo; (p.180). The framework names
              concepts (resource position barrier, attractive resource) but does not formally
              characterize when a resource qualifies - that work comes later with Barney (1991) and
              Peteraf (1993).
            </li>
            <li>
              <strong>No inimitability mechanism:</strong> The paper describes first-mover
              advantages through illustrative examples but does not provide a general theory of why
              resources are hard to imitate. Causal ambiguity (Lippman &amp; Rumelt, 1982),
              time-compression diseconomies (Dierickx &amp; Cool, 1989), and social complexity
              (Barney, 1991) came later.
            </li>
            <li>
              <strong>Limited implementability guidance:</strong> The closing paragraph explicitly
              flags this: &ldquo;nothing is known, for example, about the practical difficulties
              involved in identifying resources (products are easy to identify), nor about to what
              extent one in practice can combine capabilities across operating divisions, or about
              how one can set up a structure and systems which can help a firm execute these
              strategies&rdquo; (p.180).
            </li>
            <li>
              <strong>No empirical test:</strong> The paper presents conceptual arguments and worked
              examples but does not test its propositions empirically. Empirical support for the
              resource perspective came through Rumelt (1991) and subsequent large-sample studies.
            </li>
            <li>
              <strong>Mathematical appendix is minor:</strong> The paper includes a brief formal
              model of sequential entry (pp.176-177) but it is illustrative rather than a general
              formalization of resource position barriers.
            </li>
            <li>
              <strong>Resource definition inherits Caves&rsquo;s looseness:</strong> Wernerfelt
              adopts &ldquo;anything which could be thought of as a strength or weakness&rdquo;
              (Caves, 1980; p.172), which is broad enough to invite the tautology critique that
              later attached to RBV (&ldquo;if the firm is doing well, its resources must be
              strong&rdquo;). Later work had to narrow the definition.
            </li>
            <li>
              <strong>Treatment of dynamics is schematic:</strong> The sequential-entry,
              exploit-and-develop, and stepping-stone patterns are evocative diagrams rather than
              predictive theories. Dynamic capabilities (Teece, Pisano &amp; Shuen, 1997) addresses
              this gap with a more explicit mechanism.
            </li>
          </ul>
        </section>

        {/* 9. Key Contributions */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Key Contributions</h2>
          <p className={PARAGRAPH_CLASSES}>
            The contributions of Wernerfelt (1984) as originally stated are narrower than later
            reviews often suggest. The paper&rsquo;s specific contributions are:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Resource-perspective analogue to product-market analysis:</strong> Established
              that the tools of industrial-organization strategy (entry barriers, Porter&rsquo;s
              five forces) can be applied symmetrically at the resource level rather than only at
              the product-market level (pp.172-173).
            </li>
            <li>
              <strong>Concept of a resource position barrier:</strong> Introduced resource position
              barriers as the resource-level analogue of entry barriers - a first-mover advantage in
              a specific resource that makes an advantage over another resource holder defensible
              (p.173). Wernerfelt does <em>not</em> supply the mechanisms later attributed to RBV
              (causal ambiguity, social complexity, time-compression diseconomies); those came
              later.
            </li>
            <li>
              <strong>Resource-product matrix:</strong> Introduced the resource-product matrix
              (Figure 1, p.175) as a working analytical tool, explicitly connected to
              growth-share-style portfolio thinking (Henderson, 1979) and to the duality between
              product and resource perspectives.
            </li>
            <li>
              <strong>Four illustrative first-mover resource advantages:</strong> Spelled out
              machine capacity, customer loyalty, production experience, and technological leads as
              concrete mechanisms for resource-level first-mover advantages, with named references
              to Spence (1979), Ries &amp; Trout (1981), and BCG (1972).
            </li>
            <li>
              <strong>Dynamic strategy patterns:</strong> Provided three schematic dynamic-strategy
              patterns on the resource-product matrix - sequential entry, exploit-and-develop,
              stepping stones (Figures 2-4, pp.176-178) - offering a vocabulary for multi-period
              resource development.
            </li>
            <li>
              <strong>M&amp;A as resource-trading mechanism:</strong> Framed mergers and
              acquisitions as an opportunity to trade otherwise non-marketable resources in bundles
              - a framing that pre-dates and informs the later RBV and dynamic-capabilities
              treatments of acquisitions.
            </li>
            <li>
              <strong>Foundation for later RBV work:</strong> Provided the conceptual ground from
              which Barney (1991) later built the VRIN framework; Dierickx &amp; Cool (1989) built
              the asset-stock-accumulation / time-compression-diseconomies treatment; Peteraf (1993)
              built the four cornerstones formalization; and Teece, Pisano &amp; Shuen (1997) built
              dynamic capabilities. These follow-on works are addressed in Following Models and
              Further Reading.
            </li>
          </ul>
        </section>

        {/* 10. Internal Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Internal Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            As a conceptual framework paper rather than an empirical study, RBV&rsquo;s internal
            validity derives from logical coherence, theoretical reasoning, and consistency with
            existing organizational evidence:
          </p>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) is a conceptual / theoretical paper, not an empirical study. Internal
            validity here is assessed as logical coherence of the argument and fidelity to the cited
            prior work:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Consistent analytical mapping:</strong> The paper&rsquo;s central move -
              applying Porter&rsquo;s (1980) five competitive forces at the resource level - is
              carried through systematically: monopoly at the resource level, substitute resources,
              buyer/supplier power over resources, and resource-level entry. The symmetry with
              product-market analysis holds throughout (pp.172-173).
            </li>
            <li>
              <strong>Fidelity to cited sources:</strong> The resource definition is drawn directly
              from Caves (1980, p.172). The experience-curve first-mover argument is drawn from BCG
              (1972). Customer-loyalty first-mover advantages reference Ries &amp; Trout (1981).
              Scale-economy first-mover advantages reference Spence (1979). Each example cites a
              recognized source.
            </li>
            <li>
              <strong>Transparent scope:</strong> The paper explicitly labels itself a &ldquo;first
              cut&rdquo; (p.180) and names gaps (implementability, resource identification, no
              empirical test). It does not over-claim.
            </li>
            <li>
              <strong>Mathematical appendix for sequential entry:</strong> The sequential-entry
              illustration (pp.176-177) is backed by a small formal model of two-period optimal
              entry conditions, providing limited but explicit mathematical grounding for that
              specific pattern.
            </li>
            <li>
              <strong>Intellectual lineage stated:</strong> Penrose (1959), Rubin (1973), Caves
              (1980) are credited as precursors of the resource perspective. The paper does not
              claim originality for the resource concept itself, only for the symmetric analytical
              framework.
            </li>
            <li>
              <strong>Known limitations of internal validity:</strong> Three of the four first-mover
              examples (customer loyalty, production experience, technological leads) are supported
              by citation rather than worked proofs. The resource-product matrix and its dynamic
              strategies are illustrated by one firm-example each and generalized informally.
            </li>
          </ul>
        </section>

        {/* 11. External Validity */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>External Validity</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) presents no empirical tests, so external validity is evaluated in
            terms of how well the framework generalizes when applied in later work:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>No original empirical test:</strong> The paper closes (p.180) by noting that
              the strategies suggested need research on implementability and that identifying
              resources in practice is an open problem. External validity was established by
              subsequent work - notably Rumelt (1991) on firm vs. industry effects - not by
              Wernerfelt 1984 itself.
            </li>
            <li>
              <strong>Worked examples are drawn from 1970s-1980s US/Western firms:</strong> The
              illustrative firms (BIC Pen, razor and lighter markets, General Electric, Texas
              Instruments) and the worked examples of international contacts, production skills, and
              domestic contacts reflect the industrial-economy context of the paper&rsquo;s writing.
              The framework as stated does not address service economies, platform businesses, or
              digital resource types.
            </li>
            <li>
              <strong>Industry scope is mostly manufacturing and diversified conglomerates:</strong>
              The resource-product matrix (Figure 1) and the diversification-by-acquisition analysis
              are most naturally applied to multi-business firms with tradeable physical and human
              resources. Single-business firms and early-stage ventures fit less cleanly.
            </li>
            <li>
              <strong>Dynamic resource management is illustrative, not predictive:</strong>{' '}
              Sequential entry, exploit-and-develop, and stepping stones are shown as possibilities
              on a matrix; the paper offers no predictions about when each pattern dominates. That
              work is taken up by later dynamic-capabilities research (Teece et al., 1997).
            </li>
            <li>
              <strong>No treatment of intangible or knowledge-specific resources:</strong>{' '}
              Wernerfelt names brand names, trade contacts, and in-house technology but does not
              develop a theory of knowledge as a resource. The Knowledge-Based View (Grant, 1996)
              addresses this later.
            </li>
            <li>
              <strong>No treatment of non-profit or public organizations:</strong> The analysis
              assumes profit-seeking firms in competitive markets. Applicability to nonprofits,
              regulated industries, and public-sector organizations is outside the paper&rsquo;s
              scope.
            </li>
            <li>
              <strong>Reception and adoption:</strong> Wernerfelt (1984) is widely cited as a
              foundational paper of RBV alongside Barney (1991). Wide citation reflects theoretical
              generalizability, but the empirical defensibility of specific claims (e.g. that
              resource position barriers translate into sustained returns) depends on follow-on work
              rather than on the 1984 paper itself.
            </li>
          </ul>
        </section>

        {/* 12. Relevance to Technology Adoption */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Relevance to Technology Adoption</h2>
          <p className={PARAGRAPH_CLASSES}>
            RBV explains organizational capability to adopt technology through a resource lens.
            Technology adoption requires organizations possess or develop resources enabling
            adoption: capital for acquisition, technical expertise to implement, organizational
            infrastructure to integrate systems, change management capabilities, and leadership
            commitment. Organizations lacking these resource prerequisites struggle with adoption.
            Conversely, organizations with strong resource bases can more successfully execute
            technology implementations. RBV suggests that competitive advantage in technology
            adoption comes from distinctive resources: superior technical talent, organizational
            culture supporting change, technology infrastructure, and change management
            capabilities. Organizations with these distinctive resources outpace competitors in
            technology adoption, achieving performance benefits from technology investments faster
            than resource-constrained competitors.
          </p>

          <h3 className={H3_CLASSES}>Barriers to Technology Adoption Identified</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Insufficient capital resources:</strong> Technology acquisitions require
              capital investment. Organizations lacking financial resources to fund technology
              purchases and implementation face adoption barriers.
            </li>
            <li>
              <strong>Lack of technical expertise:</strong> Technology implementation requires
              technical skills organizations may lack. Absence of technical talent creates barriers
              to successful deployment and maintenance.
            </li>
            <li>
              <strong>Inadequate organizational infrastructure:</strong> Technology adoption
              requires compatible systems, networks, databases, and operational processes.
              Organizations with outdated or incompatible infrastructure face integration barriers.
            </li>
            <li>
              <strong>Insufficient change management capability:</strong> Technology adoption
              requires change management expertise, project management skills, and organizational
              change competence. Organizations weak in these capabilities struggle with adoption
              transitions.
            </li>
            <li>
              <strong>Weak organizational culture for technology change:</strong> Organizations with
              cultures resistant to change, risk-averse, or low in learning orientation face
              adoption barriers despite technical capability.
            </li>
            <li>
              <strong>Inadequate leadership commitment:</strong> Technology adoption requires
              leadership sponsorship, resource commitment, and visible support. Organizations with
              weak leadership commitment struggle with adoption implementation.
            </li>
            <li>
              <strong>Limited knowledge and learning resources:</strong> Organizations lacking
              training capacity, knowledge management systems, and learning infrastructure struggle
              to transfer technology skills to users.
            </li>
          </ul>

          <h3 className={H3_CLASSES}>Leadership Actions the Framework Prescribes</h3>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Audit adoption resource base:</strong> Systematically assess organizational
              resources relevant to technology adoption: capital availability, technical talent,
              infrastructure capability, change management expertise, and leadership commitment.
            </li>
            <li>
              <strong>Identify resource gaps:</strong> Determine which resources the organization
              lacks or possesses weakly that are required for successful adoption. Gap
              identification guides resource development or acquisition strategies.
            </li>
            <li>
              <strong>Develop distinctive adoption capabilities:</strong> Build or acquire resources
              that create competitive advantage in technology adoption speed and effectiveness.
              Superior change management, technical talent, or organizational learning capability
              create adoption advantage.
            </li>
            <li>
              <strong>Invest in foundational infrastructure:</strong> Build organizational
              infrastructure (networks, systems, integration platforms) that enables multiple future
              technology adoptions rather than single-technology implementations.
            </li>
            <li>
              <strong>Develop human capital:</strong> Invest in technical training, change
              management expertise, and leadership capabilities required for technology adoption
              success.
            </li>
            <li>
              <strong>Build organizational culture:</strong> Develop culture characteristics
              supporting technology adoption: learning orientation, change readiness, risk
              tolerance, and innovation enthusiasm.
            </li>
            <li>
              <strong>Secure sustained leadership commitment:</strong> Ensure leadership provides
              visible sponsorship, allocates adequate resources, and maintains long-term commitment
              to adoption initiatives.
            </li>
            <li>
              <strong>Create path dependency in adoption advantage:</strong> Early successful
              adoptions build experience, relationships, and expertise that create advantages in
              subsequent adoptions, building compounding adoption capability.
            </li>
          </ul>
        </section>

        {/* 13. Following Models or Theories */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Following Models or Theories</h2>
          <p className={PARAGRAPH_CLASSES}>
            Wernerfelt (1984) was followed by a substantial RBV literature that filled in the
            mechanisms the original paper left open. The most important extensions, in rough
            chronological order, are:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>
                Uncertain imitability (
                <a
                  id="cite-ref-lippman-1982-1"
                  href="#ref-lippman-1982"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Lippman &amp; Rumelt, 1982
                </a>
                ):
              </strong>{' '}
              Published two years <em>before</em> Wernerfelt (1984) but developed the
              <em>causal-ambiguity</em> concept independently. Argues that interfirm efficiency
              differences can persist when imitation requires replicating unclear causal chains.
              Often grouped with Wernerfelt (1984) as a joint foundation of RBV, though Wernerfelt
              does not cite it.
            </li>
            <li>
              <strong>
                Asset stock accumulation (
                <a
                  id="cite-ref-dierickx-1989-1"
                  href="#ref-dierickx-1989"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Dierickx &amp; Cool, 1989
                </a>
                ):
              </strong>{' '}
              Introduced <em>time-compression diseconomies</em>, <em>asset-mass efficiencies</em>,
              <em>interconnectedness of asset stocks</em>, <em>asset erosion</em>, and{' '}
              <em>causal ambiguity</em> as specific mechanisms that make resource positions
              defensible. These are the mechanisms often (incorrectly) attributed to Wernerfelt
              1984.
            </li>
            <li>
              <strong>
                VRIN framework (
                <a
                  id="cite-ref-barney-1991-1"
                  href="#ref-barney-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Barney, 1991
                </a>
                ):
              </strong>{' '}
              The canonical formalization of RBV. Barney argues sustained competitive advantage
              requires resources that are <em>valuable</em>, <em>rare</em>, <em>inimitable</em>, and{' '}
              <em>non-substitutable</em>. Barney (1995) later restated this as VRIO (substituting{' '}
              <em>organization</em> for non-substitutability). VRIN/VRIO is Barney, not Wernerfelt;
              the two papers are usually read together but say different things.
            </li>
            <li>
              <strong>
                Cornerstones of competitive advantage (
                <a
                  id="cite-ref-peteraf-1993-1"
                  href="#ref-peteraf-1993"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Peteraf, 1993
                </a>
                ):
              </strong>{' '}
              Integrated the Wernerfelt, Barney, and Dierickx &amp; Cool strands into four
              conditions: <em>heterogeneity</em>, <em>ex post limits to competition</em>,
              <em>imperfect mobility</em>, and <em>ex ante limits to competition</em>. Widely
              adopted as the canonical statement of the RBV logic.
            </li>
            <li>
              <strong>
                Industry vs. firm effects (
                <a
                  id="cite-ref-rumelt-1991-1"
                  href="#ref-rumelt-1991"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Rumelt, 1991
                </a>
                ):
              </strong>{' '}
              Empirical work showing firm-level effects dominate industry effects in explaining
              business-unit profitability variance - providing the empirical backing for the RBV
              proposition that firm-specific resources, not industry structure, drive differential
              performance.
            </li>
            <li>
              <strong>
                Dynamic Capabilities (
                <a
                  id="cite-ref-teece-1997-1"
                  href="#ref-teece-1997"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Teece, Pisano, &amp; Shuen, 1997
                </a>
                ):
              </strong>{' '}
              Extended RBV to dynamic environments by shifting the focus from static resources to
              organizational capabilities for sensing market changes, seizing opportunities, and
              reconfiguring resources. Addresses Wernerfelt&rsquo;s original concern that the
              framework needed a dynamic treatment.
            </li>
            <li>
              <strong>
                Knowledge-Based View (
                <a
                  id="cite-ref-grant-1996-1"
                  href="#ref-grant-1996"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Grant, 1996
                </a>
                ):
              </strong>{' '}
              Specialized RBV by treating knowledge as the strategically dominant resource class,
              emphasizing knowledge creation, integration, and application as sources of competitive
              advantage.
            </li>
            <li>
              <strong>
                Core competencies (
                <a
                  id="cite-ref-hamel-1994-1"
                  href="#ref-hamel-1994"
                  className="text-tabs-teal-deep hover:underline"
                >
                  Hamel &amp; Prahalad, 1994
                </a>
                ):
              </strong>{' '}
              Popularized the view of firms as bundles of core competencies - collective
              organizational learning - that enable entry into multiple markets, extending the
              resource-product matrix logic to a managerial audience.
            </li>
          </ul>
        </section>

        {/* 14. References */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>References</h2>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-wernerfelt-1984">
              Wernerfelt, B. (1984). A resource-based view of the firm.{' '}
              <em>Strategic Management Journal</em>, 5(2), 171-180.
            </li>
            <li id="ref-andrews-1971">
              Andrews, K. (1971). <em>The concept of corporate strategy</em>. Dow Jones-Irwin.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-andrews-1971-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-bcg-1972">
              Boston Consulting Group. (1972). <em>Perspectives on experience</em>. Boston
              Consulting Group.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-bcg-1972-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-caves-1980">
              Caves, R. E. (1980). Industrial organization, corporate strategy and structure.{' '}
              <em>Journal of Economic Literature</em>, 58, 64-92.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-caves-1980-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-henderson-1979">
              Henderson, B. D. (1979). <em>Henderson on corporate strategy</em>. Abt Books.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-henderson-1979-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-panzar-1981">
              Panzar, J. C., &amp; Willig, R. D. (1981). Economies of scope.{' '}
              <em>American Economic Review</em>, 71(2), 268-272.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-panzar-1981-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-penrose-1959">
              Penrose, E. G. (1959). <em>The theory of the growth of the firm</em>. Wiley.
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
            <li id="ref-ries-trout-1981">
              Ries, A., &amp; Trout, J. (1981). <em>Positioning: The battle for your mind</em>.
              McGraw-Hill.
            </li>
            <li id="ref-rubin-1973">
              Rubin, P. H. (1973). The expansion of firms. <em>Journal of Political Economy</em>,
              81, 936-949.
              <span className="text-xs ml-1">
                <a
                  href="#cite-ref-rubin-1973-1"
                  className="text-tabs-teal-deep hover:underline"
                  aria-label="Back to citation 1"
                ></a>
              </span>
            </li>
            <li id="ref-salter-weinhold-1979">
              Salter, M. S., &amp; Weinhold, W. A. (1979). <em>Diversification by acquisition</em>.
              Free Press.
            </li>
            <li id="ref-spence-1979">
              Spence, A. M. (1979). Investment strategy and growth in a new market.{' '}
              <em>Bell Journal of Economics</em>, 10, 1-19.
            </li>
          </ol>
        </section>

        {/* 15. Further Reading */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Further Reading</h2>
          <p className={PARAGRAPH_CLASSES}>
            The following works are <em>not</em> cited by Wernerfelt (1984). They represent the
            later RBV tradition and are listed here for readers tracing the development of the
            framework:
          </p>
          <ol className={REFERENCES_OL_CLASSES}>
            <li id="ref-barney-1991">
              Barney, J. B. (1991). Firm resources and sustained competitive advantage.{' '}
              <em>Journal of Management</em>, 17(1), 99-120.
              https://doi.org/10.1177/014920639101700108
            </li>
            <li id="ref-dierickx-1989">
              Dierickx, I., &amp; Cool, K. (1989). Asset stock accumulation and sustainability of
              competitive advantage. <em>Management Science</em>, 35(12), 1504-1511.
            </li>
            <li id="ref-lippman-1982">
              Lippman, S. A., &amp; Rumelt, R. P. (1982). Uncertain imitability: An analysis of
              interfirm differences in efficiency under competition.{' '}
              <em>Bell Journal of Economics</em>, 13(2), 418-438.
            </li>
            <li id="ref-peteraf-1993">
              Peteraf, M. A. (1993). The cornerstones of competitive advantage: A resource-based
              view. <em>Strategic Management Journal</em>, 14(3), 179-191.
            </li>
            <li id="ref-rumelt-1991">
              Rumelt, R. P. (1991). How much does industry matter?{' '}
              <em>Strategic Management Journal</em>, 12(S1), 167-185.
            </li>
            <li id="ref-teece-1997">
              Teece, D. J., Pisano, G., &amp; Shuen, A. (1997). Dynamic capabilities and strategic
              management. <em>Strategic Management Journal</em>, 18(7), 509-533.
            </li>
            <li id="ref-grant-1996">
              Grant, R. M. (1996). Toward a knowledge-based theory of the firm.{' '}
              <em>Strategic Management Journal</em>, 17(S2), 109-122.
            </li>
            <li id="ref-hamel-1994">
              Hamel, G., &amp; Prahalad, C. K. (1994). <em>Competing for the future</em>. Harvard
              Business School Press.
            </li>
          </ol>
        </section>

        {/* 16. Series Navigation */}
        <section className={SECTION_CLASSES}>
          <h2 className={H2_CLASSES}>Series Navigation</h2>
          <div className="space-y-4">
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                &larr; Previous: Technology Readiness Index 2.0 (Parasuraman &amp; Colby, 2015)
              </Link>
            </p>
            <p className={PARAGRAPH_CLASSES}>
              <Link
                href="/bibliography-2-2-vrio-framework-barney-1991"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Next: VRIO Framework (Barney, 1991) &rarr;
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
