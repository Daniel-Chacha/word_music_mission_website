import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@/content/types'
import { VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { formatDate } from '@/lib/format'

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group">
      <Link href={`/tv/${video.slug}`} className="block">
        <div className="surface-media grain relative aspect-video overflow-hidden bg-ink-800">
          <Image
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <p className="eyebrow mt-4">{VIDEO_CATEGORY_LABELS[video.category]}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug transition-colors group-hover:text-gold-300">
          {video.title}
        </h3>
        <p className="mt-2 text-sm text-bone-dim">{formatDate(video.date)}</p>
      </Link>
    </article>
  )
}
