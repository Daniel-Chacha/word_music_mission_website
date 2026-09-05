import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { site } from '@/content/site'
import { getOrder, isCommerceEnabled, markOrderPaid } from '@/lib/orders'
import { verifyTransaction } from '@/lib/paystack'
import { formatKes } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { ClearCart } from './ClearCart'

export const metadata: Metadata = {
  title: 'Your Order',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

export default async function OrderPage(
  props: PageProps<'/merch/order/[reference]'>,
) {
  const { reference } = await props.params
  if (!isCommerceEnabled()) notFound()

  const order = await getOrder(reference)
  if (!order) notFound()

  let status = order.status

  // The webhook is the source of truth, but it may not have landed yet.
  // Verifying here lets the customer see a correct receipt immediately.
  if (status === 'pending') {
    try {
      const transaction = await verifyTransaction(reference)
      if (transaction.status === 'success') {
        await markOrderPaid(reference, transaction.reference)
        status = 'paid'
      }
    } catch (cause) {
      console.error('Could not verify transaction', cause)
    }
  }

  const paid = status === 'paid'

  return (
    <Section>
      <Container className="max-w-2xl">
        {paid && <ClearCart />}

        <p className="eyebrow">{paid ? 'Payment received' : 'Payment pending'}</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {paid ? 'Thank you — God bless you' : 'We have not received payment yet'}
        </h1>

        <p className="mt-6 text-bone-dim">
          {paid
            ? 'Your order is confirmed. We will contact you on WhatsApp to arrange delivery.'
            : 'If you completed payment it may take a moment to confirm. Refresh this page, or message us and we will check.'}
        </p>

        <div className="mt-12 border border-gold-700/40 p-8">
          <div className="flex justify-between border-b border-ink-600 pb-4">
            <span className="eyebrow">Order reference</span>
            <span className="font-mono text-gold-300">{order.reference}</span>
          </div>

          {order.lines.map((line) => (
            <div
              key={`${line.slug}-${line.variantId}`}
              className="flex justify-between border-b border-ink-600 py-4"
            >
              <span className="text-sm">
                {line.name} · {line.variantLabel} × {line.quantity}
              </span>
              <span className="font-mono text-sm text-bone-dim">
                {formatKes(line.lineTotalCents)}
              </span>
            </div>
          ))}

          <div className="flex justify-between py-4">
            <span className="text-sm text-bone-dim">Delivery</span>
            <span className="font-mono text-sm text-bone-dim">
              {formatKes(order.shippingCents)}
            </span>
          </div>

          <div className="flex justify-between border-t border-gold-700/40 pt-4">
            <span className="eyebrow">Total</span>
            <span className="font-mono text-2xl font-bold text-gold-500">
              {formatKes(order.totalCents)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            href={whatsappLink(
              site.contact.whatsapp,
              `Hello Word Mission Team, I am asking about order ${order.reference}.`,
            )}
            variant="gold"
          >
            Message us about this order
          </Button>
          <Button href="/merch" variant="ghost">
            Keep shopping
          </Button>
        </div>
      </Container>
    </Section>
  )
}
