'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Client component that performs the JavaScript redirect and renders a
 * <noscript> meta-refresh fallback for no-JS environments.
 */
export default function RedirectClient() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/making-of-tabs/mind-maps/literature-review')
  }, [router])

  return (
    <noscript>
      <meta httpEquiv="refresh" content="0;url=/making-of-tabs/mind-maps/literature-review" />
    </noscript>
  )
}
