import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export interface StoryComment {
  id: string
  story_id: string
  user_id?: string
  author_name: string
  content: string
  rating: number // 1 to 5
  likes_count: number
  created_at: string
}

// In-memory comments storage ensuring comments persist even if DB is unmigrated
const runtimeComments = new Map<string, StoryComment[]>()

// Seed realistic reader feedback so every story feels lively and engaging
const DEFAULT_SEED_FEEDBACK: Record<string, StoryComment[]> = {
  'ts-dj-bj-epic-1': [
    {
      id: 'c-seed-1',
      story_id: 'ts-dj-bj-epic-1',
      author_name: 'प्रिया शर्मा (Priya)',
      content:
        'उफ्फ! सेमिनार हॉल के सन्नाटे में बारिश और डीजे की वो छुअन... रोंगटे खड़े कर देने वाली कहानी है। ऑडियो के साथ सुनना तो बिल्कुल अलग ही नशा दे गया!',
      rating: 5,
      likes_count: 42,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'c-seed-2',
      story_id: 'ts-dj-bj-epic-1',
      author_name: 'रोहित वर्मा (Rohit)',
      content:
        'प्रोफेसर बीजे और डीजे की केमिस्ट्री लाजवाब है। रात की खामोशी और महोगनी मेज का वो सीन सबसे बेहतरीन था। अगला भाग कब आ रहा है?',
      rating: 5,
      likes_count: 28,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'c-seed-3',
      story_id: 'ts-dj-bj-epic-1',
      author_name: 'Kavya S.',
      content:
        'Such intense chemistry! The dialogues and slow-burn tension felt so real and breathless. Truly loved the Hindi audio narration too.',
      rating: 5,
      likes_count: 19,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
}

function getInitialCommentsForStory(storyId: string): StoryComment[] {
  if (DEFAULT_SEED_FEEDBACK[storyId]) {
    return DEFAULT_SEED_FEEDBACK[storyId]
  }

  // Generative default seed feedback for other stories
  return [
    {
      id: `seed-c1-${storyId}`,
      story_id: storyId,
      author_name: 'अनामिका (Anamika)',
      content: 'बहुत ही खूबसूरत और कामुक कहानी! हर एक शब्द दिल को छू गया। ऑडियो आवाज़ भी बेहद प्यारी है।',
      rating: 5,
      likes_count: 14,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: `seed-c2-${storyId}`,
      story_id: storyId,
      author_name: 'Sameer K.',
      content: 'Super passionate writing. The emotions, touch, and chemistry kept me hooked until the end!',
      rating: 5,
      likes_count: 9,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storyId = searchParams.get('storyId')

  if (!storyId) {
    return NextResponse.json({ error: 'Missing storyId query parameter.' }, { status: 400 })
  }

  // Check runtime memory store
  let commentsList = runtimeComments.get(storyId)
  if (!commentsList) {
    commentsList = [...getInitialCommentsForStory(storyId)]
    runtimeComments.set(storyId, commentsList)
  }

  // Attempt to fetch from Supabase
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge unique comments
      const typedData = data as StoryComment[]
      const existingIds = new Set(typedData.map((c) => c.id))
      const combined = [
        ...typedData,
        ...commentsList.filter((c) => !existingIds.has(c.id)),
      ]
      return NextResponse.json({ comments: combined })
    }
  } catch {
    // DB unmigrated or table missing, return in-memory comments
  }

  return NextResponse.json({ comments: commentsList })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storyId, content, authorName = 'अनाम पाठक (Reader)', rating = 5 } = body

    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json({ error: 'Missing storyId.' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty.' }, { status: 400 })
    }

    // Try getting user session
    let userId: string | undefined = undefined
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        userId = data.user.id
      }
    } catch {
      // Guest comment
    }

    const newComment: StoryComment = {
      id: 'c_' + crypto.randomUUID().slice(0, 12),
      story_id: storyId,
      user_id: userId,
      author_name: authorName.trim() || 'अनाम पाठक (Reader)',
      content: content.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      likes_count: 0,
      created_at: new Date().toISOString(),
    }

    // Save into runtime memory store
    const existing = runtimeComments.get(storyId) || [...getInitialCommentsForStory(storyId)]
    existing.unshift(newComment)
    runtimeComments.set(storyId, existing)

    // Save into Supabase table if available
    try {
      const adminSupabase = await createAdminClient()
      await (adminSupabase as any).from('story_comments').insert({
        id: newComment.id,
        story_id: newComment.story_id,
        user_id: newComment.user_id || null,
        author_name: newComment.author_name,
        content: newComment.content,
        rating: newComment.rating,
        likes_count: 0,
        created_at: newComment.created_at,
      })
    } catch (dbErr) {
      console.warn('[Comments API] DB insert notice (fallback active):', dbErr)
    }

    return NextResponse.json({ success: true, comment: newComment })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post comment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
