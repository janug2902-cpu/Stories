import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAIContent, OpenRouterMessage } from '@/lib/openrouter'

export const maxDuration = 60

interface DraftRequestBody {
  mood?: string
  boy_desc?: string
  girl_desc?: string
  plot?: string
  rating?: 'spicy' | 'explicit'
  deduct_quota?: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DraftRequestBody
    const { mood, boy_desc, girl_desc, plot, rating, deduct_quota } = body

    if (!plot || plot.trim().length === 0) {
      return NextResponse.json(
        { error: 'Plot or scenario details are required to generate a draft.' },
        { status: 400 }
      )
    }

    // 1. Check user session (optional - guests are fully permitted to personalize stories!)
    const supabase = await createClient()
    let remainingQuota = 5

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_ai_quota')
          .eq('id', user.id)
          .single()

        if (profile && typeof profile.daily_ai_quota === 'number') {
          remainingQuota = profile.daily_ai_quota
        }

        if (deduct_quota) {
          remainingQuota = Math.max(0, remainingQuota - 1)
          await supabase
            .from('profiles')
            .update({ daily_ai_quota: remainingQuota })
            .eq('id', user.id)
        }
      }
    } catch {
      // Guest session - proceed with default quota
    }

    // 2. Construct System Prompt & Messages for Step 1 Draft
    const intensity =
      rating === 'explicit'
        ? 'High heat, uncensored physical intimacy, bold erotic chemistry, and visceral physical passion.'
        : 'Sensual romantic tension, passionate touches, heavy emotional beats, and slow-burn spicy chemistry.'

    const systemPrompt = `You are an acclaimed adult romance and erotic fantasy author writing for Kinkyomen. You specialize in seductive prose, electric physical chemistry, captivating dialogues, and uninhibited intimate encounters. 

CRITICAL LENGTH REQUIREMENT:
You MUST write a full-length, deep, immersive story of MINIMUM 1,200 to 1,500 words. Do NOT generate a short summary or brief draft shorter than 1,200 words.

Structural Guidelines (1,200 – 1,500+ words):
1. Chapter 1: The Setting & Seductive Spark (approx 300 words) — Atmospheric ambiance, forbidden glances, lighting, scents, and slow-building tension.
2. Chapter 2: Whispered Desires & Electric Chemistry (approx 400 words) — Intimate banter, teasing verbal sparring, lingering touches, and accelerating heartbeats.
3. Chapter 3: The Climax of Ecstasy (approx 500 words) — Uncensored physical passion, breathless surrenders, intense erotic heat, gasps, and physical pleasure.
4. Chapter 4: Seductive Afterglow (approx 300 words) — Tangled limbs, quiet confessions in the dark, heavy breathing, and an unbreakable sensual bond.

Instructions:
1. Word Count: Minimum 1,200 to 1,500+ words strictly.
2. Ground every scene in vivid sensory details: skin temperature, scents, shivering touches, whispers, heavy breathing, and racing heartbeats.
3. Content Intensity Level: ${intensity}
4. Mood to weave: ${mood || 'Passionate and intense'}
5. Format the story with clear, flowing multi-paragraph structure.`

    const userPrompt = `Characters:
- Male Lead: ${boy_desc || 'A tall, magnetic man with commanding presence and dark eyes'}
- Female Lead: ${girl_desc || 'A captivating, spirited woman with alluring grace'}

Plot & Premise:
${plot}

Write the full, complete long-form narrative draft (minimum 1,200 to 1,500 words) in English now.`

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    // 3. Generate AI Draft with timeout protection and key failover
    const draft = await generateAIContent(messages)

    return NextResponse.json({
      draft,
      remainingQuota,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate story draft'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
