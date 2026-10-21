'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Check,
  User,
  Clock,
  ExternalLink,
  Loader2,
  Flag,
} from 'lucide-react'
import type { Report } from '@/types/database'

export interface AdminReportItem extends Report {
  stories?: {
    id: string
    title: string
    language: string
    category: string
    content_rating: string
  } | null
}

interface ReportsManagerProps {
  initialReports: AdminReportItem[]
}

export function ReportsManager({ initialReports }: ReportsManagerProps) {
  const [reports, setReports] = useState<AdminReportItem[]>(initialReports)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (
    reportId: string,
    action: 'dismiss' | 'delete_story',
    storyId?: string
  ) => {
    setProcessingId(reportId)

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, storyId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Action failed.')
      }

      setReports((prev) => prev.filter((r) => r.id !== reportId))
      showToast('success', data.message || 'Report processed successfully.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report action failed'
      showToast('error', msg)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'border-emerald-800 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-800 bg-rose-950/90 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.text}</span>
        </div>
      )}

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => {
            const isProcessing = processingId === report.id
            const storyTitle = report.stories?.title || 'Unknown / Deleted Story'
            const storyId = report.story_id

            return (
              <div
                key={report.id}
                className="fantasy-card rounded-2xl p-6 border border-zinc-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Flag className="w-3 h-3 text-rose-400" /> Safe-Harbor Report
                      </span>
                      <span className="text-xs text-zinc-500 font-mono text-[11px]">
                        ID: {report.id.slice(0, 8)}...
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Reported Tale:</span>
                      <span className="text-rose-400 font-serif">{storyTitle}</span>
                      {report.stories?.id && (
                        <Link
                          href={`/read/${report.stories.id}`}
                          target="_blank"
                          className="text-zinc-500 hover:text-white"
                          title="Open story in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </h4>

                    {/* Report Reason Box */}
                    <div className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/30 text-xs text-rose-200 leading-relaxed">
                      <strong className="text-rose-400 block mb-1">Reason Stated:</strong>
                      {report.reason}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        Reporter: <code className="text-zinc-300 font-mono text-[10px]">{report.reporter_id.slice(0, 8)}...</code>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Reported on: {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(report.id, 'dismiss')}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      Dismiss Report
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(report.id, 'delete_story', storyId)}
                      className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 crimson-glow-sm transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Story
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl border border-zinc-800 bg-[#121216]/60">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">Zero Safety Flags</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All user reports have been resolved. The safe-harbor compliance inbox is clear.
          </p>
        </div>
      )}
    </div>
  )
}
