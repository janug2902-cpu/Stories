'use client'

import React, { useState } from 'react'
import { PenTool, Send, AlertCircle, ShieldAlert } from 'lucide-react'
import type { StoryCategory, ContentRating, StoryLanguage } from '@/types/database'

export default function WriteStoryPage() {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState<StoryLanguage>('hinglish')
  const [category, setCategory] = useState<StoryCategory>('romance')
  const [rating, setRating] = useState<ContentRating>('spicy')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      window.dispatchEvent(
        new CustomEvent('open-auth-modal', {
          detail: { mode: 'signin' },
        })
      )
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-xs font-semibold text-rose-300 mb-3">
          <PenTool className="w-3.5 h-3.5 text-rose-400" /> Author Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Write & Publish Your Tale
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl">
          Share your passionate romance, sensual erotica, or forbidden fantasies with enthusiastic adult readers worldwide.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="fantasy-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Story Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Whispers in the Monsoon Rain"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as StoryLanguage)}
              className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StoryCategory)}
              className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              <option value="romance">Romance</option>
              <option value="erotica">Erotica</option>
              <option value="fantasy">Fantasy</option>
              <option value="taboo">Taboo</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Heat Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value as ContentRating)}
              className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
            >
              <option value="spicy">Spicy (Sensual Romance)</option>
              <option value="explicit">Explicit (Uncensored Desires)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Synopsis / Summary
          </label>
          <textarea
            rows={2}
            placeholder="A short teaser hooking readers into the chemistry and premise..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-4 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Story Chapter / Full Content
          </label>
          <textarea
            rows={10}
            required
            placeholder="Write your story here. Use descriptive sensory language, passionate dialogues, and vivid emotional beats..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-serif leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <AlertCircle className="w-4 h-4 text-zinc-500" />
            <span>Stories submit as &ldquo;Pending&rdquo; review before appearing on the public library.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm crimson-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting Tale...' : 'Submit for Review'}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-2 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
        <span>Strictly 18+. All characters depicted must be consenting adults (18+). Non-consensual real violence is prohibited.</span>
      </div>
    </div>
  )
}
