'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number // delay in milliseconds for staggered entrance
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number // duration in milliseconds
}

/**
 * ScrollReveal Component
 * Smoothly fades and slides elements into view as the user scrolls down the page.
 * Uses IntersectionObserver with a gentle cubic-bezier curve.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 700,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    // Fallback if IntersectionObserver is unavailable
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const getInitialTransform = () => {
    if (isVisible) {
      return 'translate-y-0 translate-x-0 scale-100 opacity-100'
    }

    switch (direction) {
      case 'up':
        return 'translate-y-12 scale-[0.98] opacity-0'
      case 'down':
        return '-translate-y-12 scale-[0.98] opacity-0'
      case 'left':
        return 'translate-x-10 opacity-0'
      case 'right':
        return '-translate-x-10 opacity-0'
      case 'none':
        return 'scale-[0.97] opacity-0'
      default:
        return 'translate-y-12 scale-[0.98] opacity-0'
    }
  }

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
      className={`transition-all transform ${getInitialTransform()} ${className}`}
    >
      {children}
    </div>
  )
}
