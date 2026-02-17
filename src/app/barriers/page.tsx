import type { Metadata } from 'next'
import Barriers from '@/components/tabs/barriers'

export const metadata: Metadata = {
  title: 'Technology Adoption Barriers',
  description:
    'Explore the key barriers to technology adoption identified through the TABS research. Understand the obstacles organizations face when implementing new technology.',
}

const BarriersPage = () => {
  return (
    <>
      <main className="pt-[80px]">
        <div className="bg-blue-600 py-[60px] text-white text-center">
          <h1 className="text-[48px] font-bold">Technology Adoption Barriers</h1>
          <p className="text-[20px] opacity-90">
            Explore factors that can slow or prevent the adoption of new technology in
            organizations.
          </p>
        </div>
        <Barriers />
      </main>
    </>
  )
}

export default BarriersPage
