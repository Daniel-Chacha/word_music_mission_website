import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/content/types'
import { formatKes } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  const from = Math.min(...product.variants.map((v) => v.priceCents))

  return (
    <article className="group">
      <Link href={`/merch/${product.slug}`}>
        <div className="surface-media grain relative aspect-square overflow-hidden bg-ink-800">
          <Image
            src={product.images[0].src}
            alt=""
            width={product.images[0].width}
            height={product.images[0].height}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-5 text-lg font-bold transition-colors group-hover:text-gold-300">
          {product.name}
        </h3>
        <p className="mt-2 text-gold-300">
          {product.variants.length > 1 ? `From ${formatKes(from)}` : formatKes(from)}
        </p>
      </Link>
    </article>
  )
}
