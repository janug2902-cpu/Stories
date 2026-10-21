import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAIContent, OpenRouterMessage } from '@/lib/openrouter'

export const maxDuration = 60

interface AdaptRequestBody {
  draft?: string
  target_language?: 'hindi' | 'hinglish'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdaptRequestBody
    const { draft, target_language } = body

    if (!draft || draft.trim().length === 0) {
      return NextResponse.json(
        { error: 'A story draft is required for language adaptation.' },
        { status: 400 }
      )
    }

    if (!target_language || (target_language !== 'hindi' && target_language !== 'hinglish')) {
      return NextResponse.json(
        { error: "Invalid target language. Must be 'hindi' or 'hinglish'." },
        { status: 400 }
      )
    }

    // 1. Check user session (guests allowed freely!)
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
          remainingQuota = Math.max(0, profile.daily_ai_quota - 1)
          await supabase
            .from('profiles')
            .update({ daily_ai_quota: remainingQuota })
            .eq('id', user.id)
        }
      }
    } catch {
      // Guest access - proceed
    }

    // 2. System Prompt for Adaptation Step
    let systemPrompt = ''

    if (target_language === 'hinglish') {
      systemPrompt = `You are an expert Indian fiction dialogue stylist for Kinkyomen. Rewrite this English romantic/adult story into natural, modern, conversational Hinglish (Hindi written in Roman/Latin script). Do NOT use stiff textbook Hindi. Retain the passion, intimacy, dialogues, and sensual intensity.

Key Guidelines:
- Write exclusively in natural Romanized Hindi / Hinglish (e.g. "Tumhe yahan nahi aana chahiye tha", "Uski saansein tez ho rahi thi", "Dono ke beech ki dooriyan khatam ho chuki thi").
- Keep English modern words where natural in contemporary urban conversations (e.g. "feel", "touch", "bedroom", "whisper", "light").
- Preserve all emotional chemistry, seductive banter, intense physical touches, and heat without censoring.
- Ensure natural paragraph breaks.`
    } else {
      // Natural Devanagari Hindi
      systemPrompt = `You are an acclaimed Hindi romantic literature author writing for Kinkyomen. Rewrite this English romantic/adult story into natural, evocative, and passionate Devanagari Hindi (हिन्दी लिपि).

Key Guidelines:
- Write in rich, fluid, contemporary Devanagari Hindi.
- Retain all the sensual tension, intimate touches, dialogues, and raw romantic passion without sanitizing.
- Use vivid sensory descriptors for touch, breath, fragrance, and heartbeat.
- Structure with clear paragraph breaks.`
    }

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Here is the English story draft to adapt into ${
          target_language === 'hinglish' ? 'natural conversational Hinglish' : 'Devanagari Hindi'
        }:\n\n${draft}`,
      },
    ]

    // 3. Generate adaptation
    const finalStory = await generateAIContent(messages)

    return NextResponse.json({
      finalStory,
      remainingQuota,
      language: target_language,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Language adaptation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
