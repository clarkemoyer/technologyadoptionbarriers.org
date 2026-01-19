import type { Metadata } from 'next'
import Link from 'next/link'
import { assetPath } from '@/lib/assetPath'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Technology Adoption Barriers (TABS)',
  description:
    'Oops! This page could not be found. Looks like we hit a technology adoption barrier.',
}

export default function NotFound() {
  return (
    <div className="pt-[140px] pb-[54px] min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="py-[27px] w-[90%] md:w-[80%] max-w-[800px] mx-auto text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-[700] text-[#333] leading-none mb-4">
            404
          </h1>
          <div className="text-[24px] md:text-[32px] font-[600] text-[#666] mb-2">
            Technology Adoption Barrier Detected! 🚧
          </div>
        </div>

        {/* Funny Image Placeholder - Using existing site style */}
        <div className="my-8 relative mx-auto max-w-[500px]">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-8 shadow-lg">
            {/* ASCII Art of a broken computer/failed adoption */}
            <pre className="text-[12px] md:text-[16px] font-mono text-[#333] overflow-x-auto">
              {`
    _______________
   |  _________  |
   | |  ERROR  | |
   | |   404   | |
   | |_________| |
   |_____________|
      _[_____]_
   ___[_______]___
  |               |
  |  [] [] [] []  |
  |______________ |
       |     |
       |_____|
      /       \\
     /_________\\
   RESISTANCE TO
      CHANGE!
              `}
            </pre>
          </div>
        </div>

        {/* Humorous Message */}
        <div className="my-8 space-y-4">
          <h2 className="text-[26px] md:text-[32px] font-[700] text-[#333] mb-4">
            Looks Like This Page Resisted Being Adopted! 😅
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#666] leading-[28px] font-[500] mb-4">
            Just like many organizations face barriers when adopting new technology, this page seems
            to have faced its own adoption challenges... and lost the battle.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 text-left">
            <p className="text-[14px] md:text-[16px] text-[#666] leading-[24px]">
              <strong className="text-[#333]">Common causes of this barrier include:</strong>
              <br />
              • The page moved to a new URL without proper change management
              <br />
              • Insufficient stakeholder buy-in for the page&apos;s existence
              <br />
              • Legacy link that never completed the digital transformation journey
              <br />• Poor URL architecture planning (a classic adoption barrier!)
            </p>
          </div>
          <p className="text-[16px] md:text-[18px] text-[#666] leading-[28px] font-[500]">
            Don&apos;t worry though – unlike failed technology adoption, we can help you find your
            way!
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#007bff] text-white text-[16px] font-[600] rounded-lg hover:bg-[#0056b3] transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Return to Home (No Barriers Here!)
          </Link>
          <Link
            href="/barriers"
            className="inline-block px-8 py-4 bg-[#6c757d] text-white text-[16px] font-[600] rounded-lg hover:bg-[#5a6268] transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Learn About Real Barriers
          </Link>
        </div>

        {/* Additional Humor */}
        <div className="mt-12 text-[14px] text-[#999] italic">
          <p>
            &quot;The only thing worse than a 404 error is trying to implement an ERP system without
            proper training.&quot;
          </p>
          <p className="mt-2">- Every IT Director, probably</p>
        </div>
      </div>
    </div>
  )
}
