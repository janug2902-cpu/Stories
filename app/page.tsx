import React, { Suspense } from 'react'
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
import { createClient } from '@/lib/supabase/server'
import { StoryCard } from '@/components/StoryCard'
import type { Story, StoryLanguage, StoryCategory } from '@/types/database'

// Curated approved stories fallback when database table is not yet seeded
const FALLBACK_APPROVED_STORIES: Story[] = [
  {
    id: '1',
    author_id: 'seed-author-1',
    title: 'Midnight in Chandni Chowk',
    summary:
      'A rain-soaked rendezvous beneath the balcony of an ancestral haveli turns into an uninhibited night of whispered secrets and breathless intimacy.',
    content: `The rain fell over Old Delhi in relentless sheets, drumming against the red sandstone arches of the ancestral haveli. 

Inside the curtained veranda, the scent of petrichor mingled with night-blooming jasmine and warm musk. Priya stepped closer, her silk dupatta soaked through, clinging sensuously to the curves of her waist.

"You should not have summoned me in this storm," Kabir whispered, his voice dark and thick with longing.

"And you should not have answered," she breathed, her heart hammering against her ribs as his fingers traced the damp line of her collarbone. The electricity flickered, leaving them in shadows illuminated only by the distant flashes of lightning.

Every breath between them became heavy, charged with years of unspoken longing. When his hands finally drew her in, the ancient walls bore witness to a fevered, breathless passion that defied family pride and honor.`,
    language: 'hinglish',
    category: 'romance',
    content_rating: 'spicy',
    is_ai_generated: false,
    status: 'approved',
    views_count: 4820,
    likes_count: 1240,
    created_at: '2026-10-20T12:00:00Z',
    updated_at: '2026-10-20T12:00:00Z',
  },
  {
    id: '2',
    author_id: 'seed-author-2',
    title: 'The Sorceress’s Bound Oath',
    summary:
      'Bound by ancient blood-magic in the high obsidian citadel, a royal commander and an untamed shadow-caster surrender to their deepest carnal hunger.',
    content: `High atop the obsidian spires of Valenreach, the twin moons cast a violet sheen over the marble dais. 

Captain Eric Vance tightened his grip on his rune-etched hilt, his pulse racing not from fear, but from the intoxicating presence of Lady Vespera. Her dark eyes gleamed with forbidden arcana as runes shimmered along her bare shoulders.

"The binding circle requires complete physical surrender, Commander," she murmured, stepping forward until the warmth of her breath ghosted over his throat. "One false thought, and the magic consumes us both."

"Then let it consume us," Eric growled, catching her by the waist and pulling her against his armor.

Her laughter was low, thrilling, and dangerous. As their lips met, the ward runes pulsed crimson, unleashing waves of carnal ecstasy that tore through the sanctum, melting steel, pride, and restraint into pure, unbound desire.`,
    language: 'english',
    category: 'fantasy',
    content_rating: 'explicit',
    is_ai_generated: true,
    status: 'approved',
    views_count: 8910,
    likes_count: 2350,
    created_at: '2026-10-19T14:30:00Z',
    updated_at: '2026-10-19T14:30:00Z',
  },
  {
    id: '3',
    author_id: 'seed-author-3',
    title: 'Raat Ki Madhushala',
    summary:
      'Ek anjaan mehmaan, ek purani haveli aur do dilon ki aisi dastaan jahan har chhuwan ek nayi aag bhadkati hai.',
    content: `Haveli ke kamre mein halki madham roshni thi. Bahar hawa ki sarsarahat aur andar do dilon ki tez dhadkanein.

Devika ne aaina dekhte hue apne baalon ki lat ko peeche kiya. Darwaaze par halki dastak hui, aur Samar andar aaya. Uski aankhon mein ek aisi chamak thi jise Devika kai dino se mehsoos kar rahi thi.

"Tumhe yahan nahi aana chahiye tha, Samar," Devika ne dheeme se kaha, par uske lafzon mein rokne ki koi taaqat nahi thi.

Samar ne aage badhkar uski kamar par apna haath rakha. Uski garam saansein Devika ki gardan par padte hi ek thar-tharahat si daud gayi. Raat ka har pehar ek naye ehsaas, ek nayi gehraai aur be-parwah jazbaat ki aag mein dhalta chala gaya.`,
    language: 'hindi',
    category: 'erotica',
    content_rating: 'explicit',
    is_ai_generated: false,
    status: 'approved',
    views_count: 6140,
    likes_count: 1890,
    created_at: '2026-10-18T18:15:00Z',
    updated_at: '2026-10-18T18:15:00Z',
  },
  {
    id: '4',
    author_id: 'seed-author-4',
    title: 'Forbidden Ties & Velvet Shadows',
    summary:
      'Crossing societal boundaries behind locked penthouse doors, exploring unspoken yearnings that can never be spoken in the daylight.',
    content: `The skyline of South Mumbai glimmered through the floor-to-ceiling glass of the 42nd-floor penthouse. 

Rohan poured two glasses of vintage Merlot, his hands remarkably steady despite the illicit tension thrumming through the room. Meera stood by the balcony glass, her silk gown whispering against her thighs with every small movement.

"If anyone finds out about tonight, Rohan... everything collapses," she said softly, turning around.

He placed the glasses on the granite counter and walked toward her with deliberate, unhurried steps. "Nobody knows. And nobody will."

When his fingers tilted her chin upward and their lips parted in an urgent, stifled gasp, all the rules, boundaries, and familial taboos dissolved into a whirlwind of velvet touch and passionate abandon.`,
    language: 'hinglish',
    category: 'taboo',
    content_rating: 'spicy',
    is_ai_generated: true,
    status: 'approved',
    views_count: 3410,
    likes_count: 980,
    created_at: '2026-10-17T20:00:00Z',
    updated_at: '2026-10-17T20:00:00Z',
  },
]

const CATEGORIES = ['All', 'Romance', 'Erotica', 'Fantasy', 'Taboo']
const LANGUAGES = ['All', 'English', 'Hindi', 'Hinglish']

interface HomeFeedProps {
  searchParams: Promise<{
    lang?: string
    cat?: string
  }>
}

/**
 * Builds the URL query string maintaining active filter states.
 */
function buildFilterUrl(newLang: string, newCat: string) {
  const params = new URLSearchParams()
  if (newLang && newLang.toLowerCase() !== 'all') {
    params.set('lang', newLang.toLowerCase())
  }
  if (newCat && newCat.toLowerCase() !== 'all') {
    params.set('cat', newCat.toLowerCase())
  }
  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}

async function StoriesGrid({ searchParams }: HomeFeedProps) {
  const resolvedParams = await searchParams
  const selectedLang = (resolvedParams.lang || 'all').toLowerCase()
  const selectedCat = (resolvedParams.cat || 'all').toLowerCase()

  // Query Supabase for approved stories
  let stories: Story[] = []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('stories')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (selectedLang !== 'all') {
      query = query.eq('language', selectedLang as StoryLanguage)
    }

    if (selectedCat !== 'all') {
      query = query.eq('category', selectedCat as StoryCategory)
    }

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      stories = data as Story[]
    } else if (!error && data && data.length === 0) {
      stories = []
    } else {
      // In development fallback mode if Supabase tables have not been seeded yet
      stories = FALLBACK_APPROVED_STORIES.filter((s) => {
        const matchLang =
          selectedLang === 'all' || s.language.toLowerCase() === selectedLang
        const matchCat =
          selectedCat === 'all' || s.category.toLowerCase() === selectedCat
        return matchLang && matchCat
      })
    }
  } catch {
    // Fallback gracefully to curated approved stories
    stories = FALLBACK_APPROVED_STORIES.filter((s) => {
      const matchLang =
        selectedLang === 'all' || s.language.toLowerCase() === selectedLang
      const matchCat =
        selectedCat === 'all' || s.category.toLowerCase() === selectedCat
      return matchLang && matchCat
    })
  }

  return (
    <>
      {/* Header & Filter Controls */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Flame className="w-7 h-7 text-rose-500" /> Approved Stories Feed
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Verified stories curated for mature readers (18+ only)
            </p>
          </div>

          {(selectedLang !== 'all' || selectedCat !== 'all') && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Reset Filters
            </Link>
          )}
        </div>

        {/* Filter Pills Container */}
        <div className="p-5 rounded-2xl border border-zinc-800/90 bg-[#121216]/80 backdrop-blur-md space-y-4">
          {/* Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 sm:w-24 shrink-0">
              <Filter className="w-3.5 h-3.5 text-rose-400" /> Category:
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCat === cat.toLowerCase()
                return (
                  <Link
                    key={cat}
                    href={buildFilterUrl(selectedLang, cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white crimson-glow-sm scale-105'
                        : 'bg-[#09090b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Language Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 border-t border-zinc-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 sm:w-24 shrink-0">
              <Languages className="w-3.5 h-3.5 text-rose-400" /> Language:
            </span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isActive = selectedLang === lang.toLowerCase()
                return (
                  <Link
                    key={lang}
                    href={buildFilterUrl(lang, selectedCat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white crimson-glow-sm scale-105'
                        : 'bg-[#09090b] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {lang}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid or Empty State */}
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 rounded-2xl border border-zinc-800/80 bg-[#121216]/50">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-900/60 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-7 h-7 text-rose-500 opacity-80" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Stories Found</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            There are no approved stories matching category{' '}
            <strong className="text-zinc-200 capitalize">&ldquo;{selectedCat}&rdquo;</strong> and
            language <strong className="text-zinc-200 capitalize">&ldquo;{selectedLang}&rdquo;</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white transition-all"
            >
              Clear Filters
            </Link>
            <Link
              href="/generate"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white crimson-glow-sm transition-all"
            >
              Generate with AI
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-28 rounded-2xl bg-zinc-900/80 border border-zinc-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        ))}
      </div>
    </div>
  )
}

export default function HomeFeed({ searchParams }: HomeFeedProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-16 overflow-hidden text-center max-w-5xl mx-auto">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[280px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 text-xs font-medium text-rose-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            DesiFantasy / VelvetTales • 18+ Adult Stories Realm
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Where Desires Take Form <br />
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent crimson-glow-text">
              In Intimate Words
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 mb-8 leading-relaxed">
            Immerse yourself in deeply sensual romances, high-fantasy erotic sagas, and taboo encounters.
            Browse approved community tales or craft your own with multi-key AI failover.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#feed"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm crimson-glow transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" /> Start Reading
            </a>

            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 font-medium text-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-rose-400" /> AI Story Studio
            </Link>

            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-medium text-sm transition-all"
            >
              <PenTool className="w-4 h-4 text-zinc-400" /> Write Story
            </Link>
          </div>
        </section>

        {/* Stories Feed Section with Suspense */}
        <section id="feed" className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
          <Suspense fallback={<FeedSkeleton />}>
            <StoriesGrid searchParams={searchParams} />
          </Suspense>
        </section>

        {/* Feature Highlights */}
        <section className="px-6 py-16 border-t border-zinc-800 bg-[#09090b] text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-rose-400" />
              <span>Multilingual: English • Hindi • Hinglish</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Spicy & Explicit Ratings</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>OpenRouter AI Engine Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>18+ Verified & Safe-Harbor Compliant</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 bg-[#09090b] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <span className="font-semibold text-zinc-300">DesiFantasy / VelvetTales</span>
            <span>© 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-rose-400 font-medium">18+ Adult Stories</span>
            <span>App Router Production Feed</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
