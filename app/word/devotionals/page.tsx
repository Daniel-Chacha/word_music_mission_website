import type { Metadata } from 'next'
import { devotionals } from '@/content/word'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { DevotionalCard } from '@/components/content/DevotionalCard'

export const metadata: Metadata = {
  title: 'Daily Devotions',
  description: 'A short word for students, every day.',
}

export default function DevotionalsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Daily Devotions
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {latest(devotionals).map((devotional) => (
            <DevotionalCard key={devotional.slug} devotional={devotional} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
