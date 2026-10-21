export type StoryBlockType = 'text' | 'image' | 'gif' | 'video'

export interface StoryBlock {
  id: string
  type: StoryBlockType
  content: string // text paragraph if 'text', or media URL / Base64 data if 'image' | 'gif' | 'video'
  caption?: string
}

/**
 * Serializes an array of story blocks into a unified JSON string.
 */
export function serializeStoryBlocks(blocks: StoryBlock[]): string {
  return JSON.stringify({
    version: 2,
    blocks,
  })
}

/**
 * Robust parser that converts any story content (structured JSON, markdown, or plain text)
 * into an ordered array of StoryBlock objects.
 */
export function parseStoryContent(rawContent: string | null | undefined): StoryBlock[] {
  if (!rawContent || !rawContent.trim()) {
    return [
      {
        id: 'block-default',
        type: 'text',
        content:
          'No story content found. This tale might still be forming in the shadowed halls of fantasy...',
      },
    ]
  }

  const trimmed = rawContent.trim()

  // 1. Attempt to parse as structured JSON blocks
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
        return parsed.blocks.map((b: any, idx: number) => ({
          id: b.id || `block-${idx}-${Date.now()}`,
          type: (b.type as StoryBlockType) || 'text',
          content: b.content || '',
          caption: b.caption || '',
        }))
      }
    } catch {
      // Fall through to text/markdown parser
    }
  }

  // 2. Parse markdown with embedded images/videos or plain text paragraphs
  const rawParagraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const blocks: StoryBlock[] = []

  rawParagraphs.forEach((para, idx) => {
    const pTrimmed = para.trim()

    // Match Markdown images: ![caption](url)
    const imgMatch = pTrimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      const isGif = imgMatch[2].toLowerCase().includes('.gif') || imgMatch[2].includes('giphy') || imgMatch[2].includes('tenor')
      blocks.push({
        id: `img-${idx}`,
        type: isGif ? 'gif' : 'image',
        content: imgMatch[2].trim(),
        caption: imgMatch[1].trim() || undefined,
      })
      return
    }

    // Match custom video tag: <!--video:url:caption--> or [video:caption](url)
    const videoTagMatch = pTrimmed.match(/<!--video:(.*?)(?::(.*?))?-->/)
    if (videoTagMatch) {
      blocks.push({
        id: `vid-${idx}`,
        type: 'video',
        content: videoTagMatch[1].trim(),
        caption: videoTagMatch[2]?.trim() || undefined,
      })
      return
    }

    const videoMdMatch = pTrimmed.match(/^\[video(?::(.*?))?\]\((.*?)\)$/)
    if (videoMdMatch) {
      blocks.push({
        id: `vid-${idx}`,
        type: 'video',
        content: videoMdMatch[2].trim(),
        caption: videoMdMatch[1]?.trim() || undefined,
      })
      return
    }

    // Regular text paragraph
    blocks.push({
      id: `text-${idx}`,
      type: 'text',
      content: pTrimmed,
    })
  })

  return blocks.length > 0
    ? blocks
    : [
        {
          id: 'block-fallback',
          type: 'text',
          content: trimmed,
        },
      ]
}

/**
 * Calculates words strictly from the text blocks of a story.
 */
export function getStoryWordCount(input: string | StoryBlock[]): number {
  const blocks = typeof input === 'string' ? parseStoryContent(input) : input
  const textBlocks = blocks.filter((b) => b.type === 'text')
  const combined = textBlocks.map((b) => b.content).join(' ')
  return combined.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Combines all text blocks into a single plain text string.
 */
export function getStoryPlainText(input: string | StoryBlock[]): string {
  const blocks = typeof input === 'string' ? parseStoryContent(input) : input
  return blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.content)
    .join('\n\n')
}
