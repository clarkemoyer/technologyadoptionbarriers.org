import type { Metadata } from 'next'
import Link from 'next/link'
import { assetPath } from '@/lib/assetPath'

export const metadata: Metadata = {
  title: 'TABS Literature Review Mind Map',
  description:
    'Full-resolution static rendering of the TABS literature review mind map (15823×9757 native SVG). Use browser pinch/scroll to zoom.',
  alternates: {
    canonical: '/lit-review-mind-map',
  },
}

export default function LitReviewMindMapPage() {
  const src = assetPath('/Svgs/mind-maps/tabs-lit-review-only.svg')
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-800">TABS Literature Review Mind Map</span>
        <span className="text-slate-500">
          Native resolution 15823×9757 — zoom in your browser for arbitrary detail.
        </span>
        <span className="ml-auto flex gap-3">
          <a
            href={src}
            className="text-blue-700 underline hover:text-blue-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open raw SVG
          </a>
          <Link
            href="/making-of-tabs/mind-maps/"
            className="text-blue-700 underline hover:text-blue-900"
          >
            Back to Mind Maps
          </Link>
        </span>
      </header>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="TABS literature review mind map — full landscape of technology adoption models and frameworks."
        width={15823}
        height={9757}
        decoding="async"
        fetchPriority="high"
        className="block w-full h-auto"
      />
    </div>
  )
}
