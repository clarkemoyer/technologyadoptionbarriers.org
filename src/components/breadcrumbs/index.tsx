'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { normalizePath } from '@/lib/normalizePath'

interface BreadcrumbsProps {
  /** Override the auto-generated breadcrumb items */
  items?: Array<{ label: string; href?: string }>
  className?: string
}

/** Known segment → display label mappings for proper casing of acronyms/terms */
const SEGMENT_LABELS: Record<string, string> = {
  tabs: 'TABS',
  crp: 'CRP',
  cmo: 'CMO',
  faq: 'FAQ',
  seo: 'SEO',
  api: 'API',
  qa: 'QA',
  github: 'GitHub',
  '4k': '4K',
  'crp-2026': 'CRP 2026',
  'making-of-tabs': 'Making of TABS',
  'cmo-survey': 'CMO Survey',
  'data-quality': 'Data Quality',
  'survey-stats': 'Survey Statistics',
  'dataset-comparison': 'Dataset Comparison',
  'ai-assisted-development': 'AI-Assisted Development',
  'ai-validity-checks': 'AI Validity Checks',
  'gemini-3-1-review': 'Gemini 3.1 Review',
  'google-analytics': 'Google Analytics',
  'google-jules': 'Google Jules',
  'microsoft-clarity': 'Microsoft Clarity',
  'branch-1-psychological-models': 'Psychological Models',
  'branch-1-sociological-models': 'Sociological Models',
  'branch-1-specialized-models': 'Specialized Models',
  'branch-1-unified-models': 'Unified Models',
  'branch-2-cloud-and-ai-frameworks': 'Cloud & AI Frameworks',
  'branch-2-enterprise-architecture': 'Enterprise Architecture',
  'branch-2-maturity-models': 'Maturity Models',
  'branch-2-strategic-models': 'Strategic Models',
  'bibliography-and-citations': 'Bibliography & Citations',
  'overnight-shift': 'The Overnight Shift',
  'squash-merge-incident': 'The Squash Merge Incident',
  'tabs-presentation': 'TABS Presentation',
  'factor-analysis': 'Factor Analysis',
  'baseline-audit': 'Baseline Audit',
  reliability: 'Scale Reliability',
  findings: 'Key Findings',
  sample: 'Sample & Demographics',
  descriptive: 'Descriptive Statistics',
  sensitivity: 'Sensitivity Analysis',
  reproducibility: 'Reproducibility',
  validation: 'Instrument Validation',
  glossary: 'Statistics Glossary',
  ga4: 'GA4',
  cloudflare: 'Cloudflare',
  prolific: 'Prolific',
  qualtrics: 'Qualtrics',
}

function capitalize(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  const crumbs: Array<{ label: string; href?: string }> = items ?? []

  if (!items) {
    const raw = normalizePath(pathname)
    const segments = raw.split('/').filter(Boolean)

    if (segments.length < 2) return null

    let accumulated = ''
    for (let i = 0; i < segments.length; i++) {
      accumulated += `/${segments[i]}`
      const isLast = i === segments.length - 1
      crumbs.push({
        label: capitalize(segments[i]),
        href: isLast ? undefined : accumulated,
      })
    }
  }

  if (crumbs.length < 2) return null

  return (
    <nav className={`mb-8 text-sm text-gray-500 ${className ?? ''}`} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li
              key={crumb.href ?? crumb.label}
              {...(isLast ? { 'aria-current': 'page' as const } : {})}
              className={isLast ? 'text-gray-800' : undefined}
            >
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-600 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                crumb.label
              )}
              {!isLast && (
                <span className="mx-2" aria-hidden="true">
                  &rsaquo;
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
