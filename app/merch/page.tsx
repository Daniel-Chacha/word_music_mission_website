import type { Metadata } from 'next'
import { products, PRODUCT_CATEGORY_LABELS } from '@/content/merch'
import type { ProductCategory } from '@/content/types'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/commerce/ProductCard'

export const metadata: Metadata = {
  title: 'Merchandise & Books',
  description:
    'Word Mission Team apparel, accessories and books. Every purchase supports school missions.',
}

const ORDER: ProductCategory[] = ['apparel', 'accessory', 'book']

export default function MerchPage() {
  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Merchandise &amp; Books</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Wear it, read it, share it
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            Every purchase goes straight back into reaching students. Nothing here is
            sold for profit.
          </p>
        </Container>
      </Section>

      {ORDER.map((category, index) => {
        const items = products.filter((p) => p.category === category)
        if (items.length === 0) return null

        return (
          <Section key={category} className={index % 2 === 0 ? '' : 'bg-ink-800'}>
            <Container>
              <SectionHeading
                eyebrow={PRODUCT_CATEGORY_LABELS[category]}
                number={`0${index + 1}`}
                title={PRODUCT_CATEGORY_LABELS[category]}
              />
              <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </Container>
          </Section>
        )
      })}
    </>
  )
}
