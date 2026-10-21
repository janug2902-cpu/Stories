'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Star,
  Send,
  Heart,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { StoryComment } from '@/app/api/stories/comments/route'

interface StoryCommentsProps {
  storyId: string
  storyTitle?: string
}

export function StoryComments({ storyId }: StoryCommentsProps) {
  const [comments, setComments] = useState<StoryComment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set())

  // Form State
  const [authorName, setAuthorName] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  // Fetch comments on mount
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetch(`/api/stories/comments?storyId=${encodeURIComponent(storyId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.comments) {
          setComments(data.comments)
        }
      })
      .catch((err) => {
        console.warn('Could not load comments:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [storyId])

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/stories/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          authorName: authorName.trim() || 'अनाम पाठक (Reader)',
          content: content.trim(),
          rating,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'प्रतिक्रिया भेजने में समस्या आई।')
      }

      if (data.comment) {
        setComments((prev) => [data.comment, ...prev])
        setContent('')
        setSubmitSuccess(true)
        setTimeout(() => setSubmitSuccess(false), 3500)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'प्रतिक्रिया पोस्ट नहीं हो सकी।'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Like comment
  const handleLikeComment = (commentId: string) => {
    if (likedCommentIds.has(commentId)) return

    setLikedCommentIds((prev) => new Set(prev).add(commentId))
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c))
    )
  }

  // Format relative date
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
      if (diffSec < 60) return 'अभी-अभी'
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin} मिनट पहले`
      const diffHours = Math.floor(diffMin / 60)
      if (diffHours < 24) return `${diffHours} घंटे पहले`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} दिन पहले`
    } catch {
      return 'हाल ही में'
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-zinc-800/80 text-[#f4f4f5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center crimson-glow-sm">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg sm:text-xl flex items-center gap-2">
              पाठकों की प्रतिक्रियाएँ
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                {comments.length} Comments
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              इस कहानी पर अपनी राय, अनुभव और अहसास साझा करें
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>सच्ची व बेबाक राय</span>
        </div>
      </div>

      {/* Write Comment Box */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-rose-900/40 bg-[#140f17]/90 p-5 sm:p-6 mb-8 shadow-xl backdrop-blur-md space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Name input */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              आपका नाम या उपनाम (Name / Nickname):
            </label>
            <div className="relative">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="उदा. प्रिया, राहुल, देसी लवर..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                maxLength={40}
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              कहानी की रेटिंग (Rating):
            </label>
            <div className="flex items-center gap-1 py-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-zinc-600 hover:scale-110 transition-transform cursor-pointer"
                  title={`${star} Star`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-amber-400 font-semibold ml-1.5">
                {rating}/5
              </span>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            आपकी प्रतिक्रिया (Your Thoughts / Feelings):
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="कहानी आपको कैसी लगी? कौन सा सीन दिल को छू गया? अपने दिल की बात यहाँ बेझिझक लिखें..."
            rows={3}
            className="w-full p-3 text-xs sm:text-sm rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            maxLength={800}
            required
          />
          <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1">
            <span>सभ्य और सकारात्मक माहौल बनाए रखें</span>
            <span>{content.length}/800</span>
          </div>
        </div>

        {/* Error / Success Messages */}
        {submitError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>आपकी प्रतिक्रिया सफलतापूर्वक पोस्ट हो गई है! धन्यवाद।</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs crimson-glow transition-all hover:scale-105 cursor-pointer"
          >
            {isSubmitting ? (
              <span>भेज रहे हैं...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>प्रतिक्रिया पोस्ट करें (Post Comment)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-zinc-800 bg-[#121216]/50">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              अभी तक कोई प्रतिक्रिया नहीं आई है। आप पहले पाठक बनें और अपनी राय लिखें!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const hasLiked = likedCommentIds.has(comment.id)
            const initials = (comment.author_name || 'U')
              .slice(0, 2)
              .toUpperCase()

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-zinc-800/80 bg-[#131118]/80 p-4 sm:p-5 hover:border-rose-900/50 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    {/* Avatar Circle */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-900/60 via-purple-900/50 to-zinc-900 border border-rose-800/50 flex items-center justify-center text-xs font-bold text-rose-200">
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-zinc-100">
                          {comment.author_name}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/70 text-zinc-400 border border-zinc-700/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          सत्यापित पाठक
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (comment.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-12 pr-2">
                  {comment.content}
                </p>

                {/* Like Button on Comment */}
                <div className="flex justify-end items-center mt-3 pt-2.5 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => handleLikeComment(comment.id)}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      hasLiked
                        ? 'border-rose-800 bg-rose-950/60 text-rose-300'
                        : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasLiked ? 'text-rose-500 fill-rose-500' : 'text-zinc-500'
                      }`}
                    />
                    <span>{comment.likes_count}</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
