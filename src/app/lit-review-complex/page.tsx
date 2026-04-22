import type { Metadata } from 'next'
import MindMapViewer from '@/components/lit-review-complex/mind-map-viewer'

export const metadata: Metadata = {
  title: 'Literature Review Mind Map (Complex)',
  description:
    'Interactive pan-and-zoom view of the Technology Adoption Barriers Survey (TABS) literature review mind map, covering models, frameworks, standards, and the culminating research project workflow.',
}

const LitReviewComplexPage = () => {
  return (
    <main className="pt-[80px]">
      <div className="bg-tabs-navy py-[60px] text-white text-center px-4">
        <h1 className="text-[36px] md:text-[48px] font-bold">Literature Review Mind Map</h1>
        <p className="text-[18px] md:text-[20px] opacity-90 max-w-3xl mx-auto mt-2">
          Complex view — drag to pan, scroll or pinch to zoom. Double-click to reset.
        </p>
      </div>
      <MindMapViewer />
    </main>
  )
}

export default LitReviewComplexPage
