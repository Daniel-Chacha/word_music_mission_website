import Link from 'next/link'
import type { NewsItem } from '@/content/types'
import { NEWS_CATEGORY_LABELS } from '@/content/news'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

export function EventCard({ item }: { item: NewsItem }) {
  return (
    <article className="group border-t border-gold-700/40 py-8">
      <div className="flex flex-wrap items-center gap-4">
        <Badge>{NEWS_CATEGORY_LABELS[item.category]}</Badge>
        <p className="text-sm text-bone-dim">{formatDate(item.date)}</p>
        {item.location && <p className="text-sm text-bone-dim">· {item.location}</p>}
      </div>
      <h3 className="mt-4 text-2xl font-bold leading-snug">
        <Link
          href={`/news/${item.slug}`}
          className="transition-colors group-hover:text-gold-300"
        >
          {item.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-2xl text-bone-dim">{item.excerpt}</p>
    </article>
  )
}
