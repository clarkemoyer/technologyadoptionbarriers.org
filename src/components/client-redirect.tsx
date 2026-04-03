'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientRedirect({ to }: { to: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(to)
  }, [router, to])

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white flex items-start justify-center">
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${to}`} />
      </noscript>
      <div className="text-center mt-20">
        <p className="text-gray-600">
          This page has moved to{' '}
          <Link href={to} className="text-blue-600 hover:underline">
            {to}
          </Link>
        </p>
      </div>
    </main>
  )
}
