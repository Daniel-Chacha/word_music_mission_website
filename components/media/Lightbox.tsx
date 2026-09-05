'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Photo } from '@/content/types'

export function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: Photo[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const closeRef = useRef<HTMLButtonElement>(null)

  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length],
  )
  const previous = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  )

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [next, previous, onClose])

  const photo = photos[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/[0.97] p-4 lg:p-8"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          {index + 1} / {photos.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="p-2 text-bone">
          <span className="sr-only">Close</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <button type="button" onClick={previous} className="shrink-0 p-3 text-gold-500">
          <span className="sr-only">Previous photo</span>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-[75vh] w-auto object-contain"
        />

        <button type="button" onClick={next} className="shrink-0 p-3 text-gold-500">
          <span className="sr-only">Next photo</span>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {photo.caption && (
        <p className="mt-4 text-center text-sm text-bone-dim">{photo.caption}</p>
      )}
    </div>
  )
}
