import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/supabase/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { StoryCategory, StoryLanguage, ContentRating, StoryStatus } from '@/types/database'

interface PublishRequestBody {
  title: string
  summary?: string
  content: string
  category: StoryCategory
  language: StoryLanguage
  content_rating: ContentRating
  is_ai_generated?: boolean
  status?: StoryStatus
}

export async function POST(request: Request) {
  try {
    // 1. Strict Security Check: Verify admin role
    const { user, isAdmin } = await verifyAdminSession()
    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: 'Forbidden: Admin clearance required to publish directly.' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as PublishRequestBody
    const {
      title,
      summary,
      content,
      category,
      language,
      content_rating,
      is_ai_generated = true,
      status = 'approved',
    } = body

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Story title and content are required.' },
        { status: 400 }
      )
    }

    // 2. Insert into stories table using privileged admin client
    const adminClient = await createAdminClient()
    const { data, error } = await adminClient
      .from('stories')
      .insert({
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content.trim(),
        category,
        language,
        content_rating,
        author_id: user.id,
        is_ai_generated: Boolean(is_ai_generated),
        status,
        views_count: 0,
        likes_count: 0,
      })
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: `Database insertion failed: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      storyId: data.id,
      status,
      message:
        status === 'approved'
          ? 'Story published live to the platform!'
          : 'Story saved as draft.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error while publishing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
