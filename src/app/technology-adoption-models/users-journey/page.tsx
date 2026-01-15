import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

const UsersJourneyPage = () => {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <div className="bg-blue-600 py-[60px] text-white text-center">
          <h1 className="text-[40px] font-bold px-4">
            Article 1: Branch Introduction – The User’s Journey
          </h1>
        </div>
        <article className="max-w-[800px] mx-auto py-[60px] px-6 text-[18px] leading-relaxed">
          <p className="mb-6">
            This branch focuses on the individual's experience with technology. We explore the
            psychological factors, ease of use, and perceived usefulness that drive an employee to
            either embrace or resist a new tool.
          </p>
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <h2 className="text-[24px] font-bold mb-4">Key Focus Areas:</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Individual Psychology of Adoption</li>
              <li>User Experience (UX) Impact</li>
              <li>The Role of Training and Support</li>
              <li>Resistance and Adoption Curves</li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}

export default UsersJourneyPage
