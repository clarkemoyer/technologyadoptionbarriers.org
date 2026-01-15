import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

const ModelsPage = () => {
  return (
    <>
      <Header />
      <main className="pt-[80px] bg-gray-50">
        <div className="bg-blue-700 py-[80px] text-white text-center">
          <h1 className="text-[48px] lg:text-[56px] font-bold max-w-[1000px] mx-auto px-4">
            The Landscape of Technology Adoption Models & Frameworks
          </h1>
          <p className="text-[22px] mt-6 italic opacity-90 max-w-[800px] mx-auto px-4">
            &quot;Getting a new idea adopted, even when it has obvious advantages, is often very
            difficult.&quot; — Everett M. Rogers
          </p>
        </div>

        <article className="max-w-[900px] mx-auto py-[80px] px-6 text-gray-800 leading-relaxed text-[18px]">
          <section className="mb-[60px]">
            <h2 className="text-[32px] font-bold mb-[24px] text-gray-900">
              Defining the Domain: A Trifecta of Adoption
            </h2>
            <p className="mb-6">
              To truly understand technology adoption, we must move beyond a simple
              user-versus-organization dichotomy. A more accurate model considers three distinct but
              overlapping domains: Organizational Adoption, User Adoption, and Consumer Adoption.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                <h3 className="font-bold text-xl mb-3">Organizational</h3>
                <p className="text-gray-600 text-sm">
                  Focus on strategy, procurement, and operations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
                <h3 className="font-bold text-xl mb-3">User</h3>
                <p className="text-gray-600 text-sm">
                  Psychology, training, and employee acceptance.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500">
                <h3 className="font-bold text-xl mb-3">Consumer</h3>
                <p className="text-gray-600 text-sm">
                  External market perception and user experience.
                </p>
              </div>
            </div>
          </section>

          <section id="article-1-branch" className="mb-[60px]">
            <h2 className="text-[32px] font-bold mb-[24px] text-gray-900">The Roadmap</h2>
            <p className="mb-4">
              Our research explores two primary branches of the adoption journey:
            </p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Branch 1: The User’s Journey</strong> - Understanding individual acceptance.
              </li>
              <li>
                <strong>Branch 2: The Organization’s Playbook</strong> - Strategic implementation
                frameworks.
              </li>
            </ul>
          </section>

          <section
            id="article-1-1"
            className="mb-[60px] p-8 bg-blue-50 rounded-2xl border border-blue-100"
          >
            <h2 className="text-[28px] font-bold mb-4 text-blue-900">The Bedrock</h2>
            <p className="italic text-blue-800">
              Foundational Theories That Shaped Tech Acceptance
            </p>
            <p className="mt-4 text-gray-700">
              From early social psychology to modern frameworks, we trace the history of why some
              technologies succeed while others fail.
            </p>
          </section>

          <section className="mt-[80px] pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-4">References</h3>
            <ol className="list-decimal pl-6 text-sm text-gray-500 space-y-2">
              <li>Rogers, E. M. (2003). Diffusion of innovations (5th ed.). Free Press.</li>
              <li>
                Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user
                acceptance of information technology. MIS Quarterly.
              </li>
              <li>
                Venkatesh, V., et al. (2003). User acceptance of information technology: Toward a
                unified view. MIS Quarterly.
              </li>
            </ol>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}

export default ModelsPage
