import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { MASTER_STORIES_MAP } from '@/lib/stories-data'

// Persistent in-memory cache for dynamic views tracking across server requests
const runtimeViewsCache = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storyId, initialCount = 0 } = body

    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json({ error: 'Missing storyId parameter' }, { status: 400 })
    }

    // 1. Calculate next view count in runtime cache
    const currentCached = runtimeViewsCache.get(storyId)
    const baseCount =
      currentCached !== undefined
        ? currentCached
        : MASTER_STORIES_MAP[storyId]?.views_count || initialCount || 0
    const nextCount = baseCount + 1
    runtimeViewsCache.set(storyId, nextCount)

    // Also update MASTER_STORIES_MAP in memory so other server components read the new value
    if (MASTER_STORIES_MAP[storyId]) {
      MASTER_STORIES_MAP[storyId].views_count = nextCount
    }

    // 2. Persist to Supabase if available
    try {
      const supabase = await createAdminClient()
      const { data: dbStory } = await supabase
        .from('stories')
        .select('views_count')
        .eq('id', storyId)
        .single()

      if (dbStory) {
        const dbNext = (dbStory.views_count || 0) + 1
        await supabase
          .from('stories')
          .update({ views_count: dbNext })
          .eq('id', storyId)

        runtimeViewsCache.set(storyId, dbNext)
        return NextResponse.json({ success: true, views_count: dbNext })
      }
    } catch {
      // Supabase table or row unavailable, fallback gracefully to in-memory count
    }

    return NextResponse.json({ success: true, views_count: nextCount })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to increment view count'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
