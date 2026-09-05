'use client'

import Image from 'next/image'
import type { Photo } from '@/content/types'

export function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: Photo
  index: number
  onOpen: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="surface-media grain group relative aspect-[4/3] overflow-hidden bg-ink-800"
    >
      <span className="sr-only">Open photo: {photo.alt}</span>
      <Image
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        sizes="(max-width: 768px) 50vw, 33vw"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </button>
  )
}
