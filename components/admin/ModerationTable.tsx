'use client'

import React, { useState } from 'react'
import {
  Check,
  X,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Story, StoryLanguage, ContentRating } from '@/types/database'

interface ModerationTableProps {
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

export function ModerationTable({ initialStories }: ModerationTableProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (storyId: string, action: 'approve' | 'reject') => {
    setProcessingId(storyId)

    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Moderation action failed.')
      }

      setStories((prev) => prev.filter((s) => s.id !== storyId))
      if (selectedStory?.id === storyId) {
        setSelectedStory(null)
      }

      showToast(
        'success',
        action === 'approve'
          ? 'Story approved and published to live feed!'
          : 'Story rejected.'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.'
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

      {/* Table Container */}
      {stories.length > 0 ? (
        <div className="fantasy-card rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181b] border-b border-zinc-800 text-zinc-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Title & Teaser</th>
                  <th className="py-3.5 px-3">Author</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Language</th>
                  <th className="py-3.5 px-3">Rating</th>
                  <th className="py-3.5 px-3">Submitted</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {stories.map((story) => {
                  const isProcessing = processingId === story.id
                  return (
                    <tr
                      key={story.id}
                      className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStory(story)}
                    >
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <p className="font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                          {story.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {story.summary || story.content.slice(0, 80) + '...'}
                        </p>
                      </td>

                      <td className="py-4 px-3 text-zinc-300 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-500" />
                          {story.author_id.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium uppercase text-[10px]">
                          {story.category}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] border ${getLanguageBadgeStyle(
                            story.language
                          )}`}
                        >
                          {story.language}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getRatingBadgeStyle(
                            story.content_rating
                          )}`}
                        >
                          {story.content_rating}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-zinc-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()} // Prevent row click opening modal
                        >
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAction(story.id, 'approve')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Approve story"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAction(story.id, 'reject')}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-900 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-[11px] transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Reject story"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl border border-zinc-800 bg-[#121216]/60">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">Moderation Queue Clear</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            There are currently no pending user-submitted stories awaiting review.
          </p>
        </div>
      )}

      {/* Slide-Over Inspection Modal for Full Submission */}
      {selectedStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="absolute inset-0" onClick={() => setSelectedStory(null)} />

          <div className="relative w-full max-w-2xl h-full bg-[#121216] border-l border-zinc-800 p-8 overflow-y-auto flex flex-col justify-between space-y-6 z-10 shadow-2xl">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-zinc-800 text-zinc-200">
                    {selectedStory.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase border ${getLanguageBadgeStyle(
                      selectedStory.language
                    )}`}
                  >
                    {selectedStory.language}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getRatingBadgeStyle(
                      selectedStory.content_rating
                    )}`}
                  >
                    {selectedStory.content_rating}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {selectedStory.title}
              </h2>

              <p className="text-xs text-zinc-400 flex items-center gap-2 mb-6">
                <span>Author ID: <code className="text-zinc-200">{selectedStory.author_id}</code></span>
                <span>•</span>
                <span>Submitted: {new Date(selectedStory.created_at).toLocaleString()}</span>
              </p>

              {selectedStory.summary && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs italic text-zinc-300 mb-6">
                  &ldquo;{selectedStory.summary}&rdquo;
                </div>
              )}

              {/* Full Content */}
              <div className="font-serif text-sm text-zinc-200 leading-relaxed space-y-4">
                {selectedStory.content.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="pt-6 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-[#121216]">
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleAction(selectedStory.id, 'reject')}
                className="px-4 py-2 rounded-xl border border-rose-900 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>

              <button
                type="button"
                onClick={() => handleAction(selectedStory.id, 'approve')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs crimson-glow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
