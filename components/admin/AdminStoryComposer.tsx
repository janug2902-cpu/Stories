'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  PenTool,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Sparkles,
  GripVertical,
  Image as ImageIcon,
  Film,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Upload,
  Link as LinkIcon,
  Eye,
  ExternalLink,
} from 'lucide-react'
import type { StoryCategory, ContentRating, StoryLanguage } from '@/types/database'
import {
  StoryBlock,
  StoryBlockType,
  serializeStoryBlocks,
  getStoryWordCount,
} from '@/lib/story-blocks'

const CATEGORY_OPTIONS: { label: string; value: StoryCategory }[] = [
  { label: 'Teacher & Student', value: 'teacher_student' },
  { label: 'Maid & Boss', value: 'maid' },
  { label: 'Travel & Vacation', value: 'travel' },
  { label: 'Outdoor & Public', value: 'outdoor' },
  { label: 'Office & Boss', value: 'office' },
  { label: 'Romance', value: 'romance' },
  { label: 'Erotica', value: 'erotica' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Taboo', value: 'taboo' },
  { label: 'Other', value: 'other' },
]

export function AdminStoryComposer() {
  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<StoryCategory>('teacher_student')
  const [language, setLanguage] = useState<StoryLanguage>('hindi')
  const [rating, setRating] = useState<ContentRating>('explicit')
  const [summary, setSummary] = useState('')

  // Structured Story Blocks (Draggable & Reorderable)
  const [blocks, setBlocks] = useState<StoryBlock[]>([
    {
      id: 'admin-block-1',
      type: 'text',
      content:
        'चौथे तल के अकादमिक भवन में मूसलाधार बारिश के बीच छात्र डीजे और प्रोफेसर बीजे के बीच की मर्यादा जब तूफानी रात की बेपरवाह चाहत में बदल गई...',
    },
  ])

  // UI Modes
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Media Insertion Modal / State
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [mediaModalType, setMediaModalType] = useState<StoryBlockType>('image')
  const [mediaUrlInput, setMediaUrlInput] = useState('')
  const [mediaCaptionInput, setMediaCaptionInput] = useState('')
  const [mediaInsertIndex, setMediaInsertIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [publishedStoryId, setPublishedStoryId] = useState<string | null>(null)

  // Live Word Count
  const wordCount = getStoryWordCount(blocks)

  // Block Manipulation Handlers
  const handleUpdateTextBlock = (index: number, text: string) => {
    setBlocks((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], content: text }
      return next
    })
  }

  const handleUpdateMediaCaption = (index: number, caption: string) => {
    setBlocks((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], caption }
      return next
    })
  }

  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      setErrorMsg('A story must contain at least one text block.')
      return
    }
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setBlocks((prev) => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(index - 1, 0, item)
      return next
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return
    setBlocks((prev) => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(index + 1, 0, item)
      return next
    })
  }

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    setBlocks((prev) => {
      const next = [...prev]
      const [movedItem] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, movedItem)
      return next
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Adding blocks
  const handleAddTextBlock = (atIndex?: number) => {
    const newBlock: StoryBlock = {
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'text',
      content: '',
    }
    setBlocks((prev) => {
      const next = [...prev]
      if (typeof atIndex === 'number') {
        next.splice(atIndex + 1, 0, newBlock)
      } else {
        next.push(newBlock)
      }
      return next
    })
  }

  const openMediaModal = (type: StoryBlockType, atIndex?: number) => {
    setMediaModalType(type)
    setMediaInsertIndex(typeof atIndex === 'number' ? atIndex : null)
    setMediaUrlInput('')
    setMediaCaptionInput('')
    setMediaModalOpen(true)
  }

  const handleAddMediaSubmit = () => {
    if (!mediaUrlInput.trim()) {
      setErrorMsg('Please provide a valid media URL or upload a file.')
      return
    }

    const newBlock: StoryBlock = {
      id: `${mediaModalType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: mediaModalType,
      content: mediaUrlInput.trim(),
      caption: mediaCaptionInput.trim() || undefined,
    }

    setBlocks((prev) => {
      const next = [...prev]
      if (typeof mediaInsertIndex === 'number') {
        next.splice(mediaInsertIndex + 1, 0, newBlock)
      } else {
        next.push(newBlock)
      }
      return next
    })

    setMediaModalOpen(false)
    setMediaUrlInput('')
    setMediaCaptionInput('')
  }

  // Handle local file uploads (converts file to Base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrlInput(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Publish Directly to Live Feed
  const handlePublish = async (status: 'approved' | 'pending' = 'approved') => {
    setErrorMsg(null)
    setPublishedStoryId(null)

    if (!title.trim() || title.trim().length < 5) {
      setErrorMsg('Story Title must be at least 5 characters.')
      return
    }

    if (wordCount < 100) {
      setErrorMsg(`Content requires at least 100 words. Current count: ${wordCount} words.`)
      return
    }

    setIsSubmitting(true)

    try {
      const serializedContent = serializeStoryBlocks(blocks)

      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          language,
          content_rating: rating,
          summary: summary.trim() || undefined,
          content: serializedContent,
          is_ai_generated: false,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish story.')
      }

      setPublishedStoryId(data.storyId || 'published')

      // Reset form
      setTitle('')
      setSummary('')
      setBlocks([
        {
          id: `admin-block-${Date.now()}`,
          type: 'text',
          content: '',
        },
      ])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Publishing failed. Please try again.'
      setErrorMsg(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-zinc-800 bg-[#121216]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-semibold mb-2">
            <PenTool className="w-3.5 h-3.5 text-rose-400" /> Admin Direct Story Composer
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Write & Post Stories Instantly to Feed
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Compose rich narratives with embedded photos, GIFs, and videos. Reorder them via drag-and-drop and publish immediately without moderation.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Composer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {publishedStoryId && (
        <div className="p-5 rounded-2xl border border-emerald-800 bg-emerald-950/50 text-emerald-200 animate-in fade-in flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-300">Story Published Live Directly to Feed!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Your tale is now active and accessible to all readers across the platform.
              </p>
            </div>
          </div>
          <Link
            href={`/read/${publishedStoryId}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>View Story Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {activeTab === 'preview' ? (
        /* PREVIEW MODE */
        <div className="fantasy-card rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="pb-6 border-b border-zinc-800">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                {category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-950/60 text-rose-300 border border-rose-900/60">
                {language}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800">
                {rating}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-serif mb-2">
              {title || 'Untitled Manuscript'}
            </h2>
            {summary && (
              <p className="text-sm text-zinc-400 italic font-serif">&ldquo;{summary}&rdquo;</p>
            )}
          </div>

          <div className="space-y-6 text-zinc-200 leading-relaxed font-serif text-base sm:text-lg">
            {blocks.map((block) => {
              if (block.type === 'text') {
                return (
                  <p key={block.id}>
                    {block.content || <span className="text-zinc-600 italic">(Empty paragraph)</span>}
                  </p>
                )
              }

              if (block.type === 'image' || block.type === 'gif') {
                return (
                  <figure
                    key={block.id}
                    className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-black/50 shadow-2xl relative"
                  >
                    <div className="relative overflow-hidden max-h-[500px] flex items-center justify-center bg-black/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.content}
                        alt={block.caption || 'Illustration'}
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="px-4 py-2.5 text-center text-xs italic text-rose-300 bg-zinc-950/80 border-t border-zinc-800 font-sans">
                        ✦ {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              if (block.type === 'video') {
                return (
                  <figure
                    key={block.id}
                    className="my-6 rounded-2xl overflow-hidden border border-rose-900/60 bg-black shadow-2xl relative"
                  >
                    <div className="relative overflow-hidden max-h-[500px] flex items-center justify-center bg-black">
                      <video
                        src={block.content}
                        controls
                        playsInline
                        loop
                        muted
                        className="w-full max-h-[500px] object-contain rounded-t-2xl"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="px-4 py-2.5 text-center text-xs italic text-rose-300 bg-zinc-950/80 border-t border-zinc-800 font-sans">
                        ▶ {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              return null
            })}
          </div>
        </div>
      ) : (
        /* COMPOSER FORM */
        <div className="fantasy-card rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Story Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              placeholder="e.g. अकादमिक भवन की तूफानी रातें (डीजे और प्रोफेसर बीजे)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Category / Language / Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoryCategory)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as StoryLanguage)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="hindi">Hindi (Devanagari)</option>
                <option value="hinglish">Hinglish (Conversational)</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Heat Rating
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRating('spicy')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    rating === 'spicy'
                      ? 'bg-amber-950/80 border border-amber-700 text-amber-300'
                      : 'bg-[#09090b] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Spicy
                </button>
                <button
                  type="button"
                  onClick={() => setRating('explicit')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    rating === 'explicit'
                      ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                      : 'bg-[#09090b] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Explicit (18+)
                </button>
              </div>
            </div>
          </div>

          {/* Teaser */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Short Teaser / Summary
            </label>
            <textarea
              rows={2}
              maxLength={200}
              placeholder="Compelling hook for story previews..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Multi-Block Drag & Drop Editor */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Manuscript Sections & Embedded Media
                </label>
                <p className="text-[11px] text-zinc-400">
                  Drag handles (<GripVertical className="inline w-3 h-3 text-zinc-500" />) to reorder images and text blocks.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <FileText className="w-3.5 h-3.5" />
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Blocks List */}
            <div className="space-y-4">
              {blocks.map((block, index) => {
                const isDragging = draggedIndex === index
                const isDragOver = dragOverIndex === index

                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all bg-[#0d0d11] ${
                      isDragging
                        ? 'opacity-40 scale-[0.99] border-dashed border-rose-500'
                        : isDragOver
                        ? 'border-rose-500 ring-2 ring-rose-500/50 bg-rose-950/20'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-zinc-400 hover:text-white"
                          title="Drag to reposition"
                        >
                          <GripVertical className="w-4 h-4 text-zinc-400" />
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            block.type === 'text'
                              ? 'bg-zinc-800 text-zinc-300'
                              : block.type === 'image'
                              ? 'bg-rose-950/70 border border-rose-800/70 text-rose-300'
                              : block.type === 'gif'
                              ? 'bg-amber-950/70 border border-amber-800/70 text-amber-300'
                              : 'bg-purple-950/70 border border-purple-800/70 text-purple-300'
                          }`}
                        >
                          {block.type === 'text' && <FileText className="w-3 h-3 text-zinc-400" />}
                          {block.type === 'image' && <ImageIcon className="w-3 h-3 text-rose-400" />}
                          {block.type === 'gif' && <Sparkles className="w-3 h-3 text-amber-400" />}
                          {block.type === 'video' && <Film className="w-3 h-3 text-purple-400" />}
                          <span>
                            {block.type === 'text'
                              ? `Paragraph ${index + 1}`
                              : `${block.type.toUpperCase()} #${index + 1}`}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === blocks.length - 1}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(index)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 ml-1"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {block.type === 'text' ? (
                      <textarea
                        rows={4}
                        value={block.content}
                        onChange={(e) => handleUpdateTextBlock(index, e.target.value)}
                        placeholder="Write this scene's sensory details, dialogue, and touch..."
                        className="w-full p-3 rounded-xl border border-zinc-800 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                      />
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black/60 flex items-center justify-center max-h-[300px]">
                          {block.type === 'video' ? (
                            <video
                              src={block.content}
                              controls
                              className="max-h-[300px] w-full object-contain"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={block.content}
                              alt={block.caption || 'Media'}
                              className="max-h-[300px] w-full object-contain"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={block.caption || ''}
                            onChange={(e) => handleUpdateMediaCaption(index, e.target.value)}
                            className="px-3 py-2 rounded-lg border border-zinc-800 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
                          />
                          <input
                            type="text"
                            placeholder="Media URL"
                            value={block.content}
                            onChange={(e) => handleUpdateTextBlock(index, e.target.value)}
                            className="px-3 py-2 rounded-lg border border-zinc-800 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500 truncate"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add Controls */}
            <div className="p-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleAddTextBlock()}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-rose-400" /> Add Text Paragraph
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('image')}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-rose-400" /> Add Photo
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('gif')}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Add GIF
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('video')}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-purple-400" /> Add Video
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePublish('pending')}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Save as Pending
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePublish('approved')}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs crimson-glow transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Publish Directly to Live Feed
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MEDIA MODAL */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setMediaModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-2xl z-10 text-zinc-100">
            <h3 className="text-base font-bold text-white mb-2">
              Insert {mediaModalType.toUpperCase()}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Web URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept={
                    mediaModalType === 'video'
                      ? 'video/*'
                      : mediaModalType === 'gif'
                      ? 'image/gif'
                      : 'image/*'
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 inline-flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  Upload Local File (Max 10MB)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-300 mb-1.5">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Subtitle or scene caption..."
                  value={mediaCaptionInput}
                  onChange={(e) => setMediaCaptionInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMediaSubmit}
                  disabled={!mediaUrlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Insert Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
