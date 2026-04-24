import Link from 'next/link'
import sensitivityData from '@/data/sensitivity-analysis.json'

/**
 * Live Results Section
 * Displays top 3 barriers from survey data with link to full results
 */
const LiveResults = () => {
  // Get top 3 barriers by count without mutating imported JSON data
  const top3Barriers = sensitivityData.top3_pick_counts.items_sorted_desc.slice(0, 3)

  const totalN = sensitivityData.top3_pick_counts.total_n

  return (
    <section id="live-results" className="w-full py-[80px] bg-gray-50">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        {/* Section Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[48px] font-bold text-gray-900 mb-[20px] font-serif">
            Live Results: Top Barriers
          </h2>
          <p className="text-[20px] text-gray-700 max-w-[800px] mx-auto">
            Based on responses from {totalN.toLocaleString()} verified participants, here are the
            most commonly identified technology adoption barriers.
          </p>
        </div>

        {/* Top 3 Barriers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] mb-[60px]">
          {top3Barriers.map((barrier, index) => (
            <div
              key={barrier.item}
              className="bg-white rounded-lg border border-gray-200 p-[30px] shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-[20px]">
                <div className="w-[50px] h-[50px] rounded-full bg-tabs-blue text-white flex items-center justify-center text-[24px] font-bold">
                  {index + 1}
                </div>
                <div className="text-right">
                  <div className="text-[28px] font-bold text-tabs-orange">{barrier.count}</div>
                  <div className="text-[14px] text-gray-600">
                    {typeof barrier.pct === 'number' ? `${barrier.pct.toFixed(1)}%` : '—'}
                  </div>
                </div>
              </div>

              {/* Barrier Text */}
              <p className="text-[16px] text-gray-800 leading-relaxed">{barrier.text}</p>
            </div>
          ))}
        </div>

        {/* CTA to Full Results */}
        <div className="text-center">
          <Link
            href="/results"
            className="inline-flex items-center gap-[12px] bg-tabs-blue text-white px-[40px] py-[16px] rounded-lg text-[18px] font-semibold hover:bg-tabs-navy transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            View All Results & Analysis
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-[14px] text-gray-600 mt-[16px]">
            Explore detailed analysis, cross-tabulations, and statistical findings
          </p>
        </div>
      </div>
    </section>
  )
}

export default LiveResults
