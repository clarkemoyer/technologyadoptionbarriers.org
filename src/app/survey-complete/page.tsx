import type { Metadata } from 'next'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'
import { Mail, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Survey Complete | TABS',
  description:
    'Thank you for participating in the Technology Adoption Barriers Survey (TABS) survey.',
}

export default function SurveyCompletePage() {
  const shareSubject = encodeURIComponent('Take the Technology Adoption Barriers Survey (TABS)')
  const shareBody = encodeURIComponent(
    `I just completed the Technology Adoption Barriers Survey (TABS) and thought you might be interested in participating as well.\n\nYou can take the survey here: ${TABS_WEBSITE_QUALTRICS_SURVEY_URL}`
  )
  const mailingListSubject = encodeURIComponent('Join TABS Mailing List')
  const mailingListBody = encodeURIComponent(
    'Please add me to the mailing list to be notified about future TABS surveys and research updates.'
  )

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
          again in a future cycle so we can measure how technology adoption barriers change over
          time.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Also, consider sharing this year&apos;s TABS survey with the rest of the leadership team
          in your organization (C-suite, VPs, Directors) - broader input makes the dataset stronger.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <a
            href={`mailto:?subject=${shareSubject}&body=${shareBody}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-tabs-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-tabs-blue-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tabs-blue transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Survey via Email
          </a>
          <a
            href={`mailto:contact@technologyadoptionbarriers.org?subject=${mailingListSubject}&body=${mailingListBody}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Join Mailing List
          </a>
        </div>
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
