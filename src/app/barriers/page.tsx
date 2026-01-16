import React from 'react'
import Barriers from '@/components/tabs/Barriers'

const BarriersPage = () => {
  return (
    <>
      <main className="pt-[80px]">
        <div className="bg-blue-600 py-[60px] text-white text-center">
          <h1 className="text-[48px] font-bold">Tech Adoption Barriers</h1>
          <p className="text-[20px] opacity-90">Overall page for the collection of barriers.</p>
        </div>
        <Barriers />
      </main>
    </>
  )
}

export default BarriersPage
