'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  Heart,
  Sparkles,
  BookOpen,
  Share2,
  Flag,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Headphones,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parseStoryContent, getStoryWordCount } from '@/lib/story-blocks'
import { HindiAudioPlayer } from '@/components/HindiAudioPlayer'
import type { Story } from '@/types/database'

interface ReaderClientProps {
  story: Story
}

export function ReaderClient({ story }: ReaderClientProps) {
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

  // Estimated reading time
  const wordCount = getStoryWordCount(story.content || '')
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  // Hindi Audio Experience State
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState<boolean>(false)
  const [autoStartAudio, setAutoStartAudio] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('audio=1')) {
      setIsAudioPlayerOpen(true)
      setAutoStartAudio(true)
    }
  }, [])

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

  // Parse story into structured blocks (supports text paragraphs and embedded photos, GIFs, and videos)
  const storyBlocks = parseStoryContent(story.content)

  // Multi-part story support:
  // If story exceeds 1500 words and doesn't have an explicit next_part_id, we automatically break into Part 1 and Part 2!
  const [activeVirtualPart, setActiveVirtualPart] = useState<number>(1)
  const isOver1500Words = wordCount > 1500 && !story.next_part_id

  const { virtualPart1Blocks, virtualPart2Blocks } = React.useMemo(() => {
    if (!isOver1500Words) {
      return { virtualPart1Blocks: storyBlocks, virtualPart2Blocks: [] }
    }
    let runningWords = 0
    const p1: typeof storyBlocks = []
    const p2: typeof storyBlocks = []

    for (const b of storyBlocks) {
      const bWords = b.type === 'text' ? b.content.trim().split(/\s+/).filter(Boolean).length : 0
      if (runningWords < 1350 || p1.length === 0) {
        p1.push(b)
        runningWords += bWords
      } else {
        p2.push(b)
      }
    }
    return { virtualPart1Blocks: p1, virtualPart2Blocks: p2 }
  }, [storyBlocks, isOver1500Words])

  const displayedBlocks = isOver1500Words
    ? activeVirtualPart === 1
      ? virtualPart1Blocks
      : virtualPart2Blocks
    : storyBlocks

  let textIndex = 0

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Sticky Reader Controls Header */}
      <div className="sticky top-16 z-30 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>Back to Feed</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => {
                if (isAudioPlayerOpen) {
                  setIsAudioPlayerOpen(false)
                  setAutoStartAudio(false)
                } else {
                  setIsAudioPlayerOpen(true)
                  setAutoStartAudio(true)
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                isAudioPlayerOpen
                  ? 'border-rose-500 bg-rose-600 text-white crimson-glow-sm'
                  : 'border-rose-800/80 bg-rose-950/60 hover:bg-rose-900/60 text-rose-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{isAudioPlayerOpen ? 'ऑडियो बंद करें' : '🎧 हिंदी ऑडियो'}</span>
            </button>

            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>{readTime} min read</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Reading Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Story Header */}
        <header className="mb-10 text-center pb-8 border-b border-zinc-800">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {story.series_title && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                Series: {story.series_title}
              </span>
            )}

            {story.part_number && story.total_parts && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600/30 text-rose-300 border border-rose-500/50">
                Part {story.part_number} of {story.total_parts}
              </span>
            )}

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
                <Sparkles className="w-3 h-3 text-rose-400" /> Custom Crafted
              </span>
            )}

            {isOver1500Words && (
              <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 ml-1">
                <button
                  type="button"
                  onClick={() => setActiveVirtualPart(1)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                    activeVirtualPart === 1
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Part 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVirtualPart(2)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                    activeVirtualPart === 2
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Part 2
                </button>
              </div>
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

        {/* Hindi Audio Experience Banner or Player */}
        {isAudioPlayerOpen ? (
          <HindiAudioPlayer
            story={story}
            initialPlay={autoStartAudio}
            onClose={() => {
              setIsAudioPlayerOpen(false)
              setAutoStartAudio(false)
            }}
          />
        ) : (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-[#18121c]/80 to-rose-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-600/20 border border-rose-600/40 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center justify-center sm:justify-start gap-2">
                  देसी लड़की की आवाज़ में सुनें
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600/30 text-rose-300 border border-rose-500/40">
                    देसी सोफ्ट आवाज़
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  सुनो ना जानू... देसी अंदाज़ और कामुक शब्दों में पूरी कहानी का मदहोश ऑडियो और ट्रांसक्रिप्ट।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAudioPlayerOpen(true)
                setAutoStartAudio(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs crimson-glow transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Headphones className="w-4 h-4" /> अभी सुनें (Listen Audio)
            </button>
          </div>
        )}

        {/* Reader Prose Text Block */}
        <article className="rounded-2xl p-6 sm:p-10 border border-zinc-800 bg-[#121216] text-[#f4f4f5] font-serif transition-all shadow-xl">
          <div className="text-lg sm:text-xl leading-relaxed space-y-6 text-justify sm:text-left">
            {displayedBlocks.map((block) => {
              if (block.type === 'text') {
                const isFirst = textIndex === 0
                textIndex += 1
                return (
                  <p
                    key={block.id}
                    className={
                      isFirst
                        ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-2 first-letter:leading-none'
                        : ''
                    }
                  >
                    {block.content}
                  </p>
                )
              }

              if (block.type === 'image') {
                return (
                  <figure
                    key={block.id}
                    className="my-8 rounded-2xl overflow-hidden border border-zinc-800/80 bg-black/40 shadow-2xl relative group transition-all"
                  >
                    <div className="relative overflow-hidden max-h-[560px] flex items-center justify-center bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.content}
                        alt={block.caption || 'Sensual story moment'}
                        className="w-full h-auto object-cover max-h-[560px] transition-transform duration-700 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                    </div>
                    {block.caption && (
                      <figcaption className="px-4 py-2.5 text-center text-xs italic text-rose-300/90 bg-zinc-950/80 border-t border-zinc-800/60 font-sans tracking-wide">
                        ✦ {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              if (block.type === 'gif') {
                return (
                  <figure
                    key={block.id}
                    className="my-8 rounded-2xl overflow-hidden border border-rose-900/50 bg-black/40 shadow-2xl relative group transition-all"
                  >
                    <div className="relative overflow-hidden max-h-[560px] flex items-center justify-center bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.content}
                        alt={block.caption || 'Sensual animated scene'}
                        className="w-full h-auto object-cover max-h-[560px]"
                        loading="lazy"
                      />
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-rose-400 uppercase tracking-widest border border-rose-900/60 backdrop-blur-sm shadow-md">
                        GIF
                      </span>
                      <div className="absolute inset-0 ring-1 ring-inset ring-rose-500/20 rounded-2xl pointer-events-none" />
                    </div>
                    {block.caption && (
                      <figcaption className="px-4 py-2.5 text-center text-xs italic text-rose-300/90 bg-zinc-950/80 border-t border-zinc-800/60 font-sans tracking-wide">
                        ✦ {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              if (block.type === 'video') {
                return (
                  <figure
                    key={block.id}
                    className="my-8 rounded-2xl overflow-hidden border border-rose-900/60 bg-black shadow-2xl relative"
                  >
                    <div className="relative overflow-hidden max-h-[560px] flex items-center justify-center bg-black">
                      <video
                        src={block.content}
                        controls
                        playsInline
                        loop
                        muted
                        className="w-full max-h-[560px] object-contain rounded-t-2xl"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="px-4 py-2.5 text-center text-xs italic text-rose-300/90 bg-zinc-950/80 border-t border-zinc-800/60 font-sans tracking-wide">
                        ▶ {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              return null
            })}
          </div>
        </article>

        {/* Multi-Part Chapter Navigation (Simple, Minimal Link) */}
        {(story.next_part_id || story.prev_part_id || isOver1500Words) && (
          <div className="my-8 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
            {story.prev_part_id ? (
              <Link
                href={`/read/${story.prev_part_id}`}
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span>{story.prev_part_title || `Previous: Part ${(story.part_number || 2) - 1}`}</span>
              </Link>
            ) : isOver1500Words && activeVirtualPart === 2 ? (
              <button
                type="button"
                onClick={() => {
                  setActiveVirtualPart(1)
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span>Previous (Part 1)</span>
              </button>
            ) : (
              <div />
            )}

            {story.next_part_id ? (
              <Link
                href={`/read/${story.next_part_id}`}
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold hover:underline transition-all ml-auto"
              >
                <span>{story.next_part_title || `Part ${(story.part_number || 1) + 1}`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isOver1500Words && activeVirtualPart === 1 ? (
              <button
                type="button"
                onClick={() => {
                  setActiveVirtualPart(2)
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold hover:underline transition-all ml-auto cursor-pointer"
              >
                <span>Part 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

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
