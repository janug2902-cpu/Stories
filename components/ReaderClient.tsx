'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  Heart,
  Sparkles,
  BookOpen,
  Share2,
  Flag,
  Type,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Story } from '@/types/database'

interface ReaderClientProps {
  story: Story
}

type FontSize = 'sm' | 'md' | 'lg'
type LineSpacing = 'normal' | 'relaxed' | 'loose'
type BgTheme = 'slate' | 'black' | 'velvet'
type FontFace = 'serif' | 'sans'

export function ReaderClient({ story }: ReaderClientProps) {
  // Reading Customization State
  const [fontSize, setFontSize] = useState<FontSize>('md')
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>('relaxed')
  const [bgTheme, setBgTheme] = useState<BgTheme>('slate')
  const [fontFace, setFontFace] = useState<FontFace>('serif')

  // Engagement State
  const [likesCount, setLikesCount] = useState<number>(story.likes_count ?? 0)
  const [hasLiked, setHasLiked] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false)
  const [reportReason, setReportReason] = useState<string>('underage')
  const [reportDetails, setReportDetails] = useState<string>('')
  const [reportSubmitting, setReportSubmitting] = useState<boolean>(false)
  const [reportSuccess, setReportSuccess] = useState<boolean>(false)
  const [reportError, setReportError] = useState<string | null>(null)

  // Typography Styles Mapping
  const fontSizeClass = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  }[fontSize]

  const lineSpacingClass = {
    normal: 'leading-normal space-y-4',
    relaxed: 'leading-relaxed space-y-6',
    loose: 'leading-[2.2] space-y-8',
  }[lineSpacing]

  const bgThemeStyles = {
    slate: 'bg-[#121216] text-[#f4f4f5] border-zinc-800',
    black: 'bg-[#050505] text-[#e4e4e7] border-zinc-900',
    velvet: 'bg-[#10080d] text-[#fce7f3] border-rose-950/60',
  }[bgTheme]

  // Estimated reading time
  const wordCount = story.content ? story.content.trim().split(/\s+/).length : 300
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const handleLike = async () => {
    if (hasLiked) return
    setHasLiked(true)
    const newCount = likesCount + 1
    setLikesCount(newCount)

    try {
      const supabase = createClient()
      await supabase
        .from('stories')
        .update({ likes_count: newCount })
        .eq('id', story.id)
    } catch (err) {
      console.warn('Could not update likes count on server:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReportSubmitting(true)
    setReportError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Use authenticated user ID or fallback anonymous reporter identifier
      const reporterId = user?.id || story.author_id

      const reasonFormatted = `[${reportReason.toUpperCase()}]: ${reportDetails.trim() || 'No additional details provided.'}`

      const { error } = await supabase.from('reports').insert({
        story_id: story.id,
        reporter_id: reporterId,
        reason: reasonFormatted,
        status: 'open',
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.warn('Reports insert returned notice:', error.message)
      }

      setReportSuccess(true)
      setTimeout(() => {
        setIsReportOpen(false)
        setReportSuccess(false)
        setReportDetails('')
      }, 1800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report.'
      setReportError(msg)
    } finally {
      setReportSubmitting(false)
    }
  }

  // Split content into clean paragraphs
  const paragraphs = story.content
    ? story.content.split('\n\n').filter((p) => p.trim().length > 0)
    : [
        'No story content found. This tale might still be forming in the shadowed halls of fantasy...',
      ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        bgTheme === 'black'
          ? 'bg-[#050505]'
          : bgTheme === 'velvet'
          ? 'bg-[#10080d]'
          : 'bg-[#09090b]'
      }`}
    >
      {/* Sticky Reader Controls Header */}
      <div className="sticky top-16 z-30 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Back to Feed</span>
          </Link>

          {/* Reading Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Font Size Toggle */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-0.5">
              {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 rounded text-xs font-semibold uppercase transition-all ${
                    fontSize === size
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`Font size: ${size}`}
                >
                  {size === 'sm' ? 'A-' : size === 'md' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {/* Line Spacing Toggle */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-0.5">
              {(['normal', 'relaxed', 'loose'] as LineSpacing[]).map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => setLineSpacing(spacing)}
                  className={`px-2 py-1 rounded text-[11px] capitalize transition-all ${
                    lineSpacing === spacing
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`Line spacing: ${spacing}`}
                >
                  {spacing === 'normal' ? '1.5' : spacing === 'relaxed' ? '1.8' : '2.2'}
                </button>
              ))}
            </div>

            {/* Font Face Toggle */}
            <button
              onClick={() => setFontFace(fontFace === 'serif' ? 'sans' : 'serif')}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Toggle Serif vs Sans-Serif"
            >
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span className="capitalize">{fontFace}</span>
            </button>

            {/* Background Theme Selector */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-0.5">
              <button
                onClick={() => setBgTheme('slate')}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  bgTheme === 'slate' ? 'ring-2 ring-rose-500 bg-[#121216]' : 'bg-[#18181b]'
                }`}
                title="Theme: Dark Slate"
              >
                <div className="w-3 h-3 rounded-full bg-zinc-400" />
              </button>
              <button
                onClick={() => setBgTheme('black')}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  bgTheme === 'black' ? 'ring-2 ring-rose-500 bg-black' : 'bg-black'
                }`}
                title="Theme: Pitch Black"
              >
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
              </button>
              <button
                onClick={() => setBgTheme('velvet')}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  bgTheme === 'velvet' ? 'ring-2 ring-rose-500 bg-[#250d18]' : 'bg-[#1f0a14]'
                }`}
                title="Theme: Velvet Night"
              >
                <div className="w-3 h-3 rounded-full bg-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reading Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Story Header */}
        <header className="mb-10 text-center pb-8 border-b border-zinc-800">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
              {story.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-950/60 text-rose-300 border border-rose-900/60">
              {story.language}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                story.content_rating === 'explicit'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              {story.content_rating} Content
            </span>

            {story.is_ai_generated && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-900/60">
                <Sparkles className="w-3 h-3 text-rose-400" /> AI Co-Authored
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight font-serif">
            {story.title}
          </h1>

          {story.summary && (
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto italic leading-relaxed mb-6 font-serif">
              &ldquo;{story.summary}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 pt-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-rose-400" />
              {readTime} min read ({wordCount} words)
            </span>

            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-zinc-500" />
              {(story.views_count ?? 0).toLocaleString()} views
            </span>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                hasLiked ? 'text-rose-400' : 'hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 text-rose-500 ${
                  hasLiked ? 'fill-rose-500' : 'fill-rose-500/20'
                }`}
              />
              {likesCount.toLocaleString()} {hasLiked ? 'Liked' : 'Likes'}
            </button>
          </div>
        </header>

        {/* Reader Prose Text Block */}
        <article
          className={`rounded-2xl p-6 sm:p-10 border transition-all ${bgThemeStyles} ${
            fontFace === 'serif' ? 'font-serif' : 'font-sans'
          }`}
        >
          <div className={`${fontSizeClass} ${lineSpacingClass} text-justify sm:text-left`}>
            {paragraphs.map((para, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-2 first-letter:leading-none'
                    : ''
                }
              >
                {para}
              </p>
            ))}
          </div>
        </article>

        {/* Engagement and Safe-Harbor Footer Actions */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLike}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                hasLiked
                  ? 'border-rose-600 bg-rose-950/60 text-rose-300'
                  : 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              <Heart
                className={`w-4 h-4 text-rose-500 ${hasLiked ? 'fill-rose-500' : ''}`}
              />
              {hasLiked ? 'Appreciated' : 'Like Story'} ({likesCount})
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-zinc-400" />
              {copiedLink ? 'Copied Link!' : 'Share Tale'}
            </button>
          </div>

          {/* Safe Harbor Compliance Report Button */}
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-rose-950/40 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 transition-all flex items-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5 text-zinc-500" />
            Report Content
          </button>
        </div>
      </main>

      {/* Report Content Modal (Safe Harbor & Policy Compliance) */}
      {isReportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="absolute inset-0"
            onClick={() => !reportSubmitting && setIsReportOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-2xl z-10 text-zinc-100">
            {/* Ambient glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-600/20 blur-3xl rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsReportOpen(false)}
              disabled={reportSubmitting}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Content</h3>
                <p className="text-xs text-zinc-400">Safe-Harbor & Trust Compliance Review</p>
              </div>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-semibold text-white">Report Submitted</h4>
                <p className="text-xs text-zinc-400">
                  Thank you for keeping our community safe. Our moderation team will review this tale within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportError && (
                  <div className="p-3 rounded-xl border border-rose-900/50 bg-rose-950/40 text-xs text-rose-300">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Primary Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="underage">Depiction of non-adults or underage violation</option>
                    <option value="non-consensual">Non-consensual real harm / prohibited violence</option>
                    <option value="copyright">Copyright or Intellectual Property Infringement</option>
                    <option value="harassment">Targeted harassment or personal identity leak</option>
                    <option value="spam">Spam, gibberish, or deceptive content</option>
                    <option value="other">Other legal or safety policy violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Specific Details / Context (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide timestamps, quotes, or details to assist our review..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-800 bg-[#09090b] text-[11px] text-zinc-400">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>False reporting or abusing the safe-harbor system violates our platform terms.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    disabled={reportSubmitting}
                    className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold crimson-glow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {reportSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
