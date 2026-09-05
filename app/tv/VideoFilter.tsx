'use client'

import { useState } from 'react'
import type { Video, VideoCategory } from '@/content/types'
import { VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { VideoCard } from '@/components/content/VideoCard'

type Filter = VideoCategory | 'all'

export function VideoFilter({ videos }: { videos: Video[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const categories = Object.keys(VIDEO_CATEGORY_LABELS) as VideoCategory[]
  const shown = filter === 'all' ? videos : videos.filter((v) => v.category === filter)

  return (
    <>
      <div role="group" aria-label="Filter videos by category" className="flex flex-wrap gap-3">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        {categories.map((category) => (
          <FilterButton
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
          >
            {VIDEO_CATEGORY_LABELS[category]}
          </FilterButton>
        ))}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-14 text-bone-dim">No videos in this category yet. Check back soon.</p>
      )}
    </>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
        active
          ? 'bg-gold-500 text-ink-900'
          : 'border border-gold-700/60 text-bone-dim hover:border-gold-500 hover:text-gold-300'
      }`}
    >
      {children}
    </button>
  )
}
