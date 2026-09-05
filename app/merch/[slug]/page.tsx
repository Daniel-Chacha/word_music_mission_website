import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { products } from '@/content/merch'
import { bySlug } from '@/lib/content'
import { isCommerceEnabled } from '@/lib/orders'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { AddToCart } from '@/components/commerce/AddToCart'

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata(
  props: PageProps<'/merch/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const product = bySlug(products, slug)
  if (!product) return {}
  return { title: product.name, description: product.description }
}

export default async function ProductPage(props: PageProps<'/merch/[slug]'>) {
  const { slug } = await props.params
  const product = bySlug(products, slug)
  if (!product) notFound()

  return (
    <Section>
      <Container className="grid gap-14 lg:grid-cols-2">
        <div className="surface-media grain relative aspect-square overflow-hidden bg-ink-800">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            width={product.images[0].width}
            height={product.images[0].height}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {product.name}
          </h1>
          <p className="mt-6 text-bone-dim">{product.description}</p>

          <AddToCart product={product} commerceEnabled={isCommerceEnabled()} />

          <ul className="mt-12 border-t border-rule pt-6">
            {product.details.map((detail) => (
              <li
                key={detail}
                className="border-b border-ink-600 py-3 text-sm text-bone-dim"
              >
                {detail}
              </li>
            ))}
          </ul>

          <Button href="/merch" variant="ghost" className="mt-10">
            All products
          </Button>
        </div>
      </Container>
    </Section>
  )
}
