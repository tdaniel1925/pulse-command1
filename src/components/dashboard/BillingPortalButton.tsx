"use client"
import { useState } from "react"

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  )
}
