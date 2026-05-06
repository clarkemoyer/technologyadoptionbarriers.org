import React from 'react'
import type { Metadata } from 'next'
import ConceptMapTab from '@/components/tabs/concept-mapping/ConceptMapTab'

export const metadata: Metadata = {
  title: 'Concept Mapping - Technology Adoption Models',
  description: 'Interactive landscape of technology adoption models and frameworks.',
}

export default function ConceptMappingPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header section to match other tabs/pages stylistically */}
      <div className="w-full bg-tabs-navy py-[60px] pt-[80px] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Concept Map</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            A visual overview of the key theories, models, and frameworks that shape technology
            adoption research.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <ConceptMapTab />
      </div>
    </main>
  )
}
