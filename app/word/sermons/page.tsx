import type { Metadata } from 'next'
import { sermons } from '@/content/word'
import { latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { YouTubeFacade } from '@/components/media/YouTubeFacade'

export const metadata: Metadata = {
  title: 'Sermons',
  description: 'Messages preached on mission and at camp.',
}

export default function SermonsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Sermons
        </h1>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          {latest(sermons).map((sermon) => (
            <article key={sermon.slug}>
              {sermon.youtubeId && (
                <YouTubeFacade youtubeId={sermon.youtubeId} title={sermon.title} />
              )}
              <h2 className="mt-6 text-2xl font-bold">{sermon.title}</h2>
              <p className="eyebrow mt-3">
                {sermon.preacher} · {formatDate(sermon.date)}
              </p>
              <p className="mt-4 text-bone-dim">{sermon.summary}</p>
              {sermon.audioUrl && (
                <audio controls src={sermon.audioUrl} className="mt-4 w-full">
                  Your browser does not support audio playback.
                </audio>
              )}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
