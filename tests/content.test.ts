import { describe, it, expect } from 'vitest'
import { site } from '@/content/site'

describe('site config', () => {
  it('uses the exact mission statement from the spec', () => {
    expect(site.missionStatement).toBe(
      'Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God.',
    )
  })

  it('does not list Support Us in the main nav', () => {
    const labels = site.nav.map((n) => n.label.toLowerCase())
    expect(labels).not.toContain('support us')
  })

  it('has unique nav hrefs', () => {
    const hrefs = site.nav.map((n) => n.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('exposes a WhatsApp number in international format', () => {
    expect(site.contact.whatsapp).toMatch(/^\+\d{10,15}$/)
  })
})

import { videos } from '@/content/videos'
import { albums } from '@/content/gallery'
import {
  devotionals,
  bibleStudies,
  sermons,
  teachingNotes,
} from '@/content/word'
import { newsItems } from '@/content/news'
import { ministry } from '@/content/ministry'
import {
  bySlug,
  latest,
  byCategory,
  todaysDevotional,
  currentMemoryVerse,
} from '@/lib/content'

function expectUniqueSlugs(items: { slug: string }[], name: string) {
  const slugs = items.map((i) => i.slug)
  expect(new Set(slugs).size, `${name} has duplicate slugs`).toBe(slugs.length)
}

describe('content integrity', () => {
  it('has unique slugs in every collection', () => {
    expectUniqueSlugs(videos, 'videos')
    expectUniqueSlugs(albums, 'albums')
    expectUniqueSlugs(devotionals, 'devotionals')
    expectUniqueSlugs(bibleStudies, 'bibleStudies')
    expectUniqueSlugs(sermons, 'sermons')
    expectUniqueSlugs(teachingNotes, 'teachingNotes')
    expectUniqueSlugs(newsItems, 'newsItems')
  })

  it('uses well-formed YouTube ids', () => {
    for (const video of videos) {
      expect(video.youtubeId, video.slug).toMatch(/^[\w-]{11}$/)
    }
    for (const sermon of sermons) {
      if (sermon.youtubeId) {
        expect(sermon.youtubeId, sermon.slug).toMatch(/^[\w-]{11}$/)
      }
    }
  })

  it('uses ISO dates everywhere', () => {
    const dated = [...videos, ...albums, ...devotionals, ...sermons, ...newsItems]
    for (const item of dated) {
      expect(item.date, item.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('gives every album at least one photo with alt text', () => {
    for (const album of albums) {
      expect(album.photos.length, album.slug).toBeGreaterThan(0)
      for (const photo of album.photos) {
        expect(photo.alt.trim(), album.slug).not.toBe('')
      }
    }
  })

  it('gives every devotional a verse reference and body', () => {
    for (const devotional of devotionals) {
      expect(devotional.verseRef.trim(), devotional.slug).not.toBe('')
      expect(devotional.body.length, devotional.slug).toBeGreaterThan(0)
    }
  })

  it('publishes no invented impact figures', () => {
    // Guards the placeholder policy: a stat may only carry a non-zero value
    // once its TODO note has been replaced with a real source.
    for (const stat of ministry.stats) {
      if (stat.value !== 0) {
        expect(stat.note ?? '', stat.label).not.toMatch(/TODO/)
      }
    }
  })
})

describe('content query helpers', () => {
  it('finds an item by slug', () => {
    expect(bySlug(videos, videos[0].slug)?.slug).toBe(videos[0].slug)
    expect(bySlug(videos, 'nope')).toBeUndefined()
  })

  it('sorts by date descending and limits', () => {
    const result = latest(videos, 2)
    expect(result).toHaveLength(2)
    expect(result[0].date >= result[1].date).toBe(true)
  })

  it('does not mutate the source array', () => {
    const before = videos.map((v) => v.slug)
    latest(videos)
    expect(videos.map((v) => v.slug)).toEqual(before)
  })

  it('filters by category', () => {
    const worship = byCategory(videos, 'worship')
    expect(worship.length).toBeGreaterThan(0)
    expect(worship.every((v) => v.category === 'worship')).toBe(true)
  })

  it('returns a devotional and a memory verse', () => {
    expect(todaysDevotional().slug).toBeTruthy()
    expect(currentMemoryVerse().reference).toBeTruthy()
  })
})
