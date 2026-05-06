import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES } from '@/lib/articleStyles'

export const metadata: Metadata = {
  title: 'Product Walkthrough - Making of TABS',
  description:
    'A guided tour of the most impactful URLs across the TABS website, GitHub repository, Prolific recruitment, and Qualtrics deployment. The single defense-day launching point.',
  alternates: {
    canonical: '/making-of-tabs/product-walkthrough',
  },
}

interface TourEntry {
  num: number
  title: string
  url: string
  external?: boolean
  accessNote?: string
  description: string
}

interface TourSection {
  heading: string
  intro?: string
  entries: TourEntry[]
}

const SECTIONS: TourSection[] = [
  {
    heading: '1. Start Here',
    entries: [
      {
        num: 1,
        title: 'Homepage',
        url: 'https://technologyadoptionbarriers.org/',
        description:
          'The front door of the platform. The homepage frames the research problem in one sentence (digital transformation initiatives fail at high rates because the senior leaders who set adoption strategy are rarely surveyed about what blocks them) and points the visitor at the three roles a TABS reader can take: senior leader who wants to take the survey, scholar who wants the data, or practitioner who wants the playbooks. Everything in this walkthrough is reachable in one click from this page.',
      },
    ],
  },
  {
    heading: '2. What Was Studied (Frozen CRP-2026 Results)',
    entries: [
      {
        num: 2,
        title: 'CRP-2026 Findings Landing',
        url: 'https://technologyadoptionbarriers.org/results/crp-2026/',
        description:
          'The frozen N=200 result set used in the dissertation. This page splits the analysis into the three classical parts of empirical research: Instrument Validation (Part A), Descriptive Analysis (Part B), and Advanced Inferential Analysis (Part C), and links to a sub-page for each. The "frozen" label matters: every number on every CRP-2026 page is computed from a single fixed CSV (TABS_V2_CRP_2026_public_dataset.csv) so the Culminating Research Project always cites the same data, regardless of when the page is loaded.',
      },
      {
        num: 3,
        title: 'Top Findings',
        url: 'https://technologyadoptionbarriers.org/results/crp-2026/findings/',
        description:
          'The headline scientific findings: senior leaders rate cost (M=3.46), legacy-system integration (M=3.38), and cybersecurity risk (M=3.26) as the most significant adoption barriers; barriers affect maturity entirely through readiness (full mediation, indirect = -0.30, p < .001); technology leaders perceive substantially higher organizational readiness (Cohen's d = 0.61) and capability maturity (d = 0.40) than non-technology peers, but rate barriers identically. This page is the practical answer to "so what did you find?"',
      },
      {
        num: 4,
        title: 'Top Barriers (the headline result of the dissertation)',
        url: 'https://technologyadoptionbarriers.org/results/crp-2026/top-barriers/',
        description:
          'The barriers-specific drill-down: all 18 content items ranked by Likert mean alongside the Top-3 forced-choice salience picks (B6 Cost 37.5%, B7 Legacy 36.5%, B1 Resistance 28.0%), with the triangulation finding that the Likert and Top-3 measures agree on rank-1 and rank-2 but diverge on rank-3 (severity vs. salience). The page also shows the three-factor decomposition (F1a Strategy and Culture, F1b Resources and Operations, F2 External and Compliance) so a reader can see which barrier each item belongs to. If the dissertation has a single answer to "which barriers actually matter to senior leaders?", this page is it.',
      },
      {
        num: 5,
        title: 'Instrument Validation',
        url: 'https://technologyadoptionbarriers.org/results/crp-2026/validation/',
        description:
          'The psychometric backbone: Cronbach's alphas (0.87, 0.92, 0.88), composite reliability, McDonald's omega, AVE, KMO, Bartlett, HTMT, Fornell-Larcker, and the three-factor barrier resolution (Strategy and Culture, Resources and Operations, External and Compliance). Anyone who needs to verify that the instrument is rigorous starts here. The page is generated from canonical JSON in the repo, so the numbers always match the analysis pipeline.',
      },
      {
        num: 6,
        title: 'Sample Demographics',
        url: 'https://technologyadoptionbarriers.org/results/crp-2026/sample/',
        description:
          'Who actually answered: 200 verified U.S. senior leaders, role-distributed across CIO, COO, CSO, CEO, CMO, CHRO, CTO, CFO, CRO, and CISO categories with full breakdowns by organization size, profit model, decision authority, and industry. The page includes the methodology disclosure for the Tech vs. Non-Tech reclassification (Tech n=53, Non-Tech n=147) and is honest about thin cells (e.g., only 2 CISOs).',
      },
    ],
  },
  {
    heading: '3. The Instrument and the Data',
    entries: [
      {
        num: 7,
        title: 'Concept Mapping (the full item specification matrix)',
        url: 'https://technologyadoptionbarriers.org/concept-mapping/complex/',
        description:
          'The deepest canonical document mapping each of the 57 survey items to its theoretical foundation, anchor citation, scale, expected response, CRP construct, and sub-construct lineage. This is what a methodologist asks for first when reviewing an instrument: every barrier, readiness, and maturity item is traceable back to the literature that motivated it, all the way down to the original DOI. The same matrix is what the analysis pipeline reads to score the survey, so the page also doubles as a machine-readable spec. (Lighter views also available: /concept-mapping/simple for a streamlined 57-row table; /concept-mapping/summary for a section-level overview.)',
      },
      {
        num: 8,
        title: 'Public Dataset (folder view)',
        url: 'https://github.com/clarkemoyer/technologyadoptionbarriers.org/tree/main/public/datasets',
        external: true,
        description:
          'The frozen NIST-de-identified N=200 dataset that produced every number in the dissertation, presented as a browsable GitHub folder so readers can see the file alongside its filename, size, and last-update timestamp before deciding to download. The single file inside, TABS_V2_CRP_2026_public_dataset.csv, is the open-data commitment in concrete form: any reader can replicate the analysis end-to-end without contacting the author. Direct CSV download is also available at /datasets/TABS_V2_CRP_2026_public_dataset.csv for readers who want to skip the folder view.',
      },
    ],
  },
  {
    heading: '4. The Platform (the Product)',
    entries: [
      {
        num: 9,
        title: 'Making of TABS',
        url: 'https://technologyadoptionbarriers.org/making-of-tabs/',
        description:
          'The "how it was built" hub: the development workflow, automation infrastructure, integrations, AI-assisted-development discipline, accessibility commitments, and SEO strategy that together turn the survey into a living research platform. The TABS dissertation is product-development scholarship, and this is where the product itself is documented.',
      },
      {
        num: 10,
        title: 'Open Source and Apache 2.0',
        url: 'https://technologyadoptionbarriers.org/making-of-tabs/open-source',
        description:
          'The legal and community-health foundation: Apache 2.0 license (selected over MIT or GPL for explicit patent protection in an academic-research context), all GitHub community health files (CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, CITATION.cff, FUNDING, CODEOWNERS), and the contribution policy. Anyone considering reusing TABS in their own research starts here to understand what they can and cannot do.',
      },
      {
        num: 11,
        title: 'Reproducible Analysis',
        url: 'https://technologyadoptionbarriers.org/making-of-tabs/reproducible-analysis',
        description:
          'The data flow from raw Qualtrics submission to NIST-de-identified public dataset, including the disposition pipeline (recruitment to completion to IRI screening to quality scoring to frozen sample), the 7-script Python analysis pipeline that computes every statistic, and the 165-check validation registry (84 CRP claims + 81 deck claims) that confirms numbers match between the website, the dissertation, and the live data. This page is what makes the FAIR-data commitment concrete.',
      },
    ],
  },
  {
    heading: '5. GitHub (the Source of Truth)',
    entries: [
      {
        num: 12,
        title: 'GitHub Repository Root',
        url: 'https://github.com/clarkemoyer/technologyadoptionbarriers.org',
        external: true,
        description:
          'Every line of code, every workflow, every commit, every issue, every release. Visitors can browse the analysis scripts at /scripts/analysis, the CI/CD workflows at /.github/workflows, the public dataset at /public/datasets/, and the version history at /releases. The repository is the single source of truth that the website, the CRP, and the defense materials all derive from.',
      },
    ],
  },
  {
    heading: '6. Recruitment and Live Data Collection',
    entries: [
      {
        num: 13,
        title: 'Prolific Study (recruitment infrastructure)',
        url: 'https://app.prolific.com/researcher/workspaces/studies/69c17630acada6abeead2da5/submissions',
        external: true,
        accessNote:
          'Researcher-access only; the full study record including approve/reject/awaiting-review queues is visible to logged-in collaborators.',
        description:
          'The platform that recruited the 200 senior leaders in the frozen sample and continues recruiting toward the N=500 longitudinal target. Prolific provides verified panel demographics (role, country, employment status), eligibility screening (manager-or-above, full-time, U.S.-based), and the integrity-of-response infrastructure that supports the IRI attention checks and reCAPTCHA scoring referenced in the data-quality pipeline. The submissions queue at this URL is the live admin view of every accepted, rejected, and awaiting-review respondent; the same study is referenced by ID 69c17630acada6abeead2da5 in the disposition-summary JSON that drives the public live-results dashboards.',
      },
      {
        num: 14,
        title: 'Qualtrics Deployment (the survey itself)',
        url: 'https://smeal.yul1.qualtrics.com/responses/#/surveys/SV_bkMopd73A8fzfwO',
        external: true,
        accessNote:
          'Researcher-access only; the public take-the-survey path is /survey/, which redirects to the live Qualtrics anonymous link.',
        description:
          'The deployed instrument that participants actually take. The Qualtrics survey enforces the question order (Section A demographics to Section B Barriers to Section C Readiness to Section D Maturity to Section E Feedback), randomizes items within each construct, embeds the three IRI attention checks, and captures the timing data that powers the duration-based quality screen. Survey ID SV_bkMopd73A8fzfwO on the Penn State Smeal Qualtrics tenant; the responses dashboard at this URL is the live admin view of every submission, completion-rate metric, and timing distribution. The canonical QSF definition (the version-controlled, branch-by-branch survey logic) lives in the repository for reviewers who want to inspect every skip rule, randomization block, and validation constraint.',
      },
    ],
  },
  {
    heading: '7. Scholarly Context (For Reviewers)',
    entries: [
      {
        num: 15,
        title: 'Scholarly Blog Series',
        url: 'https://technologyadoptionbarriers.org/technology-adoption-series',
        description:
          'Eighteen long-form articles in two branches (User's Journey: foundational acceptance theory; Organization's Playbook: organizational adoption frameworks) that walk a reader from TRA/TPB in 1975 through TAM, UTAUT, and modern AI-adoption frameworks. The blog grounds every TABS construct in the literature it inherits from: a practitioner can read it as a trade-press primer; a scholar can read it as a literature review with full citations.',
      },
      {
        num: 16,
        title: 'Full Mind Map (the conceptual landscape)',
        url: 'https://technologyadoptionbarriers.org/making-of-tabs/mind-maps/full-mind-map/',
        description:
          'The single visualization that links every theoretical model, every TABS construct, every validation result, and every operational moving part of the platform on one navigable canvas. Branches cover the foundational adoption literature (TRA/TPB, TAM/TAM2/TAM3, UTAUT/UTAUT2, DOI, TRI/TRI 2.0), the organizational frameworks (TOE, CMM/CMMI, IT-CMF, RBV, dynamic capabilities), the TABS instrument structure, the project operations, and the dissertation chapters: each node hyperlinked to the page or article that goes deeper. Where the scholarly blog series tells the story in long form and the bibliography pages give the citation-by-citation detail, the mind map is how a reader sees the whole project at once. It is also the most efficient onboarding URL for a new collaborator or a curious peer reviewer.',
      },
    ],
  },
]

const ProductWalkthroughPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Product Walkthrough</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-4 text-lg">
            <strong>A guided tour of what was built, what was found, and how it stays alive.</strong>
          </p>
          <p className="mb-6">
            Sixteen URLs across the website, the GitHub repository, the Prolific recruitment platform,
            and the Qualtrics deployment, with one paragraph each. The committee, future scholars, peer
            reviewers, and practitioners all need a single entry point that answers{' '}
            <em>where can I see the work?</em> This page collapses those into one navigable index,
            ordered as a narrative arc rather than a sitemap. Researcher-only URLs are clearly marked.
          </p>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.heading} className="mb-12 text-gray-800">
            <h2 className={H2_CLASSES}>{section.heading}</h2>
            {section.intro && <p className="mb-6">{section.intro}</p>}

            <div className="space-y-6">
              {section.entries.map((entry) => (
                <div
                  key={entry.num}
                  className="border-l-4 border-blue-200 pl-4 py-2 bg-gray-50 rounded-r"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {entry.num}. {entry.title}
                  </h3>
                  <p className="mb-2 break-all">
                    <a
                      href={entry.url}
                      target={entry.external ? '_blank' : undefined}
                      rel={entry.external ? 'noopener noreferrer' : undefined}
                      className="text-blue-600 underline hover:text-blue-800 font-mono text-sm"
                    >
                      {entry.url}
                    </a>
                  </p>
                  {entry.accessNote && (
                    <p className="mb-2 text-sm italic text-amber-700">{entry.accessNote}</p>
                  )}
                  <p>{entry.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Closing the Loop</h2>
          <p className="mb-6">
            The deliverable is <em>not</em> a static dissertation; it is a research platform. The
            dissertation explains what was studied. The website displays what was found. The GitHub
            repository proves how it was built. Prolific and Qualtrics keep new data flowing.
            Together, these sixteen URLs are the answer to{' '}
            <em>where can I see the work?</em> and any one of them can be opened, audited, and reused
            without contacting the author.
          </p>
          <p className="text-sm text-gray-600">
            Related: see{' '}
            <Link
              href="/making-of-tabs/open-source"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Open Source &amp; Community
            </Link>{' '}
            for the licensing and contribution context, and{' '}
            <Link
              href="/making-of-tabs/reproducible-analysis"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Reproducible Analysis
            </Link>{' '}
            for the data-flow and validation pipeline.
          </p>
        </section>
      </article>
    </div>
  )
}

export default ProductWalkthroughPage
