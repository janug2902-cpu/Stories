'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Wand2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Copy,
  Check,
  Flame,
  ArrowRight,
} from 'lucide-react'
import type { StoryCategory, StoryLanguage, ContentRating } from '@/types/database'

type FactoryStage = 'idle' | 'drafting' | 'adapting' | 'ready'

export function AdminAIFactory() {
  // Left Column Controls State
  const [promptDescription, setPromptDescription] = useState('')
  const [boyDesc, setBoyDesc] = useState('Ranveer (29), brooding, magnetic, tall with an unyielding presence')
  const [girlDesc, setGirlDesc] = useState('Nisha (26), fiercely independent, alluring, confident with dark expressive eyes')
  const [mood, setMood] = useState('Passionate')
  const [category, setCategory] = useState<StoryCategory>('romance')
  const [rating, setRating] = useState<ContentRating>('spicy')
  const [language, setLanguage] = useState<StoryLanguage>('hinglish')

  // Right Column Live Editor State
  const [stage, setStage] = useState<FactoryStage>('idle')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedStoryId, setPublishedStoryId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Calculate live word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptDescription.trim()) {
      setErrorMsg('Please provide a plot premise or scenario description.')
      return
    }

    setErrorMsg(null)
    setStage('drafting')
    setPublishedStoryId(null)

    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_description: promptDescription,
          mood,
          characters: `Male Lead: ${boyDesc} | Female Lead: ${girlDesc}`,
          language,
          category,
          rating,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate story draft.')
      }

      setTitle(data.title || 'Untitled Erotic Tale')
      setSummary(data.summary || '')
      setContent(data.content || '')
      setStage('ready')
      showToast('Story draft created! Review and tweak in the live editor.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Story generation error'
      setErrorMsg(msg)
      setStage('idle')
    }
  }

  const handlePublish = async (status: 'approved' | 'pending') => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Cannot publish empty story title or body.')
      return
    }

    setIsPublishing(true)
    setErrorMsg(null)

    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          content,
          category,
          language,
          content_rating: rating,
          is_ai_generated: true,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish story.')
      }

      setPublishedStoryId(data.storyId)
      showToast(
        status === 'approved'
          ? 'Story published directly to the live homepage feed!'
          : 'Story saved to pending queue as draft.'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish error'
      setErrorMsg(msg)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopy = async () => {
    if (content && navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n\n${summary}\n\n${content}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-emerald-800 bg-emerald-950/90 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Published Story Success Bar */}
      {publishedStoryId && (
        <div className="p-5 rounded-2xl border border-emerald-800 bg-emerald-950/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Story Successfully Published!</p>
              <p className="text-xs text-emerald-300/80">Story ID: {publishedStoryId}</p>
            </div>
          </div>
          <Link
            href={`/read/${publishedStoryId}`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            View Live Story <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Controls (5 cols) */}
        <div className="lg:col-span-5 fantasy-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" /> Story Factory Controls
            </h3>
            <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/60">
              Admin Unlimited
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Premise */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Story Premise / Scenario <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. A stormy night in a lakeside palace, forbidden eye contact during a royal celebration, secret meeting in the library..."
                value={promptDescription}
                onChange={(e) => setPromptDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Character Details */}
            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Male Character Details
                </label>
                <input
                  type="text"
                  value={boyDesc}
                  onChange={(e) => setBoyDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#09090b] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Female Character Details
                </label>
                <input
                  type="text"
                  value={girlDesc}
                  onChange={(e) => setGirlDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-[#09090b] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Mood & Flavor
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Passionate', 'Taboo', 'Romantic', 'Dominant', 'Fantasy'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                      mood === m
                        ? 'bg-rose-600 text-white crimson-glow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Language Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StoryCategory)}
                  className="w-full p-2 rounded-xl border border-zinc-700 bg-[#09090b] text-zinc-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="teacher_student">Teacher & Student</option>
                  <option value="maid">Maid & Boss</option>
                  <option value="travel">Travel & Vacation</option>
                  <option value="outdoor">Outdoor & Public</option>
                  <option value="office">Office & Corporate</option>
                  <option value="romance">Romance</option>
                  <option value="erotica">Erotica</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="taboo">Taboo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as StoryLanguage)}
                  className="w-full p-2 rounded-xl border border-zinc-700 bg-[#09090b] text-zinc-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="hinglish">Hinglish (Roman Hindi)</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi (Devanagari)</option>
                </select>
              </div>
            </div>

            {/* Rating Toggle */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Content Rating
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRating('spicy')}
                  className={`py-2 px-3 rounded-xl font-semibold transition-all ${
                    rating === 'spicy'
                      ? 'bg-amber-950/80 border border-amber-700 text-amber-300'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Spicy (Sensual)
                </button>
                <button
                  type="button"
                  onClick={() => setRating('explicit')}
                  className={`py-2 px-3 rounded-xl font-semibold transition-all ${
                    rating === 'explicit'
                      ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Explicit (18+ Adult)
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={stage === 'drafting'}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs crimson-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {stage === 'drafting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Story & Adapting...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Story Draft</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Editor & Direct Publisher (7 cols) */}
        <div className="lg:col-span-7 fantasy-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold text-white">Live Editor & Review</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-zinc-500" /> {wordCount} Words
              </span>
              {content && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Story Title
              </label>
              <input
                type="text"
                placeholder="Story Title (Generated automatically or custom)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Summary Textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Teaser / Summary (2 Lines)
              </label>
              <textarea
                rows={2}
                placeholder="2-line summary preview shown on the feed cards..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Story Prose Body */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                <span>Story Prose (Tweak sentences, twists, or pacing)</span>
                <span className="text-[10px] text-zinc-500 lowercase">editable markdown/prose</span>
              </label>
              <textarea
                rows={16}
                placeholder="The generated story prose will appear here for live review and editing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-600 font-serif leading-relaxed focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isPublishing || !content.trim()}
                onClick={() => handlePublish('pending')}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-zinc-400" />
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isPublishing || !content.trim() || !title.trim()}
                onClick={() => handlePublish('approved')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs crimson-glow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Live Feed...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Publish Directly to Live Feed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
