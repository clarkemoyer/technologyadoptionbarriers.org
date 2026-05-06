import type { Metadata } from 'next'
import './globals.css'
import Header from './../components/header'
import Footer from './../components/footer'
import Sidebar from './../components/sidebar'
import { SidebarProvider } from './../components/sidebar/sidebar-context'
import CookieConsent from './../components/cookie-consent'
import ClarityRouteTracker from './../components/clarity-route-tracker'
import GoogleTagManager, { GoogleTagManagerNoScript } from './../components/google-tag-manager'
import {
  openSans,
  lato,
  raleway,
  faustina,
  cantataOne,
  faunaOne,
  montserrat,
  cinzel,
} from '@/lib/fonts'

// Get basePath for GitHub Pages deployment
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  metadataBase: new URL('https://technologyadoptionbarriers.org'),
  title: {
    default: "Technology Adoption Barriers Survey (TABS) | What's in your way?",
    template: '%s | TABS',
  },
  description:
    'Technology Adoption Barriers Survey (TABS) collects insights from organizational leaders to identify and overcome obstacles to technology adoption. Know the Barriers, Break the Barriers.',
  keywords: [
    'technology adoption',
    'barriers',
    'survey',
    'research',
    'organizational leadership',
    'technology adoption barriers',
    'TABS',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://technologyadoptionbarriers.org/',
    siteName: 'Technology Adoption Barriers Survey',
    title: "Technology Adoption Barriers Survey (TABS) | What's in your way?",
    description:
      'TABS collects insights from organizational leaders to identify and overcome obstacles to technology adoption.',
    images: [
      {
        url: '/Images/TABS-Logo-Full.png',
        width: 1920,
        height: 1920,
        alt: 'Technology Adoption Barriers Survey (TABS) Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tabs_survey',
    title: "Technology Adoption Barriers Survey (TABS) | What's in your way?",
    description:
      'TABS collects insights from organizational leaders to identify and overcome obstacles to technology adoption.',
    images: ['/Images/TABS-Logo-Full.png'],
  },
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: '32x32' },
      { url: `${basePath}/icon.png`, type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: `${basePath}/apple-icon.png`, sizes: '180x180', type: 'image/png' }],
  },
  manifest: `${basePath}/site.webmanifest`,
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Preload critical LCP image */}
        <link
          rel="preload"
          as="image"
          href={`${basePath}/Images/figma-hero-img.webp`}
          fetchPriority="high"
        />

        <GoogleTagManager />
      </head>
      <body
        className={[
          'antialiased',
          openSans.variable,
          lato.variable,
          raleway.variable,
          faustina.variable,
          cantataOne.variable,
          faunaOne.variable,
          montserrat.variable,
          cinzel.variable,
        ].join(' ')}
        suppressHydrationWarning={true}
      >
        <GoogleTagManagerNoScript />
        <ClarityRouteTracker />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        {/* <PopupProvider> */}
        <SidebarProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main id="main-content" tabIndex={-1} className="flex-1 min-w-0">
                {children}
              </main>
            </div>
            <div className="mt-auto">
              <Footer />
            </div>
          </div>
        </SidebarProvider>
        <CookieConsent />
        {/* <PopupsRootClient /> */}
        {/* </PopupProvider> */}
      </body>
    </html>
  )
}
