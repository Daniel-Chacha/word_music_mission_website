# Word Mission Team — Website Design Spec

**Date:** 2026-09-05
**Status:** Approved for implementation
**Stack:** Next.js 16.3.4 (App Router), React 19.2.8, Tailwind CSS v4, TypeScript 5

---

## 1. Purpose

A public website for Word Mission Team, a Kenyan ministry reaching high school
students with the Gospel through school missions, discipleship, media, and
teaching of the Word.

The site serves two audiences at once:

- **Students (13–19)** — should find it alive, current, and worth sharing.
- **Supporters and partners (30+)** — should find it credible enough to give to
  and to invite into a school.

Every design decision below is answerable to both.

### Mission statement (verbatim, site-wide)

> Reaching the next generation with the Gospel of Jesus Christ through high
> school missions, discipleship, media, and the Word of God.

---

## 2. Decisions already settled

| Question | Decision |
|---|---|
| Content management | Typed TypeScript modules in `content/`, edited in-repo |
| Real contact/payment details | Clearly-marked placeholders, all in `content/site.ts` |
| Forms (prayer, volunteer, invite, newsletter) | WhatsApp / `mailto:` deep links, no backend |
| Merchandise | Real online checkout |
| Payment provider | Paystack (M-Pesa + card, hosted redirect) |
| Order storage | Firebase Firestore + auth-gated admin page |
| Hosting | Vercel |

---

## 3. Phasing

Three phases. Each ends at a working, committable state.

### Phase A — Foundation

Design tokens, typography, layout shell, header/footer, content model and types.
No page content yet. Blocked on nothing.

### Phase B — Content site

Home, About, Word Mission TV, Gallery, The Word, News & Events, Support,
Contact. Blocked on nothing. **At the end of Phase B the site is launchable.**

### Phase C — Commerce

Product catalog, cart, Paystack checkout, Firestore order records, admin order
list. Requires a Paystack merchant account and a Firebase project.

**Graceful degradation is a hard requirement of Phase C.** When
`PAYSTACK_SECRET_KEY` is absent, product pages must still render and the buy
action must fall back to WhatsApp ordering. The site must never show a broken
or dead checkout because an env var is missing. This is what allows Phases A+B
to ship before the merchant account exists.

---

## 4. Art direction

### Reference

A foil-stamped leather Bible. Black ground, thin gold hairlines, generous
margins, restraint. Explicitly **not** a dark SaaS landing page with gradient
blobs.

### Principles

1. **Gold is a line, not a fill.** Hairline rules, letterspaced small-caps
   eyebrows, section numerals, stat digits. No gold gradient washes, no gold
   glows.
2. **Red is rationed to one job** — the Support/Give action. It signifies the
   blood of Christ; spending it on ordinary buttons cheapens it. A red element
   anywhere other than a giving action is a bug.
3. **Photography is uniformly treated** — grain, black bottom scrim, gold rule.
   Source photos will be phone snaps of mixed quality; a consistent treatment
   makes them cohere.
4. **Scripture is typeset, not decorated** — serif, larger than body, gold
   hanging rule at left, reference in letterspaced caps.
5. **Whitespace over ornament.** Section padding is large and consistent.

### Color tokens

Defined once in `app/globals.css` under Tailwind v4 `@theme`.

| Token | Hex | Use | Contrast on `--ink-900` |
|---|---|---|---|
| `--ink-900` | `#0A0A0A` | Page background | — |
| `--ink-800` | `#121212` | Elevated surface | — |
| `--ink-700` | `#1C1C1C` | Cards | — |
| `--ink-600` | `#2A2A2A` | Subtle borders | — |
| `--gold-700` | `#9A7B1F` | Dim hairlines | 4.0:1 (non-text only) |
| `--gold-500` | `#D4AF37` | Rules, accents, numerals | 9.2:1 |
| `--gold-300` | `#E8CE7A` | Gold text on dark | 12:1 |
| `--bone` | `#FAF8F3` | Primary text (warm white) | 19:1 |
| `--bone-dim` | `#A8A49B` | Secondary text | 8.4:1 |
| `--blood` | `#B3121B` | Give action fill | white on it: 5.9:1 |
| `--blood-bright` | `#E5484D` | Red text on dark, rare | 5.5:1 |

**Contrast rule:** deep red on black is ~3.2:1 and fails WCAG AA. Red is a
*background fill* carrying white text, never red text on a black ground. Where
red text is genuinely needed, use `--blood-bright`.

Warm white (`#FAF8F3`) rather than pure `#FFFFFF` — it sits correctly against
gold, where pure white reads cold and cheap.

### Typography

Two families via `next/font/google`, both variable:

- **Archivo** (400–900) — display, headings, UI, letterspaced caps eyebrows.
  Chosen for its punch at 900 and its quality in small caps.
- **Crimson Pro** (400–600, incl. italic) — scripture, pull quotes, devotional
  body text.

Deliberately not Geist or Inter.

| Role | Spec |
|---|---|
| `display-xl` | Archivo 900, `clamp(3rem, 9vw, 7rem)`, tracking `-0.03em`, leading `0.92` |
| `display-l` | Archivo 800, `clamp(2.5rem, 6vw, 4.5rem)`, tracking `-0.02em` |
| `h2` | Archivo 800, `clamp(2rem, 4vw, 3rem)`, tracking `-0.02em` |
| `h3` | Archivo 700, `1.5rem` |
| `eyebrow` | Archivo 600, `0.75rem`, uppercase, tracking `0.22em`, `--gold-500` |
| `body` | Archivo 400, `1.0625rem`, leading `1.7`, `--bone-dim` |
| `scripture` | Crimson Pro 400, `clamp(1.375rem, 2.5vw, 1.875rem)`, leading `1.5`, `--bone` |
| `stat` | Archivo 900, `clamp(2.5rem, 7vw, 5rem)`, `--gold-500`, tabular numerals |

### Recurring motifs

These five carry the visual through-line across every page:

1. **Gold hairline** — 1px `--gold-700` rule separating major sections.
2. **Numbered eyebrow** — `01 — WHO WE ARE` above each section heading.
3. **Full-bleed scrimmed photography** — grain overlay + bottom-up black
   gradient so text is always legible over any photo.
4. **Scripture block** — Crimson Pro, 2px gold rule at left, reference in caps.
5. **Stat counters** — oversized gold numerals, count up once on scroll into
   view, respecting `prefers-reduced-motion`.

### Layout

- Container max-width `1280px`; gutters `24px` mobile, `48px` at `lg`.
- Section rhythm: `py-20` mobile, `py-32` desktop.
- Mobile-first. All layouts must work at `360px` wide — a large share of the
  student audience is on small Android phones.

---

## 5. Information architecture

### Navigation

Home · About · TV · Gallery · The Word · News · Shop · Contact

**Support Us** is deliberately excluded from the nav list and rendered as a
standing red CTA button beside it. Nine equal nav items would flatten the most
important action into a list; separating it makes giving the visually dominant
choice on every page.

Mobile: full-screen overlay menu, focus-trapped, closes on route change and on
`Escape`.

### Routes

| Route | Content |
|---|---|
| `/` | Hero, mission, impact stats, latest videos, latest word, support CTA |
| `/about` | Who we are, vision, mission, values, story, stats, team |
| `/tv` | Video library, filterable by category |
| `/tv/[slug]` | Single video + description + related |
| `/gallery` | Album grid |
| `/gallery/[album]` | Photo grid + lightbox |
| `/word` | Hub: today's devotion, memory verse, studies, sermons, notes |
| `/word/devotionals` · `/word/devotionals/[slug]` | Daily devotions |
| `/word/bible-studies` · `/word/bible-studies/[slug]` | Study series |
| `/word/sermons` | Sermon list (audio/video links) |
| `/word/notes` | Downloadable teaching notes (PDF) |
| `/news` · `/news/[slug]` | Upcoming visits, mission reports, prayer requests, testimonies |
| `/support` | Giving methods, WhatsApp, M-Pesa, bank, international |
| `/merch` · `/merch/[slug]` | Catalog and product detail |
| `/merch/cart` · `/merch/checkout` · `/merch/order/[reference]` | Commerce flow |
| `/contact` | All channels + WhatsApp-backed forms |
| `/admin/orders` | Order list, gated |

Plus `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `not-found.tsx`.

### Video categories

`school-mission` · `testimony` · `worship` · `interview` · `documentary`

---

## 6. Content model

All content lives in `content/`, typed against `content/types.ts`. A malformed
edit is a **build-time type error**, not a production incident. This is the
principal reason for choosing typed modules over loose JSON or Markdown
frontmatter.

```
content/
  types.ts        shared types
  site.ts         org identity, contact, payment, socials, nav   ← ALL placeholders
  ministry.ts     vision, mission, values, story, stats, team
  videos.ts       YouTube entries
  gallery.ts      albums + photos
  word.ts         devotionals, studies, sermons, memory verses, notes
  news.ts         events, reports, prayer requests, testimonies
  merch.ts        products + variants
```

### Placeholder policy

Impact statistics, team members, and student testimonies ship as **obviously
marked placeholders** — `schoolsVisited: 0, // TODO: real figure`.

Inventing salvation counts or attributing fabricated testimonies to named
students would be dishonest to publish, even as filler. Placeholder entries
carry realistic *structure* so layout can be verified, but never
realistic-looking false *claims*.

Every real-world detail the ministry must supply — WhatsApp number, M-Pesa
paybill, bank account, social handles, YouTube channel — lives in
`content/site.ts` and nowhere else, so filling them in is a single-file task.

### Money

Prices are stored as **integer KES cents** (`priceCents: 150000` = KES 1,500).
No floating-point money anywhere. Paystack is called in the smallest unit,
which matches this representation directly.

---

## 7. Components

```
components/
  layout/     Header, MobileMenu, Footer, Container, Section
  ui/         Button, Eyebrow, SectionHeading, GoldRule, Badge, Field
  media/      ScrimmedImage, YouTubeFacade, Lightbox
  content/    ScriptureBlock, StatCounter, VideoCard, PhotoCard,
              TeamCard, EventCard, DevotionalCard, ProductCard
  forms/      WhatsAppForm (prayer, volunteer, invite, newsletter)
  commerce/   CartProvider, CartDrawer, AddToCart, OrderSummary
```

Server Components by default. `"use client"` only where genuinely needed:
mobile menu, lightbox, YouTube facade, stat counter, cart, forms.

### `YouTubeFacade`

Renders the poster image with a play button; mounts the real YouTube `<iframe>`
only on click. A page with twelve videos otherwise loads twelve full players.
Requires `i.ytimg.com` in `next.config.ts` `images.remotePatterns`.

### `WhatsAppForm`

Collects fields client-side, builds a pre-filled `wa.me` URL, opens it. No
network request, no backend, no data stored. Phone numbers are normalised to
international format (`0712…` → `254712…`) and message text is
`encodeURIComponent`-escaped.

---

## 8. Commerce data flow

```
cart (React context + localStorage)
  → POST /api/checkout   { items: [{slug, variantId, qty}], customer }
  → server re-prices every line from merch.ts        ← client prices never trusted
  → Firestore  orders/{orderId}  status: "pending"
  → Paystack transaction/initialize (amount in KES cents, reference = orderId)
  → redirect to Paystack hosted checkout (M-Pesa or card)
  → webhook POST /api/webhooks/paystack
       verify x-paystack-signature (HMAC-SHA512 of raw body, secret key)
       idempotent: charge.success on an already-paid order is a no-op
       → orders/{orderId}.status = "paid"          ← SOURCE OF TRUTH
  → GET /merch/order/[reference] → verify + render receipt
```

### Security requirements

- The client sends only `{slug, variantId, qty}`. **Prices, totals and
  shipping are computed server-side from `content/merch.ts`.** A client that
  posts its own prices must not be able to influence the amount charged.
- The webhook must verify `x-paystack-signature` against the **raw request
  body** before parsing. Parsing first and re-serialising breaks the HMAC.
- Payment confirmation comes from the webhook, not the browser redirect. A user
  who never returns from Paystack still gets a recorded paid order.
- Webhook handling is idempotent — Paystack retries.
- Firebase Admin credentials are server-only, never in a `NEXT_PUBLIC_` var.

### Admin auth

`/admin/*` is gated in `proxy.ts` (Next 16's rename of `middleware.ts`) by
checking a signed httpOnly cookie. The cookie is issued by a route handler that
compares a submitted password against `ADMIN_PASSWORD` in constant time.

This is deliberately not a full auth system. Two people will use this page;
NextAuth plus a user table would be more attack surface and more maintenance
than the problem warrants.

### Environment variables

```
PAYSTACK_SECRET_KEY            server only
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY           server only
ADMIN_PASSWORD                 server only
ADMIN_COOKIE_SECRET            server only
NEXT_PUBLIC_SITE_URL
```

Documented in `.env.example`. Absence of Paystack or Firebase vars degrades to
WhatsApp ordering rather than erroring.

---

## 9. Error handling

| Case | Behaviour |
|---|---|
| Paystack keys missing | Shop renders; buy button becomes "Order on WhatsApp" |
| Firebase creds missing | Checkout disabled the same way; no crash at import |
| Paystack API error | Checkout page shows a retry message + WhatsApp fallback |
| Bad webhook signature | `401`, nothing written, logged |
| Unknown product slug in cart | Line dropped, user told, rest of cart preserved |
| Empty cart at checkout | Redirect to `/merch` |
| Missing route | Branded `not-found.tsx` |
| Server error | Branded `error.tsx` with a WhatsApp contact route |
| YouTube embed blocked | Facade keeps working as a link to youtube.com |

---

## 10. Testing

**Vitest** is added as the test runner (not currently in `package.json`).

TDD applies to logic, not to page markup. Tests to write:

- `lib/cart` — add, remove, change quantity, distinct variants of one product,
  totals, localStorage round-trip
- `lib/pricing` — server-side re-pricing; **a test asserting a tampered
  client-supplied price is ignored**
- `lib/paystack` — signature verification: valid, invalid, and replayed
- `lib/whatsapp` — phone normalisation (`0712…`, `+254712…`, `254712…`) and
  message encoding of special characters
- `lib/format` — KES formatting from integer cents
- `content` integrity — unique slugs per collection, non-empty required fields,
  valid YouTube ID shape, every product has ≥1 variant

---

## 11. Accessibility

- WCAG 2.2 AA contrast, verified against the table in §4.
- Skip-to-content link as the first focusable element.
- Mobile menu and lightbox: focus trapped, `Escape` closes, focus restored.
- All interactive elements reachable and operable by keyboard, with a visible
  gold focus ring.
- `prefers-reduced-motion` disables stat count-ups and scroll animations.
- Every image carries meaningful `alt`; decorative images `alt=""`.
- Video facades are `<button>`s with accessible names, not clickable `<div>`s.

---

## 12. Out of scope for this build

Named explicitly so they are not silently assumed:

- Online Bible courses with progress tracking
- Live streaming infrastructure
- Newsletter delivery (the signup form opens WhatsApp; no mailing list backend)
- Event registration with ticketing
- Multi-language / Swahili translation
- YouTube Data API auto-sync (videos are listed manually in `content/videos.ts`;
  the module is shaped so an API sync can be added later without changing
  consumers)
