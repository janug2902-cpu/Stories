import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure profile exists on OAuth login
      const username =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'User'

      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          username,
          role: 'user',
          daily_ai_quota: 5,
          last_quota_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to home if code exchange fails
  return NextResponse.redirect(`${origin}/`)
}
