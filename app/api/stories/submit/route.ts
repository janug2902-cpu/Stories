import { NextResponse } from 'next/server'
import { createAdminClient, getSessionUser } from '@/lib/supabase/server'
import { getStoryWordCount } from '@/lib/story-blocks'
import type { StoryCategory, StoryLanguage, ContentRating } from '@/types/database'

interface StorySubmitRequest {
  title: string
  category: StoryCategory
  language: StoryLanguage
  content_rating: ContentRating
  summary?: string
  content: string
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or create an account to submit your story.' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as StorySubmitRequest
    const { title, category, language, content_rating, summary, content } = body

    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Story title must be at least 5 characters long.' },
        { status: 400 }
      )
    }

    const wordCount = getStoryWordCount(content || '')
    if (wordCount < 200) {
      return NextResponse.json(
        { error: `Story content requires at least 200 words. Current count is ${wordCount} words.` },
        { status: 400 }
      )
    }

    const adminClient = await createAdminClient()

    // 1. Ensure author profile exists (prevents foreign key constraint failure)
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const username =
        user.user_metadata?.username ||
        user.email?.split('@')[0] ||
        `Author_${user.id.slice(0, 6)}`

      await adminClient.from('profiles').upsert(
        {
          id: user.id,
          username,
          role: 'user',
          daily_ai_quota: 5,
          last_quota_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
    }

    // 2. Insert into stories table with 'pending' status
    const { data: story, error: insertError } = await adminClient
      .from('stories')
      .insert({
        title: title.trim(),
        category,
        language,
        content_rating,
        summary: summary?.trim() || null,
        content: content.trim(),
        status: 'pending',
        author_id: user.id,
        is_ai_generated: false,
        views_count: 0,
        likes_count: 0,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Story submission error:', insertError)
      return NextResponse.json(
        { error: `Failed to submit story: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      storyId: story?.id,
      message: 'Story submitted successfully! It will appear on the feed after moderation.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal submission error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
