'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  AlertTriangle,
  FileText,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { Story, StoryLanguage, ContentRating } from '@/types/database'

interface AdminModerationClientProps {
  initialStories: Story[]
}

function getLanguageBadgeStyle(language: StoryLanguage) {
  switch (language) {
    case 'english':
      return 'bg-sky-950/80 text-sky-300 border-sky-800/60'
    case 'hindi':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
    case 'hinglish':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60'
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
}

function getRatingBadgeStyle(rating: ContentRating) {
  switch (rating) {
    case 'explicit':
      return 'bg-rose-950/90 text-rose-300 border-rose-800/70'
    case 'spicy':
      return 'bg-amber-950/90 text-amber-300 border-amber-800/70'
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
}

export function AdminModerationClient({ initialStories }: AdminModerationClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(
    initialStories.length > 0 ? initialStories[0].id : null
  )
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [approvedCount, setApprovedCount] = useState<number>(0)
  const [rejectedCount, setRejectedCount] = useState<number>(0)
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const handleModerate = async (storyId: string, action: 'approve' | 'reject') => {
    setProcessingId(storyId)

    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Moderation request failed')
      }

      // Remove the reviewed story from the pending queue
      setStories((prev) => prev.filter((s) => s.id !== storyId))

      if (action === 'approve') {
        setApprovedCount((c) => c + 1)
        showToast('success', 'Story approved! It is now live on the public feed.')
      } else {
        setRejectedCount((c) => c + 1)
        showToast('error', 'Story rejected and removed from public queue.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to moderate story.'
      showToast('error', msg)
    } finally {
      setProcessingId(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedStoryId((current) => (current === id ? null : id))
  }

  return (
    <div className="space-y-8">
      {/* Moderation Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Pending Submissions
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{stories.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Approved This Session
            </span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Rejected This Session
            </span>
            <p className="text-3xl font-extrabold text-rose-400 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300 ${
            toastMessage.type === 'success'
              ? 'border-emerald-800/80 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-800/80 bg-rose-950/90 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Stories List or Clear State */}
      {stories.length > 0 ? (
        <div className="space-y-6">
          {stories.map((story) => {
            const isExpanded = expandedStoryId === story.id
            const isProcessing = processingId === story.id
            const wordCount = story.content ? story.content.trim().split(/\s+/).length : 0

            return (
              <div
                key={story.id}
                className="fantasy-card rounded-2xl border border-zinc-800 overflow-hidden transition-all"
              >
                {/* Header row */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121216]/90">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {story.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getLanguageBadgeStyle(
                          story.language
                        )}`}
                      >
                        {story.language}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getRatingBadgeStyle(
                          story.content_rating
                        )}`}
                      >
                        {story.content_rating}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                        <FileText className="w-3 h-3" /> {wordCount} words
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-snug">{story.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        Author ID: <code className="text-zinc-300 font-mono text-[10px]">{story.author_id.slice(0, 8)}...</code>
                      </span>
                      <span>•</span>
                      <span>Submitted: {new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleModerate(story.id, 'approve')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-950/50 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleModerate(story.id, 'reject')}
                      className="px-4 py-2.5 rounded-xl border border-rose-900/80 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(story.id)}
                      className="p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse Content' : 'Expand Full Story'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary Section */}
                {story.summary && (
                  <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-xs text-zinc-400 italic">
                    &ldquo;{story.summary}&rdquo;
                  </div>
                )}

                {/* Expanded Full Content Preview */}
                {isExpanded && (
                  <div className="p-6 border-t border-zinc-800 bg-[#09090b] space-y-4 font-serif text-sm text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-sans text-zinc-500">
                      <span>Full Submission Text Preview</span>
                      <span>{wordCount} Words Total</span>
                    </div>
                    {story.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty Queue State */
        <div className="text-center py-20 px-6 rounded-2xl border border-zinc-800/80 bg-[#121216]/50">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Moderation Queue Clear</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            All user-submitted stories have been reviewed. New UGC tales will appear here for compliance review before public display.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:border-zinc-500"
          >
            Return to Public Feed
          </Link>
        </div>
      )}
    </div>
  )
}
