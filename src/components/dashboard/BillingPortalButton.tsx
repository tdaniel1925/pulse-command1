"use client"
import { useState } from "react"

interface Props {
  label?: string
  icon?: React.ReactNode
}

export function BillingPortalButton({ label = "Manage Subscription", icon }: Props) {
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
      className="inline-flex items-center gap-1 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
    >
      {icon}
      {loading ? 'Loading...' : label}
    </button>
  )
}
