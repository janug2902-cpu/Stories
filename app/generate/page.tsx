'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ShieldAlert,
  Loader2,
  Coins,
  Copy,
  Check,
  BookmarkPlus,
  ArrowRight,
  BookOpen,
  User,
  Heart,
  RefreshCw,
  Globe,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import type { StoryLanguage, ContentRating, StoryCategory } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type GenerationStage = 'idle' | 'drafting' | 'adapting' | 'completed'

export default function GenerateStoryPage() {
  const { lang, t } = useLanguage()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [dailyQuota, setDailyQuota] = useState<number>(5)

  // Form Controls
  const [mood, setMood] = useState<string>('Passionate')
  const [maleDesc, setMaleDesc] = useState<string>('Vikram (28), tall, commanding gaze, intense and protective')
  const [femaleDesc, setFemaleDesc] = useState<string>('Ananya (26), elegant, bold, with sharp wit and alluring confidence')
  const [plot, setPlot] = useState<string>('')
  const [language, setLanguage] = useState<StoryLanguage>('hinglish')
  const [category, setCategory] = useState<StoryCategory>('romance')
  const [rating, setRating] = useState<ContentRating>('spicy')

  // Generation & Output State
  const [stage, setStage] = useState<GenerationStage>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [storyDraft, setStoryDraft] = useState<string>('')
  const [finalStory, setFinalStory] = useState<string>('')
  const [storyTitle, setStoryTitle] = useState<string>('')

  // Action State
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null)

  // Check auth and fetch user quota (if logged in, otherwise guest gets 5 free credits)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('daily_ai_quota')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data && typeof data.daily_ai_quota === 'number') {
              setDailyQuota(data.daily_ai_quota)
            }
          })
      }
    })
  }, [])

  // 2-Step Prompt Chaining Execution (Available to ALL users without sign in)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plot.trim()) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया कहानी का कथानक या विचार दर्ज करें।'
          : 'Please describe a plot scenario or premise.'
      )
      return
    }

    setErrorMsg(null)
    setStage('drafting')
    setStoryDraft('')
    setFinalStory('')
    setSavedStoryId(null)

    try {
      // Step 1: Call /api/ai/draft
      const draftRes = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          boy_desc: maleDesc,
          girl_desc: femaleDesc,
          plot,
          rating,
          deduct_quota: Boolean(user && language === 'english'),
        }),
      })

      const draftData = await draftRes.json()

      if (!draftRes.ok) {
        throw new Error(draftData.error || 'Failed to generate initial story draft.')
      }

      const generatedDraft = draftData.draft
      setStoryDraft(generatedDraft)

      if (typeof draftData.remainingQuota === 'number') {
        setDailyQuota(draftData.remainingQuota)
      } else {
        setDailyQuota((q) => Math.max(0, q - 1))
      }

      // If English, Step 1 IS the final story
      if (language === 'english') {
        setFinalStory(generatedDraft)
        setStoryTitle(deriveStoryTitle(plot, mood))
        setStage('completed')
        return
      }

      // Step 2: Language Adaptation (Hindi or Hinglish)
      setStage('adapting')

      const adaptRes = await fetch('/api/ai/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: generatedDraft,
          target_language: language,
        }),
      })

      const adaptData = await adaptRes.json()

      if (!adaptRes.ok) {
        throw new Error(adaptData.error || 'Failed to adapt story into selected language.')
      }

      setFinalStory(adaptData.finalStory)
      setStoryTitle(deriveStoryTitle(plot, mood))
      if (typeof adaptData.remainingQuota === 'number') {
        setDailyQuota(adaptData.remainingQuota)
      }
      setStage('completed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while creating your story.'
      setErrorMsg(msg)
      setStage('idle')
    }
  }

  // Generate an evocative story title based on plot and mood
  const deriveStoryTitle = (scenario: string, selectedMood: string) => {
    const cleaned = scenario
      .split(/[.,!?\n]/)[0]
      .trim()
      .slice(0, 45)
    return cleaned.length > 8 ? cleaned : `${selectedMood} Nights on Kinkyomen`
  }

  const handleCopy = async () => {
    if (finalStory && navigator.clipboard) {
      await navigator.clipboard.writeText(`${storyTitle}\n\n${finalStory}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleSaveToMyStories = async () => {
    if (!finalStory) return
    setIsSaving(true)

    try {
      const supabase = createClient()
      const summaryText =
        finalStory.slice(0, 150).replace(/\n/g, ' ') + '...'

      const { data, error } = await supabase
        .from('stories')
        .insert({
          title: storyTitle || (lang === 'hi' ? 'मेरी पर्सनलाइज़्ड कहानी' : 'A Personalized Sensual Fantasy'),
          author_id: user?.id || 'guest-author',
          content: finalStory,
          summary: summaryText,
          language,
          category,
          content_rating: rating,
          is_ai_generated: true,
          status: 'approved',
          views_count: 1,
          likes_count: 0,
        })
        .select('id')
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSavedStoryId(data.id)
      }
    } catch (err) {
      console.warn('Save story notice:', err)
      setSavedStoryId('saved-local-story')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-10">
      {/* Studio Header & Quota Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-xs font-semibold text-rose-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Kinkyomen • {lang === 'hi' ? 'त्वरित कहानी रचना स्टूडियो' : 'Instant Creation Studio'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.personalizeTitle}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t.personalizeSubtitle}
          </p>
        </div>

        {/* Daily Quota Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-200 text-xs font-medium self-start sm:self-center">
          <Coins className="w-4 h-4 text-rose-400" />
          <span>
            <strong className="text-white text-sm font-bold">{dailyQuota}</strong>{' '}
            {t.creditsLeft}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Generation Form */}
      {stage !== 'completed' ? (
        <form onSubmit={handleGenerate} className="fantasy-card rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              {t.moodLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { en: 'Passionate', hi: 'जुनूनी (Passionate)' },
                { en: 'First Time', hi: 'पहली बार (First Time)' },
                { en: 'Forbidden / Taboo', hi: 'वर्जित (Taboo)' },
                { en: 'Romantic & Tender', hi: 'रोमांटिक (Tender)' },
                { en: 'Dominant & Intense', hi: 'उत्तेजक (Intense)' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.en}
                  onClick={() => setMood(m.en)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                    mood === m.en
                      ? 'bg-rose-600 text-white crimson-glow-sm'
                      : 'bg-[#09090b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {lang === 'hi' ? m.hi : m.en}
                </button>
              ))}
            </div>
          </div>

          {/* Character Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-400" /> {t.maleCharLabel}
              </label>
              <input
                type="text"
                value={maleDesc}
                onChange={(e) => setMaleDesc(e.target.value)}
                placeholder="Vikram, 28, brooding, protective"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> {t.femaleCharLabel}
              </label>
              <input
                type="text"
                value={femaleDesc}
                onChange={(e) => setFemaleDesc(e.target.value)}
                placeholder="Ananya, 26, elegant, sharp wit, alluring"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Plot Details Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              {t.premiseLabel}
            </label>
            <textarea
              rows={4}
              value={plot}
              onChange={(e) => setPlot(e.target.value)}
              placeholder={
                lang === 'hi'
                  ? 'अपनी कल्पना लिखें... उदाहरण: कॉलेज के बाद प्रोफेसर के केबिन में या बारिश में फंसे दो अनजाने दिल...'
                  : 'Describe the setting, scenario, or fantasy premise in your own words...'
              }
              className="w-full px-3.5 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
            />
          </div>

          {/* Dropdowns Row: Language, Category, Content Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-400" /> {t.filterLanguage}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as StoryLanguage)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                <option value="hinglish">Hinglish (Natural Romanized)</option>
                <option value="hindi">Hindi (देवनागरी हिन्दी)</option>
                <option value="english">English (Sensual Prose)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                {t.filterCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoryCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                <option value="bhabhi">{t.catBhabhi}</option>
                <option value="aunty">{t.catAunty}</option>
                <option value="padosan">{t.catPadosan}</option>
                <option value="teacher_student">{t.catTeacherStudent}</option>
                <option value="maid">{t.catMaid}</option>
                <option value="travel">{t.catTravel}</option>
                <option value="outdoor">{t.catOutdoor}</option>
                <option value="office">{t.catOffice}</option>
                <option value="romance">{t.catRomance}</option>
                <option value="erotica">{t.catErotica}</option>
                <option value="fantasy">{t.catFantasy}</option>
                <option value="taboo">{t.catTaboo}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                {lang === 'hi' ? 'उत्तेजना स्तर' : 'Content Heat'}
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value as ContentRating)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                <option value="spicy">{t.spicyBadge} (Softcore & Emotional)</option>
                <option value="explicit">{t.explicitBadge} (Uncensored Heat)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={stage !== 'idle'}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-semibold text-xs tracking-wide crimson-glow transition-all flex items-center gap-2"
            >
              {stage === 'idle' ? (
                <>
                  <Sparkles className="w-4 h-4" /> {t.btnCreateStory}
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {stage === 'drafting'
                      ? t.creatingDraft
                      : lang === 'hi'
                      ? 'भाषा में रूपांतरित किया जा रहा है...'
                      : 'Adapting to target language...'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Completed Story View & Live Editor */
        <div className="fantasy-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60 inline-block mb-1">
                {language.toUpperCase()} • {category.replace('_', ' ').toUpperCase()} • {rating.toUpperCase()}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {storyTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? (lang === 'hi' ? 'कॉपी हो गया' : 'Copied!') : t.copyStory}
              </button>

              <button
                type="button"
                onClick={handleSaveToMyStories}
                disabled={isSaving || Boolean(savedStoryId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors crimson-glow-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : savedStoryId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <BookmarkPlus className="w-3.5 h-3.5" />
                )}
                {savedStoryId ? (lang === 'hi' ? 'सेव हो गया' : 'Saved!') : t.saveToLibrary}
              </button>
            </div>
          </div>

          {/* Story Text Body */}
          <article className="prose prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed text-zinc-200 space-y-6">
            {finalStory.split('\n\n').map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-2 first-letter:leading-none'
                    : ''
                }
              >
                {para}
              </p>
            ))}
          </article>

          {/* Bottom Bar: Generate Again */}
          <div className="pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setStage('idle')
                setFinalStory('')
                setStoryDraft('')
                setSavedStoryId(null)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'hi' ? 'एक और नई कहानी बनाएं' : 'Personalize Another Fantasy'}</span>
            </button>

            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>{lang === 'hi' ? 'कहानियों की फीड पर वापस जाएं' : 'Back to Stories Feed'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
