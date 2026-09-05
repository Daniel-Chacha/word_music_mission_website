import Image from 'next/image'
import type { Photo } from '@/content/types'

/**
 * The uniform photo treatment: grain plus a bottom-up black scrim.
 * Source photos are phone snaps of mixed quality; this makes them cohere and
 * guarantees overlaid text stays legible whatever the underlying image.
 */
export function ScrimmedImage({
  photo,
  priority = false,
  className = '',
  sizes = '100vw',
  children,
}: {
  photo: Photo
  priority?: boolean
  className?: string
  sizes?: string
  children?: React.ReactNode
}) {
  return (
    <div className={`grain relative overflow-hidden bg-ink-800 ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent"
      />
      {children && (
        <div className="relative z-10 w-full p-6 lg:p-10">{children}</div>
      )}
    </div>
  )
}
