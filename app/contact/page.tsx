import type { Metadata } from 'next'
import Image from 'next/image'
import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { FormTabs, type TabbedForm } from '@/components/forms/FormTabs'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { socialProfiles } from '@/lib/socials'
import contactIcons from '@/public/images/contact-icons.jpg'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach Word Mission Team on WhatsApp, email or social media.',
}

const FORMS: TabbedForm[] = [
  {
    tab: 'Invite us',
    heading: 'Invite us to your school',
    intro: 'For school administrators, chaplains, patrons and CU leaders.',
    preamble: 'SCHOOL INVITATION',
    submitLabel: 'Send invitation',
    fields: [
      { label: 'Your name', name: 'name', required: true },
      { label: 'Your role', name: 'role', required: true },
      { label: 'Email', name: 'email', type: 'email', required: true },
      { label: 'School name', name: 'school', required: true },
      { label: 'County / location', name: 'location', required: true },
      { label: 'Preferred date & time', name: 'dates', type: 'datetime-local' },
      { label: 'Anything we should know', name: 'notes', rows: 4 },
    ],
  },
  {
    tab: 'Prayer request',
    heading: 'Send a prayer request',
    intro: 'We pray over every request as a team.',
    preamble: 'PRAYER REQUEST',
    submitLabel: 'Send request',
    fields: [
      { label: 'Your name', name: 'name' },
      { label: 'Phone (optional)', name: 'phone', type: 'tel' },
      { label: 'Email (optional)', name: 'email', type: 'email' },
      { label: 'Your request', name: 'request', rows: 5, required: true },
    ],
  },
  {
    tab: 'Join the team',
    heading: 'Join the team',
    intro: 'Volunteer with us on missions, media, worship or follow-up.',
    preamble: 'VOLUNTEER REGISTRATION',
    submitLabel: 'Register interest',
    fields: [
      { label: 'Your name', name: 'name', required: true },
      { label: 'Phone', name: 'phone', type: 'tel', required: true },
      { label: 'Email', name: 'email', type: 'email', required: true },
      { label: 'Location', name: 'location', required: true },
      { label: 'How you would like to serve', name: 'serve', rows: 4 },
    ],
  },
  {
    tab: 'Mission updates',
    heading: 'Get mission updates',
    intro: 'We will send you updates on missions and prayer points by email.',
    preamble: 'UPDATES SIGN-UP',
    submitLabel: 'Sign me up',
    fields: [
      { label: 'Your name', name: 'name', required: true },
      { label: 'Phone', name: 'phone', type: 'tel', required: true },
      { label: 'Email', name: 'email', type: 'email', required: true },
    ],
  },
]

export default function ContactPage() {
  const socials = socialProfiles(site.socials, site.socialNames)
  const email = site.contact.email.trim()
  const generalChat = whatsappLink(site.contact.whatsapp, 'Hello Word Mission Team,')

  return (
    <>
      <Section className="on-photo grain relative overflow-hidden bg-scrim">
        <Image
          src={contactIcons}
          alt=""
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[50%_70%]"
        />
        {/* A light shade behind the text only, so the icons on the left still
            read; the headline's text shadow (.on-photo) carries legibility. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a8c] via-[#0a0a0a4d] via-50% to-[#0a0a0a33] lg:to-transparent"
        />
        <Container className="relative">
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
            <Button className='bg-black' href={`mailto:${email}`} variant="ghost" size="lg">
              {email}
            </Button>
          </div>

          <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-4">
            {socials.map(({ key, label, url, handle }) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={handle ? `${label}: ${handle}` : label}
                  // White rather than copper: copper labels disappear against
                  // the wooden discs in the photo.
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-bone transition-colors hover:text-gold-300"
                >
                  <SocialIcon name={key} className="size-5 shrink-0" />
                  <span>{handle ?? label}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="How can we help?"
            number="01"
            title="Send us a message"
            description="Pick what you need below. Each form sends your message straight to the team by email."
          />

          <div className="mt-14">
            <FormTabs forms={FORMS} />
          </div>
        </Container>
      </Section>
    </>
  )
}
