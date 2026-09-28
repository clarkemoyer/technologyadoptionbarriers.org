import type { Metadata } from 'next'

import { presentationFontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Technology Adoption Teaching Series - Slide Deck',
  description:
    'A full-screen slide deck view of the Technology Adoption Teaching Series, designed for presenting like a PowerPoint.',
}

export default function TechnologyAdoptionSeriesPresentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className={presentationFontVariables}
      style={{
        fontFamily: 'var(--font-plus-jakarta-sans), sans-serif',
      }}
    >
      {children}
    </div>
  )
}
