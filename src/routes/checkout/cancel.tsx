// @ts-nocheck
import { createFileRoute, useRouter } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/checkout/cancel')({
  component: CancelPage,
})

function CancelPage() {
  const { history } = useRouter()
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Payment canceled</h1>
      <p className="text-gray-700">Your checkout was canceled. You can try again.</p>
      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          onClick={() => history.back()}
        >
          Go back
        </button>
      </div>
    </div>
  )
}
