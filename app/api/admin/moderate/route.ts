import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { StoryStatus } from '@/types/database'

interface ModerateRequestBody {
  storyId: string
  action: 'approve' | 'reject'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ModerateRequestBody
    const { storyId, action } = body

    if (!storyId || !action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Invalid payload: storyId and valid action (approve/reject) are required.' },
        { status: 400 }
      )
    }

    // 1. Verify user authentication
    const userClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to perform moderation actions.' },
        { status: 401 }
      )
    }

    // 2. Verify admin role in profiles table
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin role required to moderate submissions.' },
        { status: 403 }
      )
    }

    // 3. Update story status using privileged admin client
    const newStatus: StoryStatus = action === 'approve' ? 'approved' : 'rejected'

    const adminClient = await createAdminClient()
    const { error: updateError } = await adminClient
      .from('stories')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId)

    if (updateError) {
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      storyId,
      status: newStatus,
      message: `Story marked as ${newStatus} successfully.`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
