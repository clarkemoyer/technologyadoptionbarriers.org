import Link from 'next/link'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  SECTION_CLASSES,
  PARAGRAPH_CLASSES,
} from '@/lib/articleStyles'
import LastUpdated from '@/components/last-updated'
import { DATA_UNAVAILABLE } from '@/lib/sentinelMarker'

interface OtherRolesData {
  total: number
  categories: Record<string, number | string>
}

interface RoleCategoryInfo {
  label: string
  description: string
  examples: string
}

interface DemographicsData {
  roles?: Record<string, number>
  org_sizes?: Record<string, number>
  profit_models?: Record<string, number>
  tech_vs_nontech?: { technical: number; non_technical: number; other: number }
  other_roles?: OtherRolesData
}

interface SampleDetail {
  demographics?: DemographicsData
}

type Sample = {
  key: string
  label: string
  description?: string
  n: number | null
}

export type SampleData = {
  samples: Sample[]
  sample_details?: Record<string, SampleDetail>
  role_categories?: RoleCategoryInfo[]
  last_updated?: string
}

export type SampleVariant = 'live' | 'crp'

type GroupConfig = { key: string; label: string; color: string }

interface SampleContentProps {
  variant: SampleVariant
  data: SampleData
}

const pct = (count: number, total: number | null | undefined): string =>
  total && total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '-'

const PRIMARY_GROUPS_LIVE: GroupConfig[] = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
  { key: 'v2_finished', label: 'All V2 Finished', color: 'border-gray-400' },
]

const PRIMARY_GROUPS_CRP: GroupConfig[] = [
  { key: 'conservative_clean', label: 'Conservative Clean', color: 'border-green-500' },
  { key: 'flexible_clean', label: 'Flexible Clean', color: 'border-blue-500' },
  { key: 'prolific_accepted', label: 'Prolific Accepted', color: 'border-amber-500' },
]

type RelatedLink = { href: string; label: string; description: string }

type VariantConfig = {
  title: string
  metaPublished?: { wrapperClass: string; badgeClass: string; label: string }
  groups: GroupConfig[]
  groupCountWord: string
  techLabel: string
  /** When true, render the role-classification methodology `<details>`
   *  block. Originally introduced for CRP-2026 per issue #1858 and
   *  mirrored to the live track per issue #1865 — both variants now
   *  render the same disclosure so the classification logic is auditable
   *  on every results page. */
  showRoleClassificationDetails: boolean
  findingsHref: string
  missingDataFilename: string
  relatedLinks: RelatedLink[]
  backLink: { href: string; label: string }
}

const VARIANT_CONFIG: Record<SampleVariant, VariantConfig> = {
  live: {
    title: 'Sample & Demographics',
    groups: PRIMARY_GROUPS_LIVE,
    groupCountWord: 'four',
    techLabel: 'Technical (CIO, CTO, CISO + reclassified Other)',
    showRoleClassificationDetails: true,
    findingsHref: '/results/findings',
    missingDataFilename: 'sensitivity-analysis.json',
    relatedLinks: [
      {
        href: '/results/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations for each result group',
      },
      {
        href: '/results/findings',
        label: 'Key Findings',
        description: 'effect sizes and cross-tabulations per result group',
      },
      {
        href: '/results/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how responses are validated and samples defined',
      },
    ],
    backLink: { href: '/results', label: '← Back to Results Overview' },
  },
  crp: {
    title: 'CRP 2026: Sample & Demographics',
    metaPublished: {
      wrapperClass: 'mb-6',
      badgeClass:
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200',
      label: 'Published: April 2026',
    },
    groups: PRIMARY_GROUPS_CRP,
    groupCountWord: 'three',
    techLabel: 'Technical (CIO, CTO, CISO + reclassified Other)',
    showRoleClassificationDetails: true,
    findingsHref: '/results/crp-2026/findings',
    missingDataFilename: 'crp-sensitivity-analysis.json',
    relatedLinks: [
      {
        href: '/results/crp-2026/descriptive',
        label: 'Descriptive Statistics',
        description: 'means, SDs, and correlations for each result group',
      },
      {
        href: '/results/crp-2026/findings',
        label: 'Key Findings',
        description: 'effect sizes and cross-tabulations per result group',
      },
      {
        href: '/results/crp-2026/data-quality',
        label: 'Data Quality Pipeline',
        description: 'how responses are validated and samples defined',
      },
    ],
    backLink: { href: '/results/crp-2026', label: '← Back to CRP 2026 Overview' },
  },
}

/**
 * Renders the Sample & Demographics results page for either the live
 * or CRP-2026 dataset, sharing all layout and computation between them.
 * Variant-specific differences (title, date treatment, sample filtering,
 * tech-bucket label, role-classification methodology block,
 * related links) live in `VARIANT_CONFIG`.
 *
 * The role-classification `<details>` block is currently rendered only
 * for the CRP variant. Mirroring it to the live variant is tracked as
 * a separate task (issue #1865 — Tech/Non-Tech transparency parity).
 */
export const SampleContent = ({ variant, data }: SampleContentProps) => {
  const config = VARIANT_CONFIG[variant]
  const sampleDetails: Record<string, SampleDetail> = data.sample_details ?? {}
  const sampleLookup = new Map(data.samples.map((s) => [s.key, s]))
  const roleCategories: RoleCategoryInfo[] = Array.isArray(data.role_categories)
    ? data.role_categories
    : []

  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>{config.title}</h1>

        {variant === 'crp' && config.metaPublished ? (
          <div className={config.metaPublished.wrapperClass}>
            <span className={config.metaPublished.badgeClass}>{config.metaPublished.label}</span>
          </div>
        ) : (
          <LastUpdated utcTimestamp={data.last_updated} />
        )}

        <section className={SECTION_CLASSES}>
          <p className={PARAGRAPH_CLASSES}>
            Demographics are computed independently for each of the {config.groupCountWord} primary
            result groups. This allows researchers to verify that the composition of their chosen
            dataset matches their generalizability requirements. All statistics on this page are
            generated by the daily analysis pipeline.
          </p>
        </section>

        <DemographicDataSourcesSection />
        <PrescreeningCriteriaSection />
        <SampleSizeSummarySection groups={config.groups} sampleLookup={sampleLookup} />

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Survey Demographics by Result Group (Qualtrics)</h2>
          <p className={PARAGRAPH_CLASSES}>
            Each result group below shows its organizational and role-based composition as
            self-reported by participants in the TABS survey (questions Q1-Q9). This allows
            assessment of whether data cleaning differentially affects sample composition across
            executive roles, organization sizes, and sector types.
          </p>

          {config.groups.map((group) => {
            const sample = sampleLookup.get(group.key)
            const details = sampleDetails[group.key]
            const demo = details?.demographics
            const hasDemoData =
              demo && Object.values(demo.roles ?? {}).some((v) => (v as number) > 0)

            return (
              <div
                key={group.key}
                className={`border-l-4 ${group.color} bg-gray-50 rounded-lg p-5 mb-6`}
              >
                <h3 className={H3_CLASSES}>
                  {group.label} (N={sample?.n ?? '-'})
                </h3>

                {demo && hasDemoData ? (
                  <PerGroupDemographics demo={demo} sample={sample} config={config} />
                ) : (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    {DATA_UNAVAILABLE} Demographics data missing from {config.missingDataFilename}.
                    Check the daily pipeline workflow.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <OtherRoleClassificationSection roleCategories={roleCategories} />

        <section className="mb-12 text-gray-800">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              <strong>Privacy Note:</strong> Survey demographics (shown above) are aggregated from
              self-reported Qualtrics responses (Q1-Q9) and displayed as category-level counts and
              percentages only. Prolific platform demographics (base fields: age, sex, ethnicity,
              etc.; prescreener fields: industry, company size, occupation, etc.) are collected
              separately and are used for cross-validation and sample balancing but are not
              displayed on this page to protect participant privacy. No individual-level data is
              displayed from either source.
            </p>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {config.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-blue-600 hover:underline">
                  {link.label}
                </Link>{' '}
                - {link.description}
              </li>
            ))}
            <li>
              <Link href={config.backLink.href} className="text-blue-600 hover:underline">
                {config.backLink.label}
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}

interface PerGroupDemographicsProps {
  demo: DemographicsData
  sample: Sample | undefined
  config: VariantConfig
}

const PerGroupDemographics = ({ demo, sample, config }: PerGroupDemographicsProps) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
      <DemoCountTable title="Roles" entries={demo.roles ?? {}} sampleN={sample?.n} />
      <DemoCountTable
        title="Organization Size"
        entries={demo.org_sizes ?? {}}
        sampleN={sample?.n}
      />
      <DemoCountTable title="Profit Model" entries={demo.profit_models ?? {}} sampleN={sample?.n} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {demo.tech_vs_nontech && (
        <TechBucketTable
          breakdown={demo.tech_vs_nontech}
          sampleN={sample?.n}
          techLabel={config.techLabel}
          findingsHref={config.findingsHref}
          showMethodologyDetails={config.showRoleClassificationDetails}
        />
      )}

      {demo.other_roles &&
        demo.other_roles.total > 0 &&
        Object.keys(demo.other_roles.categories).length > 0 && (
          <OtherRolesTable otherRoles={demo.other_roles} />
        )}
    </div>
  </>
)

const DemoCountTable = ({
  title,
  entries,
  sampleN,
}: {
  title: string
  entries: Record<string, number>
  sampleN: number | null | undefined
}) => (
  <div>
    <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">{title}</h4>
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Category
          </th>
          <th scope="col" className="sr-only">
            Count
          </th>
          <th scope="col" className="sr-only">
            Percent
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(entries).map(([k, count]) => (
          <tr key={k} className="border-b border-gray-200">
            <th scope="row" className="py-1 pr-2 font-medium text-left">
              {k}
            </th>
            <td className="py-1 text-right font-mono">{count}</td>
            <td className="py-1 pl-1 text-right text-gray-500">{pct(count, sampleN)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

interface TechBucketTableProps {
  breakdown: { technical: number; non_technical: number; other: number }
  sampleN: number | null | undefined
  techLabel: string
  findingsHref: string
  showMethodologyDetails: boolean
}

const TechBucketTable = ({
  breakdown,
  sampleN,
  techLabel,
  findingsHref,
  showMethodologyDetails,
}: TechBucketTableProps) => {
  // When `other === 0` every self-reported "Other" response was reclassified
  // into Technical or Non-Technical by the pipeline, so the Non-Technical
  // bucket contains more than just the named C-suite roles.
  const nonTechLabel =
    breakdown.other === 0
      ? 'Non-Technical (CEO, CFO, COO, CHRO, CMO, CSO, CRO + reclassified Other)'
      : 'Non-Technical (CEO, CFO, COO, CHRO, CMO, CSO, CRO)'
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
        Technical vs. Non-Technical Breakdown
      </h4>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              Role Group
            </th>
            <th scope="col" className="sr-only">
              Count
            </th>
            <th scope="col" className="sr-only">
              Percent
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <th scope="row" className="py-1.5 pr-2 font-medium text-left">
              <span
                className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5"
                aria-hidden="true"
              />
              {techLabel}
            </th>
            <td className="py-1.5 text-right font-mono">{breakdown.technical}</td>
            <td className="py-1.5 pl-1 text-right text-gray-500">
              {pct(breakdown.technical, sampleN)}
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <th scope="row" className="py-1.5 pr-2 font-medium text-left">
              <span
                className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"
                aria-hidden="true"
              />
              {nonTechLabel}
            </th>
            <td className="py-1.5 text-right font-mono">{breakdown.non_technical}</td>
            <td className="py-1.5 pl-1 text-right text-gray-500">
              {pct(breakdown.non_technical, sampleN)}
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <th scope="row" className="py-1.5 pr-2 font-medium text-left">
              <span
                className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"
                aria-hidden="true"
              />
              Other (self-reported)
            </th>
            <td className="py-1.5 text-right font-mono">{breakdown.other}</td>
            <td className="py-1.5 pl-1 text-right text-gray-500">
              {pct(breakdown.other, sampleN)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 mt-2 italic">
        Grouping used for ANOVA and effect-size comparisons on the{' '}
        <Link href={findingsHref} className="text-blue-500 hover:underline">
          Findings
        </Link>{' '}
        page.
      </p>
      {showMethodologyDetails && <RoleClassificationMethodology />}
    </div>
  )
}

const RoleClassificationMethodology = () => (
  <details className="mt-3 text-[11px] text-gray-600">
    <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-600">
      How is this classification computed? (open for details)
    </summary>
    <div className="mt-2 pl-3 border-l-2 border-blue-200 space-y-1.5">
      <p>
        <span className="font-semibold">Technical bucket</span> = the three IT-leadership C-suite
        titles <span className="font-mono">CIO + CTO + CISO</span> (named role count), plus any{' '}
        <em>Other (please specify)</em> free-text response that matches a technical-role regex
        (e.g., <span className="font-mono">director of IT</span>,{' '}
        <span className="font-mono">VP of engineering</span>,{' '}
        <span className="font-mono">software architect</span>,{' '}
        <span className="font-mono">cybersecurity</span>).
      </p>
      <p>
        <span className="font-semibold">Non-Technical bucket</span> = the seven non-IT C-suite
        titles <span className="font-mono">CEO + CFO + COO + CHRO + CMO + CSO + CRO</span>, plus any{' '}
        <em>Other</em> free-text matching a non-technical regex (e.g.,{' '}
        <span className="font-mono">president</span>, <span className="font-mono">founder</span>,{' '}
        <span className="font-mono">finance manager</span>), plus unmatched <em>Other</em> responses
        (conservative default: assigned to Non-Technical when no clear technology signal is
        present).
      </p>
      <p>
        Source: <span className="font-mono">classify_role_binary()</span> in{' '}
        <Link
          href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/scripts/analysis/tabs_v2_unified_data_analysis.py"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          scripts/analysis/tabs_v2_unified_data_analysis.py
        </Link>{' '}
        (TECH_TITLES, NONTECH_TITLES, _OTHER_ROLE_PATTERNS). The <em>Other Role Categories</em>{' '}
        table uses <span className="font-mono">categorize_other_role()</span> /{' '}
        <span className="font-mono">OTHER_ROLE_CATEGORIES_PATTERNS</span>; counts shown as
        &ldquo;&lt;5&rdquo; are k-anonymity suppressed.
      </p>
    </div>
  </details>
)

const OtherRolesTable = ({ otherRoles }: { otherRoles: OtherRolesData }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
      &ldquo;Other&rdquo; Role Categories (n={otherRoles.total})
    </h4>
    <p className="text-[10px] text-gray-500 mb-2">
      Free-text responses categorized by keyword matching. Individual responses are not displayed to
      protect participant privacy.
    </p>
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Category
          </th>
          <th scope="col" className="sr-only">
            Count
          </th>
          <th scope="col" className="sr-only">
            Percent
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(otherRoles.categories).map(([category, count]) => (
          <tr key={category} className="border-b border-gray-200">
            <th scope="row" className="py-1 pr-2 font-medium text-left">
              {category}
            </th>
            <td className="py-1 text-right font-mono">{count}</td>
            <td className="py-1 pl-1 text-right text-gray-500">
              {typeof count === 'number' ? pct(count, otherRoles.total) : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const SampleSizeSummarySection = ({
  groups,
  sampleLookup,
}: {
  groups: GroupConfig[]
  sampleLookup: Map<string, Sample>
}) => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>Sample Size Summary</h2>
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              #
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Result Group
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Description
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-right font-bold">
              N
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, i) => {
            const sample = sampleLookup.get(group.key)
            return (
              <tr
                key={group.key}
                className={`border-l-4 ${group.color} ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
              >
                <td className="border border-gray-300 px-4 py-2 font-bold text-gray-500">
                  {i + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">{group.label}</td>
                <td className="border border-gray-300 px-4 py-2">{sample?.description ?? ''}</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-mono font-bold">
                  {sample?.n ?? '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </section>
)

const OtherRoleClassificationSection = ({
  roleCategories,
}: {
  roleCategories: RoleCategoryInfo[]
}) => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>Understanding &ldquo;Other&rdquo; Roles</h2>
    <p className={PARAGRAPH_CLASSES}>
      Participants who selected &ldquo;Other (please specify)&rdquo; for their executive role (Q1)
      provided a free-text description. The analysis pipeline categorizes these responses into broad
      groups using keyword matching to provide insight into the composition of the
      &ldquo;Other&rdquo; category without exposing individual responses.
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Category
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Description
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Example Patterns
            </th>
          </tr>
        </thead>
        <tbody>
          {roleCategories.length > 0 ? (
            roleCategories.map((cat, i) => (
              <tr key={cat.label} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <th
                  scope="row"
                  className="border border-gray-300 px-4 py-2 font-semibold text-left"
                >
                  {cat.label}
                </th>
                <td className="border border-gray-300 px-4 py-2">{cat.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">
                  {cat.examples || '—'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="border border-gray-300 px-4 py-4 text-sm text-gray-600">
                Role-category methodology details are not available in the current dataset.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <p className="text-sm text-amber-900">
        <strong>Note:</strong> These categories are computed automatically by the daily analysis
        pipeline using keyword matching on free-text responses. A single response is assigned to the
        first matching category. &ldquo;C-Suite Adjacent&rdquo; and &ldquo;VP / SVP&rdquo;
        respondents may represent roles functionally equivalent to the named C-suite titles but with
        different organizational naming conventions. Researchers may wish to consider reclassifying
        these into the Technical or Non-Technical grouping for sensitivity analyses.
      </p>
    </div>
  </section>
)

const DemographicDataSourcesSection = () => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>Demographic Data Sources</h2>
    <p className={PARAGRAPH_CLASSES}>
      Participant demographics are collected from two independent sources. These capture different
      types of information and should not be conflated:
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-teal-900 uppercase mb-2">
          Survey Demographics (Qualtrics)
        </h3>
        <p className="text-sm text-teal-800 mb-3">
          Self-reported by participants within the TABS survey instrument itself (questions Q1-Q9).
          These are <strong>role-specific, organizational</strong> demographics directly relevant to
          the research questions.
        </p>
        <ul className="text-xs text-teal-700 space-y-1 list-disc list-inside">
          <li>Executive Role (Q1) - CIO, CTO, CEO, CFO, etc.</li>
          <li>Decision Authority (Q2)</li>
          <li>Industry (Q3)</li>
          <li>Organization Size (Q4) - &lt;100 to 10,000+</li>
          <li>Profit Model (Q5) - For-Profit, Non-Profit, Government</li>
          <li>Revenue/Budget (Q6-Q7)</li>
          <li>Geographic Scope &amp; Scale (Q8-Q9)</li>
        </ul>
        <p className="text-xs text-teal-600 mt-3 italic">
          Source: Qualtrics CSV export &rarr;{' '}
          <code className="bg-teal-100 px-1 rounded">tabs_v2_analysis.py</code>
        </p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-purple-900 uppercase mb-2">
          Platform Demographics (Prolific)
        </h3>
        <p className="text-sm text-purple-800 mb-3">
          Collected from Prolific&rsquo;s participant profile database at submission completion.
          Includes <strong>base demographic fields</strong> (always exported) and{' '}
          <strong>prescreener fields</strong> (up to 15 selectable per export from Prolific&rsquo;s
          full filter catalog).
        </p>
        <h4 className="text-xs font-bold text-purple-800 mt-2 mb-1">
          Base Fields (always included)
        </h4>
        <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
          <li>Age</li>
          <li>Sex (as recorded on legal documents)</li>
          <li>Ethnicity (simplified)</li>
          <li>First Language</li>
          <li>Country of Residence &amp; Nationality</li>
          <li>Country of Birth</li>
          <li>Student Status</li>
          <li>Employment Status</li>
        </ul>
        <h4 className="text-xs font-bold text-purple-800 mt-3 mb-1">
          Prescreener Fields (configurable, up to 15 per export)
        </h4>
        <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
          <li>Employment Sector (Private, Public, Non-profit)</li>
          <li>Industry classification</li>
          <li>Company/Organization Size</li>
          <li>Occupation/Job Title category</li>
          <li>Education Level</li>
          <li>Household Income</li>
          <li>Fluent Languages</li>
          <li>Marital Status &amp; Number of Children</li>
          <li>Health Conditions &amp; Disabilities</li>
          <li>
            <em>…and hundreds more via</em>{' '}
            <code className="bg-purple-100 px-1 rounded">GET /api/v1/filters/</code>
          </li>
        </ul>
        <p className="text-xs text-purple-600 mt-3 italic">
          Source: Prolific API{' '}
          <code className="bg-purple-100 px-1 rounded">
            POST /studies/&#123;id&#125;/demographic-export/
          </code>{' '}
          - snapshot at time of participation
        </p>
      </div>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <p className="text-sm text-amber-900">
        <strong>Important:</strong> The demographics shown below in the per-group breakdowns are{' '}
        <strong>Survey Demographics (Qualtrics)</strong> - the organizational and role-based
        characteristics that participants self-reported in the TABS instrument. Prolific Platform
        Demographics are available separately via the Prolific demographic export and are not
        displayed on this page to protect participant privacy.
      </p>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-bold text-indigo-900 mb-2">
        Cross-Validation: Prolific &times; Qualtrics Demographic Overlap
      </h3>
      <p className="text-sm text-indigo-800 mb-3">
        Several Prolific prescreener fields overlap with Qualtrics survey demographics, enabling
        independent cross-validation of self-reported data. Researchers can compare responses to
        flag discrepancies (e.g., a participant reporting &ldquo;CIO at a 10,000+ company&rdquo; in
        Qualtrics but &ldquo;Student&rdquo; or &ldquo;Company Size: 1-10&rdquo; in Prolific).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-indigo-100">
              <th scope="col" className="border border-indigo-200 px-3 py-1.5 text-left font-bold">
                Dimension
              </th>
              <th scope="col" className="border border-indigo-200 px-3 py-1.5 text-left font-bold">
                Prolific Field (Platform)
              </th>
              <th scope="col" className="border border-indigo-200 px-3 py-1.5 text-left font-bold">
                Qualtrics Field (Survey)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                scope="row"
                className="border border-indigo-200 px-3 py-1.5 font-medium text-left"
              >
                Industry
              </th>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-purple-100 px-1 rounded">industry</code>
              </td>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-teal-100 px-1 rounded">Q3_Industry</code>
              </td>
            </tr>
            <tr className="bg-indigo-50/50">
              <th
                scope="row"
                className="border border-indigo-200 px-3 py-1.5 font-medium text-left"
              >
                Organization Size
              </th>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-purple-100 px-1 rounded">company_size</code>
              </td>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-teal-100 px-1 rounded">Q4_OrgSize</code>
              </td>
            </tr>
            <tr>
              <th
                scope="row"
                className="border border-indigo-200 px-3 py-1.5 font-medium text-left"
              >
                Sector
              </th>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-purple-100 px-1 rounded">employment_sector</code>
              </td>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-teal-100 px-1 rounded">Q5_ProfitModel</code>
              </td>
            </tr>
            <tr className="bg-indigo-50/50">
              <th
                scope="row"
                className="border border-indigo-200 px-3 py-1.5 font-medium text-left"
              >
                Role
              </th>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-purple-100 px-1 rounded">occupation</code>
              </td>
              <td className="border border-indigo-200 px-3 py-1.5">
                <code className="text-xs bg-teal-100 px-1 rounded">Q1_Role</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-indigo-600 mt-2 italic">
        Join key: Prolific Participant ID (PID). Prescreener fields are available when configured as
        study filters in the Prolific study setup.
      </p>
      <div className="mt-3 pt-3 border-t border-indigo-200">
        <h4 className="text-xs font-bold text-indigo-800 mb-1">
          Prolific-Only Fields (augment survey data)
        </h4>
        <p className="text-xs text-indigo-700">
          Prolific also provides demographic dimensions not captured by the TABS survey instrument,
          including: <strong>Education Level</strong>, <strong>Household Income</strong>,{' '}
          <strong>Fluent Languages</strong>, <strong>Marital Status</strong>,{' '}
          <strong>Health Conditions</strong>, and more. These can be used to augment aggregate
          demographic reports and assess sample representativeness beyond what the survey captures.
        </p>
      </div>
    </div>
  </section>
)

const PrescreeningCriteriaSection = () => (
  <section className="mb-12 text-gray-800">
    <h2 className={H2_CLASSES}>Prolific Study Prescreening Criteria</h2>
    <p className={PARAGRAPH_CLASSES}>
      The following eligibility screeners are configured on the live Prolific study. All
      participants must match <strong>every</strong> criterion below to be eligible for recruitment.
      These prescreener responses are also exported for demographic enrichment and cross-validation
      against Qualtrics survey responses.
    </p>
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Screener
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Criterion
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Eligible Values
            </th>
            <th scope="col" className="border border-gray-300 px-4 py-2 text-left font-bold">
              Qualtrics Cross-Ref
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="border border-gray-300 px-4 py-2 font-semibold text-left">
              Current Country of Residence
            </th>
            <td className="border border-gray-300 px-4 py-2">is any of</td>
            <td className="border border-gray-300 px-4 py-2">United States</td>
            <td className="border border-gray-300 px-4 py-2 text-gray-400 italic">
              Q8-Q9 (Geography)
            </td>
          </tr>
          <tr className="bg-gray-50">
            <th scope="row" className="border border-gray-300 px-4 py-2 font-semibold text-left">
              Employment Status
            </th>
            <td className="border border-gray-300 px-4 py-2">is any of</td>
            <td className="border border-gray-300 px-4 py-2">Full-Time</td>
            <td className="border border-gray-300 px-4 py-2 text-gray-400 italic">-</td>
          </tr>
          <tr>
            <th scope="row" className="border border-gray-300 px-4 py-2 font-semibold text-left">
              Employer Type
            </th>
            <td className="border border-gray-300 px-4 py-2">is any of</td>
            <td className="border border-gray-300 px-4 py-2">
              <ul className="list-disc list-inside text-xs space-y-0.5">
                <li>Employee of a for-profit company or business</li>
                <li>Employee of a not-for-profit, tax-exempt, or charitable organization</li>
                <li>Local government employee</li>
                <li>State government employee</li>
                <li>Federal government employee</li>
                <li>Self-employed (not-incorporated)</li>
                <li>Self-employed (incorporated)</li>
                <li>Working without pay in family business or farm</li>
              </ul>
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <code className="text-xs bg-teal-100 px-1 rounded">Q5_ProfitModel</code>
            </td>
          </tr>
          <tr className="bg-gray-50">
            <th scope="row" className="border border-gray-300 px-4 py-2 font-semibold text-left">
              Company Size
            </th>
            <td className="border border-gray-300 px-4 py-2">is any of</td>
            <td className="border border-gray-300 px-4 py-2">50-249, 250-999, 1000+</td>
            <td className="border border-gray-300 px-4 py-2">
              <code className="text-xs bg-teal-100 px-1 rounded">Q4_OrgSize</code>
            </td>
          </tr>
          <tr>
            <th scope="row" className="border border-gray-300 px-4 py-2 font-semibold text-left">
              Job Position
            </th>
            <td className="border border-gray-300 px-4 py-2">is any of</td>
            <td className="border border-gray-300 px-4 py-2">
              <ul className="list-disc list-inside text-xs space-y-0.5">
                <li>C-Level (e.g. CEO, CFO), Owner, Partner, President</li>
                <li>Vice President (EVP, SVP, AVP, VP)</li>
                <li>Director (Group Director, Sr. Director, Director)</li>
                <li>Manager (Group Manager, Sr. Manager, Manager, Program Manager)</li>
              </ul>
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <code className="text-xs bg-teal-100 px-1 rounded">Q1_Role</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <p className="text-sm text-green-900">
        <strong>Enrichment Export:</strong> All 5 screener filter_ids are included in the Prolific
        demographic export alongside 2 additional augmentation filters (education level, household
        income), totaling 7 of the 15-filter API maximum. Screener responses enable cross-validation
        against Qualtrics survey answers (e.g., Prolific &ldquo;Company Size: 1000+&rdquo; vs
        Qualtrics Q4 &ldquo;10,000+&rdquo;). Raw prescreener data is processed ephemerally and never
        committed to the repository.
      </p>
    </div>
  </section>
)
