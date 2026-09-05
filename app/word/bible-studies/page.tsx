import type { Metadata } from 'next'
import Link from 'next/link'
import { bibleStudies } from '@/content/word'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Bible Studies',
  description: 'Studies for going deeper in the Word, alone or in a group.',
}

export default function BibleStudiesPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Bible Studies
        </h1>
        <div className="mt-14">
          {bibleStudies.map((study) => (
            <article key={study.slug} className="group border-t border-gold-700/40 py-8">
              {study.series && <Badge>{study.series}</Badge>}
              <h2 className="mt-4 text-2xl font-bold">
                <Link
                  href={`/word/bible-studies/${study.slug}`}
                  className="transition-colors group-hover:text-gold-300"
                >
                  {study.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl text-bone-dim">{study.summary}</p>
              <p className="eyebrow mt-4">{study.scriptures.join(' · ')}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
