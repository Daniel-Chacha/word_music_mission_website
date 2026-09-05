# Word Mission Team — Content Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, launchable ministry website for Word Mission Team — eight content sections, a black/gold/red design system, and WhatsApp-backed forms — with no external accounts or backend required.

**Architecture:** Next.js 16 App Router, Server Components by default. All editable content lives in typed TypeScript modules under `content/`, so a malformed edit fails the build rather than production. `lib/` holds pure, unit-tested logic. `components/` is split by responsibility (layout, ui, media, content, forms). Client components are used only for genuine interactivity: mobile menu, lightbox, YouTube facade, stat counters, forms.

**Tech Stack:** Next.js 16.3.4, React 19.2.8, TypeScript 5, Tailwind CSS v4, Vitest, `next/font/google` (Archivo + Crimson Pro).

**Spec:** `docs/superpowers/specs/2026-09-05-word-mission-website-design.md`

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Next.js 16 conventions.** `middleware.ts` is renamed `proxy.ts`. `params` and `searchParams` are `Promise`s and must be awaited. `PageProps<'/route'>` and `LayoutProps<'/route'>` are global types — never import them.
- **Tailwind v4.** Tokens are declared in `@theme` in `app/globals.css`. There is no `tailwind.config.js`.
- **Colour discipline.** Gold is a line, not a fill — no gold gradient washes or glows. **Red (`--color-blood`) appears only on giving/support actions.** A red element anywhere else is a bug.
- **Contrast.** Deep red on black is ~3.2:1 and fails WCAG AA. Red is a *background fill* carrying white text, never red text on a black ground. Use `--color-blood-bright` if red text on dark is genuinely required.
- **Warm white.** Primary text is `#FAF8F3`, never pure `#FFFFFF`.
- **Placeholder policy.** Impact statistics, team members and student testimonies ship as obviously-marked placeholders (`value: 0, // TODO: real figure`). Never invent salvation counts or attribute fabricated testimonies to named students. Structure may be realistic; *claims* may not.
- **Single source of real-world detail.** Every value the ministry must supply — WhatsApp number, M-Pesa paybill, bank account, socials, YouTube channel — lives in `content/site.ts` and nowhere else.
- **Money.** Integer KES cents everywhere (`150000` = KES 1,500). No floating-point money.
- **Mobile-first.** Every layout must work at 360px wide.
- **Accessibility.** WCAG 2.2 AA. Skip link first in tab order. Focus trapped in menu and lightbox, `Escape` closes, focus restored. Visible gold focus ring. `prefers-reduced-motion` disables count-ups and scroll animation. Video facades are `<button>`s, not clickable `<div>`s.
- **Mission statement, verbatim:** "Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God."

---

## File Structure

```
content/
  types.ts       All shared content types. No logic.
  site.ts        Org identity, contact, giving details, socials, nav. ALL placeholders.
  ministry.ts    Vision, mission, values, story, impact stats, team.
  videos.ts      YouTube video entries.
  gallery.ts     Photo albums.
  word.ts        Devotionals, bible studies, sermons, memory verses, teaching notes.
  news.ts        Events, mission reports, prayer requests, testimonies.

lib/
  format.ts      KES currency + date formatting. Pure.
  whatsapp.ts    Phone normalisation + wa.me deep-link building. Pure.
  content.ts     Query helpers over content modules (bySlug, latest, byCategory).

components/
  layout/  Container.tsx Section.tsx Header.tsx MobileMenu.tsx Footer.tsx SkipLink.tsx
  ui/      Button.tsx Eyebrow.tsx SectionHeading.tsx GoldRule.tsx Badge.tsx Field.tsx
  media/   ScrimmedImage.tsx YouTubeFacade.tsx Lightbox.tsx
  content/ ScriptureBlock.tsx StatCounter.tsx VideoCard.tsx PhotoCard.tsx
           TeamCard.tsx EventCard.tsx DevotionalCard.tsx
  forms/   WhatsAppForm.tsx

app/
  layout.tsx globals.css page.tsx not-found.tsx error.tsx
  sitemap.ts robots.ts opengraph-image.tsx
  about/ tv/ gallery/ word/ news/ support/ contact/

tests/
  format.test.ts whatsapp.test.ts content.test.ts
```

**Boundary rationale:** `content/` is data with zero logic so non-developers can edit it safely. `lib/` is pure and fully unit-tested. Components never reach into `content/` directly for filtering — they receive props; `lib/content.ts` owns querying. This keeps pages thin and makes content queries testable in isolation.

---

## Task 1: Test infrastructure and content types

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `content/types.ts`
- Create: `content/site.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: every type in `content/types.ts` (listed in Step 3); `site` object exported from `content/site.ts`

- [ ] **Step 1: Install Vitest**

Only pure TypeScript modules are unit-tested, so the `node` environment suffices — no jsdom, no React testing library, no plugin.

```bash
npm install -D vitest
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `content/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `content/site.ts`**

Every placeholder carries a `TODO` comment. Phone numbers use the reserved-for-documentation form `+254700000000` so a real number is never accidentally dialled.

```ts
import type { SiteConfig } from './types'

export const site: SiteConfig = {
  name: 'Word Mission Team',
  shortName: 'Word Mission',
  tagline: 'Reaching the next generation',
  missionStatement:
    'Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God.',
  url: 'https://wordmissionteam.org', // TODO: real domain

  contact: {
    whatsapp: '+254700000000', // TODO: real WhatsApp number
    phone: '+254700000000', // TODO: real phone number
    email: 'hello@wordmissionteam.org', // TODO: real email
    location: 'Nairobi, Kenya', // TODO: confirm base location
  },

  socials: {
    youtube: 'https://youtube.com/@wordmissiontv', // TODO: real channel
    facebook: 'https://facebook.com/wordmissionteam', // TODO
    instagram: 'https://instagram.com/wordmissionteam', // TODO
    tiktok: 'https://tiktok.com/@wordmissionteam', // TODO
    x: 'https://x.com/wordmissionteam', // TODO
  },

  giving: {
    message:
      'Every gift helps us reach more students with the Gospel. Your support enables school missions, discipleship, Bibles, transport, and follow-up ministry.',
    mpesa: {
      paybill: '000000', // TODO: real paybill
      account: 'WORDMISSION', // TODO: real account name
      sendMoneyPhone: '+254700000000', // TODO: real number
    },
    bank: {
      bankName: 'TODO Bank Name',
      branch: 'TODO Branch',
      accountName: 'Word Mission Team',
      accountNumber: '0000000000', // TODO
      swiftCode: 'TODOKENA', // TODO: for international transfers
    },
    internationalNote:
      'Giving from outside Kenya? Send us a message on WhatsApp and we will share the fastest route for your country.',
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'TV', href: '/tv' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'The Word', href: '/word' },
    { label: 'News', href: '/news' },
    { label: 'Shop', href: '/merch' },
    { label: 'Contact', href: '/contact' },
  ],
}
```

Note: `Support Us` is intentionally absent from `nav` — it renders as a standing red CTA in the header (Task 4).

- [ ] **Step 5: Write the failing content-integrity test**

`tests/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { site } from '@/content/site'

describe('site config', () => {
  it('uses the exact mission statement from the spec', () => {
    expect(site.missionStatement).toBe(
      'Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God.',
    )
  })

  it('does not list Support Us in the main nav', () => {
    const labels = site.nav.map((n) => n.label.toLowerCase())
    expect(labels).not.toContain('support us')
  })

  it('has unique nav hrefs', () => {
    const hrefs = site.nav.map((n) => n.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('exposes a WhatsApp number in international format', () => {
    expect(site.contact.whatsapp).toMatch(/^\+\d{10,15}$/)
  })
})
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS (4 tests). If the mission statement assertion fails, the string in `content/site.ts` was retyped rather than copied — fix `site.ts`, not the test.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts content/ tests/
git commit -m "feat: add content types, site config and test harness"
```

---

## Task 2: Design tokens, fonts and root layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `site` from `content/site.ts`
- Produces: CSS custom properties `--color-ink-900`, `--color-ink-800`, `--color-ink-700`, `--color-ink-600`, `--color-gold-700`, `--color-gold-500`, `--color-gold-300`, `--color-bone`, `--color-bone-dim`, `--color-blood`, `--color-blood-bright`; font variables `--font-archivo`, `--font-crimson`; utility classes `.eyebrow`, `.scripture`, `.grain`

- [ ] **Step 1: Replace `app/globals.css`**

The scaffold's light/dark tokens are discarded — this site is single-theme by design (a dark ministry identity, not a theme-switchable app).

```css
@import "tailwindcss";

@theme {
  --color-ink-900: #0a0a0a;
  --color-ink-800: #121212;
  --color-ink-700: #1c1c1c;
  --color-ink-600: #2a2a2a;

  --color-gold-700: #9a7b1f;
  --color-gold-500: #d4af37;
  --color-gold-300: #e8ce7a;

  --color-bone: #faf8f3;
  --color-bone-dim: #a8a49b;

  --color-blood: #b3121b;
  --color-blood-bright: #e5484d;

  --font-sans: var(--font-archivo);
  --font-display: var(--font-archivo);
  --font-scripture: var(--font-crimson);
}

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    background-color: var(--color-ink-900);
    color: var(--color-bone);
    font-family: var(--font-sans);
    font-size: 1.0625rem;
    line-height: 1.7;
  }

  ::selection {
    background-color: var(--color-gold-500);
    color: var(--color-ink-900);
  }

  :focus-visible {
    outline: 2px solid var(--color-gold-500);
    outline-offset: 3px;
    border-radius: 2px;
  }

  h1, h2, h3, h4 {
    color: var(--color-bone);
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }
}

@layer components {
  .eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-gold-500);
  }

  .scripture {
    font-family: var(--font-scripture);
    font-size: clamp(1.375rem, 2.5vw, 1.875rem);
    line-height: 1.5;
    color: var(--color-bone);
  }

  /* Uniform photo treatment: fine grain so mixed-quality phone photos cohere. */
  .grain::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.16;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Archivo, Crimson_Pro } from 'next/font/google'
import { site } from '@/content/site'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SkipLink } from '@/components/layout/SkipLink'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.missionStatement,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.missionStatement,
    locale: 'en_KE',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${crimson.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-900 text-bone">
        <SkipLink />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

`LayoutProps<'/'>` is global in Next 16 — do not add an import for it.

- [ ] **Step 3: Configure remote images in `next.config.ts`**

YouTube thumbnails are fetched from `i.ytimg.com` by the facade component in Task 6.

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: Verify the build compiles**

The app will not build until Tasks 3 and 4 create `Header`, `Footer` and `SkipLink`. Confirm only that `globals.css` and `next.config.ts` are syntactically valid:

Run: `npx tsc --noEmit`
Expected: errors limited to the three not-yet-created component imports in `layout.tsx`. Any *other* error must be fixed now.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx next.config.ts
git commit -m "feat: add design tokens, typography and root layout"
```

---

## Task 3: Layout and UI primitives

**Files:**
- Create: `components/layout/Container.tsx`, `components/layout/Section.tsx`, `components/layout/SkipLink.tsx`
- Create: `components/ui/Button.tsx`, `components/ui/Eyebrow.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/GoldRule.tsx`, `components/ui/Badge.tsx`

**Interfaces:**
- Consumes: tokens from Task 2
- Produces:
  - `<Container className?>` — max-width 1280px wrapper
  - `<Section id? className? children>` — vertical rhythm wrapper
  - `<SkipLink />`
  - `<Button href? variant='gold'|'give'|'ghost' size='md'|'lg' children>`
  - `<Eyebrow number? children>` — renders `01 — LABEL`
  - `<SectionHeading eyebrow? number? title description? align?>`
  - `<GoldRule />`
  - `<Badge children>`

- [ ] **Step 1: Create `components/layout/Container.tsx`**

```tsx
export function Container({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/layout/Section.tsx`**

```tsx
export function Section({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`py-20 lg:py-32 ${className}`}>
      {children}
    </section>
  )
}
```

- [ ] **Step 3: Create `components/layout/SkipLink.tsx`**

Must be the first focusable element in the document (Task 2 already places it first in `<body>`).

```tsx
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
    >
      Skip to content
    </a>
  )
}
```

- [ ] **Step 4: Create `components/ui/Button.tsx`**

`variant="give"` is the only red surface on the site. White text on `--color-blood` is 5.9:1, which passes AA.

```tsx
import Link from 'next/link'

type Variant = 'gold' | 'give' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-300',
  give: 'bg-blood text-white hover:bg-blood-bright',
  ghost: 'border border-gold-700 text-bone hover:border-gold-500 hover:text-gold-300',
}

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export function Button({
  href,
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...rest
}: {
  href?: string
  variant?: Variant
  size?: keyof typeof SIZES
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.12em] transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
```

- [ ] **Step 5: Create `components/ui/Eyebrow.tsx`, `GoldRule.tsx`, `Badge.tsx`**

```tsx
// components/ui/Eyebrow.tsx
export function Eyebrow({
  number,
  children,
}: {
  number?: string
  children: React.ReactNode
}) {
  return (
    <p className="eyebrow flex items-center gap-3">
      {number && <span className="text-gold-700">{number}</span>}
      {number && <span aria-hidden="true" className="h-px w-6 bg-gold-700" />}
      <span>{children}</span>
    </p>
  )
}
```

```tsx
// components/ui/GoldRule.tsx
export function GoldRule({ className = '' }: { className?: string }) {
  return <hr className={`border-0 h-px bg-gold-700/40 ${className}`} />
}
```

```tsx
// components/ui/Badge.tsx
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border border-gold-700/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-300">
      {children}
    </span>
  )
}
```

- [ ] **Step 6: Create `components/ui/SectionHeading.tsx`**

```tsx
import { Eyebrow } from './Eyebrow'

export function SectionHeading({
  eyebrow,
  number,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string
  number?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'center' ? 'text-center items-center' : 'items-start'
  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      {eyebrow && <Eyebrow number={number}>{eyebrow}</Eyebrow>}
      <h2 className="max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-bone-dim">{description}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: errors only for the still-missing `Header` and `Footer` imports.

- [ ] **Step 8: Commit**

```bash
git add components/
git commit -m "feat: add layout and UI primitives"
```

---

## Task 4: Header, mobile menu and footer

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `site` from `content/site.ts`; `Container`, `Button`, `GoldRule`
- Produces: `<Header />`, `<Footer />`

- [ ] **Step 1: Create `components/layout/MobileMenu.tsx`**

Client component. Requirements: focus trapped while open, `Escape` closes, focus returns to the trigger, body scroll locked, menu closes on route change.

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { site } from '@/content/site'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      ;(previouslyFocused ?? triggerRef.current)?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="p-2 text-bone lg:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink-900 px-6 py-6 lg:hidden"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 text-bone"
            >
              <span className="sr-only">Close menu</span>
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-ink-600 py-4 text-2xl font-bold tracking-[-0.01em] text-bone"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/support"
              className="mt-6 bg-blood px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white"
            >
              Support Us
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Create `components/layout/Header.tsx`**

Server component wrapping the client menu. The wordmark uses a gold-ruled lockup rather than an image, so the site has an identity before a real logo file exists — drop a logo into `public/` and swap this block later.

```tsx
import Link from 'next/link'
import { site } from '@/content/site'
import { Container } from './Container'
import { MobileMenu } from './MobileMenu'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-700/30 bg-ink-900/90 backdrop-blur">
      <Container className="flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-extrabold uppercase tracking-[0.08em] text-bone">
            Word Mission
          </span>
          <span className="eyebrow mt-1">Team · TV</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-bone-dim transition-colors hover:text-gold-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/support" variant="give" className="hidden sm:inline-flex">
            Support Us
          </Button>
          <MobileMenu />
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 3: Create `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import { site } from '@/content/site'
import { Container } from './Container'
import { GoldRule } from '@/components/ui/GoldRule'

const SOCIAL_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
}

export function Footer() {
  const socials = Object.entries(site.socials).filter(([, url]) => Boolean(url))

  return (
    <footer className="border-t border-gold-700/30 bg-ink-800">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-lg font-extrabold uppercase tracking-[0.08em]">
              {site.name}
            </p>
            <p className="mt-4 max-w-sm text-sm text-bone-dim">
              {site.missionStatement}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 flex flex-col gap-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-bone-dim hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Connect</p>
            <ul className="mt-4 flex flex-col gap-2">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bone-dim hover:text-gold-300"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-sm text-bone-dim hover:text-gold-300"
                >
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <GoldRule className="my-10" />

        <p className="text-xs text-bone-dim">
          © {new Date().getFullYear()} {site.name}. {site.contact.location}.
        </p>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 4: Verify the app boots**

Run: `npm run dev` and open `http://localhost:3000`
Expected: the scaffold homepage renders inside the new dark header/footer shell. Then verify by keyboard: `Tab` once reveals "Skip to content"; at a narrow viewport the menu button opens the overlay, `Escape` closes it, and focus returns to the button.

- [ ] **Step 5: Commit**

```bash
git add components/layout/
git commit -m "feat: add header, accessible mobile menu and footer"
```

---

## Task 5: Pure utility libraries

**Files:**
- Create: `lib/format.ts`, `lib/whatsapp.ts`
- Test: `tests/format.test.ts`, `tests/whatsapp.test.ts`

**Interfaces:**
- Produces:
  - `formatKes(cents: number): string`
  - `formatDate(iso: string): string`
  - `normalisePhone(input: string): string` — digits only, international, no `+`
  - `whatsappLink(phone: string, message: string): string`
  - `buildEnquiry(fields: Record<string, string>): string`

- [ ] **Step 1: Write the failing tests**

`tests/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatKes, formatDate } from '@/lib/format'

describe('formatKes', () => {
  it('formats whole shillings from integer cents', () => {
    expect(formatKes(150000)).toBe('KES 1,500')
  })

  it('shows cents only when they are non-zero', () => {
    expect(formatKes(150050)).toBe('KES 1,500.50')
  })

  it('handles zero', () => {
    expect(formatKes(0)).toBe('KES 0')
  })

  it('handles values under one shilling', () => {
    expect(formatKes(50)).toBe('KES 0.50')
  })
})

describe('formatDate', () => {
  it('renders a readable Kenyan-style date', () => {
    expect(formatDate('2026-03-14')).toBe('14 March 2026')
  })
})
```

`tests/whatsapp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { normalisePhone, whatsappLink, buildEnquiry } from '@/lib/whatsapp'

describe('normalisePhone', () => {
  it('converts a local 07 number to international', () => {
    expect(normalisePhone('0712345678')).toBe('254712345678')
  })

  it('converts a local 01 number to international', () => {
    expect(normalisePhone('0112345678')).toBe('254112345678')
  })

  it('strips a leading plus', () => {
    expect(normalisePhone('+254712345678')).toBe('254712345678')
  })

  it('strips spaces, dashes and parentheses', () => {
    expect(normalisePhone('+254 (712) 345-678')).toBe('254712345678')
  })

  it('leaves an already-international number unchanged', () => {
    expect(normalisePhone('254712345678')).toBe('254712345678')
  })
})

describe('whatsappLink', () => {
  it('builds a wa.me url with an encoded message', () => {
    expect(whatsappLink('+254712345678', 'Hello & peace')).toBe(
      'https://wa.me/254712345678?text=Hello%20%26%20peace',
    )
  })

  it('encodes newlines', () => {
    expect(whatsappLink('0712345678', 'a\nb')).toBe(
      'https://wa.me/254712345678?text=a%0Ab',
    )
  })
})

describe('buildEnquiry', () => {
  it('renders labelled lines and skips empty values', () => {
    expect(buildEnquiry({ Name: 'Amina', School: '', Request: 'Pray for me' })).toBe(
      'Name: Amina\nRequest: Pray for me',
    )
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/format` and `@/lib/whatsapp`.

- [ ] **Step 3: Implement `lib/format.ts`**

`Intl.NumberFormat` is not used for currency here because its `KES` output (`KSh`/`KES` placement, forced 2 decimals) is inconsistent across Node and browser ICU builds. Explicit formatting keeps output identical everywhere and keeps the tests meaningful.

```ts
export function formatKes(cents: number): string {
  const whole = Math.trunc(cents / 100)
  const remainder = Math.abs(cents % 100)
  const grouped = whole.toLocaleString('en-US')
  return remainder === 0
    ? `KES ${grouped}`
    : `KES ${grouped}.${String(remainder).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
```

- [ ] **Step 4: Implement `lib/whatsapp.ts`**

```ts
const KENYA_CODE = '254'

export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('0')) return KENYA_CODE + digits.slice(1)
  return digits
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(message)}`
}

export function buildEnquiry(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value.trim() !== '')
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n')
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS. `encodeURIComponent` encodes a space as `%20` (not `+`) and `&` as `%26`, matching the assertions.

- [ ] **Step 6: Commit**

```bash
git add lib/format.ts lib/whatsapp.ts tests/format.test.ts tests/whatsapp.test.ts
git commit -m "feat: add tested currency, date and WhatsApp link helpers"
```

---

## Task 6: Media components

**Files:**
- Create: `components/media/ScrimmedImage.tsx`, `components/media/YouTubeFacade.tsx`, `components/media/Lightbox.tsx`

**Interfaces:**
- Consumes: `Photo` type from `content/types.ts`
- Produces:
  - `<ScrimmedImage photo priority? className? sizes? children>`
  - `<YouTubeFacade youtubeId title className?>`
  - `<Lightbox photos startIndex onClose>`

- [ ] **Step 1: Create `components/media/ScrimmedImage.tsx`**

The uniform photo treatment from the spec: grain plus a bottom-up black scrim so overlaid text stays legible on any source photo.

```tsx
import Image from 'next/image'
import type { Photo } from '@/content/types'

export function ScrimmedImage({
  photo,
  priority = false,
  className = '',
  sizes = '100vw',
  children,
}: {
  photo: Photo
  priority?: boolean
  className?: string
  sizes?: string
  children?: React.ReactNode
}) {
  return (
    <div className={`grain relative overflow-hidden bg-ink-800 ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent"
      />
      {children && (
        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10">{children}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/media/YouTubeFacade.tsx`**

Loads the poster only; mounts the real iframe on click. A `<button>`, not a clickable `<div>`, so it is keyboard-operable and announced correctly.

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export function YouTubeFacade({
  youtubeId,
  title,
  className = '',
}: {
  youtubeId: string
  title: string
  className?: string
}) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <div className={`relative aspect-video overflow-hidden bg-ink-800 ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className={`group relative block aspect-video w-full overflow-hidden bg-ink-800 ${className}`}
    >
      <span className="sr-only">Play video: {title}</span>
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-ink-900/30"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500 bg-ink-900/70 transition-colors group-hover:bg-gold-500">
          <svg width="20" height="22" viewBox="0 0 20 22" className="ml-1">
            <path
              d="M0 0l20 11L0 22z"
              className="fill-gold-500 group-hover:fill-ink-900"
            />
          </svg>
        </span>
      </span>
    </button>
  )
}
```

- [ ] **Step 3: Create `components/media/Lightbox.tsx`**

Same accessibility contract as the mobile menu: focus trapped, `Escape` closes, focus restored. Adds arrow-key navigation.

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Photo } from '@/content/types'

export function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: Photo[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight')
        setIndex((i) => (i + 1) % photos.length)
      if (event.key === 'ArrowLeft')
        setIndex((i) => (i - 1 + photos.length) % photos.length)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [photos.length, onClose])

  const photo = photos[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/97 p-4 lg:p-8"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="p-2 text-bone"
        >
          <span className="sr-only">Close</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
          className="shrink-0 p-3 text-gold-500"
        >
          <span className="sr-only">Previous photo</span>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="max-h-[75vh] w-auto object-contain"
        />

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % photos.length)}
          className="shrink-0 p-3 text-gold-500"
        >
          <span className="sr-only">Next photo</span>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {photo.caption && (
        <p className="mt-4 text-center text-sm text-bone-dim">{photo.caption}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no errors in `components/media/`.

```bash
git add components/media/
git commit -m "feat: add scrimmed image, YouTube facade and lightbox"
```

---

## Task 7: Content modules and query helpers

**Files:**
- Create: `content/ministry.ts`, `content/videos.ts`, `content/gallery.ts`, `content/word.ts`, `content/news.ts`
- Create: `lib/content.ts`
- Modify: `tests/content.test.ts`
- Create: `public/images/` placeholder assets

**Interfaces:**
- Produces:
  - `ministry: Ministry`, `videos: Video[]`, `albums: Album[]`, `devotionals: Devotional[]`, `bibleStudies: BibleStudy[]`, `sermons: Sermon[]`, `memoryVerses: MemoryVerse[]`, `teachingNotes: TeachingNote[]`, `newsItems: NewsItem[]`
  - `lib/content.ts`: `bySlug<T extends {slug: string}>(items: T[], slug: string): T | undefined`, `latest<T extends {date: string}>(items: T[], count?: number): T[]`, `byCategory<T extends {category: C}, C>(items: T[], category: C): T[]`, `todaysDevotional(): Devotional`, `currentMemoryVerse(): MemoryVerse`

- [ ] **Step 1: Add placeholder images**

Create `public/images/placeholder.svg` — a black card with a gold rule and the word `PHOTO`, sized 1600×1067. Every `Photo` in content modules points at this until real photos are supplied. Using one shared SVG rather than sourcing stock photography avoids shipping images of students who are not part of this ministry.

```bash
mkdir -p public/images
```

```svg
<!-- public/images/placeholder.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067" viewBox="0 0 1600 1067">
  <rect width="1600" height="1067" fill="#121212"/>
  <rect x="120" y="120" width="1360" height="827" fill="none" stroke="#9A7B1F" stroke-width="2"/>
  <line x1="700" y1="533" x2="900" y2="533" stroke="#D4AF37" stroke-width="3"/>
  <text x="800" y="600" fill="#A8A49B" font-family="sans-serif" font-size="34"
        letter-spacing="12" text-anchor="middle">PHOTO PLACEHOLDER</text>
</svg>
```

- [ ] **Step 2: Create `content/ministry.ts`**

Stats are zeroed with `TODO` markers per the placeholder policy. Vision, mission and values are written for the ministry and are safe to ship; team entries are structural placeholders.

```ts
import type { Ministry } from './types'

const PLACEHOLDER_PHOTO = {
  src: '/images/placeholder.svg',
  alt: 'Placeholder portrait',
  width: 1600,
  height: 1067,
}

export const ministry: Ministry = {
  vision:
    'A generation of Kenyan students who know Jesus Christ personally, stand firm in His Word, and carry the Gospel to their schools, their homes, and their nation.',

  mission:
    'We go into high schools with the Gospel, we disciple the students who respond, and we keep walking with them through media, mentorship, and the teaching of the Word.',

  values: [
    {
      title: 'The Word first',
      description:
        'Every mission, video and conversation is anchored in Scripture. We do not offer opinion where God has already spoken.',
    },
    {
      title: 'Reaching them where they are',
      description:
        'Students are in school. So we go to school — into assemblies, classrooms, dormitories and fields, not waiting for them to find a church.',
    },
    {
      title: 'Discipleship, not events',
      description:
        'A crusade that ends when we drive away is not ministry. We follow up, we mentor, and we stay reachable.',
    },
    {
      title: 'Integrity in everything',
      description:
        'We account for every shilling given, we protect every student we meet, and we tell the truth about our numbers.',
    },
  ],

  story: [
    'Word Mission Team began with a burden for students who were being reached by everything except the Gospel.',
    'TODO: Replace with the real founding story — when the ministry started, the first school visited, and what happened there.',
    'TODO: Describe how the team grew and what the ministry looks like today.',
  ],

  // TODO: Replace every value below with the real figure before launch.
  // Zeros are deliberate. Do not publish estimated or invented numbers.
  stats: [
    { label: 'Schools visited', value: 0, note: 'TODO: real figure' },
    { label: 'Students reached', value: 0, note: 'TODO: real figure' },
    { label: 'Decisions for Christ', value: 0, note: 'TODO: real figure' },
    { label: 'Bibles distributed', value: 0, note: 'TODO: real figure' },
  ],

  // TODO: Replace with the real team. Names below are placeholders.
  team: [
    {
      name: 'TODO: Team Leader Name',
      role: 'Team Leader',
      bio: 'TODO: Short bio — calling, background, and role in the ministry.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Media Lead Name',
      role: 'Media & Word Mission TV',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Discipleship Lead Name',
      role: 'Discipleship & Follow-up',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Worship Lead Name',
      role: 'Worship',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
  ],
}
```

- [ ] **Step 3: Create `content/videos.ts`**

`youtubeId` values are the canonical 11-character YouTube ID shape. Each is marked TODO — a wrong ID renders a missing thumbnail, so these must be replaced before launch.

```ts
import type { Video } from './types'

// TODO: Replace every youtubeId with a real video ID from the ministry channel.
// A YouTube ID is the 11 characters after `watch?v=` in the video URL.
export const videos: Video[] = [
  {
    slug: 'school-mission-highlights',
    youtubeId: 'AAAAAAAAAAA',
    title: 'School Mission Highlights',
    description:
      'TODO: Describe this mission — which school, what happened, how students responded.',
    category: 'school-mission',
    date: '2026-08-14',
    school: 'TODO: School name',
    featured: true,
  },
  {
    slug: 'student-testimony',
    youtubeId: 'BBBBBBBBBBB',
    title: 'A Student Tells Her Story',
    description: 'TODO: Describe this testimony.',
    category: 'testimony',
    date: '2026-07-30',
  },
  {
    slug: 'worship-session',
    youtubeId: 'CCCCCCCCCCC',
    title: 'Worship Session',
    description: 'TODO: Describe this worship session.',
    category: 'worship',
    date: '2026-07-12',
  },
  {
    slug: 'interview-with-a-chaplain',
    youtubeId: 'DDDDDDDDDDD',
    title: 'Interview With a School Chaplain',
    description: 'TODO: Describe this interview.',
    category: 'interview',
    date: '2026-06-20',
  },
  {
    slug: 'mission-documentary',
    youtubeId: 'EEEEEEEEEEE',
    title: 'Mission Documentary',
    description: 'TODO: Describe this documentary.',
    category: 'documentary',
    date: '2026-05-09',
  },
]

export const VIDEO_CATEGORY_LABELS: Record<Video['category'], string> = {
  'school-mission': 'School Missions',
  testimony: 'Testimonies',
  worship: 'Worship',
  interview: 'Interviews',
  documentary: 'Documentaries',
}
```

- [ ] **Step 4: Create `content/gallery.ts`**

Five albums matching the spec's gallery brief: schools, camps, prayer meetings, guidance and counselling, student testimonies. Each has six placeholder photos so grid layouts can be verified.

```ts
import type { Album, Photo } from './types'

function placeholders(count: number, label: string): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    src: '/images/placeholder.svg',
    alt: `TODO: Describe this ${label} photo`,
    width: 1600,
    height: 1067,
    caption: `TODO: caption ${i + 1}`,
  }))
}

const cover: Photo = {
  src: '/images/placeholder.svg',
  alt: 'TODO: Describe this album cover photo',
  width: 1600,
  height: 1067,
}

// TODO: Replace placeholder photos with real ministry photographs.
export const albums: Album[] = [
  {
    slug: 'school-missions',
    title: 'School Missions',
    description: 'Assemblies, classrooms and fields across Kenyan high schools.',
    date: '2026-08-14',
    category: 'school',
    cover,
    photos: placeholders(6, 'school mission'),
  },
  {
    slug: 'camps',
    title: 'Camps',
    description: 'Residential camps where students go deeper in the Word.',
    date: '2026-07-05',
    category: 'camp',
    cover,
    photos: placeholders(6, 'camp'),
  },
  {
    slug: 'prayer-meetings',
    title: 'Prayer Meetings',
    description: 'Students and team seeking God together before every mission.',
    date: '2026-06-18',
    category: 'prayer',
    cover,
    photos: placeholders(6, 'prayer meeting'),
  },
  {
    slug: 'guidance-and-counselling',
    title: 'Guidance & Counselling',
    description: 'One-to-one sessions walking with students through real struggles.',
    date: '2026-05-22',
    category: 'counseling',
    cover,
    photos: placeholders(6, 'counselling session'),
  },
  {
    slug: 'student-testimonies',
    title: 'Student Testimonies',
    description: 'Students telling their own stories of meeting Jesus.',
    date: '2026-04-30',
    category: 'testimony',
    cover,
    photos: placeholders(6, 'testimony'),
  },
]
```

- [ ] **Step 5: Create `content/word.ts`**

Devotionals, studies, sermons, memory verses and teaching notes. Scripture is quoted from the World English Bible, which is public domain — this avoids the licensing restrictions that apply to NIV and ESV text on a public website.

```ts
import type {
  BibleStudy,
  Devotional,
  MemoryVerse,
  Sermon,
  TeachingNote,
} from './types'

// Scripture quotations are from the World English Bible (public domain).
// TODO: If the ministry prefers another translation, check its licence for
// web use before switching — NIV and ESV both restrict online quotation.
export const devotionals: Devotional[] = [
  {
    slug: 'called-while-young',
    title: 'Called While You Are Young',
    date: '2026-09-05',
    verseRef: '1 Timothy 4:12',
    verseText:
      'Let no man despise your youth; but be an example to those who believe, in word, in your way of life, in love, in spirit, in faith, and in purity.',
    body: [
      'There is a lie that says God is waiting for you to finish school, get a job and settle down before He can use you. Paul writes the opposite to a young man leading a church.',
      'Timothy was not told to wait until he was older. He was told to be an example now — in how he spoke, how he lived, how he loved, and how he kept himself pure.',
      'Your school is not a waiting room. It is your first mission field.',
    ],
    prayer:
      'Lord, use me where I am. Make my words, my life and my purity an example to the people around me today.',
  },
  {
    slug: 'the-word-is-a-lamp',
    title: 'A Lamp for the Next Step',
    date: '2026-09-04',
    verseRef: 'Psalm 119:105',
    verseText:
      'Your word is a lamp to my feet, and a light for my path.',
    body: [
      'A lamp in the dark does not show you the whole journey. It shows you the next step.',
      'Many students want God to reveal their entire future before they will obey Him in anything. But Scripture offers a lamp, not a floodlight.',
      'Open the Word today for the next step, not the whole map.',
    ],
    prayer: 'Father, give me the courage to take the step I can already see.',
  },
  {
    slug: 'no-longer-my-own',
    title: 'No Longer My Own',
    date: '2026-09-03',
    verseRef: '1 Corinthians 6:19-20',
    verseText:
      "Or don't you know that your body is a temple of the Holy Spirit which is in you, which you have from God? You are not your own, for you were bought with a price.",
    body: [
      'The culture around you says your body is yours to do with as you please. Scripture says something far more valuable: you were bought at a price.',
      'That is not a restriction. It is a valuation. Someone paid for you.',
      'Live today like something expensive was spent on you — because it was.',
    ],
    prayer: 'Jesus, thank You for the price You paid. Help me to honour it.',
  },
]

export const bibleStudies: BibleStudy[] = [
  {
    slug: 'identity-in-christ',
    title: 'Identity in Christ',
    series: 'Foundations',
    summary:
      'Four sessions on who you become the moment you trust Jesus — and why that settles the questions your school keeps asking you.',
    scriptures: ['John 1:12', '2 Corinthians 5:17', 'Ephesians 2:10', 'Romans 8:15-17'],
    sections: [
      {
        heading: 'You are received, not auditioning',
        body: [
          'John 1:12 says that as many as received Him, to them He gave the right to become children of God.',
          'TODO: Expand this session with the ministry’s own teaching notes.',
        ],
      },
      {
        heading: 'You are new, not repaired',
        body: [
          '2 Corinthians 5:17 does not describe an improvement. It describes a new creation.',
          'TODO: Expand this session.',
        ],
      },
    ],
  },
  {
    slug: 'standing-firm-in-school',
    title: 'Standing Firm in School',
    series: 'Foundations',
    summary:
      'Practical sessions on peer pressure, purity, discipline and witness inside a Kenyan high school.',
    scriptures: ['Daniel 1:8', 'Romans 12:2', '1 Peter 3:15'],
    sections: [
      {
        heading: 'Daniel decided beforehand',
        body: [
          'Daniel 1:8 says he purposed in his heart. The decision was made before the pressure arrived.',
          'TODO: Expand this session.',
        ],
      },
    ],
  },
]

export const sermons: Sermon[] = [
  {
    slug: 'the-cost-and-the-crown',
    title: 'The Cost and the Crown',
    preacher: 'TODO: Preacher name',
    date: '2026-08-24',
    summary: 'TODO: Summarise this message.',
    youtubeId: 'FFFFFFFFFFF', // TODO: real video ID
  },
  {
    slug: 'who-told-you',
    title: 'Who Told You?',
    preacher: 'TODO: Preacher name',
    date: '2026-07-27',
    summary: 'TODO: Summarise this message.',
    youtubeId: 'GGGGGGGGGGG', // TODO: real video ID
  },
]

export const memoryVerses: MemoryVerse[] = [
  {
    reference: 'Joshua 1:9',
    text: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    week: '2026-W36',
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ, who strengthens me.',
    week: '2026-W35',
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.',
    week: '2026-W34',
  },
]

// TODO: Upload the real PDFs to public/notes/ and update fileUrl + fileSizeLabel.
export const teachingNotes: TeachingNote[] = [
  {
    slug: 'identity-in-christ-notes',
    title: 'Identity in Christ — Teaching Notes',
    description:
      'Full notes for the four-session Identity in Christ study, formatted for group leaders.',
    fileUrl: '/notes/identity-in-christ.pdf',
    fileSizeLabel: 'TODO KB',
    pages: 12,
  },
  {
    slug: 'school-mission-followup',
    title: 'School Mission Follow-Up Guide',
    description:
      'How to walk with a student in the first thirty days after they give their life to Christ.',
    fileUrl: '/notes/school-mission-followup.pdf',
    fileSizeLabel: 'TODO KB',
    pages: 8,
  },
]
```

- [ ] **Step 6: Create `content/news.ts`**

```ts
import type { NewsItem } from './types'

// TODO: Replace with real events, reports, prayer points and testimonies.
export const newsItems: NewsItem[] = [
  {
    slug: 'upcoming-school-visits-term-three',
    title: 'Upcoming School Visits — Term Three',
    category: 'upcoming-visit',
    date: '2026-09-20',
    location: 'TODO: County / region',
    excerpt:
      'TODO: List the schools the team is visiting this term and the dates.',
    body: [
      'TODO: Name each school, the date of the visit, and what the team will be doing there.',
      'TODO: Explain how a school can request a visit.',
    ],
  },
  {
    slug: 'mission-report-term-two',
    title: 'Mission Report — Term Two',
    category: 'mission-report',
    date: '2026-08-30',
    excerpt: 'TODO: Summarise what God did across the term.',
    body: [
      'TODO: Report the schools visited, students reached and decisions recorded.',
      'TODO: Include one or two specific stories, with permission from the students involved.',
    ],
  },
  {
    slug: 'prayer-points-this-month',
    title: 'Prayer Points for This Month',
    category: 'prayer-request',
    date: '2026-09-01',
    excerpt: 'Stand with us in prayer for these specific needs.',
    body: [
      'TODO: List current prayer needs — upcoming missions, transport, Bibles, students in follow-up.',
    ],
  },
  {
    slug: 'a-student-testimony',
    title: 'From the Back Row to the Front Line',
    category: 'testimony',
    date: '2026-08-12',
    excerpt: 'TODO: Summarise this testimony.',
    body: [
      'TODO: Publish this testimony only with the student’s explicit permission, and use a first name or initials for a minor.',
    ],
  },
]

export const NEWS_CATEGORY_LABELS: Record<NewsItem['category'], string> = {
  'upcoming-visit': 'Upcoming Visit',
  'mission-report': 'Mission Report',
  'prayer-request': 'Prayer Request',
  testimony: 'Testimony',
}
```

- [ ] **Step 7: Create `lib/content.ts`**

```ts
import { devotionals, memoryVerses } from '@/content/word'
import type { Devotional, MemoryVerse } from '@/content/types'

export function bySlug<T extends { slug: string }>(
  items: T[],
  slug: string,
): T | undefined {
  return items.find((item) => item.slug === slug)
}

export function latest<T extends { date: string }>(items: T[], count?: number): T[] {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))
  return count === undefined ? sorted : sorted.slice(0, count)
}

export function byCategory<C, T extends { category: C }>(
  items: T[],
  category: C,
): T[] {
  return items.filter((item) => item.category === category)
}

/** The most recent devotional. Falls back to the first entry if none are dated. */
export function todaysDevotional(): Devotional {
  return latest(devotionals, 1)[0] ?? devotionals[0]
}

/** The most recent memory verse by ISO week string. */
export function currentMemoryVerse(): MemoryVerse {
  return [...memoryVerses].sort((a, b) => b.week.localeCompare(a.week))[0]
}
```

- [ ] **Step 8: Extend `tests/content.test.ts` with integrity tests**

Append to the existing file:

```ts
import { videos } from '@/content/videos'
import { albums } from '@/content/gallery'
import { devotionals, bibleStudies, sermons, memoryVerses, teachingNotes } from '@/content/word'
import { newsItems } from '@/content/news'
import { ministry } from '@/content/ministry'
import { bySlug, latest, byCategory, todaysDevotional, currentMemoryVerse } from '@/lib/content'

function expectUniqueSlugs(items: { slug: string }[], name: string) {
  const slugs = items.map((i) => i.slug)
  expect(new Set(slugs).size, `${name} has duplicate slugs`).toBe(slugs.length)
}

describe('content integrity', () => {
  it('has unique slugs in every collection', () => {
    expectUniqueSlugs(videos, 'videos')
    expectUniqueSlugs(albums, 'albums')
    expectUniqueSlugs(devotionals, 'devotionals')
    expectUniqueSlugs(bibleStudies, 'bibleStudies')
    expectUniqueSlugs(sermons, 'sermons')
    expectUniqueSlugs(teachingNotes, 'teachingNotes')
    expectUniqueSlugs(newsItems, 'newsItems')
  })

  it('uses well-formed YouTube ids', () => {
    for (const video of videos) {
      expect(video.youtubeId, video.slug).toMatch(/^[\w-]{11}$/)
    }
  })

  it('uses ISO dates everywhere', () => {
    const dated = [...videos, ...albums, ...devotionals, ...sermons, ...newsItems]
    for (const item of dated) {
      expect(item.date, item.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('gives every album at least one photo with alt text', () => {
    for (const album of albums) {
      expect(album.photos.length, album.slug).toBeGreaterThan(0)
      for (const photo of album.photos) {
        expect(photo.alt.trim(), album.slug).not.toBe('')
      }
    }
  })

  it('gives every devotional a verse reference and body', () => {
    for (const devotional of devotionals) {
      expect(devotional.verseRef.trim(), devotional.slug).not.toBe('')
      expect(devotional.body.length, devotional.slug).toBeGreaterThan(0)
    }
  })

  it('publishes no invented impact figures', () => {
    // Guards the placeholder policy: stats must be zero until real figures
    // are supplied, and each must carry a TODO note.
    for (const stat of ministry.stats) {
      if (stat.value !== 0) {
        expect(stat.note ?? '', stat.label).not.toMatch(/TODO/)
      }
    }
  })
})

describe('content query helpers', () => {
  it('finds an item by slug', () => {
    expect(bySlug(videos, videos[0].slug)?.slug).toBe(videos[0].slug)
    expect(bySlug(videos, 'nope')).toBeUndefined()
  })

  it('sorts by date descending and limits', () => {
    const result = latest(videos, 2)
    expect(result).toHaveLength(2)
    expect(result[0].date >= result[1].date).toBe(true)
  })

  it('does not mutate the source array', () => {
    const before = videos.map((v) => v.slug)
    latest(videos)
    expect(videos.map((v) => v.slug)).toEqual(before)
  })

  it('filters by category', () => {
    const worship = byCategory(videos, 'worship' as const)
    expect(worship.every((v) => v.category === 'worship')).toBe(true)
  })

  it('returns a devotional and a memory verse', () => {
    expect(todaysDevotional().slug).toBeTruthy()
    expect(currentMemoryVerse().reference).toBeTruthy()
  })
})
```

- [ ] **Step 9: Run the tests**

Run: `npm test`
Expected: PASS. A failure on the YouTube-id assertion means a placeholder ID is not 11 characters — fix the content, not the test.

- [ ] **Step 10: Commit**

```bash
git add content/ lib/content.ts tests/content.test.ts public/images/
git commit -m "feat: add ministry content modules and query helpers"
```

---

## Task 8: Content display components

**Files:**
- Create: `components/content/ScriptureBlock.tsx`, `StatCounter.tsx`, `VideoCard.tsx`, `PhotoCard.tsx`, `TeamCard.tsx`, `EventCard.tsx`, `DevotionalCard.tsx`

**Interfaces:**
- Consumes: types from `content/types.ts`; `formatDate` from `lib/format`; `ScrimmedImage`; `Badge`
- Produces:
  - `<ScriptureBlock reference text>` 
  - `<StatCounter stat />` (client)
  - `<VideoCard video />`
  - `<PhotoCard photo onOpen />` (client-callable)
  - `<TeamCard member />`
  - `<EventCard item />`
  - `<DevotionalCard devotional />`

- [ ] **Step 1: Create `ScriptureBlock.tsx`**

Motif 4 from the spec: Crimson Pro, 2px gold rule at left, reference in caps.

```tsx
export function ScriptureBlock({
  reference,
  text,
  className = '',
}: {
  reference: string
  text: string
  className?: string
}) {
  return (
    <figure className={`border-l-2 border-gold-500 pl-6 lg:pl-8 ${className}`}>
      <blockquote className="scripture">{text}</blockquote>
      <figcaption className="eyebrow mt-4">{reference}</figcaption>
    </figure>
  )
}
```

- [ ] **Step 2: Create `StatCounter.tsx`**

Client component. Counts up once when scrolled into view; respects `prefers-reduced-motion` by rendering the final value immediately.

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { ImpactStat } from '@/content/types'

export function StatCounter({ stat }: { stat: ImpactStat }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || stat.value === 0) {
      setValue(stat.value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return
        done.current = true

        const duration = 1400
        const start = performance.now()

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          // Ease-out cubic so the number decelerates into place.
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(stat.value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [stat.value])

  return (
    <div ref={ref} className="border-t border-gold-700/40 pt-6">
      <p className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-none tabular-nums text-gold-500">
        {value.toLocaleString('en-US')}
        {stat.suffix}
      </p>
      <p className="eyebrow mt-3">{stat.label}</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `VideoCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@/content/types'
import { VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { formatDate } from '@/lib/format'

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group">
      <Link href={`/tv/${video.slug}`} className="block">
        <div className="grain relative aspect-video overflow-hidden bg-ink-800">
          <Image
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <p className="eyebrow mt-4">{VIDEO_CATEGORY_LABELS[video.category]}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug transition-colors group-hover:text-gold-300">
          {video.title}
        </h3>
        <p className="mt-2 text-sm text-bone-dim">{formatDate(video.date)}</p>
      </Link>
    </article>
  )
}
```

- [ ] **Step 4: Create `PhotoCard.tsx`, `TeamCard.tsx`, `EventCard.tsx`, `DevotionalCard.tsx`**

```tsx
// components/content/PhotoCard.tsx
'use client'

import Image from 'next/image'
import type { Photo } from '@/content/types'

export function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: Photo
  index: number
  onOpen: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="grain group relative aspect-[4/3] overflow-hidden bg-ink-800"
    >
      <span className="sr-only">Open photo: {photo.alt}</span>
      <Image
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        sizes="(max-width: 768px) 50vw, 33vw"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </button>
  )
}
```

```tsx
// components/content/TeamCard.tsx
import Image from 'next/image'
import type { TeamMember } from '@/content/types'

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article>
      {member.photo && (
        <div className="grain relative aspect-[3/4] overflow-hidden bg-ink-800">
          <Image
            src={member.photo.src}
            alt={member.photo.alt}
            width={member.photo.width}
            height={member.photo.height}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h3 className="mt-5 text-xl font-bold">{member.name}</h3>
      <p className="eyebrow mt-2">{member.role}</p>
      <p className="mt-3 text-sm text-bone-dim">{member.bio}</p>
    </article>
  )
}
```

```tsx
// components/content/EventCard.tsx
import Link from 'next/link'
import type { NewsItem } from '@/content/types'
import { NEWS_CATEGORY_LABELS } from '@/content/news'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

export function EventCard({ item }: { item: NewsItem }) {
  return (
    <article className="group border-t border-gold-700/40 py-8">
      <div className="flex flex-wrap items-center gap-4">
        <Badge>{NEWS_CATEGORY_LABELS[item.category]}</Badge>
        <p className="text-sm text-bone-dim">{formatDate(item.date)}</p>
        {item.location && (
          <p className="text-sm text-bone-dim">· {item.location}</p>
        )}
      </div>
      <h3 className="mt-4 text-2xl font-bold leading-snug">
        <Link href={`/news/${item.slug}`} className="transition-colors group-hover:text-gold-300">
          {item.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-2xl text-bone-dim">{item.excerpt}</p>
    </article>
  )
}
```

```tsx
// components/content/DevotionalCard.tsx
import Link from 'next/link'
import type { Devotional } from '@/content/types'
import { formatDate } from '@/lib/format'

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  return (
    <article className="group border border-ink-600 p-6 transition-colors hover:border-gold-700">
      <p className="eyebrow">{devotional.verseRef}</p>
      <h3 className="mt-3 text-xl font-bold leading-snug">
        <Link
          href={`/word/devotionals/${devotional.slug}`}
          className="transition-colors group-hover:text-gold-300"
        >
          {devotional.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm text-bone-dim">{devotional.body[0]}</p>
      <p className="mt-4 text-xs text-bone-dim">{formatDate(devotional.date)}</p>
    </article>
  )
}
```

- [ ] **Step 5: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add components/content/
git commit -m "feat: add content display components"
```

---

## Task 9: Homepage

**Files:**
- Rewrite: `app/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 3–8

- [ ] **Step 1: Replace `app/page.tsx`**

Sections in order: hero (full-bleed, scrimmed, mission statement, three CTAs), impact stats, mission/vision, latest videos, today's word, support CTA.

The three hero buttons are exactly those named in the brief — Watch Videos, Support the Mission, Read the Word — with Support rendered in `give` red.

```tsx
import Link from 'next/link'
import { site } from '@/content/site'
import { ministry } from '@/content/ministry'
import { videos } from '@/content/videos'
import { latest, todaysDevotional, currentMemoryVerse } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrimmedImage } from '@/components/media/ScrimmedImage'
import { ScriptureBlock } from '@/components/content/ScriptureBlock'
import { StatCounter } from '@/components/content/StatCounter'
import { VideoCard } from '@/components/content/VideoCard'

export default function HomePage() {
  const featured = latest(videos, 3)
  const devotional = todaysDevotional()
  const verse = currentMemoryVerse()

  return (
    <>
      {/* Hero */}
      <ScrimmedImage
        photo={{
          // TODO: Replace with a real photograph from a high school outreach.
          src: '/images/placeholder.svg',
          alt: '',
          width: 1600,
          height: 1067,
        }}
        priority
        sizes="100vw"
        className="min-h-[85vh] flex items-end"
      >
        <Container className="pb-4">
          <p className="eyebrow">Word Mission Team · Word Mission TV</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,9vw,7rem)] font-black leading-[0.92] tracking-[-0.03em]">
            Reaching the next generation
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            {site.missionStatement}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/tv" variant="gold" size="lg">
              Watch Videos
            </Button>
            <Button href="/support" variant="give" size="lg">
              Support the Mission
            </Button>
            <Button href="/word" variant="ghost" size="lg">
              Read the Word
            </Button>
          </div>
        </Container>
      </ScrimmedImage>

      {/* Impact */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Our Impact"
            number="01"
            title="What God is doing through this team"
            description="Every figure below represents students we have stood in front of, prayed with, and continue to walk alongside."
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Mission and vision */}
      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              number="02"
              title="We go where the students are"
            />
            <p className="mt-8 text-bone-dim">{ministry.mission}</p>
            <Button href="/about" variant="ghost" className="mt-8">
              About the team
            </Button>
          </div>
          <ScriptureBlock reference={verse.reference} text={verse.text} />
        </Container>
      </Section>

      {/* Latest from Word Mission TV */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Word Mission TV"
              number="03"
              title="Watch the mission"
            />
            <Button href="/tv" variant="ghost">
              All videos
            </Button>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Today's word */}
      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            eyebrow="The Word"
            number="04"
            title="Today's devotion"
            description="A short word for students, every day."
          />
          <div>
            <ScriptureBlock
              reference={devotional.verseRef}
              text={devotional.verseText}
            />
            <h3 className="mt-10 text-2xl font-bold">{devotional.title}</h3>
            <p className="mt-4 text-bone-dim">{devotional.body[0]}</p>
            <Button
              href={`/word/devotionals/${devotional.slug}`}
              variant="ghost"
              className="mt-8"
            >
              Read today&rsquo;s word
            </Button>
          </div>
        </Container>
      </Section>

      {/* Support */}
      <Section>
        <Container>
          <div className="border border-blood/60 bg-ink-800 p-10 lg:p-16">
            <p className="eyebrow">Support the Mission</p>
            <h2 className="mt-6 max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
              Every gift sends the Gospel into another school
            </h2>
            <p className="mt-6 max-w-2xl text-bone-dim">
              {site.giving.message}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/support" variant="give" size="lg">
                Give now
              </Button>
              <Button href="/contact" variant="ghost" size="lg">
                Invite us to your school
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`
Expected at `/`: hero fills the viewport with the mission statement and three buttons; the red Support button is the only red element on the page; stats render (as `0` per the placeholder policy); three video cards; devotion section; support panel.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build homepage"
```

---

## Task 10: About page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ministry } from '@/content/ministry'
import { site } from '@/content/site'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GoldRule } from '@/components/ui/GoldRule'
import { StatCounter } from '@/components/content/StatCounter'
import { TeamCard } from '@/components/content/TeamCard'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About',
  description: ministry.mission,
}

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">About Word Mission Team</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            A team sent to the schools of this generation
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            {site.missionStatement}
          </p>
        </Container>
      </Section>

      <GoldRule />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our Vision" number="01" title="Where we are going" />
            <p className="mt-8 text-bone-dim">{ministry.vision}</p>
          </div>
          <div>
            <SectionHeading eyebrow="Our Mission" number="02" title="How we get there" />
            <p className="mt-8 text-bone-dim">{ministry.mission}</p>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="What We Stand On"
            number="03"
            title="Our values"
          />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            {ministry.values.map((value) => (
              <div key={value.title} className="border-t border-gold-700/40 pt-6">
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="mt-3 text-bone-dim">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Our Story" number="04" title="How this began" />
          <div className="mt-10 max-w-3xl space-y-6">
            {ministry.story.map((paragraph, i) => (
              <p key={i} className="text-bone-dim">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="Our Impact"
            number="05"
            title="The numbers behind the mission"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="The Team" number="06" title="Who we are" />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ministry.team.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
          <Button href="/contact" variant="give" className="mt-14">
            Invite us to your school
          </Button>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run dev`, open `/about`.

```bash
git add app/about/
git commit -m "feat: build about page"
```

---

## Task 11: Word Mission TV

**Files:**
- Create: `app/tv/page.tsx`, `app/tv/[slug]/page.tsx`, `app/tv/VideoFilter.tsx`

**Interfaces:**
- Consumes: `videos`, `VIDEO_CATEGORY_LABELS`, `YouTubeFacade`, `VideoCard`
- Produces: `<VideoFilter videos />` (client)

- [ ] **Step 1: Create `app/tv/VideoFilter.tsx`**

Client component holding the category filter state. Extracted so `app/tv/page.tsx` stays a Server Component.

```tsx
'use client'

import { useState } from 'react'
import type { Video, VideoCategory } from '@/content/types'
import { VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { VideoCard } from '@/components/content/VideoCard'

type Filter = VideoCategory | 'all'

export function VideoFilter({ videos }: { videos: Video[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const categories = Object.keys(VIDEO_CATEGORY_LABELS) as VideoCategory[]
  const shown = filter === 'all' ? videos : videos.filter((v) => v.category === filter)

  return (
    <>
      <div role="group" aria-label="Filter videos by category" className="flex flex-wrap gap-3">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        {categories.map((category) => (
          <FilterButton
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
          >
            {VIDEO_CATEGORY_LABELS[category]}
          </FilterButton>
        ))}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-14 text-bone-dim">
          No videos in this category yet. Check back soon.
        </p>
      )}
    </>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
        active
          ? 'bg-gold-500 text-ink-900'
          : 'border border-gold-700/60 text-bone-dim hover:border-gold-500 hover:text-gold-300'
      }`}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `app/tv/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { videos } from '@/content/videos'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { VideoFilter } from './VideoFilter'

export const metadata: Metadata = {
  title: 'Word Mission TV',
  description:
    'School missions, testimonies, worship sessions, interviews and mission documentaries from Word Mission Team.',
}

export default function TvPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">Word Mission TV</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Watch the mission
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-bone-dim">
          School missions, testimonies, worship, interviews and documentaries —
          the Gospel going into Kenyan high schools.
        </p>
        <div className="mt-14">
          <VideoFilter videos={latest(videos)} />
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/tv/[slug]/page.tsx`**

Uses `generateStaticParams` for prerendering and `PageProps<'/tv/[slug]'>` for typing. `params` is a Promise in Next 16 and must be awaited.

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { videos, VIDEO_CATEGORY_LABELS } from '@/content/videos'
import { bySlug, latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { YouTubeFacade } from '@/components/media/YouTubeFacade'
import { VideoCard } from '@/components/content/VideoCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'

export function generateStaticParams() {
  return videos.map((video) => ({ slug: video.slug }))
}

export async function generateMetadata(
  props: PageProps<'/tv/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const video = bySlug(videos, slug)
  if (!video) return {}
  return { title: video.title, description: video.description }
}

export default async function VideoPage(props: PageProps<'/tv/[slug]'>) {
  const { slug } = await props.params
  const video = bySlug(videos, slug)
  if (!video) notFound()

  const related = latest(
    videos.filter((v) => v.slug !== video.slug && v.category === video.category),
    3,
  )

  return (
    <>
      <Section>
        <Container>
          <YouTubeFacade youtubeId={video.youtubeId} title={video.title} />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Badge>{VIDEO_CATEGORY_LABELS[video.category]}</Badge>
            <p className="text-sm text-bone-dim">{formatDate(video.date)}</p>
            {video.school && (
              <p className="text-sm text-bone-dim">· {video.school}</p>
            )}
          </div>

          <h1 className="mt-6 max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {video.title}
          </h1>
          <p className="mt-6 max-w-2xl text-bone-dim">{video.description}</p>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section className="bg-ink-800">
          <Container>
            <SectionHeading eyebrow="Keep Watching" title="More like this" />
            <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <VideoCard key={item.slug} video={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run dev`, open `/tv`. Filter buttons should narrow the grid; clicking a card opens the detail page; the play button mounts the iframe only on click.

```bash
git add app/tv/
git commit -m "feat: build Word Mission TV pages"
```

---

## Task 12: Gallery

**Files:**
- Create: `app/gallery/page.tsx`, `app/gallery/[album]/page.tsx`, `app/gallery/[album]/PhotoGrid.tsx`

- [ ] **Step 1: Create `app/gallery/[album]/PhotoGrid.tsx`**

Client component owning lightbox state.

```tsx
'use client'

import { useState } from 'react'
import type { Photo } from '@/content/types'
import { PhotoCard } from '@/components/content/PhotoCard'
import { Lightbox } from '@/components/media/Lightbox'

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <PhotoCard
            key={index}
            photo={photo}
            index={index}
            onOpen={setOpenIndex}
          />
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Create `app/gallery/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { albums } from '@/content/gallery'
import { latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photos from school missions, camps, prayer meetings, guidance and counselling sessions, and student testimonies.',
}

export default function GalleryPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Moments from the field
        </h1>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {latest(albums).map((album) => (
            <article key={album.slug} className="group">
              <Link href={`/gallery/${album.slug}`}>
                <div className="grain relative aspect-[4/3] overflow-hidden bg-ink-800">
                  <Image
                    src={album.cover.src}
                    alt=""
                    width={album.cover.width}
                    height={album.cover.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-5 text-xl font-bold transition-colors group-hover:text-gold-300">
                  {album.title}
                </h2>
                <p className="mt-2 text-sm text-bone-dim">{album.description}</p>
                <p className="eyebrow mt-3">
                  {album.photos.length} photos · {formatDate(album.date)}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/gallery/[album]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { albums } from '@/content/gallery'
import { bySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { PhotoGrid } from './PhotoGrid'

export function generateStaticParams() {
  return albums.map((album) => ({ album: album.slug }))
}

export async function generateMetadata(
  props: PageProps<'/gallery/[album]'>,
): Promise<Metadata> {
  const { album: slug } = await props.params
  const album = bySlug(albums, slug)
  if (!album) return {}
  return { title: album.title, description: album.description }
}

export default async function AlbumPage(props: PageProps<'/gallery/[album]'>) {
  const { album: slug } = await props.params
  const album = bySlug(albums, slug)
  if (!album) notFound()

  return (
    <Section>
      <Container>
        <p className="eyebrow">{formatDate(album.date)}</p>
        <h1 className="mt-6 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          {album.title}
        </h1>
        <p className="mt-6 max-w-2xl text-bone-dim">{album.description}</p>

        <div className="mt-14">
          <PhotoGrid photos={album.photos} />
        </div>

        <Button href="/gallery" variant="ghost" className="mt-14">
          All albums
        </Button>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Verify and commit**

Open `/gallery`, then an album. Click a photo: the lightbox opens focused on the close button; arrow keys move between photos; `Escape` closes and returns focus.

```bash
git add app/gallery/
git commit -m "feat: build gallery with accessible lightbox"
```

---

## Task 13: The Word

**Files:**
- Create: `app/word/page.tsx`, `app/word/devotionals/page.tsx`, `app/word/devotionals/[slug]/page.tsx`, `app/word/bible-studies/page.tsx`, `app/word/bible-studies/[slug]/page.tsx`, `app/word/sermons/page.tsx`, `app/word/notes/page.tsx`

- [ ] **Step 1: Create `app/word/page.tsx`** — the hub

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { devotionals, bibleStudies, sermons, teachingNotes } from '@/content/word'
import { latest, todaysDevotional, currentMemoryVerse } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ScriptureBlock } from '@/components/content/ScriptureBlock'
import { DevotionalCard } from '@/components/content/DevotionalCard'

export const metadata: Metadata = {
  title: 'The Word',
  description:
    'Daily devotions, Bible studies, sermons, memory verses and downloadable teaching notes.',
}

export default function WordPage() {
  const today = todaysDevotional()
  const verse = currentMemoryVerse()

  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">The Word of God</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Feed on the Word
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            A daily devotion, studies to go deeper, sermons to listen to, and
            notes you can carry into your own group.
          </p>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            eyebrow="Today"
            number="01"
            title="Today&rsquo;s devotion"
          />
          <div>
            <ScriptureBlock reference={today.verseRef} text={today.verseText} />
            <h3 className="mt-10 text-2xl font-bold">{today.title}</h3>
            <p className="mt-4 text-bone-dim">{today.body[0]}</p>
            <Button
              href={`/word/devotionals/${today.slug}`}
              variant="gold"
              className="mt-8"
            >
              Read it
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Memory Verse"
            number="02"
            title="Hide it in your heart"
          />
          <ScriptureBlock
            reference={verse.reference}
            text={verse.text}
            className="mt-10 max-w-3xl"
          />
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Devotionals"
              number="03"
              title="Recent devotions"
            />
            <Button href="/word/devotionals" variant="ghost">
              All devotions
            </Button>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {latest(devotionals, 3).map((devotional) => (
              <DevotionalCard key={devotional.slug} devotional={devotional} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-14 md:grid-cols-3">
          <HubLink
            href="/word/bible-studies"
            eyebrow="04"
            title="Bible Studies"
            description={`${bibleStudies.length} studies for going deeper, alone or in a group.`}
          />
          <HubLink
            href="/word/sermons"
            eyebrow="05"
            title="Sermons"
            description={`${sermons.length} messages preached on mission and at camp.`}
          />
          <HubLink
            href="/word/notes"
            eyebrow="06"
            title="Teaching Notes"
            description={`${teachingNotes.length} downloadable guides for leaders.`}
          />
        </Container>
      </Section>
    </>
  )
}

function HubLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group border-t border-gold-700/40 pt-6 transition-colors hover:border-gold-500"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-bold transition-colors group-hover:text-gold-300">
        {title}
      </h3>
      <p className="mt-3 text-sm text-bone-dim">{description}</p>
    </Link>
  )
}
```

- [ ] **Step 2: Create `app/word/devotionals/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { devotionals } from '@/content/word'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { DevotionalCard } from '@/components/content/DevotionalCard'

export const metadata: Metadata = {
  title: 'Daily Devotions',
  description: 'A short word for students, every day.',
}

export default function DevotionalsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Daily Devotions
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {latest(devotionals).map((devotional) => (
            <DevotionalCard key={devotional.slug} devotional={devotional} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/word/devotionals/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { devotionals } from '@/content/word'
import { bySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ScriptureBlock } from '@/components/content/ScriptureBlock'
import { Button } from '@/components/ui/Button'
import { GoldRule } from '@/components/ui/GoldRule'

export function generateStaticParams() {
  return devotionals.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata(
  props: PageProps<'/word/devotionals/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const devotional = bySlug(devotionals, slug)
  if (!devotional) return {}
  return { title: devotional.title, description: devotional.body[0] }
}

export default async function DevotionalPage(
  props: PageProps<'/word/devotionals/[slug]'>,
) {
  const { slug } = await props.params
  const devotional = bySlug(devotionals, slug)
  if (!devotional) notFound()

  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="eyebrow">{formatDate(devotional.date)}</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {devotional.title}
        </h1>

        <ScriptureBlock
          reference={devotional.verseRef}
          text={devotional.verseText}
          className="mt-12"
        />

        <div className="mt-12 space-y-6">
          {devotional.body.map((paragraph, i) => (
            <p key={i} className="text-bone-dim">
              {paragraph}
            </p>
          ))}
        </div>

        {devotional.prayer && (
          <>
            <GoldRule className="my-12" />
            <p className="eyebrow">Pray</p>
            <p className="scripture mt-4 italic">{devotional.prayer}</p>
          </>
        )}

        <Button href="/word/devotionals" variant="ghost" className="mt-14">
          All devotions
        </Button>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Create `app/word/bible-studies/page.tsx` and `[slug]/page.tsx`**

```tsx
// app/word/bible-studies/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { bibleStudies } from '@/content/word'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Bible Studies',
  description: 'Studies for going deeper in the Word, alone or in a group.',
}

export default function BibleStudiesPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Bible Studies
        </h1>
        <div className="mt-14">
          {bibleStudies.map((study) => (
            <article key={study.slug} className="group border-t border-gold-700/40 py-8">
              {study.series && <Badge>{study.series}</Badge>}
              <h2 className="mt-4 text-2xl font-bold">
                <Link
                  href={`/word/bible-studies/${study.slug}`}
                  className="transition-colors group-hover:text-gold-300"
                >
                  {study.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl text-bone-dim">{study.summary}</p>
              <p className="eyebrow mt-4">{study.scriptures.join(' · ')}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

```tsx
// app/word/bible-studies/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { bibleStudies } from '@/content/word'
import { bySlug } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function generateStaticParams() {
  return bibleStudies.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata(
  props: PageProps<'/word/bible-studies/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const study = bySlug(bibleStudies, slug)
  if (!study) return {}
  return { title: study.title, description: study.summary }
}

export default async function BibleStudyPage(
  props: PageProps<'/word/bible-studies/[slug]'>,
) {
  const { slug } = await props.params
  const study = bySlug(bibleStudies, slug)
  if (!study) notFound()

  return (
    <Section>
      <Container className="max-w-3xl">
        {study.series && <Badge>{study.series}</Badge>}
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {study.title}
        </h1>
        <p className="mt-6 text-lg text-bone-dim">{study.summary}</p>
        <p className="eyebrow mt-6">{study.scriptures.join(' · ')}</p>

        <div className="mt-14 space-y-12">
          {study.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-bold">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-bone-dim">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Button href="/word/bible-studies" variant="ghost" className="mt-14">
          All studies
        </Button>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 5: Create `app/word/sermons/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { sermons } from '@/content/word'
import { latest } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { YouTubeFacade } from '@/components/media/YouTubeFacade'

export const metadata: Metadata = {
  title: 'Sermons',
  description: 'Messages preached on mission and at camp.',
}

export default function SermonsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Sermons
        </h1>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          {latest(sermons).map((sermon) => (
            <article key={sermon.slug}>
              {sermon.youtubeId && (
                <YouTubeFacade youtubeId={sermon.youtubeId} title={sermon.title} />
              )}
              <h2 className="mt-6 text-2xl font-bold">{sermon.title}</h2>
              <p className="eyebrow mt-3">
                {sermon.preacher} · {formatDate(sermon.date)}
              </p>
              <p className="mt-4 text-bone-dim">{sermon.summary}</p>
              {sermon.audioUrl && (
                <audio controls src={sermon.audioUrl} className="mt-4 w-full">
                  Your browser does not support audio playback.
                </audio>
              )}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 6: Create `app/word/notes/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { teachingNotes } from '@/content/word'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = {
  title: 'Teaching Notes',
  description: 'Downloadable teaching notes and leader guides.',
}

export default function NotesPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Teaching Notes
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-bone-dim">
          Download these and teach them. They are free, and they are meant to be
          used.
        </p>

        <div className="mt-14">
          {teachingNotes.map((note) => (
            <article
              key={note.slug}
              className="flex flex-wrap items-center justify-between gap-6 border-t border-gold-700/40 py-8"
            >
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold">{note.title}</h2>
                <p className="mt-2 text-bone-dim">{note.description}</p>
                <p className="eyebrow mt-3">
                  PDF · {note.fileSizeLabel}
                  {note.pages ? ` · ${note.pages} pages` : ''}
                </p>
              </div>
              <a
                href={note.fileUrl}
                download
                className="inline-flex items-center gap-2 border border-gold-700 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:border-gold-500 hover:text-gold-300"
              >
                Download
              </a>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 7: Verify and commit**

Open `/word` and each subroute.

```bash
git add app/word/
git commit -m "feat: build The Word section"
```

---

## Task 14: News & Events

**Files:**
- Create: `app/news/page.tsx`, `app/news/[slug]/page.tsx`

- [ ] **Step 1: Create `app/news/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { newsItems } from '@/content/news'
import { latest } from '@/lib/content'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { EventCard } from '@/components/content/EventCard'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'News & Events',
  description:
    'Upcoming school visits, mission reports, prayer requests and testimonies.',
}

export default function NewsPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">News &amp; Events</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Where we are going, and what God has done
        </h1>

        <div className="mt-14">
          {latest(newsItems).map((item) => (
            <EventCard key={item.slug} item={item} />
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Button href="/contact" variant="give">
            Send a prayer request
          </Button>
          <Button href="/contact" variant="ghost">
            Invite us to your school
          </Button>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Create `app/news/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { newsItems, NEWS_CATEGORY_LABELS } from '@/content/news'
import { bySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata(
  props: PageProps<'/news/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const item = bySlug(newsItems, slug)
  if (!item) return {}
  return { title: item.title, description: item.excerpt }
}

export default async function NewsItemPage(props: PageProps<'/news/[slug]'>) {
  const { slug } = await props.params
  const item = bySlug(newsItems, slug)
  if (!item) notFound()

  return (
    <Section>
      <Container className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-4">
          <Badge>{NEWS_CATEGORY_LABELS[item.category]}</Badge>
          <p className="text-sm text-bone-dim">{formatDate(item.date)}</p>
          {item.location && <p className="text-sm text-bone-dim">· {item.location}</p>}
        </div>

        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {item.title}
        </h1>

        <div className="mt-10 space-y-6">
          {item.body.map((paragraph, i) => (
            <p key={i} className="text-bone-dim">
              {paragraph}
            </p>
          ))}
        </div>

        <Button href="/news" variant="ghost" className="mt-14">
          All news
        </Button>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
git add app/news/
git commit -m "feat: build news and events pages"
```

---

## Task 15: Support page

**Files:**
- Create: `app/support/page.tsx`

This is the only page where red is the dominant accent.

- [ ] **Step 1: Create `app/support/page.tsx`**

```tsx
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
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            {site.giving.message}
          </p>
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
              After giving, send us the M-Pesa message on WhatsApp so we can
              thank you and account for the gift.
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
          <div className="border border-gold-700/40 p-10 lg:p-16">
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
```

- [ ] **Step 2: Verify and commit**

Check that placeholder paybill/account values render visibly as `000000` / `TODO Bank Name` — they must be obviously unfinished, not plausible.

```bash
git add app/support/
git commit -m "feat: build support page with giving details"
```

---

## Task 16: Contact page and WhatsApp forms

**Files:**
- Create: `components/ui/Field.tsx`, `components/forms/WhatsAppForm.tsx`
- Create: `app/contact/page.tsx`

**Interfaces:**
- Consumes: `whatsappLink`, `buildEnquiry` from `lib/whatsapp`
- Produces: `<Field label name type? required? rows?>`, `<WhatsAppForm heading intro fields submitLabel preamble>`

- [ ] **Step 1: Create `components/ui/Field.tsx`**

```tsx
export function Field({
  label,
  name,
  type = 'text',
  required = false,
  rows,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  rows?: number
}) {
  const id = `field-${name}`
  const shared =
    'mt-2 w-full border border-ink-600 bg-ink-900 px-4 py-3 text-bone placeholder:text-bone-dim focus:border-gold-500 focus:outline-none'

  return (
    <div>
      <label htmlFor={id} className="eyebrow">
        {label}
        {required && <span className="text-blood-bright"> *</span>}
      </label>
      {rows ? (
        <textarea id={id} name={name} rows={rows} required={required} className={shared} />
      ) : (
        <input id={id} name={name} type={type} required={required} className={shared} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/forms/WhatsAppForm.tsx`**

Client component. Builds a pre-filled `wa.me` link from the form fields and opens it. Nothing is sent anywhere and nothing is stored.

```tsx
'use client'

import { site } from '@/content/site'
import { whatsappLink, buildEnquiry } from '@/lib/whatsapp'
import { Field } from '@/components/ui/Field'

export interface FormField {
  label: string
  name: string
  type?: string
  required?: boolean
  rows?: number
}

export function WhatsAppForm({
  heading,
  intro,
  fields,
  submitLabel,
  preamble,
}: {
  heading: string
  intro: string
  fields: FormField[]
  submitLabel: string
  preamble: string
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const entries: Record<string, string> = {}
    for (const field of fields) {
      entries[field.label] = String(data.get(field.name) ?? '')
    }

    const message = `${preamble}\n\n${buildEnquiry(entries)}`
    window.open(whatsappLink(site.contact.whatsapp, message), '_blank', 'noopener')
  }

  return (
    <form onSubmit={onSubmit} className="border border-ink-600 p-8">
      <h3 className="text-xl font-bold">{heading}</h3>
      <p className="mt-3 text-sm text-bone-dim">{intro}</p>

      <div className="mt-8 flex flex-col gap-6">
        {fields.map((field) => (
          <Field key={field.name} {...field} />
        ))}
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300"
      >
        {submitLabel}
      </button>
      <p className="mt-4 text-xs text-bone-dim">
        This opens WhatsApp with your message ready to send. Nothing is stored on
        this website.
      </p>
    </form>
  )
}
```

- [ ] **Step 3: Create `app/contact/page.tsx`**

Covers all four form types from the spec's "future additions": prayer request, school invitation, volunteer registration, newsletter.

```tsx
import type { Metadata } from 'next'
import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { WhatsAppForm } from '@/components/forms/WhatsAppForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach Word Mission Team on WhatsApp, email or social media.',
}

const SOCIAL_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
}

export default function ContactPage() {
  const socials = Object.entries(site.socials).filter(([, url]) => Boolean(url))
  const generalChat = whatsappLink(
    site.contact.whatsapp,
    'Hello Word Mission Team,',
  )

  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Talk to the team
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            WhatsApp is the fastest way to reach us. We read every message.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={generalChat} variant="gold" size="lg">
              WhatsApp us
            </Button>
            <Button href={`mailto:${site.contact.email}`} variant="ghost" size="lg">
              {site.contact.email}
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow hover:text-gold-300"
              >
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-800">
        <Container>
          <SectionHeading
            eyebrow="How can we help?"
            number="01"
            title="Send us a message"
            description="Fill in a form and it opens WhatsApp with your message ready to send."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <WhatsAppForm
              heading="Invite us to your school"
              intro="For school administrators, chaplains, patrons and CU leaders."
              preamble="SCHOOL INVITATION"
              submitLabel="Send invitation"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Your role', name: 'role', required: true },
                { label: 'School name', name: 'school', required: true },
                { label: 'County / location', name: 'location', required: true },
                { label: 'Preferred dates', name: 'dates' },
                { label: 'Anything we should know', name: 'notes', rows: 4 },
              ]}
            />

            <WhatsAppForm
              heading="Send a prayer request"
              intro="We pray over every request as a team."
              preamble="PRAYER REQUEST"
              submitLabel="Send request"
              fields={[
                { label: 'Your name', name: 'name' },
                { label: 'School (optional)', name: 'school' },
                { label: 'Your request', name: 'request', rows: 5, required: true },
              ]}
            />

            <WhatsAppForm
              heading="Join the team"
              intro="Volunteer with us on missions, media, worship or follow-up."
              preamble="VOLUNTEER REGISTRATION"
              submitLabel="Register interest"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Phone', name: 'phone', type: 'tel', required: true },
                { label: 'Location', name: 'location', required: true },
                { label: 'How you would like to serve', name: 'serve', rows: 4 },
              ]}
            />

            <WhatsAppForm
              heading="Get mission updates"
              intro="We will add you to our WhatsApp updates for missions and prayer points."
              preamble="UPDATES SIGN-UP"
              submitLabel="Sign me up"
              fields={[
                { label: 'Your name', name: 'name', required: true },
                { label: 'Phone', name: 'phone', type: 'tel', required: true },
              ]}
            />
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 4: Verify and commit**

Submit a form and confirm a `wa.me` URL opens with labelled, correctly-encoded lines.

```bash
git add components/ui/Field.tsx components/forms/ app/contact/
git commit -m "feat: build contact page with WhatsApp-backed forms"
```

---

## Task 17: SEO, error pages and launch readiness

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/error.tsx`, `app/opengraph-image.tsx`
- Create: `README.md` section
- Delete: `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, `public/window.svg`, `public/file.svg`

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { videos } from '@/content/videos'
import { albums } from '@/content/gallery'
import { devotionals, bibleStudies } from '@/content/word'
import { newsItems } from '@/content/news'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/about',
    '/tv',
    '/gallery',
    '/word',
    '/word/devotionals',
    '/word/bible-studies',
    '/word/sermons',
    '/word/notes',
    '/news',
    '/support',
    '/contact',
  ]

  const dynamicPaths = [
    ...videos.map((v) => `/tv/${v.slug}`),
    ...albums.map((a) => `/gallery/${a.slug}`),
    ...devotionals.map((d) => `/word/devotionals/${d.slug}`),
    ...bibleStudies.map((s) => `/word/bible-studies/${s.slug}`),
    ...newsItems.map((n) => `/news/${n.slug}`),
  ]

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }))
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/content/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Create `app/opengraph-image.tsx`**

`ImageResponse` supports flexbox but not grid — this layout uses flex only.

```tsx
import { ImageResponse } from 'next/og'
import { site } from '@/content/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${site.name} — ${site.tagline}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: 8,
            color: '#d4af37',
            textTransform: 'uppercase',
          }}
        >
          Word Mission Team
        </div>
        <div style={{ display: 'flex', width: 160, height: 3, backgroundColor: '#d4af37', marginTop: 32 }} />
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 900,
            color: '#faf8f3',
            marginTop: 40,
            lineHeight: 1.05,
          }}
        >
          Reaching the next generation
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#a8a49b', marginTop: 32 }}>
          High school missions · Discipleship · Media · The Word
        </div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 4: Create `app/not-found.tsx` and `app/error.tsx`**

```tsx
// app/not-found.tsx
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <p className="eyebrow">404</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          This page is not here
        </h1>
        <p className="mt-6 text-bone-dim">
          The link may be old, or the page may have moved.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/" variant="gold">Home</Button>
          <Button href="/tv" variant="ghost">Watch videos</Button>
          <Button href="/word" variant="ghost">Read the Word</Button>
        </div>
      </Container>
    </Section>
  )
}
```

```tsx
// app/error.tsx
'use client'

import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-32">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05]">
        We hit an error
      </h1>
      <p className="mt-6 text-bone-dim">
        Try again. If it keeps happening, tell us on WhatsApp and we will fix it.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          onClick={reset}
          className="bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900"
        >
          Try again
        </button>
        <a
          href={whatsappLink(site.contact.whatsapp, 'I hit an error on the website.')}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gold-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone"
        >
          Report it
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Remove scaffold assets**

```bash
rm public/next.svg public/vercel.svg public/globe.svg public/window.svg public/file.svg
```

- [ ] **Step 6: Document the launch checklist in `README.md`**

Replace the create-next-app boilerplate with a section titled "Before launch: fill these in", listing every `TODO` in `content/`. Generate the authoritative list with:

```bash
grep -rn "TODO" content/ | sed 's/:.*TODO/ — TODO/'
```

- [ ] **Step 7: Full verification**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all pass; the build reports every route prerendered as static.

- [ ] **Step 8: Commit**

```bash
git add app/ public/ README.md
git commit -m "feat: add SEO, error pages and launch checklist"
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: §4 art direction → Tasks 2–3; §5 IA and routes → Tasks 4, 9–17; §6 content model and placeholder policy → Tasks 1, 7 (with a test enforcing the policy); §7 components → Tasks 3, 6, 8, 16; §9 error handling (non-commerce rows) → Task 17; §10 testing → Tasks 1, 5, 7; §11 accessibility → Tasks 3, 4, 6, 8. §8 commerce is covered by the separate commerce plan.

**Type consistency.** `Photo`, `Video`, `Album`, `Devotional`, `BibleStudy`, `Sermon`, `MemoryVerse`, `TeachingNote`, `NewsItem`, `ImpactStat`, `TeamMember`, `SiteConfig` are defined once in Task 1 Step 3 and used unchanged thereafter. `bySlug`/`latest`/`byCategory` signatures in Task 7 match every call site in Tasks 9–17. `formatKes`/`formatDate` in Task 5 match usage in Tasks 8, 11–14. Note `byCategory<C, T>` puts the category type parameter first so `T` is inferred from the array argument.

**Known gap, deliberate:** `content/merch.ts` and the `/merch` route are absent here — the Shop nav entry in `content/site.ts` will 404 until the commerce plan's Task 1 lands. Ship Phase B with the Shop entry commented out of `site.nav` if the content site launches first.
