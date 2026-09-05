export interface NavItem {
  label: string
  href: string
}

export interface Photo {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  x?: string
}

export interface MpesaDetails {
  paybill?: string
  account?: string
  tillNumber?: string
  sendMoneyPhone?: string
}

export interface BankDetails {
  bankName: string
  branch: string
  accountName: string
  accountNumber: string
  swiftCode?: string
}

export interface SiteConfig {
  name: string
  shortName: string
  tagline: string
  missionStatement: string
  url: string
  contact: {
    whatsapp: string
    phone: string
    email: string
    location: string
  }
  socials: SocialLinks
  giving: {
    message: string
    mpesa: MpesaDetails
    bank: BankDetails
    internationalNote: string
  }
  nav: NavItem[]
}

export interface ImpactStat {
  label: string
  value: number
  suffix?: string
  note?: string
}

export interface TeamMember {
  name: string
  role: string
  bio: string
  photo?: Photo
  socials?: SocialLinks
}

export interface MinistryValue {
  title: string
  description: string
}

export interface Ministry {
  vision: string
  mission: string
  values: MinistryValue[]
  story: string[]
  stats: ImpactStat[]
  team: TeamMember[]
}

export type VideoCategory =
  | 'school-mission'
  | 'testimony'
  | 'worship'
  | 'interview'
  | 'documentary'

export interface Video {
  slug: string
  youtubeId: string
  title: string
  description: string
  category: VideoCategory
  date: string
  school?: string
  featured?: boolean
}

export type AlbumCategory =
  | 'school'
  | 'camp'
  | 'prayer'
  | 'counseling'
  | 'testimony'

export interface Album {
  slug: string
  title: string
  description: string
  date: string
  category: AlbumCategory
  cover: Photo
  photos: Photo[]
}

export interface Devotional {
  slug: string
  title: string
  date: string
  verseRef: string
  verseText: string
  body: string[]
  prayer?: string
}

export interface BibleStudySection {
  heading: string
  body: string[]
}

export interface BibleStudy {
  slug: string
  title: string
  series?: string
  summary: string
  scriptures: string[]
  sections: BibleStudySection[]
}

export interface Sermon {
  slug: string
  title: string
  preacher: string
  date: string
  summary: string
  youtubeId?: string
  audioUrl?: string
}

export interface MemoryVerse {
  reference: string
  text: string
  week: string
}

export interface TeachingNote {
  slug: string
  title: string
  description: string
  fileUrl: string
  fileSizeLabel: string
  pages?: number
}

export type NewsCategory =
  | 'upcoming-visit'
  | 'mission-report'
  | 'prayer-request'
  | 'testimony'

export interface NewsItem {
  slug: string
  title: string
  category: NewsCategory
  date: string
  excerpt: string
  body: string[]
  location?: string
  image?: Photo
}

export interface ProductVariant {
  id: string
  label: string
  priceCents: number
  inStock: boolean
}

export type ProductCategory = 'apparel' | 'accessory' | 'book'

export interface Product {
  slug: string
  name: string
  category: ProductCategory
  description: string
  details: string[]
  images: Photo[]
  variants: ProductVariant[]
  featured?: boolean
}

/** What the browser sends at checkout. Deliberately carries no price. */
export interface CartLine {
  slug: string
  variantId: string
  quantity: number
}

export interface PricedLine {
  slug: string
  variantId: string
  quantity: number
  name: string
  variantLabel: string
  unitPriceCents: number
  lineTotalCents: number
}

export interface PricedOrder {
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  rejected: CartLine[]
}
