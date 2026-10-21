import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('kinky_author_session')

    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Signed out successfully.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign out failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
