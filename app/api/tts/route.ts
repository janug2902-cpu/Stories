import { NextRequest, NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import crypto from 'crypto'

// Voice selection: hi-IN-SwaraNeural is Microsoft's state-of-the-art Hindi neural female voice
// Known for emotional depth, soft breathing inflections, and natural human cadence
const FEMALE_HINDI_VOICE = 'hi-IN-SwaraNeural'

// In-memory cache for audio buffers to avoid duplicate TTS requests
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>()
const MAX_CACHE_ENTRIES = 120

function getCacheKey(text: string, tone: string): string {
  return crypto.createHash('sha256').update(`${tone}:${text}`).digest('hex')
}

// Clean text for speech synthesis and insert natural human breath pauses
function sanitizeTextForSpeech(input: string): string {
  return input
    .replace(/\[IMAGE:[^\]]*\]/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[*_~`#>\-–—]/g, ' ')
    // Convert Hindi danda to natural breathing pauses
    .replace(/।+/g, '... ')
    // Smooth out repeated punctuation into breath pauses
    .replace(/\.{3,}/g, '... ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Map tone presets to precise acoustic rate & pitch parameters for natural, smooth Indian girl voice
function getAcousticParameters(tone: string) {
  switch (tone) {
    case 'velvet':
    case 'desi_mastani':
      // Young, sweet, smooth Indian girl tone with seductive warmth
      return { rate: '-3%', pitch: '+0.5Hz' }
    case 'sultry':
    case 'sensual_whisper':
      // Breathy, slow, intimate bedside whisper
      return { rate: '-6%', pitch: '-0.5Hz' }
    case 'natural':
    case 'bold_passion':
    default:
      // Lively, smooth, expressive feminine cadence
      return { rate: '-1%', pitch: '+0.5Hz' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, tone = 'velvet', rateOverride, pitchOverride } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty text parameter.' },
        { status: 400 }
      )
    }

    const cleanText = sanitizeTextForSpeech(text)
    if (!cleanText) {
      return NextResponse.json(
        { error: 'Text contains no readable characters.' },
        { status: 400 }
      )
    }

    // Limit single chunk to 1,200 characters for optimal latency and stability
    const textChunk = cleanText.slice(0, 1200)
    const cacheKey = getCacheKey(textChunk, tone)

    // Check memory cache
    const cached = audioCache.get(cacheKey)
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cached.buffer.length.toString(),
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-TTS-Cache': 'HIT',
        },
      })
    }

    // Synthesize using MsEdgeTTS neural female voice with 96kbps high fidelity
    const tts = new MsEdgeTTS()
    await tts.setMetadata(FEMALE_HINDI_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)

    const acousticParams = getAcousticParameters(tone)
    const options = {
      rate: rateOverride || acousticParams.rate,
      pitch: pitchOverride || acousticParams.pitch,
    }

    const { audioStream } = tts.toStream(textChunk, options)

    // Accumulate stream chunks into Buffer
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      audioStream.on('end', () => {
        resolve()
      })
      audioStream.on('error', (err: Error) => {
        reject(err)
      })
    })

    const fullBuffer = Buffer.concat(chunks)

    // Store in cache (with basic LRU eviction)
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = audioCache.keys().next().value
      if (oldestKey) audioCache.delete(oldestKey)
    }
    audioCache.set(cacheKey, { buffer: fullBuffer, timestamp: Date.now() })

    return new NextResponse(new Uint8Array(fullBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fullBuffer.length.toString(),
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-TTS-Cache': 'MISS',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown TTS synthesis error'
    console.error('[API /api/tts] Synthesis failure:', message)
    return NextResponse.json(
      { error: 'TTS audio synthesis failed.', details: message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') || ''
  const tone = searchParams.get('tone') || 'velvet'

  if (!text.trim()) {
    return NextResponse.json({ error: 'Text query param is required.' }, { status: 400 })
  }

  // Delegate to POST logic
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ text, tone }),
      headers: { 'Content-Type': 'application/json' },
    })
  )
}
