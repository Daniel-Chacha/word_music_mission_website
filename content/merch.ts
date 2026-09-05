import type { Product } from './types'

const PLACEHOLDER_IMAGE = {
  src: '/images/placeholder.jpg',
  alt: 'TODO: Replace with a product photograph',
  width: 1600,
  height: 1067,
}

// TODO: Confirm every price with the ministry before launch.
// Prices are integer KES cents: 150000 = KES 1,500.
export const products: Product[] = [
  {
    slug: 'word-mission-tee',
    name: 'Word Mission Team T-Shirt',
    category: 'apparel',
    description:
      'Heavy cotton tee carrying the Word Mission mark. Worn on every school mission.',
    details: ['100% cotton', 'Unisex fit', 'Printed in Nairobi'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [
      { id: 's', label: 'Small', priceCents: 150000, inStock: true },
      { id: 'm', label: 'Medium', priceCents: 150000, inStock: true },
      { id: 'l', label: 'Large', priceCents: 150000, inStock: true },
      { id: 'xl', label: 'Extra Large', priceCents: 160000, inStock: true },
    ],
  },
  {
    slug: 'word-mission-hoodie',
    name: 'Word Mission Team Hoodie',
    category: 'apparel',
    description: 'Brushed fleece hoodie in black with gold embroidery.',
    details: ['Cotton-polyester fleece', 'Unisex fit', 'Embroidered mark'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [
      { id: 's', label: 'Small', priceCents: 350000, inStock: true },
      { id: 'm', label: 'Medium', priceCents: 350000, inStock: true },
      { id: 'l', label: 'Large', priceCents: 350000, inStock: true },
      { id: 'xl', label: 'Extra Large', priceCents: 370000, inStock: true },
    ],
  },
  {
    slug: 'word-mission-cap',
    name: 'Word Mission Cap',
    category: 'accessory',
    description: 'Adjustable black cap with the gold Word Mission mark.',
    details: ['One size, adjustable strap', 'Embroidered front'],
    images: [PLACEHOLDER_IMAGE],
    variants: [{ id: 'one', label: 'One size', priceCents: 100000, inStock: true }],
  },
  {
    slug: 'word-mission-wristband',
    name: 'Word Mission Wristband',
    category: 'accessory',
    description: 'Silicone wristband carrying a memory verse — made to be given away.',
    details: ['Silicone', 'Sold singly'],
    images: [PLACEHOLDER_IMAGE],
    variants: [{ id: 'one', label: 'One size', priceCents: 20000, inStock: true }],
  },
  {
    slug: 'identity-in-christ-book',
    name: 'Identity in Christ',
    category: 'book',
    description: 'TODO: Replace with the real book description, author and page count.',
    details: ['Paperback', 'TODO: page count'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [
      { id: 'paperback', label: 'Paperback', priceCents: 80000, inStock: true },
    ],
  },
]

export const PRODUCT_CATEGORY_LABELS: Record<Product['category'], string> = {
  apparel: 'Apparel',
  accessory: 'Accessories',
  book: 'Books',
}
