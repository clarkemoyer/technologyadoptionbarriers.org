'use client'

import React from 'react'
import impactData from '../../data/impact.json'

// Only show if we have valid data
const showStats =
  impactData && (parseInt(impactData.activeUsers) > 0 || parseInt(impactData.pageViews) > 0)

export const ImpactCounter = () => {
  if (!showStats) return null

  return (
    <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
      <div className="font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
        Impact (Last 28 Days)
      </div>
      <div>
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {parseInt(impactData.activeUsers).toLocaleString()}
        </span>{' '}
        Researchers Helped
      </div>
      <div>
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {parseInt(impactData.pageViews).toLocaleString()}
        </span>{' '}
        Page Views
      </div>
      <div className="text-[10px] opacity-70">
        Updated: {new Date(impactData.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
