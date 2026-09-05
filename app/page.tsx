import { site } from '@/content/site'
import { ministry } from '@/content/ministry'
import { videos } from '@/content/videos'
import { latest, todaysDevotional, currentMemoryVerse } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrimmedImage } from '@/components/media/ScrimmedImage'
import { ScriptureBlock } from '@/components/content/ScriptureBlock'
import { StatCounter } from '@/components/content/StatCounter'
import { VideoCard } from '@/components/content/VideoCard'

export default function HomePage() {
  const featured = latest(videos, 3)
  const devotional = todaysDevotional()
  const verse = currentMemoryVerse()

  return (
    <>
      <ScrimmedImage
        photo={{
          // TODO: Replace with a real photograph from a high school outreach.
          src: '/images/placeholder.jpg',
          alt: '',
          width: 1600,
          height: 1067,
        }}
        priority
        sizes="100vw"
        className="flex min-h-[85vh] items-end"
      >
        <Container className="pb-4">
          <p className="eyebrow">Word Mission Team · Word Mission TV</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,9vw,7rem)] font-black leading-[0.92] tracking-[-0.03em]">
            Reaching the next generation
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">{site.missionStatement}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/tv" variant="gold" size="lg">
              Watch Videos
            </Button>
            <Button href="/support" variant="give" size="lg">
              Support the Mission
            </Button>
            <Button href="/word" variant="ghost" size="lg">
              Read the Word
            </Button>
          </div>
        </Container>
      </ScrimmedImage>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Our Impact"
            number="01"
            title="What God is doing through this team"
            description="Every figure below represents students we have stood in front of, prayed with, and continue to walk alongside."
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              number="02"
              title="We go where the students are"
            />
            <p className="mt-8 text-bone-dim">{ministry.mission}</p>
            <Button href="/about" variant="ghost" className="mt-8">
              About the team
            </Button>
          </div>
          <ScriptureBlock reference={verse.reference} text={verse.text} />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Word Mission TV" number="03" title="Watch the mission" />
            <Button href="/tv" variant="ghost">
              All videos
            </Button>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            eyebrow="The Word"
            number="04"
            title="Today's devotion"
            description="A short word for students, every day."
          />
          <div>
            <ScriptureBlock reference={devotional.verseRef} text={devotional.verseText} />
            <h3 className="mt-10 text-2xl font-bold">{devotional.title}</h3>
            <p className="mt-4 text-bone-dim">{devotional.body[0]}</p>
            <Button
              href={`/word/devotionals/${devotional.slug}`}
              variant="ghost"
              className="mt-8"
            >
              Read today&rsquo;s word
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="surface-panel border border-blood-soft p-10 lg:p-16">
            <p className="eyebrow">Support the Mission</p>
            <h2 className="mt-6 max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
              Every gift sends the Gospel into another school
            </h2>
            <p className="mt-6 max-w-2xl text-bone-dim">{site.giving.message}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/support" variant="give" size="lg">
                Give now
              </Button>
              <Button href="/contact" variant="ghost" size="lg">
                Invite us to your school
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
