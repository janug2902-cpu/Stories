'use client'

import React, { useState } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'

export function AdminQuickLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleQuickLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      if (res.ok) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/admin?dev_admin=true'
      }
    } catch {
      window.location.href = '/admin?dev_admin=true'
    }
  }

  return (
    <button
      type="button"
      onClick={handleQuickLogin}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold crimson-glow transition-all hover:scale-105 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Logging in as Admin...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-4 h-4" />
          <span>1-Click Admin Quick Login (तुरंत एडमिन लॉगिन करें)</span>
        </>
      )}
    </button>
  )
}
