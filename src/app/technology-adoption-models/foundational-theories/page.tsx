import React from 'react'

const FoundationalTheoriesPage = () => {
  return (
    <>
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
                Everett Rogers&apos; classic model of how ideas spread through cultures.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">Technology Acceptance Model (TAM)</h2>
              <p className="text-gray-700">
                Fred Davis&apos; model focused on Perceived Usefulness and Perceived Ease of Use.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">Theory of Planned Behavior (TPB)</h2>
              <p className="text-gray-700">
                Explaining how attitudes and social norms influence adoption intent.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">
                Unified Theory of Acceptance and Use of Technology (UTAUT)
              </h2>
              <p className="text-gray-700">
                A comprehensive framework combining elements from eight previous models.
              </p>
            </div>
            <div>
              <h2 className="text-[24px] font-bold mb-2">
                Technology-Organization-Environment (TOE)
              </h2>
              <p className="text-gray-700">
                A framework for understanding organizational adoption based on technological,
                organizational, and environmental contexts.
              </p>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}

export default FoundationalTheoriesPage
