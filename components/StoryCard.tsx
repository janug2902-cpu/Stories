'use client'

import React from 'react'
import Link from 'next/link'
import { Eye, Heart, Sparkles, BookOpen } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { getStoryWordCount } from '@/lib/story-blocks'
import type { Story, StoryLanguage, ContentRating } from '@/types/database'

interface StoryCardProps {
  story: Story & {
    author_username?: string
  }
}

/**
 * Returns distinct, harmonious color tokens for story languages.
 */
function getLanguageBadgeStyle(language: StoryLanguage) {
  switch (language) {
    case 'english':
      return 'bg-sky-950/80 text-sky-300 border-sky-800/60'
    case 'hindi':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
    case 'hinglish':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60'
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
}

/**
 * Returns distinct styling for Spicy vs Explicit heat ratings.
 */
function getRatingBadgeStyle(rating: ContentRating) {
  switch (rating) {
    case 'explicit':
      return 'bg-rose-950/90 text-rose-300 border-rose-800/70'
    case 'spicy':
      return 'bg-amber-950/90 text-amber-300 border-amber-800/70'
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
}

export function StoryCard({ story }: StoryCardProps) {
  const { lang } = useLanguage()

  // Accurate reading time calculation (approx 200 words per minute)
  const wordCount = getStoryWordCount(story.content || '')
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  const formatCategoryLabel = (cat: string) => {
    const normalized = (cat || '').toLowerCase().trim()
    if (lang === 'hi') {
      switch (normalized) {
        case 'bhabhi':
          return 'भाभी'
        case 'aunty':
          return 'आंटी'
        case 'padosan':
          return 'पड़ोसन'
        case 'teacher_student':
          return 'शिक्षक और छात्र'
        case 'maid':
          return 'नौकरानी और मालिक'
        case 'travel':
          return 'सफ़र और छुट्टियां'
        case 'outdoor':
          return 'खुली जगहें'
        case 'office':
          return 'दफ्तर और बॉस'
        case 'romance':
          return 'रोमांस'
        case 'erotica':
          return 'कामुक'
        case 'fantasy':
          return 'फंतासी'
        case 'taboo':
          return 'वर्जित'
        default:
          return cat.replace(/_/g, ' ')
      }
    }

    switch (normalized) {
      case 'bhabhi':
        return 'Bhabhi'
      case 'aunty':
        return 'Aunty'
      case 'padosan':
        return 'Padosan'
      case 'teacher_student':
        return 'Teacher & Student'
      case 'maid':
        return 'Maid & Boss'
      case 'travel':
        return 'Travel'
      case 'outdoor':
        return 'Outdoor'
      case 'office':
        return 'Office'
      case 'romance':
        return 'Romance'
      case 'erotica':
        return 'Erotica'
      case 'fantasy':
        return 'Fantasy'
      case 'taboo':
        return 'Taboo'
      default:
        return cat
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  const formatLanguageLabel = (l: string) => {
    if (lang === 'hi') {
      if (l === 'english') return 'अंग्रेज़ी'
      if (l === 'hindi') return 'हिंदी'
      if (l === 'hinglish') return 'हिंग्लिश'
    }
    return l
  }

  const formatRatingLabel = (r: string) => {
    if (lang === 'hi') {
      if (r === 'explicit') return 'वयस्क 18+'
      if (r === 'spicy') return 'मसालेदार'
    }
    return r
  }

  return (
    <Link
      href={`/read/${story.id}`}
      className="group fantasy-card rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-[0_12px_35px_-10px_rgba(225,29,72,0.3)]"
    >
      <div>
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
              {formatCategoryLabel(story.category)}
            </span>

            {/* Language Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getLanguageBadgeStyle(
                story.language
              )}`}
            >
              {formatLanguageLabel(story.language)}
            </span>

            {/* Content Rating */}
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getRatingBadgeStyle(
                story.content_rating
              )}`}
            >
              {formatRatingLabel(story.content_rating)}
            </span>

            {/* Multi-part Series Badge */}
            {story.part_number && story.total_parts && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-600/30 text-rose-300 border border-rose-500/50">
                Part {story.part_number}/{story.total_parts}
              </span>
            )}
          </div>

          {/* Personalized Story Indicator */}
          {story.is_ai_generated && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/60">
              <Sparkles className="w-3 h-3" /> {lang === 'hi' ? 'पर्सनलाइज़्ड' : 'Personalized'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-rose-300 mb-2.5 transition-colors line-clamp-2 leading-snug">
          {story.title}
        </h3>

        {/* 2-line Summary Preview */}
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-6">
          {story.summary || (story.content ? story.content.slice(0, 160) + '...' : 'An intimate journey of sensual discovery and taboo chemistry...')}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="pt-4 border-t border-zinc-800/90 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <BookOpen className="w-3.5 h-3.5 text-rose-400" />
          <span>
            {readTimeMinutes} {lang === 'hi' ? 'मिनट की पढ़ाई' : 'min read'}
          </span>
        </div>

        {/* View and Like Counters */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 group-hover:text-rose-400 transition-colors">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            {(story.likes_count ?? 0).toLocaleString()}
          </span>

          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            {(story.views_count ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
