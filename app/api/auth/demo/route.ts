import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const demoEmail = 'author@kinkyomen.com'
    const demoUsername = 'KinkyAuthor'
    const demoUserId = 'demo-author-kinkyomen-01'

    const sessionPayload = {
      id: demoUserId,
      email: demoEmail,
      username: demoUsername,
      role: 'admin', // Admin privileges so user can test everything (Admin panel, Moderation, UGC, Factory)
      daily_ai_quota: 10,
    }

    // Set active session cookie
    cookieStore.set('kinky_author_session', JSON.stringify(sessionPayload), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: 'lax',
    })

    // Upsert into Supabase profiles
    try {
      const supabase = await createClient()
      await supabase.from('profiles').upsert(
        {
          id: demoUserId,
          username: demoUsername,
          role: 'admin',
          daily_ai_quota: 10,
          last_quota_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
    } catch {
      // Continue even if Supabase table is unreachable
    }

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Demo author session created successfully.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Demo login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
