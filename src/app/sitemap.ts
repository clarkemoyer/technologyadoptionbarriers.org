import type { MetadataRoute } from 'next'
import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'
import {
  technologyAdoptionTeachingSeries,
  technologyAdoptionTeachingSeriesResources,
} from '@/data/technology-adoption-teaching-series'
import { personas } from '@/lib/personas'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://technologyadoptionbarriers.org')
    .trim()
    .replace(/\/$/, '')

  const basePathRaw = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim()
  const basePath = basePathRaw ? `/${basePathRaw.replace(/^\/+/, '').replace(/\/+$/, '')}` : ''

  const baseUrl = `${siteUrl}${basePath}`
  const now = new Date()

  // Build sitemap entries from series data
  const seriesEntries: MetadataRoute.Sitemap = [
    // Root article
    {
      url: `${baseUrl}${technologyAdoptionModelsSeries.root.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Bibliography
    {
      url: `${baseUrl}${technologyAdoptionModelsSeries.bibliography.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    // Bibliography Articles (42 total: 21 individual + 21 organizational) — derived from single source of truth
    ...[
      ...technologyAdoptionModelsSeries.bibliographyArticles.individual,
      ...technologyAdoptionModelsSeries.bibliographyArticles.organizational,
    ].map((entry) => ({
      url: `${baseUrl}${entry.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // Branch introductions
    ...technologyAdoptionModelsSeries.branches.map((branch) => ({
      url: `${baseUrl}${branch.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // All articles
    ...technologyAdoptionModelsSeries.branches.flatMap((branch) =>
      branch.articles.map((article) => ({
        url: `${baseUrl}${article.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),
  ]

  const teachingSeriesEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}${technologyAdoptionTeachingSeries.root.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...technologyAdoptionTeachingSeriesResources.map((resource) => ({
      url: `${baseUrl}${technologyAdoptionTeachingSeries.root.slug}/${resource.segment}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...technologyAdoptionTeachingSeries.parts.flatMap((part) =>
      part.slides.map((slide) => ({
        url: `${baseUrl}${technologyAdoptionTeachingSeries.root.slug}/${slide.segment}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    ),
  ]

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Top-level nav-category landing pages (added per #1708 first-click audit)
    {
      url: `${baseUrl}/survey`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Barriers pages
    {
      url: `${baseUrl}/barriers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Results section
    {
      url: `${baseUrl}/results`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/results/sample`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/data-quality`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/descriptive`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/reliability`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/sensitivity`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/findings`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/dataset-comparison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/survey-stats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/making-of-tabs/cmo-survey`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/reproducibility`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/results/crp-2026/sample`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/descriptive`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/reliability`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/sensitivity`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/findings`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/data-quality`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/factor-analysis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/validation`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/crp-2026/top-barriers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/factor-analysis`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/validation`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/top-barriers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/results/glossary`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Start / persona pages
    {
      url: `${baseUrl}/start`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...personas.map((p) => ({
      url: `${baseUrl}/start/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // FAQ, Get Involved & Media
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-involved`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // For Organizations
    {
      url: `${baseUrl}/for-organizations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-organizations/executive-leaders`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/for-organizations/finance-leaders`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/for-organizations/operations-leaders`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/for-organizations/technology-leaders`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Making of TABS pages
    {
      url: `${baseUrl}/making-of-tabs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/making-of-tabs/tabs-presentation`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // CMO Survey now lives at /making-of-tabs/cmo-survey (moved from /results/cmo-survey)
    {
      url: `${baseUrl}/making-of-tabs/integrations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/google-analytics`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/qualtrics`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/prolific`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // /making-of-tabs/integrations/prolific/dashboard → /results/dashboard (redirect)
    {
      url: `${baseUrl}/making-of-tabs/integrations/microsoft-clarity`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/github`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/cloudflare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/integrations/zotero`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-assisted-development`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-assisted-development/squash-merge-incident`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-assisted-development/overnight-shift`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/development-workflow`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/accessibility`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/open-source`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/content-architecture`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/seo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // /making-of-tabs/data-analysis → /results/data-quality (redirect)
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-psychological-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-sociological-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-unified-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-1-specialized-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-strategic-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-maturity-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-enterprise-architecture`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/branch-2-cloud-and-ai-frameworks`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/bibliography-and-citations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/making-of-tabs/ai-validity-checks/gemini-3-1-review/conclusion`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Legal / policy pages
    {
      url: `${baseUrl}/contribution-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/security-acknowledgements`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/vulnerability-disclosure-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...seriesEntries,
    ...teachingSeriesEntries,
    // Lifecycle Positioning focused topic page
    {
      url: `${baseUrl}/technology-adoption-series/lifecycle-positioning`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Visual Gallery
    {
      url: `${baseUrl}/technology-adoption-series/visual-gallery`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Concept Mapping
    {
      url: `${baseUrl}/concept-mapping/simple`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Survey completion
    {
      url: `${baseUrl}/survey-complete`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Concept Mapping
    {
      url: `${baseUrl}/concept-mapping/complex`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/concept-mapping/simple`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/concept-mapping/summary`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Mind Maps (gallery under Making of TABS, one URL per map)
    {
      url: `${baseUrl}/making-of-tabs/mind-maps`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/full-mind-map`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/business-management-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/it-management-models`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/enterprise-it-architecture`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/project-program-risk-management`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/standards-regulations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/tabs-project-operations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/making-of-tabs/mind-maps/culminating-research-project`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Static full-resolution lit review map (outside Making-of-TABS layout so
    // it can render the SVG at full viewport width, no article-column clip).
    {
      url: `${baseUrl}/lit-review-mind-map`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
