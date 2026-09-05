import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { albums } from '@/content/gallery'
import { latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photos from school missions, camps, prayer meetings, guidance and counselling sessions, and student testimonies.',
}

export default function GalleryPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Moments from the field
        </h1>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {latest(albums).map((album) => (
            <article key={album.slug} className="group">
              <Link href={`/gallery/${album.slug}`}>
                <div className="grain relative aspect-[4/3] overflow-hidden bg-ink-800">
                  <Image
                    src={album.cover.src}
                    alt=""
                    width={album.cover.width}
                    height={album.cover.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-5 text-xl font-bold transition-colors group-hover:text-gold-300">
                  {album.title}
                </h2>
                <p className="mt-2 text-sm text-bone-dim">{album.description}</p>
                <p className="eyebrow mt-3">
                  {album.photos.length} photos · {formatDate(album.date)}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
