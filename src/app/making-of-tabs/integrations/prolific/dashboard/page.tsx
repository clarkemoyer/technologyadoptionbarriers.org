'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/results/dashboard')
  }, [router])

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white flex items-start justify-center">
      <div className="text-center mt-20">
        <p className="text-gray-600">
          This page has moved to{' '}
          <Link href="/results/dashboard" className="text-blue-600 hover:underline">
            /results/dashboard
          </Link>
        </p>
      </div>
    </main>
  )
}
