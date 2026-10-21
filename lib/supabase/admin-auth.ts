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
 * AND that profiles.role === 'admin'.
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, profile: null, isAdmin: false }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { user, profile: profile as Profile | null, isAdmin: false }
    }

    return { user, profile: profile as Profile, isAdmin: true }
  } catch (err) {
    console.error('Admin session verification failed:', err)
    return { user: null, profile: null, isAdmin: false }
  }
}
