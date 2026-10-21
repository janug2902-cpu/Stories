import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReaderClient } from '@/components/ReaderClient'
import type { Story } from '@/types/database'
import { MASTER_STORIES_MAP } from '@/lib/stories-data'
import { ensureStoryMinLength } from '@/lib/story-length-ensurer'

// Curated seed stories for immediate development & preview
const FALLBACK_STORIES: Record<string, Story> = {
  '1': {
    id: '1',
    author_id: 'seed-author-1',
    title: 'Midnight in Chandni Chowk',
    summary:
      'A rain-soaked rendezvous beneath the balcony of an ancestral haveli turns into an uninhibited night of whispered secrets and breathless intimacy.',
    content: `The rain fell over Old Delhi in relentless sheets, drumming against the red sandstone arches of the ancestral haveli. 

Inside the curtained veranda, the scent of petrichor mingled with night-blooming jasmine and warm musk. Priya stepped closer, her silk dupatta soaked through, clinging sensuously to the curves of her waist.

"You should not have summoned me in this storm," Kabir whispered, his voice dark and thick with longing.

"And you should not have answered," she breathed, her heart hammering against her ribs as his fingers traced the damp line of her collarbone. The electricity flickered, leaving them in shadows illuminated only by the distant flashes of lightning.

Every breath between them became heavy, charged with years of unspoken longing. When his hands finally drew her in, the ancient walls bore witness to a fevered, breathless passion that defied family pride and honor.

Hours melted like candle wax. In the quiet lull before dawn, with only the soft dripping of rainwater from the eaves, they lay entangled in the shadows, knowing that some desires, once ignited, can never be extinguished.`,
    language: 'hinglish',
    category: 'romance',
    content_rating: 'spicy',
    is_ai_generated: false,
    status: 'approved',
    views_count: 4821,
    likes_count: 1240,
    created_at: '2026-10-20T12:00:00Z',
    updated_at: '2026-10-20T12:00:00Z',
  },
  '2': {
    id: '2',
    author_id: 'seed-author-2',
    title: 'The Sorceress’s Bound Oath',
    summary:
      'Bound by ancient blood-magic in the high obsidian citadel, a royal commander and an untamed shadow-caster surrender to their deepest carnal hunger.',
    content: `High atop the obsidian spires of Valenreach, the twin moons cast a violet sheen over the marble dais. 

Captain Eric Vance tightened his grip on his rune-etched hilt, his pulse racing not from fear, but from the intoxicating presence of Lady Vespera. Her dark eyes gleamed with forbidden arcana as runes shimmered along her bare shoulders.

"The binding circle requires complete physical surrender, Commander," she murmured, stepping forward until the warmth of her breath ghosted over his throat. "One false thought, and the magic consumes us both."

"Then let it consume us," Eric growled, catching her by the waist and pulling her against his armor.

Her laughter was low, thrilling, and dangerous. As their lips met, the ward runes pulsed crimson, unleashing waves of carnal ecstasy that tore through the sanctum, melting steel, pride, and restraint into pure, unbound desire.

Arcane sparks danced along their skin as barriers shattered. When the moons aligned, the bond was sealed—not merely with words of sorcery, but in the breathless, unyielding surrender of their bodies.`,
    language: 'english',
    category: 'fantasy',
    content_rating: 'explicit',
    is_ai_generated: true,
    status: 'approved',
    views_count: 8911,
    likes_count: 2350,
    created_at: '2026-10-19T14:30:00Z',
    updated_at: '2026-10-19T14:30:00Z',
  },
  '3': {
    id: '3',
    author_id: 'seed-author-3',
    title: 'Raat Ki Madhushala',
    summary:
      'Ek anjaan mehmaan, ek purani haveli aur do dilon ki aisi dastaan jahan har chhuwan ek nayi aag bhadkati hai.',
    content: `Haveli ke kamre mein halki madham roshni thi. Bahar hawa ki sarsarahat aur andar do dilon ki tez dhadkanein.

Devika ne aaina dekhte hue apne baalon ki lat ko peeche kiya. Darwaaze par halki dastak hui, aur Samar andar aaya. Uski aankhon mein ek aisi chamak thi jise Devika kai dino se mehsoos kar rahi thi.

"Tumhe yahan nahi aana chahiye tha, Samar," Devika ne dheeme se kaha, par uske lafzon mein rokne ki koi taaqat nahi thi.

Samar ne aage badhkar uski kamar par apna haath rakha. Uski garam saansein Devika ki gardan par padte hi ek thar-tharahat si daud gayi. Raat ka har pehar ek naye ehsaas, ek nayi gehraai aur be-parwah jazbaat ki aag mein dhalta chala gaya.

Subah ki pehli kiran aane tak, dono ke beech ki dooriyan hamesha ke liye mitti ban chuki thi.`,
    language: 'hindi',
    category: 'erotica',
    content_rating: 'explicit',
    is_ai_generated: false,
    status: 'approved',
    views_count: 6141,
    likes_count: 1890,
    created_at: '2026-10-18T18:15:00Z',
    updated_at: '2026-10-18T18:15:00Z',
  },
  '4': {
    id: '4',
    author_id: 'seed-author-4',
    title: 'Forbidden Ties & Velvet Shadows',
    summary:
      'Crossing societal boundaries behind locked penthouse doors, exploring unspoken yearnings that can never be spoken in the daylight.',
    content: `The skyline of South Mumbai glimmered through the floor-to-ceiling glass of the 42nd-floor penthouse. 

Rohan poured two glasses of vintage Merlot, his hands remarkably steady despite the illicit tension thrumming through the room. Meera stood by the balcony glass, her silk gown whispering against her thighs with every small movement.

"If anyone finds out about tonight, Rohan... everything collapses," she said softly, turning around.

He placed the glasses on the granite counter and walked toward her with deliberate, unhurried steps. "Nobody knows. And nobody will."

When his fingers tilted her chin upward and their lips parted in an urgent, stifled gasp, all the rules, boundaries, and familial taboos dissolved into a whirlwind of velvet touch and passionate abandon.

The city lights below seemed a million miles away, insignificant compared to the raw heat that bound them behind those locked double doors.`,
    language: 'hinglish',
    category: 'taboo',
    content_rating: 'spicy',
    is_ai_generated: true,
    status: 'approved',
    views_count: 3411,
    likes_count: 980,
    created_at: '2026-10-17T20:00:00Z',
    updated_at: '2026-10-17T20:00:00Z',
  },
}

interface ReaderPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: ReaderPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('stories')
      .select('title, summary')
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (data) {
      return {
        title: `${data.title} | Kinkyomen`,
        description: data.summary || 'Read this adult romance story on Kinkyomen.',
      }
    }
  } catch {
    // metadata fallback
  }

  const fallback = MASTER_STORIES_MAP[id] || FALLBACK_STORIES[id]
  if (fallback) {
    return {
      title: `${fallback.title} | Kinkyomen`,
      description: fallback.summary || 'Read this adult romance story on Kinkyomen.',
    }
  }

  return {
    title: 'Adult Story Reader | Kinkyomen',
  }
}

function ReaderSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
      <div className="h-8 w-1/3 mx-auto bg-zinc-900 rounded-lg" />
      <div className="h-12 w-2/3 mx-auto bg-zinc-900 rounded-lg" />
      <div className="h-96 w-full bg-zinc-900/60 rounded-2xl border border-zinc-800" />
    </div>
  )
}

async function StoryContent({ params }: ReaderPageProps) {
  const { id } = await params

  let story: Story | null = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (!error && data) {
      story = data as Story

      // Increment views count asynchronously
      supabase
        .from('stories')
        .update({ views_count: (story.views_count ?? 0) + 1 })
        .eq('id', story.id)
        .then(() => {})
    }
  } catch {
    // Database query failed or unseeded
  }

  // Fallback to seed stories if not found in DB
  if (!story) {
    story = MASTER_STORIES_MAP[id] || FALLBACK_STORIES[id] || null
  }

  if (!story) {
    notFound()
  }

  // Guarantee story meets minimum 1,200 to 1,500 words requirement
  const fullStory = ensureStoryMinLength(story)

  return <ReaderClient story={fullStory} />
}

export default function StoryReaderPage({ params }: ReaderPageProps) {
  return (
    <Suspense fallback={<ReaderSkeleton />}>
      <StoryContent params={params} />
    </Suspense>
  )
}
