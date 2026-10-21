'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Wand2,
  FileText,
  ShieldAlert,
  Flame,
  Clock,
  Users,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { AdminAIFactory } from '@/components/admin/AdminAIFactory'
import { ModerationTable } from '@/components/admin/ModerationTable'
import { ReportsManager, type AdminReportItem } from '@/components/admin/ReportsManager'
import type { Story, Profile } from '@/types/database'

export interface AdminMetrics {
  totalPublished: number
  pendingSubmissions: number
  openReports: number
  totalUsers: number
}

interface AdminDashboardClientProps {
  metrics: AdminMetrics
  pendingStories: Story[]
  openReports: AdminReportItem[]
  adminProfile?: Profile | null
  initialTab?: 'factory' | 'submissions' | 'reports'
}

export function AdminDashboardClient({
  metrics,
  pendingStories,
  openReports,
  adminProfile,
  initialTab = 'factory',
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'factory' | 'submissions' | 'reports'>(initialTab)

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-zinc-800/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Executive Console
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">
              Admin: <strong className="text-zinc-200">{adminProfile?.username || 'SuperAdmin'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Instant story creation engine, direct publication pipeline, community UGC moderation desk, and compliance reporting tools.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#121216] hover:bg-zinc-800/80 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            <span>View Live Site</span>
          </Link>
          <Link
            href="/write"
            className="px-3.5 py-2 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Submit UGC</span>
          </Link>
        </div>
      </div>

      {/* Top Header Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Published Stories */}
        <div className="fantasy-card p-5 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-[#16161b] to-[#101014] relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Published Stories
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalPublished.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Active stories visible on feed</p>
        </div>

        {/* Metric 2: Pending Submissions */}
        <div
          onClick={() => setActiveTab('submissions')}
          className={`fantasy-card p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
            activeTab === 'submissions'
              ? 'border-amber-700/80 bg-gradient-to-b from-amber-950/20 to-[#101014]'
              : 'border-zinc-800/80 bg-gradient-to-b from-[#16161b] to-[#101014] hover:border-amber-800/50'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Pending Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.pendingSubmissions.toLocaleString()}
            </span>
            {metrics.pendingSubmissions > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Req.
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
            Click to review submissions <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 3: Open User Reports */}
        <div
          onClick={() => setActiveTab('reports')}
          className={`fantasy-card p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
            activeTab === 'reports'
              ? 'border-rose-700/80 bg-gradient-to-b from-rose-950/20 to-[#101014]'
              : 'border-zinc-800/80 bg-gradient-to-b from-[#16161b] to-[#101014] hover:border-rose-800/50'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-2xl group-hover:bg-rose-600/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Open Safety Reports
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.openReports.toLocaleString()}
            </span>
            {metrics.openReports > 0 ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Unresolved
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Clean
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 group-hover:text-rose-300 transition-colors">
            Click to review reports <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 4: Total Registered Users */}
        <div className="fantasy-card p-5 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-[#16161b] to-[#101014] relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Registered Authors
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalUsers.toLocaleString()}
            </span>
            <span className="text-[11px] text-purple-300 font-medium">Community</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Profiles in Supabase database</p>
        </div>
      </div>

      {/* Tabbed Navigation Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/90 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Tab 1: Story Factory */}
          <button
            type="button"
            onClick={() => setActiveTab('factory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'factory'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Story Factory</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                activeTab === 'factory' ? 'bg-white/20 text-white' : 'bg-rose-950/60 text-rose-300'
              }`}
            >
              Studio
            </span>
          </button>

          {/* Tab 2: User Submissions */}
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'submissions'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>User Submissions</span>
            {pendingStories.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'submissions'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {pendingStories.length}
              </span>
            )}
          </button>

          {/* Tab 3: Safety & Reports */}
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Safety & Reports</span>
            {openReports.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'reports'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {openReports.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'factory' && (
          <section aria-label="Story Factory Tab" className="animate-in fade-in-50 duration-200">
            <AdminAIFactory />
          </section>
        )}

        {activeTab === 'submissions' && (
          <section aria-label="User Submissions Tab" className="animate-in fade-in-50 duration-200">
            <ModerationTable initialStories={pendingStories} />
          </section>
        )}

        {activeTab === 'reports' && (
          <section aria-label="Safety and Reports Tab" className="animate-in fade-in-50 duration-200">
            <ReportsManager initialReports={openReports} />
          </section>
        )}
      </div>
    </div>
  )
}
