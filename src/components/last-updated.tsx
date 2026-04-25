'use client'

/**
 * Display a "Last Updated" timestamp formatted in Eastern Time.
 *
 * Accepts an ISO 8601 UTC string (e.g. from pipeline JSON) and renders it
 * as a human-readable Eastern Time string.  Falls back to a dash if the
 * timestamp is missing or unparseable.
 */

interface LastUpdatedProps {
  /** ISO 8601 UTC timestamp string, e.g. "2026-04-04T09:00:00Z" */
  utcTimestamp?: string | null
  className?: string
}

export default function LastUpdated({ utcTimestamp, className }: LastUpdatedProps) {
  if (!utcTimestamp) {
    return null
  }

  let display = '-'
  try {
    const date = new Date(utcTimestamp)
    if (!isNaN(date.getTime())) {
      display = date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      })
    }
  } catch {
    display = '-'
  }

  return <p className={className ?? 'text-xs text-gray-400 mt-2'}>Last updated: {display}</p>
}
