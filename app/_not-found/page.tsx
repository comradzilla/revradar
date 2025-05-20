'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading 404...</div>}>
      <Safe404 />
    </Suspense>
  )
}

function Safe404() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || 'unknown'

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600">We couldn’t find what you were looking for.</p>
      <p className="mt-4 text-sm text-gray-400">Came from: {from}</p>
    </div>
  )
}