import dispositionData from '@/data/disposition-summary.json'
import impactData from '@/data/impact.json'
import { TOTAL_ITEMS_PRESENTED } from '@/lib/tabs-survey-constants'

/**
 * Statistics Section
 * Simple counters matching live site style
 */
const Statistics = () => {
  // Prolific-approved submissions from the daily disposition pipeline.
  const surveysCompleted = dispositionData.completionProgress.approved
  // Production hostname visitors (excludes localhost/CI/Playwright test traffic).
  const verifiedVisitors = parseInt(impactData.verifiedVisitors, 10) || 0

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
            <div className="text-[60px] font-bold text-tabs-blue mb-[5px] leading-none">
              {surveysCompleted.toLocaleString()}
            </div>
          </div>

          {/* Survey Questions */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">
              Survey Questions
            </h3>
            <div className="text-[60px] font-bold text-tabs-orange mb-[5px] leading-none">
              {TOTAL_ITEMS_PRESENTED.toLocaleString()}
            </div>
          </div>

          {/* Verified Visitors */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">
              Verified Visitors
            </h3>
            <div className="text-[60px] font-bold text-tabs-green mb-[5px] leading-none">
              {verifiedVisitors.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Statistics
