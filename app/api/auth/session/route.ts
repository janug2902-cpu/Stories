import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const customSessionCookie = cookieStore.get('kinky_author_session')

    if (customSessionCookie?.value) {
      try {
        const payload = JSON.parse(customSessionCookie.value)
        return NextResponse.json({ user: payload, profile: payload })
      } catch {
        // Fall through
      }
    }

    // Try Supabase auth
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        return NextResponse.json({ user, profile })
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({ user: null, profile: null })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Session check failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
