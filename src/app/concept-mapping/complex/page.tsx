import type { Metadata } from 'next'
import ConceptMappingComplex from '@/components/tabs/concept-mapping/complex'

export const metadata: Metadata = {
  title: 'Concept Mapping (Complex View)',
  description:
    'Detailed academic concept mapping for the Technology Adoption Barriers Survey (TABS). View all 57 survey items with section-grouped accordion panels, scale visualizations, citation copy, and cross-reference linking.',
}

const ConceptMappingComplexPage = () => {
  return (
    <main className="pt-[80px]">
      <div className="bg-tabs-navy py-[60px] text-white text-center">
        <h1 className="text-[36px] md:text-[48px] font-bold">Concept Mapping</h1>
        <p className="text-[18px] md:text-[20px] opacity-90 max-w-3xl mx-auto px-4">
          TABS (Complex) view - All 57 survey items with section-grouped panels, scale
          visualizations, citation tools, and cross-reference linking.
        </p>
      </div>
      <ConceptMappingComplex />
    </main>
  )
}

export default ConceptMappingComplexPage
