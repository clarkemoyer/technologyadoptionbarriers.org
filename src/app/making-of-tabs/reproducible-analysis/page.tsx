'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReproducibleAnalysisRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/results/reproducibility')
  }, [router])

  return (
    <main className="pt-20 sm:pt-[120px] min-h-screen bg-white flex items-start justify-center">
      <div className="text-center mt-20">
        <p className="text-gray-600">
          This page has moved to{' '}
          <Link href="/results/reproducibility" className="text-blue-600 hover:underline">
            /results/reproducibility
          </Link>
        </p>
      </div>
    </main>
  )
}
