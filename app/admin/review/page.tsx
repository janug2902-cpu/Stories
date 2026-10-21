import React, { Suspense } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  KeyRound,
  Terminal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminModerationClient } from '@/components/AdminModerationClient'
import type { Story } from '@/types/database'

export const metadata = {
  title: 'Admin Moderation Desk | Kinkyomen',
  description: 'Review and moderate pending user-submitted stories.',
}

// Fallback pending stories for immediate preview in local testing
const DEMO_PENDING_STORIES: Story[] = [
  {
    id: 'pending-demo-1',
    author_id: 'user-preview-1234',
    title: 'Shadows in the Monsoon Courtyard',
    summary:
      'A late evening downpour traps two estranged lovers in an old family mansion, reigniting passions thought buried.',
    content: `The storm had stripped the power lines by eight in the evening. Thunder rumbled like distant artillery across the terracotta rooftops.

Meera stood by the open veranda, her hand catching the stray sprays of cool rain. Behind her, Vikram’s footsteps were nearly silent against the polished teak floor.

"You haven't changed, Meera," his voice resonated in the darkness, low and unhurried. "Still watching the storm as if it holds all the answers."

"Perhaps it holds the only answers that matter tonight," she replied, not turning around, though the heat of his presence was already prickling against the bare skin of her back.

When he reached out, his fingertips brushed the damp hair away from the curve of her neck. A sharp intake of breath shattered the silence. The distance they had guarded so carefully for five years vanished in a heartbeat, surrendered to the storm and the unbearable electricity between them.`,
    language: 'hinglish',
    category: 'romance',
    content_rating: 'spicy',
    is_ai_generated: false,
    status: 'pending',
    views_count: 0,
    likes_count: 0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

interface AdminReviewPageProps {
  searchParams: Promise<{
    dev_admin?: string
  }>
}

function ModerationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl bg-zinc-900 border border-zinc-800" />
      <div className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800" />
      <div className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800" />
    </div>
  )
}

async function ModerationDesk({ searchParams }: AdminReviewPageProps) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if role is admin in profiles
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      isAdmin = true
    }
  }

  // Allow dev override only during local development if explicitly requested
  if (!isAdmin && process.env.NODE_ENV === 'development' && resolvedParams.dev_admin === 'true') {
    isAdmin = true
  }

  // 2. 403 Forbidden View if user is not an admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-500 crimson-glow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-900 text-xs font-semibold text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" /> 403 Forbidden Access
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Admin Moderation Desk
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
          Access to this dashboard is strictly restricted to accounts with the{' '}
          <strong className="text-rose-400 font-mono">&lsquo;admin&rsquo;</strong> role in the
          Supabase <code className="text-zinc-200">profiles</code> table.
        </p>

        {/* Database Promotion Helper */}
        <div className="text-left rounded-2xl border border-zinc-800 bg-[#121216] p-5 text-xs text-zinc-300 space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-zinc-200">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>How to Grant Admin Access in Supabase SQL Editor:</span>
          </div>
          <pre className="p-3 rounded-xl bg-[#09090b] text-[11px] font-mono text-rose-300 overflow-x-auto border border-zinc-800">
            {`UPDATE public.profiles SET role = 'admin' WHERE id = '${user?.id || 'user-uuid-here'}';`}
          </pre>
          <p className="text-[11px] text-zinc-500">
            Log in with your administrator account or promote your profile in Supabase to continue.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Feed
          </Link>
          {process.env.NODE_ENV === 'development' && (
            <Link
              href="/admin/review?dev_admin=true"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold crimson-glow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" /> Preview as Dev Admin
            </Link>
          )}
        </div>
      </div>
    )
  }

  // 3. Fetch pending stories ordered by created_at ASC
  let pendingStories: Story[] = []

  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (!error && data && data.length > 0) {
      pendingStories = data as Story[]
    } else if (!error && data && data.length === 0) {
      pendingStories = []
    } else {
      // Provide demo pending stories for initial testing in unseeded local development
      pendingStories = DEMO_PENDING_STORIES
    }
  } catch {
    pendingStories = DEMO_PENDING_STORIES
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-semibold text-emerald-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Clearance Granted
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Story Moderation Desk
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review user-submitted stories for compliance with platform guidelines and 18+ standards.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Public Feed
        </Link>
      </div>

      {/* Moderation Client Component */}
      <AdminModerationClient initialStories={pendingStories} />
    </div>
  )
}

export default function AdminReviewPage({ searchParams }: AdminReviewPageProps) {
  return (
    <Suspense fallback={<ModerationSkeleton />}>
      <ModerationDesk searchParams={searchParams} />
    </Suspense>
  )
}
