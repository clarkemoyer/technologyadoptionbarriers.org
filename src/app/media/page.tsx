import type { Metadata } from 'next'
import React from 'react'
import { assetPath } from '@/lib/assetPath'

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLdJson) }}
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
          className="sticky top-[80px] z-10 bg-white/90 backdrop-blur border-b border-gray-200"
        >
          <div className="mx-auto w-[90%] max-w-6xl py-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#video"
              className="px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Video
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
                  Typical response time: 1–3 business days.
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
                        Technology adoption succeeds or fails based on organizational barriers—not
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
                          href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
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

                  <div id="downloads" className="scroll-mt-[120px]">
                    <h3 className="text-lg font-semibold">Downloads</h3>
                    <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-1.5">
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
