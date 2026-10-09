import type { Metadata } from 'next'
import { site } from '@/content/site'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Order Received',
  robots: { index: false, follow: false },
}

export default async function OrderReceivedPage(
  props: PageProps<'/merch/order-received'>,
) {
  const { ref } = await props.searchParams
  const reference = typeof ref === 'string' ? ref : null
  const email = site.contact.email.trim()

  return (
    <Section>
      <Container className="max-w-2xl">
        <p className="eyebrow">Order received</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Thank you — God bless you
        </h1>

        <p className="mt-6 text-bone-dim">
          We have received your order and sent a copy to your email. A member of our
          team will contact you shortly to arrange delivery and share payment details.
        </p>

        {reference && (
          <div className="surface-panel mt-12 flex justify-between border border-rule p-8">
            <span className="eyebrow">Order reference</span>
            <span className="font-mono text-gold-300">{reference}</span>
          </div>
        )}

        <p className="mt-10 text-sm text-bone-dim">
          Questions about your order? Email us at{' '}
          <a href={`mailto:${email}`} className="text-gold-300 hover:underline">
            {email}
          </a>
          {reference && ' and include your order reference'}.
        </p>

        <Button href="/merch" variant="ghost" className="mt-10">
          Keep shopping
        </Button>
      </Container>
    </Section>
  )
}
