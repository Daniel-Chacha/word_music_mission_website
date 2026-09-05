import Link from 'next/link'
import type { Devotional } from '@/content/types'
import { formatDate } from '@/lib/format'

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  return (
    <article className="group border border-ink-600 p-6 transition-colors hover:border-gold-700">
      <p className="eyebrow">{devotional.verseRef}</p>
      <h3 className="mt-3 text-xl font-bold leading-snug">
        <Link
          href={`/word/devotionals/${devotional.slug}`}
          className="transition-colors group-hover:text-gold-300"
        >
          {devotional.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm text-bone-dim">{devotional.body[0]}</p>
      <p className="mt-4 text-xs text-bone-dim">{formatDate(devotional.date)}</p>
    </article>
  )
}
