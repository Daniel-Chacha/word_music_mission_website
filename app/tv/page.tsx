import type { Metadata } from 'next'
import { videos } from '@/content/videos'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { VideoFilter } from './VideoFilter'

export const metadata: Metadata = {
  title: 'Word Mission TV',
  description:
    'School missions, testimonies, worship sessions, interviews and mission documentaries from Word Mission Team.',
}

export default function TvPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">Word Mission TV</p>
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
  )
}
