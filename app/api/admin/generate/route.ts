import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/supabase/admin-auth'
import { generateAIContent, OpenRouterMessage } from '@/lib/openrouter'
import type { StoryLanguage, StoryCategory, ContentRating } from '@/types/database'

export const maxDuration = 60

interface AdminGenerateRequest {
  prompt_description: string
  mood?: string
  characters?: string
  language?: StoryLanguage
  category?: StoryCategory
  rating?: ContentRating
}

function parseStructuredStory(rawText: string) {
  let title = 'Nights of Unspoken Longing'
  let summary = 'An intimate encounter in the shadows where deep desires melt all remaining restraint.'
  let content = rawText

  const titleMatch = rawText.match(/TITLE:\s*([^\n\r]+)/i)
  const summaryMatch = rawText.match(/SUMMARY:\s*([^\n\r]+)/i)
  const storyIndex = rawText.search(/STORY:\s*/i)

  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim().replace(/^["']|["']$/g, '')
  }

  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim().replace(/^["']|["']$/g, '')
  }

  if (storyIndex !== -1) {
    content = rawText.slice(storyIndex).replace(/STORY:\s*/i, '').trim()
  } else {
    // Clean any residual metadata labels if formatting was loose
    content = rawText
      .replace(/TITLE:\s*[^\n\r]+/i, '')
      .replace(/SUMMARY:\s*[^\n\r]+/i, '')
      .trim()
  }

  return { title, summary, content }
}

export async function POST(request: Request) {
  try {
    // 1. Strict Admin Security Verification
    const { isAdmin } = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin clearance required.' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as AdminGenerateRequest
    const {
      prompt_description,
      mood = 'Passionate',
      characters = 'Two intensely drawn souls crossing unspoken boundaries',
      language = 'hinglish',
      category = 'romance',
      rating = 'spicy',
    } = body

    if (!prompt_description || prompt_description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt description is required to generate a story.' },
        { status: 400 }
      )
    }

    // 2. Step 1: Generate Master Story in English with Title & Summary
    const intensity =
      rating === 'explicit'
        ? 'Uncensored 18+ adult erotica, vivid physical ecstasy, bold chemistry, and direct passion.'
        : 'Spicy sensual romance, electric tension, slow-burn intimacy, and emotional longing.'

    const step1System = `You are a master adult fantasy and erotic romance author for an exclusive platform.
You create emotionally rich, provocative, and sensual fiction.

FORMATTING RULE: You MUST format your response strictly as follows:
TITLE: <A short, poetic, magnetic title under 10 words>
SUMMARY: <A 1-2 sentence seductive teaser summary under 180 characters>
STORY:
<Full multi-paragraph prose of 500-800 words with rich dialogue and sensual pacing>`

    const step1User = `Premise / Prompt:
${prompt_description}

Mood: ${mood}
Category: ${category}
Heat Intensity: ${intensity}
Characters: ${characters}

Write the complete narrative draft now in English following the exact format above.`

    const step1Messages: OpenRouterMessage[] = [
      { role: 'system', content: step1System },
      { role: 'user', content: step1User },
    ]

    const step1Output = await generateAIContent(step1Messages)
    const { title, summary, content } = parseStructuredStory(step1Output)

    // 3. Step 2: Language Adaptation (if target is Hinglish or Hindi)
    let finalContent = content

    if (language === 'hinglish') {
      const hinglishSystem = `You are an expert Indian fiction dialogue stylist. Rewrite this English romantic/adult story into natural, modern, conversational Hinglish (Hindi written in Roman/Latin script). Do NOT use stiff textbook Hindi. Retain the passion, intimacy, dialogues, and sensual intensity.
Guidelines:
- Romanized Hindi for natural conversations (e.g. "Tumhe aana nahi chahiye tha", "Uski saansein gardan par chhu rahi thi").
- Preserve all erotic tension, spicy details, and intimate pacing.
- Output ONLY the rewritten prose story text with clear paragraphs.`

      const hinglishMessages: OpenRouterMessage[] = [
        { role: 'system', content: hinglishSystem },
        {
          role: 'user',
          content: `Adapt this story into natural conversational Hinglish:\n\n${content}`,
        },
      ]

      finalContent = await generateAIContent(hinglishMessages)
    } else if (language === 'hindi') {
      const hindiSystem = `You are an acclaimed Hindi romantic literature author. Rewrite this English romantic/adult story into natural, evocative, and passionate Devanagari Hindi (हिन्दी लिपि).
Guidelines:
- Use rich, fluid, contemporary Devanagari Hindi.
- Retain all sensual tension, intimate touches, dialogues, and physical heat.
- Output ONLY the rewritten prose story text with clear paragraphs.`

      const hindiMessages: OpenRouterMessage[] = [
        { role: 'system', content: hindiSystem },
        {
          role: 'user',
          content: `Adapt this story into natural Devanagari Hindi:\n\n${content}`,
        },
      ]

      finalContent = await generateAIContent(hindiMessages)
    }

    return NextResponse.json({
      title,
      summary,
      content: finalContent,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Story generation pipeline error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
