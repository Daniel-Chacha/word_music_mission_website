import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { albums } from '@/content/gallery'
import { videos } from '@/content/videos'
import { latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { VideoFilter } from './VideoFilter'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Videos and photos from Word Mission Team — school missions, testimonies, worship, camps, prayer meetings and mission documentaries.',
}

export default function GalleryPage() {
  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Gallery</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Watch the mission
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            School missions, testimonies, worship, interviews and documentaries — the
            Gospel going into Kenyan high schools.
          </p>
          <div className="mt-14">
            <VideoFilter videos={latest(videos)} />
          </div>
        </Container>
      </Section>

      <Section id="photos" className="bg-ink-800">
        <Container>
          <SectionHeading eyebrow="Photos" title="Moments from the field" />

          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {latest(albums).map((album) => (
              <article key={album.slug} className="group">
                <Link href={`/gallery/${album.slug}`}>
                  <div className="surface-media grain relative aspect-[4/3] overflow-hidden bg-ink-800">
                    <Image
                      src={album.cover.src}
                      alt=""
                      width={album.cover.width}
                      height={album.cover.height}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 text-xl font-bold transition-colors group-hover:text-gold-300">
                    {album.title}
                  </h3>
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
    </>
  )
}
