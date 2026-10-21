'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Flame,
  Copy,
  Check,
  Headphones,
  Sliders,
  X,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import {
  getStoryHindiTranscript,
  splitHindiTranscriptIntoParagraphs,
} from '@/lib/hindi-audio-transcripts'
import { ambientSound, AmbientSoundType } from '@/lib/ambient-sound'
import type { Story } from '@/types/database'

interface HindiAudioPlayerProps {
  story: Story
  initialPlay?: boolean
  onClose?: () => void
}

type VocalTone = 'velvet' | 'sultry' | 'natural'

// Module-level audio singleton to guarantee ONLY ONE audio stream can ever play at any given time
let activeSingletonAudio: HTMLAudioElement | null = null

function stopAllActiveAudio() {
  if (activeSingletonAudio) {
    try {
      activeSingletonAudio.pause()
      activeSingletonAudio.onended = null
      activeSingletonAudio.ontimeupdate = null
      activeSingletonAudio.onerror = null
      activeSingletonAudio.src = ''
    } catch {
      // Safe disposal
    }
    activeSingletonAudio = null
  }
  // Safeguard: Ensure no browser speech synthesis is ever running
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore
    }
  }
}

export function HindiAudioPlayer({
  story,
  initialPlay = false,
  onClose,
}: HindiAudioPlayerProps) {
  // Language mode (Hindi vs Hinglish)
  const [audioLanguage, setAudioLanguage] = useState<'hindi' | 'hinglish'>('hindi')

  // Transcript preparation based on selected language
  const hindiTranscript = React.useMemo(
    () => getStoryHindiTranscript(story, audioLanguage),
    [story, audioLanguage]
  )
  const paragraphs = React.useMemo(
    () => splitHindiTranscriptIntoParagraphs(hindiTranscript),
    [hindiTranscript]
  )

  // Playback state
  const [currentParaIndex, setCurrentParaIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false)
  const [audioProgress, setAudioProgress] = useState<number>(0) // 0 to 100%
  const [vocalTone, setVocalTone] = useState<VocalTone>('velvet')
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('none') // Default to pure natural voice
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  // Tracking refs
  const blobUrlCache = useRef<Map<string, string>>(new Map())
  const paragraphContainerRef = useRef<HTMLDivElement | null>(null)
  const activeParagraphRef = useRef<HTMLDivElement | null>(null)
  const isPlayingRef = useRef<boolean>(false)
  const activeRequestIdRef = useRef<number>(0)
  const initialPlayTriggeredRef = useRef<boolean>(false)

  isPlayingRef.current = isPlaying

  // Calculate estimated total audio time
  const totalWords = hindiTranscript.split(/\s+/).filter(Boolean).length
  const estimatedMinutes = Math.max(1, Math.round(totalWords / 130))

  // Preload & fetch MP3 audio for a specific paragraph
  const fetchParagraphAudioUrl = useCallback(
    async (paraIndex: number, tone: VocalTone): Promise<string> => {
      const text = paragraphs[paraIndex]
      if (!text) return ''

      const cacheKey = `${audioLanguage}:${tone}:${paraIndex}:${text.slice(0, 40)}`
      if (blobUrlCache.current.has(cacheKey)) {
        return blobUrlCache.current.get(cacheKey)!
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tone,
          voice: audioLanguage === 'hinglish' ? 'en-IN-NeerjaNeural' : 'hi-IN-SwaraNeural',
        }),
      })

      if (!res.ok) {
        throw new Error(`TTS server responded with status ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      blobUrlCache.current.set(cacheKey, url)
      return url
    },
    [paragraphs]
  )

  // Play a specific paragraph safely with strict single-audio session management
  const playParagraph = useCallback(
    async (index: number) => {
      if (index >= paragraphs.length) {
        setIsPlaying(false)
        setAudioProgress(100)
        stopAllActiveAudio()
        ambientSound.stop()
        return
      }

      // Generate a new unique request ID for this playback action
      const thisRequestId = ++activeRequestIdRef.current

      // Stop any existing playing audio immediately
      stopAllActiveAudio()

      setCurrentParaIndex(index)
      setIsLoadingAudio(true)
      setPlaybackError(null)
      setAudioProgress(0)

      try {
        const audioUrl = await fetchParagraphAudioUrl(index, vocalTone)

        // If another play request superseded this one while fetching, abort quietly
        if (activeRequestIdRef.current !== thisRequestId) {
          return
        }

        const audio = new Audio(audioUrl)
        activeSingletonAudio = audio

        audio.ontimeupdate = () => {
          if (activeRequestIdRef.current === thisRequestId && audio.duration > 0) {
            setAudioProgress((audio.currentTime / audio.duration) * 100)
          }
        }

        audio.onended = () => {
          if (activeRequestIdRef.current === thisRequestId && isPlayingRef.current) {
            playParagraph(index + 1)
          }
        }

        audio.onerror = (e) => {
          // If this session is still active, notify error
          if (activeRequestIdRef.current === thisRequestId) {
            console.warn('Audio playback error on audio element:', e)
            setIsLoadingAudio(false)
            setIsPlaying(false)
            setPlaybackError('ऑडियो लोड करने में समस्या आई। पुनः प्रयास करें।')
          }
        }

        await audio.play()

        // Double check request ID before updating active UI state
        if (activeRequestIdRef.current === thisRequestId) {
          setIsLoadingAudio(false)
          setIsPlaying(true)

          // Play ambient soundscape if enabled
          if (ambientType !== 'none') {
            ambientSound.play(ambientType, ambientVolume)
          }

          // Prefetch next paragraph in background for seamless transitions
          if (index + 1 < paragraphs.length) {
            fetchParagraphAudioUrl(index + 1, vocalTone).catch(() => {})
          }
        }
      } catch (err: unknown) {
        if (activeRequestIdRef.current === thisRequestId) {
          const msg = err instanceof Error ? err.message : 'Audio playback error'
          console.warn('[Audio Player] Play error:', msg)
          setIsLoadingAudio(false)
          setIsPlaying(false)
          setPlaybackError('ऑडियो लोड नहीं हो सका। कृपया दोबारा दबाएं।')
        }
      }
    },
    [paragraphs, vocalTone, ambientType, ambientVolume, fetchParagraphAudioUrl]
  )

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllActiveAudio()
      ambientSound.stop()
      setIsPlaying(false)
    } else {
      playParagraph(currentParaIndex)
    }
  }

  const handleNext = () => {
    if (currentParaIndex + 1 < paragraphs.length) {
      playParagraph(currentParaIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentParaIndex > 0) {
      playParagraph(currentParaIndex - 1)
    }
  }

  const handleSelectParagraph = (idx: number) => {
    playParagraph(idx)
  }

  // Handle ambient sound changes
  const handleAmbientChange = (type: AmbientSoundType) => {
    setAmbientType(type)
    if (isPlaying) {
      ambientSound.play(type, ambientVolume)
    }
  }

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol)
    ambientSound.setVolume(vol)
  }

  // Handle tone change
  const handleToneChange = (tone: VocalTone) => {
    setVocalTone(tone)
    if (isPlaying) {
      playParagraph(currentParaIndex)
    }
  }

  const handleCopyTranscript = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(hindiTranscript)
      setCopiedTranscript(true)
      setTimeout(() => setCopiedTranscript(false), 2000)
    }
  }

  // Auto-scroll paragraph container to active paragraph
  useEffect(() => {
    if (activeParagraphRef.current && paragraphContainerRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentParaIndex])

  // Handle initial auto-play if requested (ensuring exactly one call even in StrictMode)
  useEffect(() => {
    if (initialPlay && !initialPlayTriggeredRef.current) {
      initialPlayTriggeredRef.current = true
      playParagraph(0)
    }

    return () => {
      activeRequestIdRef.current++
      stopAllActiveAudio()
      ambientSound.stop()
    }
  }, [initialPlay, playParagraph])

  return (
    <div className="rounded-2xl border border-rose-900/60 bg-[#120e14]/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6 mb-8 text-[#f4f4f5] relative overflow-hidden transition-all">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 -z-10 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-rose-900/40 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center crimson-glow-sm">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-1.5">
                देसी लड़की की आवाज़ <span className="text-rose-400 text-xs font-normal">(Desi Girl Audio Narration)</span>
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                <Sparkles className="w-3 h-3 text-rose-400" /> सोफ्ट व कामुक अंदाज़
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              सुनो ना जानू... मदहोश देसी अंदाज़ में • {estimatedMinutes} मिनट का ऑडियो ({paragraphs.length} भाग)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Language Mode Switcher: Hindi vs Hinglish */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (audioLanguage !== 'hindi') {
                  stopAllActiveAudio()
                  ambientSound.stop()
                  setIsPlaying(false)
                  setCurrentParaIndex(0)
                  setAudioProgress(0)
                  blobUrlCache.current.clear()
                  setAudioLanguage('hindi')
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                audioLanguage === 'hindi'
                  ? 'bg-rose-950 text-rose-200 border border-rose-700 crimson-glow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌸 हिन्दी
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioLanguage !== 'hinglish') {
                  stopAllActiveAudio()
                  ambientSound.stop()
                  setIsPlaying(false)
                  setCurrentParaIndex(0)
                  setAudioProgress(0)
                  blobUrlCache.current.clear()
                  setAudioLanguage('hinglish')
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                audioLanguage === 'hinglish'
                  ? 'bg-rose-950 text-rose-200 border border-rose-700 crimson-glow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              💋 हिंग्लिश (Hinglish)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs font-medium transition-all ${
              showSettings
                ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Audio & Atmosphere Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyTranscript}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors"
            title="Copy Hindi Transcript"
          >
            {copiedTranscript ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                stopAllActiveAudio()
                ambientSound.stop()
                onClose()
              }}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close Audio Player"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Atmospheric Settings Panel (Dropdown) */}
      {showSettings && (
        <div className="mb-5 p-4 rounded-xl border border-rose-900/50 bg-[#18121c]/90 space-y-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Vocal Tone Presets */}
          <div>
            <div className="text-zinc-300 font-semibold mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> आवाज़ का अंदाज़ (Natural Sensual Tone):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleToneChange('velvet')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  vocalTone === 'velvet'
                    ? 'border-rose-500 bg-rose-950/60 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-rose-300">🌸 मखमली कानाफूसी (Velvet)</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">धीमी, सोफ्ट और रूमानी आवाज़</div>
              </button>

              <button
                type="button"
                onClick={() => handleToneChange('sultry')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  vocalTone === 'sultry'
                    ? 'border-rose-500 bg-rose-950/60 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-rose-300">💋 मादक अंदाज़ (Sultry)</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">गहरी, रूमानी और सम्मोहक लय</div>
              </button>

              <button
                type="button"
                onClick={() => handleToneChange('natural')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  vocalTone === 'natural'
                    ? 'border-rose-500 bg-rose-950/60 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-rose-300">✨ स्वाभाविक (Natural)</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">स्वाभाविक, स्पष्ट मधुर स्त्री स्वर</div>
              </button>
            </div>
          </div>

          {/* Background Ambient Soundscape */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="text-zinc-300 font-semibold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-rose-400" /> बैकग्राउंड माहौल (Atmosphere):
              </span>
              {ambientType !== 'none' && (
                <span className="text-[11px] text-zinc-400">वॉल्यूम: {Math.round(ambientVolume * 100)}%</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleAmbientChange('none')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  ambientType === 'none'
                    ? 'border-rose-500 bg-rose-950/70 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                🔇 केवल आवाज़ (Pure Voice)
              </button>

              <button
                type="button"
                onClick={() => handleAmbientChange('rain')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  ambientType === 'rain'
                    ? 'border-rose-500 bg-rose-950/70 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                🌧️ सावन की बारिश (Raindrops)
              </button>

              <button
                type="button"
                onClick={() => handleAmbientChange('velvet')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  ambientType === 'velvet'
                    ? 'border-rose-500 bg-rose-950/70 text-white crimson-glow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                🕯️ मखमली धुन (Midnight Pad)
              </button>
            </div>

            {ambientType !== 'none' && (
              <div className="flex items-center gap-3">
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.02"
                  value={ambientVolume}
                  onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Player Controller Bar */}
      <div className="bg-gradient-to-r from-rose-950/40 via-zinc-900/70 to-rose-950/40 border border-rose-900/40 rounded-xl p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Track metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold mb-1">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'}`} />
              भाग {currentParaIndex + 1} / {paragraphs.length}
            </div>
            <p className="text-xs text-zinc-300 line-clamp-1 italic font-serif">
              &ldquo;{paragraphs[currentParaIndex]?.slice(0, 85)}...&rdquo;
            </p>
          </div>

          {/* Controls: Prev, Play, Next */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentParaIndex === 0}
              className="p-2.5 rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Paragraph"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isLoadingAudio}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 hover:from-rose-500 hover:to-rose-300 text-white flex items-center justify-center crimson-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
              title={isPlaying ? 'Pause Narration' : 'Listen Narration'}
            >
              {isLoadingAudio ? (
                <RotateCcw className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentParaIndex >= paragraphs.length - 1}
              className="p-2.5 rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Paragraph"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Playback Error notice if any */}
        {playbackError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <span>{playbackError}</span>
            <button
              type="button"
              onClick={() => playParagraph(currentParaIndex)}
              className="underline text-xs font-semibold hover:text-white"
            >
              पुनः प्रयास करें
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-3 pt-3 border-t border-rose-900/20">
          <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-rose-400 h-full transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1.5">
            <span>पैराग्राफ {currentParaIndex + 1} प्रगति</span>
            <span className="text-rose-300 font-medium">
              {vocalTone === 'velvet'
                ? 'मखमली आवाज़ (Velvet Voice)'
                : vocalTone === 'sultry'
                ? 'मादक अंदाज़ (Sultry)'
                : 'स्वाभाविक (Natural)'}
            </span>
          </div>
        </div>
      </div>

      {/* Transcript Text Reader with Live Paragraph Highlighting */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" /> संपूर्ण हिंदी ट्रांसक्रिप्ट (पढ़ें और सुनें):
          </span>
          <span className="text-[11px] text-zinc-400">
            किसी भी भाग पर क्लिक करके सीधे सुनें
          </span>
        </div>

        <div
          ref={paragraphContainerRef}
          className="max-h-96 sm:max-h-[420px] overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-rose-900 scrollbar-track-zinc-950 p-2 rounded-xl bg-[#09080b]/90 border border-zinc-900"
        >
          {paragraphs.map((para, idx) => {
            const isActive = idx === currentParaIndex
            return (
              <div
                key={idx}
                ref={isActive ? activeParagraphRef : null}
                onClick={() => handleSelectParagraph(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  isActive
                    ? 'border-rose-500/80 bg-rose-950/40 text-rose-50 shadow-lg crimson-glow-sm'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-300 hover:border-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400/80 shrink-0 mt-0.5">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 animate-pulse">
                        <Play className="w-3 h-3 fill-current" /> भाग {idx + 1}
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </span>

                  <p className="flex-1 text-sm sm:text-base leading-relaxed font-serif text-justify">
                    {para}
                  </p>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <span className="p-1.5 rounded-lg bg-rose-900/60 text-rose-200 text-xs flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
