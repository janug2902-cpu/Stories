'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Flame,
  Sparkles,
  BookOpen,
  Heart,
  Eye,
  Languages,
  KeyRound,
  Database,
  Layers,
  UserCheck,
  ShieldCheck,
  PenTool,
} from 'lucide-react'
import type { StoryCategory, ContentRating, StoryLanguage } from '@/types/database'

interface DemoStory {
  id: string
  title: string
  summary: string
  author: string
  language: StoryLanguage
  category: StoryCategory
  content_rating: ContentRating
  is_ai_generated: boolean
  views_count: number
  likes_count: number
  read_time: string
}

const SAMPLE_STORIES: DemoStory[] = [
  {
    id: '1',
    title: 'Midnight in Chandni Chowk',
    summary:
      'A rain-soaked rendezvous beneath the balcony of an ancestral haveli turns into an uninhibited night of whispered secrets and breathless intimacy.',
    author: 'AriaSen',
    language: 'hinglish',
    category: 'romance',
    content_rating: 'spicy',
    is_ai_generated: false,
    views_count: 4820,
    likes_count: 1240,
    read_time: '7 min read',
  },
  {
    id: '2',
    title: 'The Sorceress’s Bound Oath',
    summary:
      'Bound by ancient blood-magic in the high obsidian citadel, a royal commander and an untamed shadow-caster surrender to their deepest carnal hunger.',
    author: 'NocturneAI',
    language: 'english',
    category: 'fantasy',
    content_rating: 'explicit',
    is_ai_generated: true,
    views_count: 8910,
    likes_count: 2350,
    read_time: '12 min read',
  },
  {
    id: '3',
    title: 'Raat Ki Madhushala',
    summary:
      'Ek anjaan mehmaan, ek purani haveli aur do dilon ki aisi dastaan jahan har chhuwan ek nayi aag bhadkati hai.',
    author: 'DevikaRoy',
    language: 'hindi',
    category: 'erotica',
    content_rating: 'explicit',
    is_ai_generated: false,
    views_count: 6140,
    likes_count: 1890,
    read_time: '9 min read',
  },
  {
    id: '4',
    title: 'Forbidden Ties & Velvet Shadows',
    summary:
      'Crossing societal boundaries behind locked penthouse doors, exploring unspoken yearnings that can never be spoken in the daylight.',
    author: 'KavyaV',
    language: 'hinglish',
    category: 'taboo',
    content_rating: 'spicy',
    is_ai_generated: true,
    views_count: 3410,
    likes_count: 980,
    read_time: '6 min read',
  },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const triggerAuth = (mode: 'signin' | 'signup') => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode } }))
  }

  const filteredStories =
    selectedCategory === 'All'
      ? SAMPLE_STORIES
      : SAMPLE_STORIES.filter(
          (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
        )

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative px-6 pt-16 pb-20 overflow-hidden text-center max-w-5xl mx-auto">
          {/* Subtle glow background */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 text-xs font-medium text-rose-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            DesiFantasy / VelvetTales • 18+ Adult Erotic Realm
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Where Desires Take Form <br />
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent crimson-glow-text">
              In Intimate Words
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 mb-10 leading-relaxed">
            Immerse yourself in deeply sensual romances, dark fantasy sagas, and taboo encounters.
            Crafted by human authors and generated with our multi-key AI engine.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm crimson-glow transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" /> Start Reading
            </a>

            <button
              type="button"
              onClick={() => triggerAuth('signup')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 font-medium text-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-rose-400" /> Claim 5 Daily Free AI Credits
            </button>

            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-medium text-sm transition-all"
            >
              <PenTool className="w-4 h-4 text-zinc-400" /> Write Story
            </Link>
          </div>

          {/* Languages & Features badges */}
          <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-rose-400" />
              <span>Languages: English, Hindi, Hinglish</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Ratings: Spicy & Explicit</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>OpenRouter AI Multi-Key Failover</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>18+ Verified & Secure Auth</span>
            </div>
          </div>
        </section>

        {/* Featured Stories Showcase */}
        <section id="explore" className="px-6 py-16 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-rose-500" /> Trending Tales
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Explore the latest approved fantasies from the library
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Romance', 'Erotica', 'Fantasy', 'Taboo'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white crimson-glow-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="fantasy-card rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-zinc-800 text-rose-300 border border-zinc-700">
                        {story.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          story.content_rating === 'explicit'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {story.content_rating}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-zinc-900 text-zinc-400">
                        {story.language}
                      </span>
                    </div>

                    {story.is_ai_generated && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-900/50">
                        <Sparkles className="w-3 h-3" /> AI Co-Authored
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-rose-300 mb-2 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                    {story.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>{story.author}</span>
                    <span className="mx-1 text-zinc-600">•</span>
                    <span>{story.read_time}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => triggerAuth('signin')}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                      title="Like this story"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      {story.likes_count.toLocaleString()}
                    </button>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      {story.views_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Core Architecture and Supabase Setup Details */}
        <section id="architecture" className="px-6 py-16 bg-[#121216]/60 border-t border-b border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
                Full-Stack System Initialized
              </span>
              <h2 className="text-3xl font-bold text-white mt-1">Authentication & Schema Configured</h2>
              <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
                Supabase SSR auth, 18+ legal gate, automatic profile provisioning with daily quota, and multi-key AI failover are active.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">18+ Gate & Supabase Auth</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Unclosable 30-day age-verification modal, email/password & Google OAuth, with real-time profile provisioning and daily credit tracking.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-rose-400">
                  components/AgeGateModal.tsx & AuthModal.tsx
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Strict Schema Types</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Strict TypeScript definitions for `Profile`, `Story` (languages, categories, spicy/explicit ratings), and `Report` tables matching Supabase Database contract.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-rose-400">
                  types/database.ts
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Studio & Failover</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Dedicated `/generate` studio with Primary, Backup 1, and Backup 2 OpenRouter keys configured to guarantee high uptime.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-rose-400">
                  app/generate/page.tsx
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-10 bg-[#09090b] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <span className="font-semibold text-zinc-300">DesiFantasy / VelvetTales</span>
            <span>© 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-rose-400 font-medium">18+ Adult Content Advisory</span>
            <span>English • Hindi • Hinglish</span>
            <span className="text-zinc-400 font-mono">Next.js App Router</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
