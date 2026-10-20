'use client'

import React, { useState, useSyncExternalStore } from 'react'
import { ShieldAlert, Lock, ArrowRight, XCircle } from 'lucide-react'

// Dummy subscriber for external cookie store
const noopSubscribe = () => () => {}

// Client snapshot: checks if age_verified cookie is set to 'true'
const getCookieSnapshot = (): boolean => {
  if (typeof document === 'undefined') return true
  const cookies = document.cookie.split(';')
  return cookies.some((cookie) => {
    const [key, value] = cookie.trim().split('=')
    return key === 'age_verified' && value === 'true'
  })
}

// Server snapshot: defaults to true during SSR to completely prevent hydration mismatch
const getServerSnapshot = (): boolean => true

/**
 * AgeGateModal enforces an unclosable 18+ age verification check.
 * - Stores age_verified=true cookie valid for 30 days upon consent.
 * - Redirects to Google on exit.
 * - Uses useSyncExternalStore to guarantee zero hydration mismatch.
 */
export function AgeGateModal() {
  const isCookieVerified = useSyncExternalStore(
    noopSubscribe,
    getCookieSnapshot,
    getServerSnapshot
  )
  const [hasDismissed, setHasDismissed] = useState(false)

  // If cookie verified or user just accepted in current session, do not render
  if (isCookieVerified || hasDismissed) {
    return null
  }

  const handleAccept = () => {
    // 30 days cookie expiration
    const maxAge = 60 * 60 * 24 * 30
    document.cookie = `age_verified=true; path=/; max-age=${maxAge}; SameSite=Lax`
    setHasDismissed(true)
  }

  const handleExit = () => {
    window.location.href = 'https://www.google.com'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-rose-900/60 bg-[#121216] p-8 text-center shadow-[0_0_50px_-10px_rgba(225,29,72,0.4)]">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-600/25 blur-3xl rounded-full pointer-events-none" />

        {/* Warning Badge & Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-800/80 crimson-glow-sm">
          <ShieldAlert className="h-9 w-9 text-rose-500 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-800/50 text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-4">
          <Lock className="w-3 h-3 text-rose-400" /> 18+ Restricted Adult Realm
        </div>

        <h2
          id="age-gate-title"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4"
        >
          Age Verification Required
        </h2>

        {/* Mandatory Legal Warning */}
        <p className="text-sm sm:text-base leading-relaxed text-zinc-300 mb-8 px-2 font-normal">
          This website contains sexually explicit content and mature themes. You must be at least 18
          years old (or the legal age of majority in your jurisdiction) to enter.
        </p>

        {/* Legal Disclaimer Box */}
        <div className="mb-8 rounded-xl border border-zinc-800 bg-[#09090b]/80 p-4 text-xs text-zinc-400 text-left">
          <p className="leading-relaxed">
            By clicking <strong className="text-zinc-200">&ldquo;I am 18 or Older - Enter&rdquo;</strong>,
            you acknowledge you are viewing voluntary adult erotic literature, agree to our terms,
            and certify that viewing adult content is legal in your locale.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleExit}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-all"
          >
            <XCircle className="w-4 h-4 text-zinc-400" />
            Exit
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm crimson-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            I am 18 or Older - Enter
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
