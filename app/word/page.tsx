import type { Metadata } from 'next'
import Link from 'next/link'
import { devotionals, bibleStudies, sermons, teachingNotes } from '@/content/word'
import { latest, todaysDevotional, currentMemoryVerse } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ScriptureBlock } from '@/components/content/ScriptureBlock'
import { DevotionalCard } from '@/components/content/DevotionalCard'

export const metadata: Metadata = {
  title: 'The Word',
  description:
    'Daily devotions, Bible studies, sermons, memory verses and downloadable teaching notes.',
}

export default function WordPage() {
  const today = todaysDevotional()
  const verse = currentMemoryVerse()

  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">The Word of God</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Feed on the Word
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            A daily devotion, studies to go deeper, sermons to listen to, and notes you
            can carry into your own group.
          </p>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Today" number="01" title="Today's devotion" />
          <div>
            <ScriptureBlock reference={today.verseRef} text={today.verseText} />
            <h3 className="mt-10 text-2xl font-bold">{today.title}</h3>
            <p className="mt-4 text-bone-dim">{today.body[0]}</p>
            <Button href={`/word/devotionals/${today.slug}`} variant="gold" className="mt-8">
              Read it
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Memory Verse" number="02" title="Hide it in your heart" />
          <ScriptureBlock
            reference={verse.reference}
            text={verse.text}
            className="mt-10 max-w-3xl"
          />
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Devotionals" number="03" title="Recent devotions" />
            <Button href="/word/devotionals" variant="ghost">
              All devotions
            </Button>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {latest(devotionals, 3).map((devotional) => (
              <DevotionalCard key={devotional.slug} devotional={devotional} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-14 md:grid-cols-3">
          <HubLink
            href="/word/bible-studies"
            eyebrow="04"
            title="Bible Studies"
            description={`${bibleStudies.length} studies for going deeper, alone or in a group.`}
          />
          <HubLink
            href="/word/sermons"
            eyebrow="05"
            title="Sermons"
            description={`${sermons.length} messages preached on mission and at camp.`}
          />
          <HubLink
            href="/word/notes"
            eyebrow="06"
            title="Teaching Notes"
            description={`${teachingNotes.length} downloadable guides for leaders.`}
          />
        </Container>
      </Section>
    </>
  )
}

function HubLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group border-t border-gold-700/40 pt-6 transition-colors hover:border-gold-500"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-bold transition-colors group-hover:text-gold-300">
        {title}
      </h3>
      <p className="mt-3 text-sm text-bone-dim">{description}</p>
    </Link>
  )
}
