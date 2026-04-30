'use client'

import { useState } from 'react'

interface Props {
  planId: string
  currentPlan: string
}

export function UpgradePlanButton({ planId, currentPlan }: Props) {
  const [loading, setLoading] = useState(false)

  const isCurrent = planId === currentPlan

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned', data)
        setLoading(false)
      }
    } catch (err) {
      console.error('Upgrade error', err)
      setLoading(false)
    }
  }

  if (isCurrent) {
    return (
      <div className="w-full py-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold text-center">
        Current Plan
      </div>
    )
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {loading ? 'Redirecting...' : 'Upgrade'}
    </button>
  )
}
