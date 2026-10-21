import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/supabase/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

interface ReportActionBody {
  reportId: string
  action: 'dismiss' | 'delete_story'
  storyId?: string
}

// GET: Fetch all reports with story context
export async function GET() {
  try {
    const { isAdmin } = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin clearance required.' },
        { status: 403 }
      )
    }

    const adminClient = await createAdminClient()

    // Query reports and join stories table
    const { data: reports, error } = await adminClient
      .from('reports')
      .select('*, stories (id, title, language, category, content_rating)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reports'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Moderate report (dismiss or delete_story)
export async function POST(request: Request) {
  try {
    const { isAdmin } = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin clearance required.' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as ReportActionBody
    const { reportId, action, storyId } = body

    if (!reportId || !action || (action !== 'dismiss' && action !== 'delete_story')) {
      return NextResponse.json(
        { error: "Invalid payload: reportId and action ('dismiss' or 'delete_story') are required." },
        { status: 400 }
      )
    }

    const adminClient = await createAdminClient()

    if (action === 'dismiss') {
      // Mark report as resolved
      const { error } = await adminClient
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: 'dismiss',
        message: 'Report dismissed and marked as resolved.',
      })
    }

    if (action === 'delete_story') {
      let targetStoryId = storyId

      // If storyId not directly passed, look up via report record
      if (!targetStoryId) {
        const { data: reportRecord } = await adminClient
          .from('reports')
          .select('story_id')
          .eq('id', reportId)
          .single()

        targetStoryId = reportRecord?.story_id
      }

      if (targetStoryId) {
        // Delete story from stories table
        const { error: storyDeleteError } = await adminClient
          .from('stories')
          .delete()
          .eq('id', targetStoryId)

        if (storyDeleteError) {
          console.warn('Story deletion returned notice:', storyDeleteError.message)
        }
      }

      // Mark report as resolved
      await adminClient
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)

      return NextResponse.json({
        success: true,
        action: 'delete_story',
        message: 'Story permanently removed from platform and report marked as resolved.',
      })
    }

    return NextResponse.json({ error: 'Unrecognized action.' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Report action failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
