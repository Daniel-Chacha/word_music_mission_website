'use client'

import { useState } from 'react'
import Image from 'next/image'

/**
 * Loads only the poster image until clicked. A page with a dozen videos would
 * otherwise pull a dozen full YouTube players on first paint.
 */
export function YouTubeFacade({
  youtubeId,
  title,
  className = '',
}: {
  youtubeId: string
  title: string
  className?: string
}) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <div className={`relative aspect-video overflow-hidden bg-ink-800 ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className={`group relative block aspect-video w-full overflow-hidden bg-ink-800 ${className}`}
    >
      <span className="sr-only">Play video: {title}</span>
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-ink-900/30"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500 bg-ink-900/70 transition-colors group-hover:bg-gold-500">
          <svg width="20" height="22" viewBox="0 0 20 22" className="ml-1">
            <path d="M0 0l20 11L0 22z" className="fill-gold-500 group-hover:fill-ink-900" />
          </svg>
        </span>
      </span>
    </button>
  )
}
