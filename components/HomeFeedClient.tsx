'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Search,
  X,
  Headphones,
} from 'lucide-react'
import { StoryCard } from '@/components/StoryCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import { useLanguage } from '@/lib/language-context'
import type { Story } from '@/types/database'

const TRENDING_SEARCHES = [
  { id: 'bhabhi', en: 'Bhabhi', hi: 'भाभी', query: 'bhabhi' },
  { id: 'office', en: 'Office', hi: 'दफ्तर रोमांस', query: 'office' },
  { id: 'rain', en: 'Rain / Monsoon', hi: 'बारिश', query: 'बारिश' },
  { id: 'aunty', en: 'Aunty', hi: 'आंटी', query: 'aunty' },
  { id: 'teacher', en: 'Teacher & Student', hi: 'शिक्षक और छात्र', query: 'teacher' },
  { id: 'maid', en: 'Maid & Boss', hi: 'कामवाली बाई', query: 'maid' },
  { id: 'travel', en: 'Travel', hi: 'सफ़र', query: 'travel' },
]

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
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [audioOnlyFilter, setAudioOnlyFilter] = useState<boolean>(false)

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

  // Filter stories efficiently on client with instant reactivity and multi-field search
  const filteredStories = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase()
    const queryTokens = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : []

    const categorySynonyms: Record<string, string[]> = {
      bhabhi: ['भाभी', 'bhabhi', 'devar', 'देवर', 'bj'],
      aunty: ['आंटी', 'aunty', 'chachi', 'चाची', 'mami', 'मामी'],
      office: ['दफ्तर', 'office', 'boss', 'बॉस', 'कॉरपोरेट', 'colleague'],
      teacher_student: ['टीचर', 'शिक्षक', 'छात्र', 'professor', 'प्रोफेसर', 'मैम', 'कॉलेज'],
      maid: ['नौकरानी', 'कामवाली', 'maid', 'kamwali'],
      travel: ['सफ़र', 'यात्रा', 'travel', 'hotel', 'होटल', 'ट्रेन'],
      outdoor: ['आउटडोर', 'outdoor', 'गाड़ी', 'कार', 'पार्क', 'जंगल'],
      romance: ['रोमांस', 'romance', 'इश्क', 'प्यार', 'प्रेम'],
      erotica: ['कामुक', 'erotica', 'कामुकता', 'वासना'],
      fantasy: ['फंतासी', 'fantasy', 'जादू', 'तिलिस्म'],
      taboo: ['वर्जित', 'taboo', 'निषिद्ध'],
    }

    return initialStories.filter((s) => {
      const matchCat =
        selectedCat === 'all' || s.category.toLowerCase() === selectedCat
      const matchLang =
        selectedLang === 'all' || s.language.toLowerCase() === selectedLang

      if (!matchCat || !matchLang) return false

      if (queryTokens.length === 0) return true

      const title = (s.title || '').toLowerCase()
      const summary = (s.summary || '').toLowerCase()
      const content = (s.content || '').toLowerCase()
      const category = (s.category || '').toLowerCase()
      const series = (s.series_title || '').toLowerCase()
      const author = (s.author_id || '').toLowerCase()

      return queryTokens.every((term) => {
        if (title.includes(term)) return true
        if (summary.includes(term)) return true
        if (category.includes(term)) return true
        if (series.includes(term)) return true
        if (content.includes(term)) return true
        if (author.includes(term)) return true

        // Category synonyms check
        for (const [catKey, syns] of Object.entries(categorySynonyms)) {
          if (category === catKey) {
            if (syns.some((syn) => syn.includes(term) || term.includes(syn))) {
              return true
            }
          }
        }

        return false
      })
    })
  }, [initialStories, selectedCat, selectedLang, searchQuery])

  const handleResetFilters = () => {
    setSelectedCat('all')
    setSelectedLang('all')
    setSearchQuery('')
    setAudioOnlyFilter(false)
  }

  return (
    <div className="relative min-h-screen flex flex-col text-[#f4f4f5]">
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative px-6 pt-16 pb-20 md:min-h-[72vh] flex flex-col justify-center items-center overflow-hidden text-center max-w-5xl mx-auto">
          {/* Ambient Crimson Centerpiece Glow */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-[420px] sm:w-[620px] h-[340px] bg-rose-600/20 blur-[130px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              {t.heroTitle1} <br />
              <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent crimson-glow-text">
                {t.heroTitle2}
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 mb-8 leading-relaxed drop-shadow-sm">
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

                {(selectedLang !== 'all' || selectedCat !== 'all' || searchQuery.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors w-fit cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> {t.resetFilters}
                  </button>
                )}
              </div>

              {/* Interactive Search Bar */}
              <div className="relative">
                <div className="relative flex items-center">
                  <div className="absolute left-4.5 pointer-events-none text-zinc-400">
                    <Search className="w-5 h-5 text-rose-500" />
                  </div>
                  <input
                    id="story-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'hi'
                        ? 'कहानियां खोजें (शीर्षक, विषय, भाभी, दफ्तर, बरसात, ऑडियो...)'
                        : 'Search stories (title, character, bhabhi, office, rain, audio...)'
                    }
                    className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-[#141218]/90 border border-zinc-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white placeholder-zinc-500 text-sm sm:text-base outline-none transition-all shadow-xl"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Clear Search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                      {filteredStories.length} {lang === 'hi' ? 'कहानियां' : 'stories'}
                    </span>
                  </div>
                </div>

                {/* Trending Topics & Audio Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="text-zinc-500 font-medium text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    {lang === 'hi' ? 'लोकप्रिय खोजें:' : 'Trending topics:'}
                  </span>
                  {TRENDING_SEARCHES.map((chip) => {
                    const isActive = searchQuery.toLowerCase().includes(chip.query.toLowerCase())
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setSearchQuery(searchQuery === chip.query ? '' : chip.query)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white crimson-glow-sm'
                            : 'bg-zinc-900/90 border border-zinc-800/90 text-zinc-300 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {lang === 'hi' ? chip.hi : chip.en}
                      </button>
                    )
                  })}
                </div>
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

              {/* Active Search & Filter Result Banner */}
              {(searchQuery || selectedCat !== 'all' || selectedLang !== 'all') && (
                <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl">
                  <span>
                    {lang === 'hi' ? 'परिणाम:' : 'Results:'}{' '}
                    <strong className="text-white">{filteredStories.length}</strong>{' '}
                    {lang === 'hi' ? 'कहानियां मिलीं' : 'stories matching'}
                    {searchQuery && (
                      <span className="text-rose-400 font-medium ml-1">
                        &ldquo;{searchQuery}&rdquo;
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    {lang === 'hi' ? 'सभी फ़िल्टर साफ़ करें' : 'Clear all filters'}
                  </button>
                </div>
              )}
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
                <Search className="w-7 h-7 text-rose-500 opacity-80" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchQuery
                  ? lang === 'hi'
                    ? `"${searchQuery}" से कोई कहानी नहीं मिली`
                    : `No stories found for "${searchQuery}"`
                  : t.noStoriesTitle}
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                {searchQuery
                  ? lang === 'hi'
                    ? 'कृपया अलग शब्द खोजकर देखें, या नीचे दिए गए बटन से फ़िल्टर हटाकर सभी कहानियां देखें।'
                    : 'Try searching for different keywords, or clear your search to explore all adult stories.'
                  : t.noStoriesDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
                >
                  {lang === 'hi' ? 'फ़िल्टर और खोज साफ़ करें' : 'Clear Search & Filters'}
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
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-amber-500/40 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Kinkyomen Logo"
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
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
