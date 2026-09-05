import type { Metadata } from 'next'
import { ministry } from '@/content/ministry'
import { site } from '@/content/site'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GoldRule } from '@/components/ui/GoldRule'
import { StatCounter } from '@/components/content/StatCounter'
import { TeamCard } from '@/components/content/TeamCard'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About',
  description: ministry.mission,
}

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">About Word Mission Team</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            A team sent to the schools of this generation
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">{site.missionStatement}</p>
        </Container>
      </Section>

      <GoldRule />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our Vision" number="01" title="Where we are going" />
            <p className="mt-8 text-bone-dim">{ministry.vision}</p>
          </div>
          <div>
            <SectionHeading eyebrow="Our Mission" number="02" title="How we get there" />
            <p className="mt-8 text-bone-dim">{ministry.mission}</p>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading eyebrow="What We Stand On" number="03" title="Our values" />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            {ministry.values.map((value) => (
              <div key={value.title} className="border-t border-gold-700/40 pt-6">
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="mt-3 text-bone-dim">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Our Story" number="04" title="How this began" />
          <div className="mt-10 max-w-3xl space-y-6">
            {ministry.story.map((paragraph, i) => (
              <p key={i} className="text-bone-dim">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="Our Impact"
            number="05"
            title="The numbers behind the mission"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="The Team" number="06" title="Who we are" />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.team.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
          <Button href="/contact" variant="give" className="mt-14">
            Invite us to your school
          </Button>
        </Container>
      </Section>
    </>
  )
}
