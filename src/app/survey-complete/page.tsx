import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Survey Complete | TABS',
  description: 'Thank you for participating in the Technology Adoption Barriers (TABS) survey.',
}

export default function SurveyCompletePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Thank you for participating
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-700">
        Your response has been recorded. We appreciate you taking the time to help improve our
        understanding of technology adoption barriers.
      </p>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">What happens next?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          TABS is a longitudinal effort. If you&apos;re willing, please plan to take the TABS survey
          again next year so we can measure how technology adoption barriers change over time.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Also, consider sharing this year&apos;s TABS survey with the rest of the leadership team
          in your organization (C-suite, VPs, Directors) — broader input makes the dataset stronger.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Came from Prolific?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          If you entered this survey through Prolific, you should typically be redirected back to
          Prolific automatically at the end. If you are not seeing your completion on Prolific,
          return to your Prolific study tab and follow the instructions there.
        </p>
      </div>

      <p className="mt-10 text-sm text-slate-600">
        Need help? Email{' '}
        <a
          className="font-medium text-slate-900 underline"
          href="mailto:contact@technologyadoptionbarriers.org"
        >
          contact@technologyadoptionbarriers.org
        </a>
        .
      </p>
    </main>
  )
}
