import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://technologyadoptionbarriers.org')
    .trim()
    .replace(/\/$/, '')

  const basePathRaw = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim()
  const basePath = basePathRaw ? `/${basePathRaw.replace(/^\/+/, '').replace(/\/+$/, '')}` : ''

  const base = `${siteUrl}${basePath}`
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
