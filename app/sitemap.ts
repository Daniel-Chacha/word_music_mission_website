import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { videos } from '@/content/videos'
import { albums } from '@/content/gallery'
import { devotionals, bibleStudies } from '@/content/word'
import { newsItems } from '@/content/news'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/about',
    '/tv',
    '/gallery',
    '/word',
    '/word/devotionals',
    '/word/bible-studies',
    '/word/sermons',
    '/word/notes',
    '/news',
    '/support',
    '/contact',
  ]

  const dynamicPaths = [
    ...videos.map((v) => `/tv/${v.slug}`),
    ...albums.map((a) => `/gallery/${a.slug}`),
    ...devotionals.map((d) => `/word/devotionals/${d.slug}`),
    ...bibleStudies.map((s) => `/word/bible-studies/${s.slug}`),
    ...newsItems.map((n) => `/news/${n.slug}`),
  ]

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }))
}
