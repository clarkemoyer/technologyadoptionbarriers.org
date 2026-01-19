import type { Metadata } from 'next'
import { outfit, plusJakartaSans, firaCode } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'TABS Presentation',
  description:
    'Technology Adoption Barriers Survey (TABS) presentation slides - Know the Barriers, Break the Barriers',
}

export default function PresentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={[outfit.variable, plusJakartaSans.variable, firaCode.variable].join(' ')}
        style={{
          fontFamily: 'var(--font-plus-jakarta-sans), sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}
