import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Donation Successful | Technology Adoption Barriers (TABS)',
  description: 'Thank you for your generous donation to support TABS research.',
  robots: {
    index: false, // Don't index success pages
    follow: false,
  },
}

export default function DonationSuccess() {
  return (
    <main className="ffc-container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-500" aria-hidden="true" />
        </div>

        <h1 className="font-[var(--font-faustina)] text-[48px] leading-[60px] mb-6 text-green-700">
          Thank You!
        </h1>

        <div className="prose max-w-none font-[var(--font-lato)] text-[18px] leading-[28px]">
          <p className="text-xl mb-4">Your donation has been successfully processed.</p>

          <p className="mb-6">
            We are grateful for your support of the Technology Adoption Barriers (TABS) research
            project. Your contribution helps us continue our mission to identify and overcome
            obstacles to technology adoption.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Confirmation Email:</strong> You will receive a confirmation email from Stripe
              with your donation receipt shortly.
            </p>
          </div>

          <p className="mb-8">
            If you have any questions about your donation, please contact us at{' '}
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

            <a
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-[#F57C20] text-white text-lg font-bold rounded hover:bg-[#d66a1a] transition-colors"
            >
              Take the Survey
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
