import type { Metadata } from 'next'
import { appearances } from '@/data/appearances'
import dispositionData from '@/data/disposition-summary.json'
import impactData from '@/data/impact.json'
import { assetPath } from '@/lib/assetPath'
import { TOTAL_ITEMS_PRESENTED } from '@/lib/tabs-survey-constants'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'

export const metadata: Metadata = {
  title: 'Media',
  description:
    'Press kit, media contact details, and project resources for the Technology Adoption Barriers Survey (TABS).',
  alternates: {
    canonical: '/media',
  },
  openGraph: {
    title: 'Media | TABS',
    description:
      'Press kit, media contact details, and project resources for the Technology Adoption Barriers Survey (TABS).',
    url: 'https://technologyadoptionbarriers.org/media',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Technology Adoption Barriers Survey (TABS)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media | TABS',
    description:
      'Press kit, media contact details, and project resources for the Technology Adoption Barriers Survey (TABS).',
    images: ['/web-app-manifest-512x512.png'],
  },
}

const MediaPage = () => {
  // Same Prolific-approved source the homepage Statistics callout uses, so the
  // press kit and the homepage cannot disagree on the headline number.
  const surveysCompleted = dispositionData.completionProgress.approved
  const pageViews = parseInt(impactData.pageViews, 10) || 0
  const verifiedVisitors = parseInt(impactData.verifiedVisitors, 10) || 0

  const orgLdJson = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Technology Adoption Barriers Survey (TABS)',
    url: 'https://technologyadoptionbarriers.org',
    email: 'contact@technologyadoptionbarriers.org',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'media',
        email: 'contact@technologyadoptionbarriers.org',
        availableLanguage: ['en'],
      },
    ],
  }

  return (
    <>
      <main className="pt-[80px]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgLdJson).replace(/</g, '\\u003c').replace(/>/g, '\\u003e'),
          }}
        />

        <div className="bg-gray-900 py-16 text-white">
          <div className="mx-auto w-[90%] max-w-6xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Media</h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90">
              Press kit, media contact details, and project resources.
            </p>
          </div>
        </div>

        <nav
          aria-label="Media page sections"
          className="sticky top-[80px] z-20 bg-white border-b border-gray-200"
        >
          <div className="mx-auto w-[90%] max-w-6xl py-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#appearances"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Appearances
            </a>
            <a
              href="#presentation"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Presentation
            </a>
            <a
              href="#video"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Video
            </a>
            <a
              href="#impact"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Impact
            </a>
            <a
              href="#press-kit"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Press Kit
            </a>
            <a
              href="#downloads"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Downloads
            </a>
            <a
              href="#contact"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Contact
            </a>
          </div>
        </nav>

        {/* Appearances Section */}
        <section id="appearances" className="py-16 bg-white scroll-mt-[120px]">
          <div className="mx-auto w-[90%] max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">Appearances</h2>
            <p className="mt-4 text-lg text-gray-700 text-center max-w-3xl mx-auto">
              Speaking engagements and public presentations about technology adoption barriers.
            </p>

            <div className="mt-10 space-y-6">
              {appearances.map((appearance) => (
                <div
                  key={`${appearance.date}-${appearance.event}-${appearance.session}`}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold">{appearance.event}</h3>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {appearance.session}
                      </p>
                    </div>
                    <time
                      dateTime={appearance.date}
                      className="text-sm font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {new Date(appearance.date + 'T00:00:00').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="mt-3 text-gray-700">{appearance.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {appearance.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {appearance.topic}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Presentation Section */}
        <section id="presentation" className="py-16 bg-gray-50 scroll-mt-[120px]">
          <div className="mx-auto w-[90%] max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">TABS Presentation</h2>
              <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
                View our interactive presentation covering the TABS mission, challenges, solutions,
                and project roadmap. Navigate through 8 slides using arrow keys or the on-screen
                controls.
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href={assetPath('/tabs-presentation')}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  View Presentation
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* Video Section */}
        <section id="video" className="py-16 bg-gray-50 scroll-mt-[120px]">
          <div className="mx-auto w-[90%] max-w-6xl">
            <figure>
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <video
                  aria-label="Introduction to The TABS Project"
                  className="w-full h-full object-contain"
                  poster={assetPath('/Images/TABS-Logo-Full.png')}
                  controls
                  preload="metadata"
                  playsInline
                >
                  <source src={assetPath('/videos/The_TABS_Project.mp4')} type="video/mp4" />
                  <track
                    kind="captions"
                    src={assetPath('/videos/The_TABS_Project.en.vtt')}
                    srcLang="en"
                    label="English"
                    default
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <figcaption className="mt-4 text-center text-gray-700 font-semibold">
                Introduction to The TABS Project
              </figcaption>
            </figure>

            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold">Transcript & Captions</h2>
              <p className="mt-2 text-gray-700">
                Captions are enabled in the player. You can download the transcript below (it is
                auto-generated and may contain errors), or email{' '}
                <a
                  className="text-blue-700 underline"
                  href="mailto:contact@technologyadoptionbarriers.org"
                >
                  contact@technologyadoptionbarriers.org
                </a>{' '}
                with corrections.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Transcript:{' '}
                <a
                  className="text-blue-700 underline"
                  href={assetPath('/press-kit/The_TABS_Project.transcript.txt')}
                  download
                >
                  The_TABS_Project.transcript.txt
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Download the video:{' '}
                <a
                  className="text-blue-700 underline"
                  href={assetPath('/videos/The_TABS_Project.mp4')}
                  download
                >
                  The_TABS_Project.mp4
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-16 bg-white scroll-mt-[120px]">
          <div className="mx-auto w-[90%] max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">TABS at a Glance</h2>
            <p className="mt-4 text-lg text-gray-700 text-center max-w-3xl mx-auto">
              Key statistics from the Technology Adoption Barriers Survey project.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-4xl font-bold text-blue-600">
                  {surveysCompleted.toLocaleString()}
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Surveys Completed
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-4xl font-bold text-green-600">
                  {verifiedVisitors.toLocaleString()}
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Verified Visitors
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="text-4xl font-bold text-orange-500">
                  {pageViews.toLocaleString()}
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Page Views
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">16</div>
                <div className="mt-1 text-sm text-gray-700">Research Articles</div>
              </div>
              <div className="p-5 rounded-xl bg-green-50 border border-green-100">
                <div className="text-2xl font-bold text-green-700">24</div>
                <div className="mt-1 text-sm text-gray-700">Bibliography Entries</div>
              </div>
              <div className="p-5 rounded-xl bg-orange-50 border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">
                  {TOTAL_ITEMS_PRESENTED.toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-700">Survey Questions</div>
              </div>
              <div className="p-5 rounded-xl bg-purple-50 border border-purple-100">
                <div className="text-2xl font-bold text-purple-700">149+</div>
                <div className="mt-1 text-sm text-gray-700">Site Pages</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto w-[90%] max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Media Inquiries */}
              <div
                id="contact"
                className="bg-white p-10 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center scroll-mt-[120px]"
              >
                <h2 className="text-3xl font-bold">Media Inquiries</h2>
                <p className="mt-4 text-lg text-gray-700">
                  For interview requests, quotes, or background information, contact our team.
                  Please include your outlet, deadline, and the specific topic(s) you’re covering.
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Typical response time: 1-3 business days.
                </p>
                <a
                  href="mailto:contact@technologyadoptionbarriers.org"
                  className="mt-8 px-10 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Contact Media Team
                </a>
              </div>

              {/* Press Kit */}
              <div id="press-kit" className="bg-white p-10 rounded-2xl shadow-xl scroll-mt-[120px]">
                <h2 className="text-3xl font-bold text-center md:text-left">Press Kit</h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">About TABS</h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      The Technology Adoption Barriers Survey (TABS) is a research initiative
                      focused on understanding the real-world barriers organizations face when
                      adopting new technologies. TABS is designed to help leaders identify priority
                      areas for intervention, benchmark against aggregated insights, and improve the
                      likelihood that technology investments deliver value.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Key Messages</h3>
                    <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1.5">
                      <li>
                        Technology adoption succeeds or fails based on organizational barriers, not
                        just tools.
                      </li>
                      <li>
                        TABS gathers perspectives from leaders and practitioners to surface
                        practical barriers and enabling capabilities.
                      </li>
                      <li>
                        The goal is actionable insight: prioritize interventions, reduce waste, and
                        increase the odds that technology investments deliver value.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Boilerplate (100 words)</h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      The Technology Adoption Barriers Survey (TABS) is a research initiative
                      focused on understanding the real-world barriers organizations face when
                      adopting new technologies. Barriers to adoption can reduce the value of
                      technology investments and negatively affect an enterprise’s ability to obtain
                      or maintain competitive advantage. TABS gathers perspectives from senior
                      leaders and practitioners to build updated, empirically grounded insights on
                      what blocks successful adoption and what organizational capabilities enable
                      it.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Quick Facts</h3>
                    <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1.5">
                      <li>
                        Website:{' '}
                        <a
                          className="text-blue-700 underline"
                          href="https://technologyadoptionbarriers.org"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          technologyadoptionbarriers.org
                        </a>
                      </li>
                      <li>
                        Survey:{' '}
                        <a
                          className="text-blue-700 underline"
                          href={TABS_WEBSITE_QUALTRICS_SURVEY_URL}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Take the TABS Survey
                        </a>
                      </li>
                      <li>
                        GitHub:{' '}
                        <a
                          className="text-blue-700 underline"
                          href="https://github.com/clarkemoyer/technologyadoptionbarriers.org"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          clarkemoyer/technologyadoptionbarriers.org
                        </a>
                      </li>
                      <li>
                        Media contact:{' '}
                        <a
                          className="text-blue-700 underline"
                          href="mailto:contact@technologyadoptionbarriers.org"
                        >
                          contact@technologyadoptionbarriers.org
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Media Coverage & Updates</h3>
                    <p className="mt-2 text-gray-700">
                      Media coverage and research updates will be posted here as they’re published.
                      If you’d like to be notified, contact us with “Media updates” in the subject.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Suggested Citation</h3>
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Moyer, C. (2026).{' '}
                        <em>Technology Adoption Barriers Survey (TABS) Website</em> (Version 0.3.1)
                        [Computer software]. Available at{' '}
                        <a
                          className="text-blue-700 underline"
                          href="https://technologyadoptionbarriers.org"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          https://technologyadoptionbarriers.org
                        </a>
                        . Source code:{' '}
                        <a
                          className="text-blue-700 underline"
                          href="https://github.com/clarkemoyer/technologyadoptionbarriers.org"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          GitHub
                        </a>
                        .
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Machine-readable citation available in{' '}
                      <a
                        className="text-blue-700 underline"
                        href="https://github.com/clarkemoyer/technologyadoptionbarriers.org/blob/main/CITATION.cff"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        CITATION.cff
                      </a>
                      .
                    </p>
                  </div>
                  <div id="downloads" className="scroll-mt-[120px]">
                    <h3 className="text-lg font-semibold">Downloads</h3>
                    <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1.5">
                      <li>
                        Presentation:{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/tabs-presentation')}
                        >
                          View Interactive Slides
                        </a>
                      </li>
                      <li>
                        Logo (PNG):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/Images/TABS-Logo-Full.png')}
                          download
                        >
                          TABS-Logo-Full.png
                        </a>
                      </li>
                      <li>
                        Press kit (text):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/TABS-Press-Kit.txt')}
                          download
                        >
                          TABS-Press-Kit.txt
                        </a>
                      </li>
                      <li>
                        Boilerplate variants (text):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/TABS-Boilerplate.txt')}
                          download
                        >
                          TABS-Boilerplate.txt
                        </a>
                      </li>
                      <li>
                        Project video (MP4):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/videos/The_TABS_Project.mp4')}
                          download
                        >
                          The_TABS_Project.mp4
                        </a>
                      </li>
                      <li>
                        Transcript (auto-generated):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/The_TABS_Project.transcript.txt')}
                          download
                        >
                          The_TABS_Project.transcript.txt
                        </a>
                      </li>
                      <li>
                        Media FAQ (text):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/TABS-Media-FAQ.txt')}
                          download
                        >
                          TABS-Media-FAQ.txt
                        </a>
                      </li>
                      <li>
                        Brand guidelines (text):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/TABS-Brand-Guidelines.txt')}
                          download
                        >
                          TABS-Brand-Guidelines.txt
                        </a>
                      </li>
                      <li>
                        Spokespeople (text):{' '}
                        <a
                          className="text-blue-700 underline"
                          href={assetPath('/press-kit/TABS-Spokespeople.txt')}
                          download
                        >
                          TABS-Spokespeople.txt
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default MediaPage
