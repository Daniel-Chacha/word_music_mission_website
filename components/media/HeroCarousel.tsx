'use client'

import Image from 'next/image'
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react'
import type { Photo } from '@/content/types'
import { upcoming, wrapIndex } from '@/lib/carousel'
import { Container } from '@/components/layout/Container'
import styles from './HeroCarousel.module.css'

const AUTOPLAY_MS = 7000
// Longest of the move animations in HeroCarousel.module.css, plus headroom.
const MOVE_MS = 900
const THUMB_GAP_PX = 12

type Direction = 'next' | 'prev'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Full-bleed hero that cycles through photos. The next photos wait in a
 * thumbnail strip; moving forward grows the first thumbnail out to fill the
 * hero, moving back shrinks the current photo into the strip.
 *
 * `children` is the overlaid copy. Each direct child is revealed in turn
 * after a move, so pass the lines as siblings rather than one wrapper.
 */
export function HeroCarousel({
  slides,
  label,
  children,
}: {
  slides: Photo[]
  label: string
  children: React.ReactNode
}) {
  const rootRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [direction, setDirection] = useState<Direction | null>(null)
  // The copy is only animated after the first move, so the initial headline
  // paints immediately instead of waiting on a reveal.
  const [hasMoved, setHasMoved] = useState(false)
  const [userPaused, setUserPaused] = useState<boolean | null>(null)

  // Server snapshot is `true` so nothing autoplays before hydration.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  )
  const paused = userPaused ?? reducedMotion
  const count = slides.length
  const queue = upcoming(current, count)

  /** Records the first thumbnail's box as the start/end point of a move. */
  function measureSlot() {
    const root = rootRef.current
    if (!root) return
    const rootBox = root.getBoundingClientRect()
    const thumb = stripRef.current?.firstElementChild?.getBoundingClientRect()

    // Fallback if the strip has not laid out: grow from a card at bottom centre.
    const box =
      thumb && thumb.width > 0
        ? {
            left: thumb.left - rootBox.left,
            top: thumb.top - rootBox.top,
            width: thumb.width,
            height: thumb.height,
          }
        : { left: rootBox.width / 2 - 60, top: rootBox.height - 220, width: 120, height: 176 }

    root.style.setProperty('--from-left', `${box.left}px`)
    root.style.setProperty('--from-top', `${box.top}px`)
    root.style.setProperty('--from-w', `${box.width}px`)
    root.style.setProperty('--from-h', `${box.height}px`)
    root.style.setProperty('--slot', `${box.width + THUMB_GAP_PX}px`)
  }

  function move(step: 1 | -1) {
    if (direction || count < 2) return
    measureSlot()
    setPrevious(current)
    setCurrent(wrapIndex(current + step, count))
    setDirection(step === 1 ? 'next' : 'prev')
    setHasMoved(true)

    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      setDirection(null)
      setPrevious(null)
    }, MOVE_MS)
  }

  const advance = useEffectEvent(() => move(1))

  useEffect(() => {
    if (paused || count < 2) return
    const timer = setTimeout(advance, AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [current, paused, count])

  useEffect(() => () => clearTimeout(settleTimer.current), [])

  function slideClass(index: number) {
    if (index === current) return `z-[2] ${direction === 'next' ? styles.expand : ''}`
    if (index === previous && direction === 'prev') return `z-[3] ${styles.shrink}`
    if (index === previous) return 'z-[1]'
    return 'z-0 opacity-0'
  }

  function thumbClass(position: number) {
    if (direction === 'next' && position === queue.length - 1) return styles.grow
    if (direction === 'prev' && position === 0) return styles.landing
    return ''
  }

  const stripClass =
    direction === 'next' ? styles.stripNext : direction === 'prev' ? styles.stripPrev : ''

  const controlClass =
    'grid size-11 place-items-center rounded-full border border-rule-strong bg-veil text-bone backdrop-blur transition-colors hover:border-gold-500 hover:text-gold-300'

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={label}
      className="on-photo relative flex min-h-[max(560px,calc(100svh-var(--header-h)-1px))] flex-col justify-end overflow-hidden bg-ink-800"
    >
      <div className="absolute inset-0 isolate">
        {slides.map((photo, index) => (
          <div key={index} className={`absolute left-0 top-0 h-full w-full ${slideClass(index)}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              preload={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {/* A light shade behind the copy only. Top and right stay untouched so
          the photo reads as it was taken. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0a0a0aa6] via-[#0a0a0a26] via-35% to-transparent to-60%"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a8c] via-[#0a0a0a33] via-40% to-transparent to-65%"
      />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      <Container className="relative z-10 pb-6 pt-10 sm:pb-8 sm:pt-24 lg:pb-16">
        <div
          key={current}
          className={`max-w-4xl lg:max-w-[50%] ${hasMoved ? styles.reveal : ''}`}
        >
          {children}
        </div>
      </Container>

      {count > 1 && (
        // Below lg the controls sit under the copy with the strip beside them,
        // running off the right edge. From lg up they float in the right half.
        <div className="relative z-10 flex items-end gap-4 px-6 pb-6 sm:pb-8 lg:absolute lg:bottom-16 lg:left-[56%] lg:block lg:p-0">
          <div className="flex shrink-0 flex-wrap items-center gap-3 max-lg:w-[156px]">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous photo"
              className={controlClass}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next photo"
              className={controlClass}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setUserPaused(!paused)}
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              className={controlClass}
            >
              {paused ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              )}
            </button>
            <p className="eyebrow tabular-nums max-lg:order-first max-lg:w-full lg:ml-2">
              {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
          </div>

          <div
            ref={stripRef}
            aria-hidden="true"
            className={`flex w-max gap-3 lg:mt-5 ${stripClass}`}
          >
            {queue.map((index, position) => (
              <div
                key={index}
                className={`relative h-[140px] w-[96px] shrink-0 overflow-hidden rounded-[20px] surface-media sm:h-[190px] sm:w-[130px] xl:h-[220px] xl:w-[150px] ${thumbClass(position)}`}
              >
                <Image
                  src={slides[index].src}
                  alt=""
                  fill
                  sizes="150px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-scrim via-transparent to-transparent" />
                {slides[index].caption && (
                  <p className="absolute inset-x-3 bottom-3 text-xs font-semibold sm:text-sm leading-tight text-bone">
                    {slides[index].caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {count > 1 && !paused && (
        <div
          key={current}
          aria-hidden="true"
          style={{ '--autoplay-ms': `${AUTOPLAY_MS}ms` } as React.CSSProperties}
          className={`absolute inset-x-0 top-0 z-10 h-[3px] bg-gold-500 ${styles.progress}`}
        />
      )}
    </section>
  )
}
