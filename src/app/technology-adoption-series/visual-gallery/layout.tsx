import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visual Gallery',
  description:
    'Browse presentation visuals from the Technology Adoption Barriers Survey (TABS) teaching series in split, modern, and ASCII art formats.',
}

export default function VisualGalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
