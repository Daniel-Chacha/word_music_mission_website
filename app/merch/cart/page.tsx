import type { Metadata } from 'next'
import { isCommerceEnabled } from '@/lib/orders'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { CartSummary } from '@/components/commerce/CartSummary'

export const metadata: Metadata = { title: 'Your Cart' }

export default function CartPage() {
  const commerceEnabled = isCommerceEnabled()

  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="eyebrow">Your Cart</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Review your order
        </h1>
        <div className="mt-14">
          <CartSummary />
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          {commerceEnabled && (
            <Button href="/merch/checkout" variant="gold" size="lg">
              Checkout
            </Button>
          )}
          <Button href="/merch" variant="ghost" size="lg">
            Keep shopping
          </Button>
        </div>
      </Container>
    </Section>
  )
}
