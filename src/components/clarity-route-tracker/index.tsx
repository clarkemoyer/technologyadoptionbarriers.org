'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Extend Window interface to include clarity
declare global {
  interface Window {
    clarity?: (command: string, ...args: string[]) => void
  }
}

/**
 * ClarityRouteTracker
 *
 * Tracks route changes in Next.js and sends page view events to Microsoft Clarity.
 * This is necessary because Clarity doesn't automatically track client-side navigation
 * in single-page applications (SPAs) like Next.js.
 *
 * Must be used as a client component and should be placed in the root layout.
 */
export default function ClarityRouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Check if Clarity is loaded
    if (typeof window.clarity === 'function') {
      // Get the full URL including basePath
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      // Normalize the path to avoid double slashes
      const fullPath = basePath && pathname !== '/' ? basePath + pathname : basePath || pathname

      // Notify Clarity of the page view
      // Using 'set' command with 'page' parameter to update the current page URL
      window.clarity('set', 'page', fullPath)
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
