import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SEO Performance Dashboard - Making of TABS',
  description: 'This page has moved. See the consolidated SEO Transparency page.',
  alternates: {
    canonical: '/making-of-tabs/seo',
  },
  robots: { index: false, follow: true },
}

const DashboardStubPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-700">
        <p className="text-lg mb-4">
          This page has been consolidated into the{' '}
          <Link href="/making-of-tabs/seo#dashboard" className="text-blue-600 hover:underline">
            SEO Benchmarking &amp; Transparency
          </Link>{' '}
          page.
        </p>
        <Link
          href="/making-of-tabs/seo#dashboard"
          className="inline-block mt-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Performance Dashboard ↓
        </Link>
      </div>
    </div>
  )
}

export default DashboardStubPage
