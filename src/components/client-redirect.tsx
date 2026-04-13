'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientRedirect({ to }: { to: string }) {
  const router = useRouter()
  useEffect(() => {
    const search = window.location.search
    const hash = window.location.hash
    router.replace(to + search + hash)
  }, [router, to])

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white flex items-start justify-center">
      <div className="text-center mt-20">
        <p className="text-gray-600">
          This page has moved to{' '}
          <Link href={to} className="text-blue-600 hover:underline">
            {to}
          </Link>
        </p>
        <noscript>
          <p className="mt-4 text-gray-600">
            JavaScript is disabled. Please use the link above to continue.
          </p>
        </noscript>
      </div>
    </main>
  )
}
