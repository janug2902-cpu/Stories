import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { HomeFeedClient } from '@/components/HomeFeedClient'
import { MASTER_STORIES } from '@/lib/stories-data'
import type { Story } from '@/types/database'

interface HomeFeedProps {
  searchParams: Promise<{
    lang?: string
    cat?: string
  }>
}

function HomeFeedSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="h-10 w-48 bg-zinc-900 rounded-xl" />
      <div className="h-16 w-full bg-zinc-900/60 rounded-2xl border border-zinc-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
        ))}
      </div>
    </div>
  )
}

async function FeedContent({ searchParams }: HomeFeedProps) {
  const resolvedParams = await searchParams
  const selectedLang = resolvedParams.lang || 'all'
  const selectedCat = resolvedParams.cat || 'all'

  let dbStories: Story[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error && data) {
      dbStories = data as Story[]
    }
  } catch {
    // DB offline or unseeded
  }

  // Combine live user submissions / approved DB stories with our comprehensive MASTER_STORIES library
  const storyMap = new Map<string, Story>()
  dbStories.forEach((s) => storyMap.set(s.id, s))
  MASTER_STORIES.forEach((s) => {
    if (!storyMap.has(s.id)) {
      storyMap.set(s.id, s)
    }
  })

  const allStories = Array.from(storyMap.values())

  return (
    <HomeFeedClient
      initialStories={allStories}
      initialLang={selectedLang}
      initialCat={selectedCat}
    />
  )
}

export default function HomeFeed({ searchParams }: HomeFeedProps) {
  return (
    <Suspense fallback={<HomeFeedSkeleton />}>
      <FeedContent searchParams={searchParams} />
    </Suspense>
  )
}
