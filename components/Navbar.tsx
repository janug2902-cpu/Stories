'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Flame,
  Sparkles,
  PenTool,
  LogOut,
  User as UserIcon,
  LogIn,
  Home,
  Menu,
  X,
  Coins,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/AuthModal'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data as Profile)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Initial user fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(user.id)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    // Global listener so other components can trigger the modal
    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: 'signin' | 'signup' }>
      if (customEvent.detail?.mode) {
        setAuthMode(customEvent.detail.mode)
      }
      setIsAuthOpen(true)
    }

    window.addEventListener('open-auth-modal', handleOpenAuth)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('open-auth-modal', handleOpenAuth)
    }
  }, [fetchProfile])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const openSignIn = () => {
    setAuthMode('signin')
    setIsAuthOpen(true)
  }

  const openSignUp = () => {
    setAuthMode('signup')
    setIsAuthOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-700 to-rose-500 flex items-center justify-center crimson-glow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors flex items-center gap-1">
                DesiFantasy <span className="text-rose-500 font-serif italic text-xs">/ VelvetTales</span>
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                Adult Romance & Taboo Realm
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-900/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>

            <Link
              href="/generate"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/generate'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-900/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> AI Generator
            </Link>

            <Link
              href="/write"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/write'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-900/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-rose-400" /> Write Story
            </Link>
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* AI Quota Badge */}
                <div
                  title="Daily AI Story Generation Credits remaining"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-900/60 text-rose-300 text-xs font-medium shadow-sm"
                >
                  <Coins className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    <strong className="text-white font-semibold">
                      {profile?.daily_ai_quota ?? 5}
                    </strong>{' '}
                    Credits
                  </span>
                </div>

                {/* User Pen Name */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200">
                  <UserIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span className="max-w-[120px] truncate">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out of account"
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openSignIn}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={openSignUp}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white crimson-glow-sm hover:scale-[1.02] transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Join
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-900/60 text-rose-300 text-[11px] font-semibold">
                <Coins className="w-3 h-3 text-rose-400" />
                <span>{profile?.daily_ai_quota ?? 5}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-[#121216] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Home
            </Link>
            <Link
              href="/generate"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-rose-400" /> AI Generator
            </Link>
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
            >
              <PenTool className="w-4 h-4 text-rose-400" /> Write Story
            </Link>

            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-400 bg-zinc-900/80 rounded-lg">
                    <span>Pen Name: <strong className="text-zinc-200">{profile?.username || user.email?.split('@')[0]}</strong></span>
                    <span className="text-rose-400 font-semibold">{profile?.daily_ai_quota ?? 5} Credits left</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-zinc-700 text-rose-400 hover:bg-zinc-800 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openSignIn()
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:text-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      openSignUp()
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          const supabase = createClient()
          supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            if (user) fetchProfile(user.id)
          })
        }}
      />
    </>
  )
}
