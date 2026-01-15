import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

const FoundationalTheoriesPage = () => {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <div className="bg-blue-600 py-[60px] text-white text-center">
          <h1 className="text-[40px] font-bold px-4">
            Article 1.1: The Bedrock – Foundational Theories
          </h1>
        </div>
        <article className="max-w-[800px] mx-auto py-[60px] px-6 text-[18px] leading-relaxed">
          <p className="mb-6">
            Understanding the history of technology acceptance helps us predict future adoption
            success. This article dives into the seminal theories that formed the basis for modern
            research.
          </p>
          <div className="space-y-8">
            <div>
              <h2 className="text-[24px] font-bold mb-2">Diffusion of Innovations (DOI)</h2>
              <p className="text-gray-700">
                Everett Rogers' classic model of how ideas spread through cultures.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">Technology Acceptance Model (TAM)</h2>
              <p className="text-gray-700">
                Fred Davis' model focused on Perceived Usefulness and Perceived Ease of Use.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">Theory of Planned Behavior (TPB)</h2>
              <p className="text-gray-700">
                Explaining how attitudes and social norms influence adoption intent.
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}

export default FoundationalTheoriesPage
