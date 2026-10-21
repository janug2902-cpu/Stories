import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * In Next.js App Router (v15+), cookies() is an asynchronous function that must be awaited.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.'
    )
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing user sessions.
        }
      },
    },
  })
}

/**
 * Creates an administrative Supabase client using the service role key.
 * Use strictly on the server for privileged backend operations (e.g. quota resets,
 * automated content review, or role updates).
 * CAUTION: Bypasses Row Level Security (RLS).
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    )
  }

  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server component write suppression
        }
      },
    },
  })
}

/**
 * Returns the currently authenticated user from either custom session cookie or Supabase.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const customSessionCookie = cookieStore.get('kinky_author_session')

    if (customSessionCookie?.value) {
      try {
        const payload = JSON.parse(customSessionCookie.value)
        return {
          id: payload.id as string,
          email: payload.email as string,
          user_metadata: {
            username: payload.username || payload.name || payload.email?.split('@')[0],
          },
          role: (payload.role as string) || 'user',
        }
      } catch {
        // Fall through
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata || {},
        role: (user.user_metadata?.role as string) || 'user',
      }
    }

    return null
  } catch {
    return null
  }
}

