'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  PenTool,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  LogIn,
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
  Play,
} from 'lucide-react'
import type { StoryCategory, ContentRating, StoryLanguage } from '@/types/database'
import {
  StoryBlock,
  StoryBlockType,
  serializeStoryBlocks,
  getStoryWordCount,
} from '@/lib/story-blocks'

const DEFAULT_CATEGORY_OPTIONS: { label: string; value: StoryCategory }[] = [
  { label: 'Bhabhi', value: 'bhabhi' },
  { label: 'Aunty', value: 'aunty' },
  { label: 'Padosan', value: 'padosan' },
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

// Preset seductive royalty-free visual assets for instant author inspiration
const SENSUAL_PRESETS: { title: string; type: StoryBlockType; url: string; caption: string }[] = [
  {
    title: 'Academic Office Desk & Shadows',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Quiet hours after class: lecture notes and lingering unspoken tension.',
  },
  {
    title: 'Candlelit Bedchamber Glow',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Soft golden candlelight casting warm shadows across tangled silk sheets.',
  },
  {
    title: 'Rain on Glass Rendezvous',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
    caption: 'Heavy rain tapping on the windowpane as two worlds quietly collide.',
  },
  {
    title: 'Velvet & Champagne Twilight',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    caption: 'Dark wine glasses and the heady scent of midnight secrets.',
  },
  {
    title: 'Flickering Hearth Flame',
    type: 'gif',
    url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    caption: 'The slow hypnotic pulse of embers reflecting in her dark eyes.',
  },
]

export default function WriteStoryPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; username?: string } | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Story Metadata
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<StoryCategory>('bhabhi')
  const [customCategories, setCustomCategories] = useState<{ label: string; value: string }[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [language, setLanguage] = useState<StoryLanguage>('hinglish')
  const [rating, setRating] = useState<ContentRating>('spicy')
  const [summary, setSummary] = useState('')

  // Load writer's saved custom categories from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('writer_custom_categories')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setCustomCategories(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const handleAddCustomCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    const slug = trimmed.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || trimmed.toLowerCase()
    const newCat = { label: trimmed, value: slug }

    const exists = customCategories.some((c) => c.value === slug) || DEFAULT_CATEGORY_OPTIONS.some((c) => c.value === slug)
    if (!exists) {
      const updated = [...customCategories, newCat]
      setCustomCategories(updated)
      try {
        localStorage.setItem('writer_custom_categories', JSON.stringify(updated))
      } catch {
        // ignore
      }
    }

    setCategory(slug as StoryCategory)
    setNewCategoryInput('')
    setIsAddingCategory(false)
  }

  // Structured Story Blocks (Draggable & Reorderable)
  const [blocks, setBlocks] = useState<StoryBlock[]>([
    {
      id: 'block-init-1',
      type: 'text',
      content:
        'The silence of the university academic wing was punctuated only by the faint hum of distant air ducts. Professor Sharma sat behind the mahogany desk, reading over the final seminar drafts, when a soft knock disturbed the evening quiet.',
    },
    {
      id: 'block-init-2',
      type: 'image',
      content:
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Dim twilight through tall departmental windows.',
    },
    {
      id: 'block-init-3',
      type: 'text',
      content:
        '"Enter," he said, adjusting his glasses. Dev stepped inside, closing the heavy wooden door with deliberate slowness. The lock clicked into place with a subtle finality that sent a sudden electric shiver between them.',
    },
  ])

  // UI Modes
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [showPresets, setShowPresets] = useState(false)
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Check auth session from backend
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          username: data.profile?.username || data.user.user_metadata?.username || data.user.email?.split('@')[0],
        })
      } else {
        setCurrentUser(null)
      }
    } catch {
      setCurrentUser(null)
    } finally {
      setAuthChecking(false)
    }
  }

  useEffect(() => {
    checkAuth()
    const handleAuthChange = () => checkAuth()
    window.addEventListener('kinky-auth-changed', handleAuthChange)
    return () => window.removeEventListener('kinky-auth-changed', handleAuthChange)
  }, [])

  const triggerAuthModal = () => {
    window.dispatchEvent(
      new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } })
    )
  }

  // Live Word Count across all text blocks
  const wordCount = getStoryWordCount(blocks)
  const isWordCountValid = wordCount >= 200
  const isTitleValid = title.trim().length >= 5

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

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please use a smaller photo or GIF.')
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

  const insertPresetMedia = (preset: (typeof SENSUAL_PRESETS)[0]) => {
    const newBlock: StoryBlock = {
      id: `${preset.type}-${Date.now()}`,
      type: preset.type,
      content: preset.url,
      caption: preset.caption,
    }
    setBlocks((prev) => [...prev, newBlock])
    setShowPresets(false)
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!currentUser) {
      triggerAuthModal()
      setErrorMsg('Please sign in or join to submit your story for moderation.')
      return
    }

    if (!isTitleValid) {
      setErrorMsg('Title must be at least 5 characters long.')
      return
    }

    if (!isWordCountValid) {
      setErrorMsg(
        `Story content requires at least 200 words across your text sections. Current count: ${wordCount} words.`
      )
      return
    }

    if (summary.length > 200) {
      setErrorMsg('Summary / Teaser cannot exceed 200 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const serializedContent = serializeStoryBlocks(blocks)

      const response = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          language,
          content_rating: rating,
          summary,
          content: serializedContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit story.')
      }

      setSuccessMsg(
        'Story submitted successfully! All your text and placed media are locked and will appear on the feed after moderation.'
      )

      // Reset form
      setTitle('')
      setSummary('')
      setBlocks([
        {
          id: `text-${Date.now()}`,
          type: 'text',
          content: '',
        },
      ])
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit story. Please try again.'
      setErrorMsg(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-sm">Loading author studio...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-xs font-semibold text-rose-300 mb-2">
            <PenTool className="w-3.5 h-3.5 text-rose-400" /> Interactive Author Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Write & Craft Your Multimedia Tale
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Weave seductive prose and embed photos, GIFs, and videos. Drag and drop them anywhere to set the mood.
          </p>
        </div>

        {/* Tab Switcher: Editor vs Live Reader Preview */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Story Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Reader Preview
          </button>
        </div>
      </div>

      {/* Unauthenticated Notification Banner */}
      {!currentUser && (
        <div className="mb-8 p-5 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 to-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900/40 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Join our circle of authors</p>
              <p className="text-xs text-zinc-400">
                You can draft your story with multimedia right now. Sign in or create an account to publish when ready!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={triggerAuthModal}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In / Join
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mb-8 p-5 rounded-2xl border border-emerald-800 bg-emerald-950/50 text-emerald-200 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">{successMsg}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline mt-2"
              >
                Return to Stories Feed →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-300 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {activeTab === 'preview' ? (
        /* LIVE READER PREVIEW (Locked View: exactly what readers experience) */
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
              <span className="px-3 py-1 rounded-full text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 ml-auto">
                🔒 Reader View: Layout is locked
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-serif mb-2">
              {title || 'Untitled Manuscript'}
            </h2>
            {summary && (
              <p className="text-sm text-zinc-400 italic font-serif">&ldquo;{summary}&rdquo;</p>
            )}
          </div>

          {/* Render Blocks sequentially */}
          <div className="space-y-6 text-zinc-200 leading-relaxed font-serif text-base sm:text-lg">
            {blocks.map((block, idx) => {
              if (block.type === 'text') {
                return (
                  <p
                    key={block.id}
                    className={
                      idx === 0
                        ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-rose-400 first-letter:float-left first-letter:mr-2 first-letter:leading-none'
                        : ''
                    }
                  >
                    {block.content || <span className="text-zinc-600 italic">(Empty text paragraph)</span>}
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
                      {block.type === 'gif' && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-rose-400 uppercase tracking-widest border border-rose-900/60">
                          GIF
                        </span>
                      )}
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

          <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-xs text-zinc-400">Word Count: {wordCount} words</span>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Back to Story Builder
            </button>
          </div>
        </div>
      ) : (
        /* STORY BUILDER FORM */
        <form onSubmit={handleSubmit} className="fantasy-card rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Story Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              placeholder="e.g. Whispers in the Academic Building"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Minimum 5 characters required.</p>
          </div>

          {/* Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory((v) => !v)}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingCategory ? 'Close' : '+ Add Custom'}</span>
                </button>
              </div>

              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddingCategory(true)
                  } else {
                    setCategory(e.target.value as StoryCategory)
                  }
                }}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <optgroup label="Popular Categories">
                  {DEFAULT_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
                {customCategories.length > 0 && (
                  <optgroup label="Your Custom Categories">
                    {customCategories.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        ✦ {opt.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__add_new__">+ Create New Category...</option>
              </select>

              {isAddingCategory && (
                <div className="mt-2.5 p-3 rounded-xl border border-rose-800/80 bg-rose-950/40 space-y-2 animate-in fade-in">
                  <p className="text-[11px] font-medium text-rose-300">
                    Add custom category (e.g. College Romance, Gym, Royal Affair)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomCategory()
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-[#09090b] text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false)
                        setNewCategoryInput('')
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-all shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Language <span className="text-rose-500">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as StoryLanguage)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="hinglish">Hinglish (Conversational)</option>
                <option value="english">English</option>
                <option value="hindi">Hindi (Devanagari)</option>
              </select>
            </div>

            {/* Content Rating Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Content Rating <span className="text-rose-500">*</span>
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
                  Spicy (Sensual)
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

          {/* Summary / Teaser */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Short Teaser / Summary
              </label>
              <span
                className={`text-xs ${
                  summary.length > 200 ? 'text-rose-400 font-bold' : 'text-zinc-500'
                }`}
              >
                {summary.length} / 200 characters
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              placeholder="A compelling 1-2 sentence hook to appear on story previews and cards..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* MULTI-BLOCK STORY BUILDER SECTION WITH DRAG & DROP */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Story Structure & Embedded Media <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-zinc-400">
                  Drag the handles (<GripVertical className="inline w-3 h-3 text-zinc-500" />) or use arrows to reposition photos, GIFs, and videos between story text.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span className={isWordCountValid ? 'text-emerald-400' : 'text-rose-400'}>
                  {wordCount} words
                </span>
                <span className="text-zinc-500">(minimum 200 words)</span>
              </div>
            </div>

            {/* Quick Media Inspiration Presets Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 text-xs font-medium hover:bg-rose-900/50 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {showPresets ? 'Hide Seductive Presets' : 'Sensual Visual Gallery (1-Click Insert)'}
              </button>
            </div>

            {/* Presets Tray */}
            {showPresets && (
              <div className="p-4 rounded-xl border border-rose-900/40 bg-zinc-950/90 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in">
                {SENSUAL_PRESETS.map((preset, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => insertPresetMedia(preset)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-800 hover:border-rose-600 bg-zinc-900/80 p-2.5 transition-all hover:scale-[1.02]"
                  >
                    <div className="h-24 w-full rounded-lg overflow-hidden bg-zinc-950 relative mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/70 text-rose-300">
                        {preset.type}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{preset.caption}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Blocks List (Draggable Cards) */}
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
                    {/* Block Toolbar */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Drag and drop to reposition this section"
                        >
                          <GripVertical className="w-4 h-4 text-zinc-400" />
                        </div>

                        {/* Block Type Badge */}
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

                      {/* Action Controls: Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === blocks.length - 1}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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

                    {/* Block Body */}
                    {block.type === 'text' ? (
                      <div>
                        <textarea
                          rows={4}
                          value={block.content}
                          onChange={(e) => handleUpdateTextBlock(index, e.target.value)}
                          placeholder="Write this scene's narrative, sensory tension, whispers, and touch..."
                          className="w-full p-3 rounded-xl border border-zinc-800 bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-sans leading-relaxed resize-y"
                        />
                        <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-500">
                          <span>
                            {block.content.trim().split(/\s+/).filter(Boolean).length} words in this section
                          </span>
                          <span className="text-zinc-600">Tip: Drag handle on left to reorder</span>
                        </div>
                      </div>
                    ) : (
                      /* Media Block Content */
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black/60 flex items-center justify-center max-h-[360px]">
                          {block.type === 'video' ? (
                            <video
                              src={block.content}
                              controls
                              className="max-h-[360px] w-full object-contain"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={block.content}
                              alt={block.caption || 'Story media'}
                              className="max-h-[360px] w-full object-contain"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Media Caption / Seductive Subtitle (optional)"
                            value={block.caption || ''}
                            onChange={(e) => handleUpdateMediaCaption(index, e.target.value)}
                            className="px-3 py-2 rounded-lg border border-zinc-800 bg-[#09090b] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                          />
                          <input
                            type="text"
                            placeholder="Update Image / GIF / Video URL"
                            value={block.content}
                            onChange={(e) => handleUpdateTextBlock(index, e.target.value)}
                            className="px-3 py-2 rounded-lg border border-zinc-800 bg-[#09090b] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 truncate"
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick In-Between Insert Line */}
                    <div className="mt-3 pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                      <span className="text-zinc-600">Insert below:</span>
                      <button
                        type="button"
                        onClick={() => handleAddTextBlock(index)}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-rose-400" /> Text
                      </button>
                      <button
                        type="button"
                        onClick={() => openMediaModal('image', index)}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 text-rose-400" /> Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => openMediaModal('gif', index)}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" /> GIF
                      </button>
                      <button
                        type="button"
                        onClick={() => openMediaModal('video', index)}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center gap-1"
                      >
                        <Film className="w-3 h-3 text-purple-400" /> Video
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Add Buttons */}
            <div className="p-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleAddTextBlock()}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-rose-400" /> Add Text Paragraph
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('image')}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-rose-400" /> Add Photo
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('gif')}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Add Small GIF
              </button>
              <button
                type="button"
                onClick={() => openMediaModal('video')}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:text-white hover:border-rose-500 transition-colors flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-purple-400" /> Add Video
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p>🔒 Once published, media positions are locked and immutable for readers.</p>
              <p className="text-zinc-500">All submissions are reviewed by moderators before appearing on the feed.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Story
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isTitleValid || !isWordCountValid}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm crimson-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Story for Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MEDIA INSERTION MODAL (Photo / GIF / Video) */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setMediaModalOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-2xl z-10 text-zinc-100">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {mediaModalType === 'image' && <ImageIcon className="w-5 h-5 text-rose-400" />}
              {mediaModalType === 'gif' && <Sparkles className="w-5 h-5 text-amber-400" />}
              {mediaModalType === 'video' && <Film className="w-5 h-5 text-purple-400" />}
              Insert {mediaModalType === 'image' ? 'Photo' : mediaModalType === 'gif' ? 'Animated GIF' : 'Short Video'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter a web URL or choose a local file from your device. You can drag and drop its position anytime.
            </p>

            <div className="space-y-4">
              {/* Media URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Media Web URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <input
                      type="url"
                      placeholder={`https://example.com/sensual-${mediaModalType}.${mediaModalType === 'video' ? 'mp4' : mediaModalType === 'gif' ? 'gif' : 'jpg'}`}
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Local File Upload Option */}
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
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  Upload from Computer / Phone
                </button>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Max size: 10MB (PNG, JPG, WebP, GIF, MP4)
                </p>
              </div>

              {/* Media Preview if provided */}
              {mediaUrlInput && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black/80 max-h-48 flex items-center justify-center p-1">
                  {mediaModalType === 'video' ? (
                    <video
                      src={mediaUrlInput}
                      controls
                      className="max-h-44 object-contain"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mediaUrlInput}
                      alt="Preview"
                      className="max-h-44 object-contain"
                    />
                  )}
                </div>
              )}

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Seductive Caption / Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A breathless glance in the dim twilight..."
                  value={mediaCaptionInput}
                  onChange={(e) => setMediaCaptionInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#09090b] text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMediaSubmit}
                  disabled={!mediaUrlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Insert Into Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
