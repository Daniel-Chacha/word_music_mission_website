'use client'

import { useState } from 'react'
import type { Photo } from '@/content/types'
import { PhotoCard } from '@/components/content/PhotoCard'
import { Lightbox } from '@/components/media/Lightbox'

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <PhotoCard key={index} photo={photo} index={index} onOpen={setOpenIndex} />
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}
