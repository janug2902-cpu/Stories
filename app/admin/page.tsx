import React, { Suspense } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  Terminal,
  Sparkles,
} from 'lucide-react'
import { verifyAdminSession } from '@/lib/supabase/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import {
  AdminDashboardClient,
  type AdminMetrics,
} from '@/components/admin/AdminDashboardClient'
import { AdminQuickLoginButton } from '@/components/admin/AdminQuickLoginButton'
import type { Story } from '@/types/database'
import type { AdminReportItem } from '@/components/admin/ReportsManager'

export const metadata = {
  title: 'Admin Control Center | Kinkyomen',
  description: 'Executive Story Creation Factory, UGC Moderation Desk, and Safety Reporting Console.',
}

// Development fallback pending stories
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

const DEMO_OPEN_REPORTS: AdminReportItem[] = [
  {
    id: 'report-demo-1',
    story_id: 'pending-demo-1',
    reporter_id: 'user-demo-reporter',
    reason: 'Incorrect content rating tag: Contains intense explicit scenes marked as spicy.',
    status: 'open',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    stories: {
      id: 'pending-demo-1',
      title: 'Shadows in the Monsoon Courtyard',
      language: 'hinglish',
      category: 'romance',
      content_rating: 'spicy',
    },
  },
]

interface AdminPageProps {
  searchParams: Promise<{
    dev_admin?: string
    tab?: 'factory' | 'compose' | 'submissions' | 'reports'
  }>
}

function AdminSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-zinc-800 rounded-full" />
          <div className="h-8 w-64 bg-zinc-800 rounded-xl" />
          <div className="h-4 w-96 bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-zinc-800 rounded-xl" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-8 w-14 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="h-12 w-96 bg-zinc-900 rounded-xl border border-zinc-800" />

      {/* Content Skeleton */}
      <div className="h-96 rounded-2xl bg-zinc-900 border border-zinc-800" />
    </div>
  )
}

async function AdminDashboardLoader({ searchParams }: AdminPageProps) {
  const resolvedParams = await searchParams
  const { user, profile, isAdmin } = await verifyAdminSession()

  // Development admin override for fast local validation
  let isAuthorized = isAdmin
  if (!isAuthorized && process.env.NODE_ENV === 'development' && resolvedParams.dev_admin === 'true') {
    isAuthorized = true
  }

  // 1. Strict Security Rule: 403 Forbidden Screen
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-500 crimson-glow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-900 text-xs font-semibold text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" /> 403 Forbidden Access
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Admin Control Center
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
          Access to this area requires an authenticated user session with the{' '}
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
            {`UPDATE public.profiles SET role = 'admin' WHERE id = '${user?.id || 'your-user-uuid-here'}';`}
          </pre>
          <p className="text-[11px] text-zinc-500">
            Current user session ID:{' '}
            <span className="font-mono text-zinc-300">{user?.id || 'None (Please log in first)'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <AdminQuickLoginButton />
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Feed
          </Link>
          <Link
            href="/admin?dev_admin=true"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Direct Dev Bypass
          </Link>
        </div>
      </div>
    )
  }

  // 2. Privileged Data Fetching
  const adminClient = await createAdminClient()

  // Metrics query
  const [
    { count: totalPublishedCount },
    { count: pendingCount },
    { count: openReportsCount },
    { count: usersCount },
    { data: pendingStoriesData },
    { data: reportsData },
  ] = await Promise.all([
    adminClient
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    adminClient
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    adminClient
      .from('stories')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    adminClient
      .from('reports')
      .select('*, stories (id, title, language, category, content_rating)')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
  ])

  // Process pending stories (with dev fallback if empty in local testing)
  let pendingStories: Story[] = pendingStoriesData || []
  if (pendingStories.length === 0 && process.env.NODE_ENV === 'development' && resolvedParams.dev_admin === 'true') {
    pendingStories = DEMO_PENDING_STORIES
  }

  // Process open reports (with dev fallback if empty in local testing)
  let openReports: AdminReportItem[] = (reportsData as unknown as AdminReportItem[]) || []
  if (openReports.length === 0 && process.env.NODE_ENV === 'development' && resolvedParams.dev_admin === 'true') {
    openReports = DEMO_OPEN_REPORTS
  }

  const metrics: AdminMetrics = {
    totalPublished: totalPublishedCount ?? 0,
    pendingSubmissions: pendingCount ?? pendingStories.length,
    openReports: openReportsCount ?? openReports.length,
    totalUsers: usersCount ?? (user ? 1 : 0),
  }

  return (
    <AdminDashboardClient
      metrics={metrics}
      pendingStories={pendingStories}
      openReports={openReports}
      adminProfile={profile}
      initialTab={resolvedParams.tab || 'factory'}
    />
  )
}

export default function AdminPage(props: AdminPageProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<AdminSkeleton />}>
          <AdminDashboardLoader searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
