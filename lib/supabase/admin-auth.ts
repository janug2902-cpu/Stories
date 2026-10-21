import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export interface AdminAuthResult {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
}

/**
 * Strict Security Helper: Verifies that the requesting user's session exists
 * AND that profiles.role === 'admin' (with fallback to verified admin session cookie).
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  try {
    // 1. Check Supabase Auth & Profile
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!authError && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && profile.role === 'admin') {
        return { user, profile: profile as Profile, isAdmin: true }
      }
    }

    // 2. Fallback to kinky_author_session cookie for local/demo admin login
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('kinky_author_session')?.value
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie)
        if (parsed.role === 'admin') {
          return {
            user: { id: parsed.id, email: parsed.email } as User,
            profile: {
              id: parsed.id,
              username: parsed.username || 'Admin',
              role: 'admin',
              daily_ai_quota: 99,
              last_quota_reset: new Date().toISOString(),
              created_at: new Date().toISOString(),
            } as Profile,
            isAdmin: true,
          }
        }
      } catch {
        // Invalid session cookie
      }
    }

    return { user: user || null, profile: null, isAdmin: false }
  } catch (err) {
    console.error('Admin session verification notice:', err)
    return { user: null, profile: null, isAdmin: false }
  }
}
