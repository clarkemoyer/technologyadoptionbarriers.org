import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

const OrganizationsPlaybookPage = () => {
    return (
        <>
            <Header />
            <main className="pt-[80px]">
                <div className="bg-blue-600 py-[60px] text-white text-center">
                    <h1 className="text-[40px] font-bold px-4">Article 2: Branch Introduction – The Organization’s Playbook</h1>
                </div>
                <article className="max-w-[800px] mx-auto py-[60px] px-6 text-[18px] leading-relaxed">
                    <p className="mb-6">
                        From a corporate perspective, adoption is about strategy, procurement, and measurement. This branch explores how organizations can create a systematic approach to technology integration.
                    </p>
                    <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
                        <h2 className="text-[24px] font-bold mb-4 text-blue-900">Strategic Pillars:</h2>
                        <ul className="list-disc pl-6 space-y-4 text-blue-800">
                            <li><strong>Alignment:</strong> Ensuring tech matches business goals.</li>
                            <li><strong>Readiness:</strong> Assessing organizational capacity for change.</li>
                            <li><strong>Governance:</strong> Managing policies and security.</li>
                            <li><strong>Success Metrics:</strong> Measuring ROI and engagement.</li>
                        </ul>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    )
}

export default OrganizationsPlaybookPage
