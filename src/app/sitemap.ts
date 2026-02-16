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
    // Organizational Bibliography Articles (3 models)
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
      url: `${baseUrl}/barriers/survey-stats`,
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
    // Get Involved & Media
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
    {
      url: `${baseUrl}/making-of-tabs/cmo-survey`,
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
  ]
}
