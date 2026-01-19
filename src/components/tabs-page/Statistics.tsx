import React from 'react'

import metricsData from '@/data/qualtrics-metrics.json'
import { getSurveysCompletedCount } from '@/lib/qualtricsStats'

/**
 * Statistics Section
 * Simple counters matching live site style
 */
const Statistics = () => {
  const surveysCompleted = getSurveysCompletedCount(metricsData.responseCounts)

  return (
    <section id="statistics" className="w-full py-[80px] bg-white">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        {/* Statistics Grid - No cards, just text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] text-center">
          {/* Surveys Completed */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">
              Surveys Completed
            </h3>
            <div className="text-[60px] font-bold text-[#2EA3F2] mb-[5px] leading-none">
              {surveysCompleted.toLocaleString()}
            </div>
          </div>

          {/* Funds Raised */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">$ Raised</h3>
            <div className="text-[60px] font-bold text-[#F57C20] mb-[5px] leading-none">$0</div>
          </div>

          {/* Hours Volunteered */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">
              Hours Volunteered
            </h3>
            <div className="text-[60px] font-bold text-[#5FB38D] mb-[5px] leading-none">0</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Statistics
