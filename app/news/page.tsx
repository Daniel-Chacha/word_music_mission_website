import type { Metadata } from 'next'
import { newsItems } from '@/content/news'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { EventCard } from '@/components/content/EventCard'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'News & Events',
  description: 'Upcoming school visits, mission reports, prayer requests and testimonies.',
}

export default function NewsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">News &amp; Events</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Where we are going, and what God has done
        </h1>

        <div className="mt-14">
          {latest(newsItems).map((item) => (
            <EventCard key={item.slug} item={item} />
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Button href="/contact" variant="gold">
            Send a prayer request
          </Button>
          <Button href="/contact" variant="ghost">
            Invite us to your school
          </Button>
        </div>
      </Container>
    </Section>
  )
}
