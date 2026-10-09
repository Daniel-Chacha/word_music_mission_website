import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { videos, VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { bySlug, latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { YouTubeFacade } from '@/components/media/YouTubeFacade'
import { VideoCard } from '@/components/content/VideoCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'

export function generateStaticParams() {
  return videos.map((video) => ({ slug: video.slug }))
}

export async function generateMetadata(
  props: PageProps<'/tv/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const video = bySlug(videos, slug)
  if (!video) return {}
  return { title: video.title, description: video.description }
}

export default async function VideoPage(props: PageProps<'/tv/[slug]'>) {
  const { slug } = await props.params
  const video = bySlug(videos, slug)
  if (!video) notFound()

  const related = latest(
    videos.filter((v) => v.slug !== video.slug && v.category === video.category),
    3,
  )

  return (
    <>
      <Section>
        <Container>
          <YouTubeFacade youtubeId={video.youtubeId} title={video.title} />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Badge>{VIDEO_CATEGORY_LABELS[video.category]}</Badge>
            <p className="text-sm text-bone-dim">{formatDate(video.date)}</p>
            {video.school && <p className="text-sm text-bone-dim">· {video.school}</p>}
          </div>

          <h1 className="mt-6 max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {video.title}
          </h1>
          <p className="mt-6 max-w-2xl text-bone-dim">{video.description}</p>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section className="bg-ink-800">
          <Container>
            <SectionHeading eyebrow="Keep Watching" title="More like this" />
            <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <VideoCard key={item.slug} video={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
