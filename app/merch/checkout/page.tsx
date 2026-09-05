import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isCommerceEnabled } from '@/lib/orders'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CartSummary } from '@/components/commerce/CartSummary'
import { CheckoutForm } from './CheckoutForm'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  // With no credentials there is no checkout to show — send them back to the
  // shop, where every product offers WhatsApp ordering.
  if (!isCommerceEnabled()) redirect('/merch')

  return (
    <Section>
      <Container className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Delivery details
          </h1>
          <div className="mt-12">
            <CheckoutForm />
          </div>
        </div>

        <div className="lg:border-l lg:border-gold-700/40 lg:pl-14">
          <p className="eyebrow">Your order</p>
          <div className="mt-8">
            <CartSummary editable={false} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
