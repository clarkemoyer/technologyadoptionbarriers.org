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
    ...(technologyAdoptionModelsSeries.bibliography
      ? [
          {
            url: `${baseUrl}${technologyAdoptionModelsSeries.bibliography.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          },
        ]
      : []),
    // Individual Bibliography Articles (21 models)
    {
      url: `${baseUrl}/bibliography-1-1-theory-of-reasoned-action-tra-fishbein-ajzen-1975`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-2-diffusion-of-innovations-rogers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-3-social-cognitive-theory-sct-bandura-1986`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-4-model-of-innovation-resistance-ram-sheth-1989`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-5-status-quo-bias-samuelson-zeckhauser-1988`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-6-technology-acceptance-model-tam-davis-1989`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-7-theory-of-planned-behavior-tpb-ajzen-1991`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-8-personal-computing-acceptance-thompson-1991`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-9-intrinsic-extrinsic-motivation-davis-1992`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-10-decomposed-tpb-taylor-todd-1995`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-11-task-technology-fit-ttf-goodhue-thompson-1995`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-12-technology-readiness-index-tri-parasuraman-2000`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-13-technology-acceptance-model-2-tam2-venkatesh-davis-2000`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-14-expectation-confirmation-model-ecm-bhattacherjee-2001`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-15-unified-theory-utaut-venkatesh-2003`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-16-math-venkatesh-brown-2001`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-17-value-based-adoption-kim-2007`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-18-tram-lin-2007`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-19-technology-acceptance-model-3-tam3-venkatesh-bala-2008`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-20-utaut2-venkatesh-2012`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-1-21-technology-readiness-index-2-tri-2-parasuraman-colby-2015`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Organizational Bibliography Articles (21 models)
    {
      url: `${baseUrl}/bibliography-2-1-resource-based-view-rbv-wernerfelt-1984`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-2-vrio-framework-barney-1991`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-3-dynamic-capabilities-teece-1997`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-4-total-quality-management-tqm-deming-1982`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-5-capability-maturity-model-cmm-humphrey-1989`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-6-toe-framework-tornatzky-1990`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-7-it-implementation-research-cooper-zmud-1990`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-8-business-process-redesign-davenport-short-1990`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-9-business-process-reengineering-hammer-champy-1993`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-10-tafim-dod-1994`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-11-gartner-hype-cycle-fenn-1995`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-12-togaf-the-open-group-1995`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-13-dodaf-dod-2003`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-14-cmmi-chrissis-2005`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-15-it-cmf-innovation-value-institute-2016`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-16-aws-caf-ai-2024`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-17-aws-etf-prescriptive-guidance-2024`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-18-microsoft-cloud-adoption-framework-2025`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-19-microsoft-ai-adoption-framework-2025`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-20-gartner-hype-cycle-methodology-2025`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bibliography-2-21-diffusion-of-innovations-organizational-rogers-1962`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
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
    // Barriers pages
    {
      url: `${baseUrl}/barriers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/barriers/quotes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
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
      url: `${baseUrl}/results/cmo-survey`,
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
    // /making-of-tabs/cmo-survey → /results/cmo-survey (redirect)
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
      url: `${baseUrl}/making-of-tabs/integrations/google-jules`,
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
    {
      url: `${baseUrl}/making-of-tabs/automation-infrastructure`,
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
  ]
}
