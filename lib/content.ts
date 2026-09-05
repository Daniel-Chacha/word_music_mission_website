import { devotionals, memoryVerses } from '@/content/word'
import type { Devotional, MemoryVerse } from '@/content/types'

export function bySlug<T extends { slug: string }>(
  items: T[],
  slug: string,
): T | undefined {
  return items.find((item) => item.slug === slug)
}

/** Newest first. Never mutates the source array. */
export function latest<T extends { date: string }>(items: T[], count?: number): T[] {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))
  return count === undefined ? sorted : sorted.slice(0, count)
}

export function byCategory<C, T extends { category: C }>(items: T[], category: C): T[] {
  return items.filter((item) => item.category === category)
}

/** The most recent devotional. */
export function todaysDevotional(): Devotional {
  return latest(devotionals, 1)[0] ?? devotionals[0]
}

/** The most recent memory verse by ISO week string. */
export function currentMemoryVerse(): MemoryVerse {
  return [...memoryVerses].sort((a, b) => b.week.localeCompare(a.week))[0]
}
