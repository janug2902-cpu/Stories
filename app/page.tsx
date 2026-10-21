import React from 'react'
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

export default async function HomeFeed({ searchParams }: HomeFeedProps) {
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
