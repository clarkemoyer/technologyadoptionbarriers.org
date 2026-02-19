import impactData from '@/data/impact.json'
import metricsData from '@/data/qualtrics-metrics.json'
import { getSurveysCompletedCount } from '@/lib/qualtricsStats'

/**
 * Statistics Section
 * Simple counters matching live site style
 */
const Statistics = () => {
  const surveysCompleted = getSurveysCompletedCount(metricsData.responseCounts)
  const activeVisitors = parseInt(impactData.activeUsers) || 0

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
              {metricsData.questionCount > 0 ? metricsData.questionCount.toLocaleString() : '—'}
            </div>
          </div>

          {/* Active Visitors */}
          <div>
            <h3 className="text-[32px] font-bold text-gray-900 mb-[10px] font-serif">
              Active Visitors
            </h3>
            <div className="text-[60px] font-bold text-tabs-green mb-[5px] leading-none">
              {activeVisitors.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Statistics
