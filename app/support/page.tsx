import type { Metadata } from 'next'
import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { GoldRule } from '@/components/ui/GoldRule'

export const metadata: Metadata = {
  title: 'Support the Mission',
  description: site.giving.message,
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-ink-600 py-4">
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-lg text-bone">{value}</span>
    </div>
  )
}

export default function SupportPage() {
  const { mpesa, bank } = site.giving

  const givingEnquiry = whatsappLink(
    site.contact.whatsapp,
    'Hello Word Mission Team, I would like to support the mission. Please send me the giving details.',
  )

  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Support the Mission</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Send the Gospel into another school
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">{site.giving.message}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={givingEnquiry} variant="give" size="lg">
              Give via WhatsApp
            </Button>
          </div>
        </Container>
      </Section>

      <GoldRule />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="M-Pesa" number="01" title="Give by M-Pesa" />
            <div className="mt-8">
              {mpesa.paybill && <DetailRow label="Paybill" value={mpesa.paybill} />}
              {mpesa.account && <DetailRow label="Account" value={mpesa.account} />}
              {mpesa.tillNumber && <DetailRow label="Till" value={mpesa.tillNumber} />}
              {mpesa.sendMoneyPhone && (
                <DetailRow label="Send Money" value={mpesa.sendMoneyPhone} />
              )}
            </div>
            <p className="mt-6 text-sm text-bone-dim">
              After giving, send us the M-Pesa message on WhatsApp so we can thank you
              and account for the gift.
            </p>
          </div>

          <div>
            <SectionHeading eyebrow="Bank" number="02" title="Give by bank transfer" />
            <div className="mt-8">
              <DetailRow label="Bank" value={bank.bankName} />
              <DetailRow label="Branch" value={bank.branch} />
              <DetailRow label="Account Name" value={bank.accountName} />
              <DetailRow label="Account No." value={bank.accountNumber} />
              {bank.swiftCode && <DetailRow label="SWIFT" value={bank.swiftCode} />}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="From Outside Kenya"
            number="03"
            title="International giving"
            description={site.giving.internationalNote}
          />
          <Button href={givingEnquiry} variant="give" className="mt-10">
            Message us on WhatsApp
          </Button>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="surface-panel border border-rule p-10 lg:p-16">
            <p className="eyebrow">Where your gift goes</p>
            <ul className="mt-8 grid gap-6 text-bone-dim md:grid-cols-2">
              <li className="border-t border-ink-600 pt-4">
                <strong className="block text-bone">School missions</strong>
                Permits, sound, and the team on the ground.
              </li>
              <li className="border-t border-ink-600 pt-4">
                <strong className="block text-bone">Bibles</strong>
                A Bible in the hand of every student who asks for one.
              </li>
              <li className="border-t border-ink-600 pt-4">
                <strong className="block text-bone">Transport</strong>
                Getting the team to schools far outside the city.
              </li>
              <li className="border-t border-ink-600 pt-4">
                <strong className="block text-bone">Follow-up ministry</strong>
                Staying with students long after the mission ends.
              </li>
            </ul>
          </div>
        </Container>
      </Section>
    </>
  )
}
