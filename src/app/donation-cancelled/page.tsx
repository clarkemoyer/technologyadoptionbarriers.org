import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Donation Cancelled | Technology Adoption Barriers (TABS)',
  description: 'Your donation was cancelled.',
  robots: {
    index: false, // Don't index cancel pages
    follow: false,
  },
}

export default function DonationCancelled() {
  return (
    <main className="ffc-container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <XCircle className="w-24 h-24 text-gray-400" aria-hidden="true" />
        </div>

        <h1 className="font-[var(--font-faustina)] text-[48px] leading-[60px] mb-6 text-gray-700">
          Donation Cancelled
        </h1>

        <div className="prose max-w-none font-[var(--font-lato)] text-[18px] leading-[28px]">
          <p className="text-xl mb-4">Your donation was not completed.</p>

          <p className="mb-6">
            No charges have been made to your payment method. If you experienced any issues or have
            questions, please don&apos;t hesitate to contact us.
          </p>

          <p className="mb-8">
            Contact us at{' '}
            <a
              href="mailto:contact@technologyadoptionbarriers.org"
              className="text-primary hover:underline"
            >
              contact@technologyadoptionbarriers.org
            </a>{' '}
            or call (520) 222-8104.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-[#113563] text-white text-lg font-bold rounded hover:bg-[#0d2847] transition-colors"
            >
              Return to Home
            </Link>

            <Link
              href="/"
              className="inline-block px-8 py-3 bg-[#F57C20] text-white text-lg font-bold rounded hover:bg-[#d66a1a] transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
