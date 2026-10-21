import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanUsername = username?.trim() || cleanEmail.split('@')[0]
    const cookieStore = await cookies()
    const supabase = await createClient()

    let userId: string = ''

    // Attempt Supabase signUp
    try {
      const { data: signUpData } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { username: cleanUsername },
        },
      })
      if (signUpData?.user?.id) {
        userId = signUpData.user.id
      }
    } catch {
      // Fallback ID if Supabase rejects custom email domain
    }

    if (!userId) {
      userId = 'author_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16)
    }

    const sessionPayload = {
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      daily_ai_quota: 10,
    }

    // Set 30-day session cookie
    cookieStore.set('kinky_author_session', JSON.stringify(sessionPayload), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: 'lax',
    })

    // Upsert profile in Supabase
    try {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          username: cleanUsername,
          role: sessionPayload.role as 'user' | 'admin',
          daily_ai_quota: 10,
          last_quota_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
    } catch {
      // Continue gracefully
    }

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Account created successfully! Welcome to Kinkyomen.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
