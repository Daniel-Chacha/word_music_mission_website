import type { Metadata } from 'next'
import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { WhatsAppForm } from '@/components/forms/WhatsAppForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach Word Mission Team on WhatsApp, email or social media.',
}

const SOCIAL_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
}

export default function ContactPage() {
  const socials = Object.entries(site.socials).filter(([, url]) => Boolean(url))
  const generalChat = whatsappLink(site.contact.whatsapp, 'Hello Word Mission Team,')

  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Talk to the team
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            WhatsApp is the fastest way to reach us. We read every message.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={generalChat} variant="gold" size="lg">
              WhatsApp us
            </Button>
            <Button href={`mailto:${site.contact.email}`} variant="ghost" size="lg">
              {site.contact.email}
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow hover:text-gold-300"
              >
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="How can we help?"
            number="01"
            title="Send us a message"
            description="Fill in a form and it opens WhatsApp with your message ready to send."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <WhatsAppForm
              heading="Invite us to your school"
              intro="For school administrators, chaplains, patrons and CU leaders."
              preamble="SCHOOL INVITATION"
              submitLabel="Send invitation"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Your role', name: 'role', required: true },
                { label: 'School name', name: 'school', required: true },
                { label: 'County / location', name: 'location', required: true },
                { label: 'Preferred dates', name: 'dates' },
                { label: 'Anything we should know', name: 'notes', rows: 4 },
              ]}
            />

            <WhatsAppForm
              heading="Send a prayer request"
              intro="We pray over every request as a team."
              preamble="PRAYER REQUEST"
              submitLabel="Send request"
              fields={[
                { label: 'Your name', name: 'name' },
                { label: 'School (optional)', name: 'school' },
                { label: 'Your request', name: 'request', rows: 5, required: true },
              ]}
            />

            <WhatsAppForm
              heading="Join the team"
              intro="Volunteer with us on missions, media, worship or follow-up."
              preamble="VOLUNTEER REGISTRATION"
              submitLabel="Register interest"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Phone', name: 'phone', type: 'tel', required: true },
                { label: 'Location', name: 'location', required: true },
                { label: 'How you would like to serve', name: 'serve', rows: 4 },
              ]}
            />

            <WhatsAppForm
              heading="Get mission updates"
              intro="We will add you to our WhatsApp updates for missions and prayer points."
              preamble="UPDATES SIGN-UP"
              submitLabel="Sign me up"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Phone', name: 'phone', type: 'tel', required: true },
              ]}
            />
          </div>
        </Container>
      </Section>
    </>
  )
}
