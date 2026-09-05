import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { albums } from '@/content/gallery'
import { bySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { PhotoGrid } from './PhotoGrid'

export function generateStaticParams() {
  return albums.map((album) => ({ album: album.slug }))
}

export async function generateMetadata(
  props: PageProps<'/gallery/[album]'>,
): Promise<Metadata> {
  const { album: slug } = await props.params
  const album = bySlug(albums, slug)
  if (!album) return {}
  return { title: album.title, description: album.description }
}

export default async function AlbumPage(props: PageProps<'/gallery/[album]'>) {
  const { album: slug } = await props.params
  const album = bySlug(albums, slug)
  if (!album) notFound()

  return (
    <Section>
      <Container>
        <p className="eyebrow">{formatDate(album.date)}</p>
        <h1 className="mt-6 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          {album.title}
        </h1>
        <p className="mt-6 max-w-2xl text-bone-dim">{album.description}</p>

        <div className="mt-14">
          <PhotoGrid photos={album.photos} />
        </div>

        <Button href="/gallery" variant="ghost" className="mt-14">
          All albums
        </Button>
      </Container>
    </Section>
  )
}
