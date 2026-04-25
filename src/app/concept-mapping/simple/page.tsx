import type { Metadata } from 'next'
import ConceptMappingSimple from '@/components/tabs/concept-mapping/simple'

export const metadata: Metadata = {
  title: 'Concept Mapping (Simple View)',
  description:
    'Interactive concept mapping table for the Technology Adoption Barriers Survey (TABS). View all 57 survey items with construct mappings, variable names, scales, and theoretical grounding.',
}

const ConceptMappingSimplePage = () => {
  return (
    <main className="pt-[80px]">
      <div className="bg-tabs-navy py-[60px] text-white text-center">
        <h1 className="text-[36px] md:text-[48px] font-bold">Concept Mapping</h1>
        <p className="text-[18px] md:text-[20px] opacity-90 max-w-3xl mx-auto px-4">
          TABS (Simple) view - All 57 survey items with construct mappings, variable names, scales,
          QIDs, and theoretical grounding.
        </p>
      </div>
      <ConceptMappingSimple />
    </main>
  )
}

export default ConceptMappingSimplePage
