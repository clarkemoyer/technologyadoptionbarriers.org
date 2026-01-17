import type { MetadataRoute } from 'next'
import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'

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

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...seriesEntries,
  ]
}
