'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number // delay in milliseconds for staggered entrance
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number // duration in milliseconds
  distance?: number // glide distance in pixels
  once?: boolean // whether to only animate once or re-animate on scroll
}

/**
 * ScrollReveal Component
 * Smoothly fades and slides elements from down to up as the user scrolls down the page.
 * Uses IntersectionObserver with a silky cubic-bezier curve.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 750,
  distance = 70,
  once = true,
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
          if (once) {
            observer.unobserve(el)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const getTransform = () => {
    if (isVisible) {
      return 'translate-y-0 translate-x-0 scale-100 opacity-100'
    }

    switch (direction) {
      case 'up':
        return `translate-y-[${distance}px] scale-[0.96] opacity-0`
      case 'down':
        return `translate-y-[-${distance}px] scale-[0.96] opacity-0`
      case 'left':
        return 'translate-x-12 opacity-0'
      case 'right':
        return '-translate-x-12 opacity-0'
      case 'none':
        return 'scale-[0.96] opacity-0'
      default:
        return `translate-y-[${distance}px] scale-[0.96] opacity-0`
    }
  }

  // Inline transform style for reliable cross-browser pixel distances
  const getTransformStyle = () => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: 'translateY(0px) scale(1)',
      }
    }

    switch (direction) {
      case 'up':
        return {
          opacity: 0,
          transform: `translateY(${distance}px) scale(0.96)`,
        }
      case 'down':
        return {
          opacity: 0,
          transform: `translateY(-${distance}px) scale(0.96)`,
        }
      case 'left':
        return {
          opacity: 0,
          transform: 'translateX(40px)',
        }
      case 'right':
        return {
          opacity: 0,
          transform: 'translateX(-40px)',
        }
      case 'none':
        return {
          opacity: 0,
          transform: 'scale(0.96)',
        }
      default:
        return {
          opacity: 0,
          transform: `translateY(${distance}px) scale(0.96)`,
        }
    }
  }

  return (
    <div
      ref={elementRef}
      style={{
        ...getTransformStyle(),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionProperty: 'opacity, transform',
        willChange: 'transform, opacity',
      }}
      className={`transition-all ${className}`}
    >
      {children}
    </div>
  )
}
