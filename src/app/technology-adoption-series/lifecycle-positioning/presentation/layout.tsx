import type { Metadata } from 'next'

import { presentationFontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Technology Lifecycle Positioning - Slide Deck',
  description:
    'A focused slide deck on technology lifecycle positioning: the dual-curve model, real-world timeline examples, and lifecycle cycles.',
}

export default function LifecyclePositioningPresentationLayout({
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
