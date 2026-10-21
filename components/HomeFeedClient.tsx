'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Flame,
  Sparkles,
  BookOpen,
  Languages,
  KeyRound,
  ShieldCheck,
  PenTool,
  Filter,
  RotateCcw,
} from 'lucide-react'
import { StoryCard } from '@/components/StoryCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import { useLanguage } from '@/lib/language-context'
import type { Story } from '@/types/database'

interface HomeFeedClientProps {
  initialStories: Story[]
  initialLang?: string
  initialCat?: string
}

const CATEGORIES: { id: string; en: string; hi: string }[] = [
  { id: 'all', en: 'All', hi: 'सभी' },
  { id: 'bhabhi', en: 'Bhabhi', hi: 'भाभी' },
  { id: 'aunty', en: 'Aunty', hi: 'आंटी' },
  { id: 'teacher_student', en: 'Teacher & Student', hi: 'शिक्षक और छात्र' },
  { id: 'maid', en: 'Maid & Boss', hi: 'नौकरानी और मालिक' },
  { id: 'travel', en: 'Travel', hi: 'सफ़र और छुट्टियां' },
  { id: 'outdoor', en: 'Outdoor', hi: 'खुली जगहें' },
  { id: 'office', en: 'Office', hi: 'दफ्तर और बॉस' },
  { id: 'romance', en: 'Romance', hi: 'रोमांस' },
  { id: 'erotica', en: 'Erotica', hi: 'कामुक' },
  { id: 'fantasy', en: 'Fantasy', hi: 'फंतासी' },
  { id: 'taboo', en: 'Taboo', hi: 'वर्जित' },
]

const LANGUAGES_LIST: { id: string; en: string; hi: string }[] = [
  { id: 'all', en: 'All', hi: 'सभी' },
  { id: 'english', en: 'English', hi: 'अंग्रेज़ी' },
  { id: 'hindi', en: 'Hindi', hi: 'हिंदी' },
  { id: 'hinglish', en: 'Hinglish', hi: 'हिंग्लिश' },
]

export function HomeFeedClient({
  initialStories,
  initialLang = 'all',
  initialCat = 'all',
}: HomeFeedClientProps) {
  const { lang, t } = useLanguage()

  const [selectedCat, setSelectedCat] = useState<string>(initialCat.toLowerCase())
  const [selectedLang, setSelectedLang] = useState<string>(initialLang.toLowerCase())

  // Dynamic category tabs: includes default categories + any writer-created custom categories in stories
  const dynamicCategories = useMemo(() => {
    const list = [...CATEGORIES]
    const existingIds = new Set(list.map((c) => c.id.toLowerCase()))

    initialStories.forEach((s) => {
      const catId = (s.category || '').toLowerCase().trim()
      if (catId && !existingIds.has(catId)) {
        existingIds.add(catId)
        const formatted = catId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        list.push({
          id: catId,
          en: formatted,
          hi: formatted,
        })
      }
    })
    return list
  }, [initialStories])

  // Filter stories efficiently on client with instant reactivity
  const filteredStories = useMemo(() => {
    return initialStories.filter((s) => {
      const matchCat =
        selectedCat === 'all' || s.category.toLowerCase() === selectedCat
      const matchLang =
        selectedLang === 'all' || s.language.toLowerCase() === selectedLang
      return matchCat && matchLang
    })
  }, [initialStories, selectedCat, selectedLang])

  const handleResetFilters = () => {
    setSelectedCat('all')
    setSelectedLang('all')
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-20 md:min-h-[72vh] flex flex-col justify-center items-center overflow-hidden text-center max-w-5xl mx-auto">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[280px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent crimson-glow-text">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 mb-8 leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#feed"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('feed')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm crimson-glow transition-all hover:scale-105 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> {t.heroBtnRead}
            </a>

            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 font-medium text-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-rose-400" /> {t.heroBtnPersonalize}
            </Link>

            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-medium text-sm transition-all"
            >
              <PenTool className="w-4 h-4 text-zinc-400" /> {t.heroBtnWrite}
            </Link>
          </div>

          {/* Scroll Cue to Encourage Exploration */}
          <div className="pt-12 flex flex-col items-center">
            <a
              href="#feed"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('feed')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="group inline-flex flex-col items-center gap-2 text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <span className="tracking-wide text-[11px] uppercase">
                {lang === 'hi' ? 'कहानियां देखने के लिए नीचे स्क्रॉल करें' : 'Scroll down for stories feed'}
              </span>
              <div className="w-5 h-8 rounded-full border border-zinc-700 group-hover:border-rose-500/80 flex items-start justify-center p-1 transition-colors">
                <div className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" />
              </div>
            </a>
          </div>
        </section>

        {/* Stories Feed Section with Smooth Scroll Reveal */}
        <section id="feed" className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full scroll-mt-20">
          {/* Header & Filter Controls with Smooth Scroll Entrance */}
          <ScrollReveal direction="up" distance={80} duration={800} once={false} className="feed-scroll-driven">
            <div className="mb-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                    <Flame className="w-7 h-7 text-rose-500" /> {t.feedTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    {t.feedSubtitle}
                  </p>
                </div>

                {(selectedLang !== 'all' || selectedCat !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors w-fit cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> {t.resetFilters}
                  </button>
                )}
              </div>

              {/* Filter Pills Container */}
              <div className="p-5 rounded-2xl border border-zinc-800/90 bg-[#121216]/80 backdrop-blur-md space-y-4 shadow-xl">
                {/* Category Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 sm:w-24 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-rose-400" /> {t.filterCategory}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dynamicCategories.map((cat) => {
                      const isActive = selectedCat === cat.id
                      const label = lang === 'hi' ? cat.hi : cat.en
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setSelectedCat(cat.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-rose-600 text-white crimson-glow-sm scale-105'
                              : 'bg-[#09090b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Language Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 border-t border-zinc-800/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 sm:w-24 shrink-0">
                    <Languages className="w-3.5 h-3.5 text-rose-400" /> {t.filterLanguage}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES_LIST.map((l) => {
                      const isActive = selectedLang === l.id
                      const label = lang === 'hi' ? l.hi : l.en
                      return (
                        <button
                          type="button"
                          key={l.id}
                          onClick={() => setSelectedLang(l.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-rose-600 text-white crimson-glow-sm scale-105'
                              : 'bg-[#09090b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Stories Grid with Staggered Scroll Reveal */}
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredStories.map((story, idx) => (
                <ScrollReveal
                  key={story.id}
                  direction="up"
                  distance={60}
                  delay={(idx % 4) * 80}
                  duration={700}
                  className="h-full card-scroll-driven"
                >
                  <StoryCard story={story} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 rounded-2xl border border-zinc-800/80 bg-[#121216]/50">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-900/60 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-7 h-7 text-rose-500 opacity-80" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t.noStoriesTitle}</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                {t.noStoriesDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
                >
                  {t.clearFilters}
                </button>
                <Link
                  href="/generate"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white crimson-glow-sm transition-all"
                >
                  {t.makeYourStory}
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Feature Highlights with Scroll Entrance */}
        <section className="px-6 py-16 border-t border-zinc-800 bg-[#09090b] text-xs text-zinc-400">
          <ScrollReveal direction="up" delay={80} duration={600}>
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-rose-400" />
                <span>
                  {lang === 'hi'
                    ? 'बहुभाषी: अंग्रेज़ी • हिंदी • हिंग्लिश'
                    : 'Multilingual: English • Hindi • Hinglish'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>
                  {lang === 'hi'
                    ? 'मसालेदार और वयस्क 18+ रेटिंग्स'
                    : 'Spicy & Explicit Ratings'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-400" />
                <span>
                  {lang === 'hi' ? 'त्वरित कहानी रचना' : 'Instant Creation Studio'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>{t.footerSafeHarbor}</span>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 bg-[#09090b] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <span className="font-semibold text-zinc-300">Kinkyomen</span>
            <span>{t.footerRights}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-rose-400 font-medium">{t.footerAdultOnly}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
