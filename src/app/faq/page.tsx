import type { Metadata } from 'next'
import FaqPageClient from './faq-client'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | TABS',
  description:
    'Find answers to over 40 frequently asked questions about the Technology Adoption Barriers Survey (TABS) - the survey, research methodology, getting involved, privacy, teaching resources, and more.',
  keywords: [
    'technology adoption barriers',
    'TABS FAQ',
    'survey questions',
    'technology adoption research',
    'digital transformation barriers',
    'technology adoption models',
  ],
  openGraph: {
    title: 'Frequently Asked Questions | TABS',
    description:
      'Find answers to over 40 frequently asked questions about the Technology Adoption Barriers Survey (TABS).',
    type: 'website',
  },
}

export default function FaqPage() {
  return <FaqPageClient />
}
