# Word Mission Team

Website for Word Mission Team — reaching Kenyan high school students with the
Gospel through school missions, discipleship, media, and the Word of God.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and TypeScript.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint
npm run build
```

---

## How to edit the site

**All editable content lives in `content/`.** You do not need to touch any
component or page to change what the site says.

| File | What it controls |
|---|---|
| `content/site.ts` | **Every real-world detail** — WhatsApp, phone, email, M-Pesa, bank, socials, navigation |
| `content/ministry.ts` | Vision, mission, values, story, impact statistics, team members |
| `content/videos.ts` | Word Mission TV entries (YouTube IDs, titles, categories) |
| `content/gallery.ts` | Photo albums |
| `content/word.ts` | Devotionals, Bible studies, sermons, memory verses, teaching notes |
| `content/news.ts` | Upcoming visits, mission reports, prayer requests, testimonies |
| `content/merch.ts` | Products, sizes and prices |

These files are type-checked. If you make a mistake — a missing field, a typo in
a category name — `npm run build` fails with a clear error instead of publishing
a broken page.

### Adding a video

Find the video on YouTube. The ID is the 11 characters after `watch?v=` in the
URL. Add an entry to `content/videos.ts`:

```ts
{
  slug: 'kabete-high-mission',          // becomes /tv/kabete-high-mission
  youtubeId: 'dQw4w9WgXcQ',
  title: 'Kabete High School Mission',
  description: 'What happened during the mission.',
  category: 'school-mission',           // or testimony | worship | interview | documentary
  date: '2026-09-14',                   // YYYY-MM-DD
  school: 'Kabete High School',
}
```

### Adding photos

Put the image files in `public/images/`, then add them to an album in
`content/gallery.ts`. **Every photo needs real `alt` text** — describe what is
happening in it. This is what blind visitors and search engines read.

### Prices

Prices are written in **cents**, so `150000` means KES 1,500. This avoids
rounding errors. Never write `1500.00`.

---

## Before launch: fill these in

Run this at any time to see everything still outstanding:

```bash
grep -rn "TODO" content/
```

### 1. Contact and payment details — `content/site.ts`

Everything here is placeholder and **must** be replaced:

- [ ] Real domain (`url`)
- [ ] WhatsApp number, phone number, email, base location
- [ ] YouTube, Facebook, Instagram, TikTok, X links
- [ ] M-Pesa paybill and account name (or till number)
- [ ] Bank name, branch, account name, account number, SWIFT code

The placeholder numbers use `+254700000000`, which is reserved for
documentation, so nothing real is ever dialled by accident.

### 2. Impact statistics — `content/ministry.ts`

All four figures ship as `0`. **This is deliberate.** Invented salvation counts
would be dishonest to publish. Replace each `value` with the real figure and
remove its `TODO` note.

There is a test enforcing this: a stat may not carry a non-zero value while its
note still says `TODO`.

### 3. Team members — `content/ministry.ts`

Replace the four placeholder names, roles, bios and photos.

### 4. The founding story — `content/ministry.ts`

Two paragraphs of the `story` array are placeholders.

### 5. Videos and sermons — `content/videos.ts`, `content/word.ts`

Every `youtubeId` is a placeholder (`AAAAAAAAAAA` and similar). A wrong ID
shows a blank thumbnail.

### 6. News, testimonies and photos

- `content/news.ts` — real events, reports and prayer points
- `content/gallery.ts` — real photographs with real alt text

**Publish a student testimony only with that student's explicit permission**,
and use a first name or initials for anyone under 18.

### 7. Teaching notes

Upload the PDFs to `public/notes/` and update `fileUrl` and `fileSizeLabel` in
`content/word.ts`.

### 8. Merchandise

Confirm every price in `content/merch.ts` and replace the placeholder product
photos.

---

## Scripture translation

Verses are quoted from the **World English Bible**, which is public domain and
free to publish online.

If you prefer another translation, check its licence first — the NIV and ESV
both restrict how much text may be quoted on a public website.

---

## Commerce setup (optional)

**The site runs fine without any of this.** With no payment credentials
configured, the shop still shows every product and the buy button becomes
"Order on WhatsApp". You can launch first and switch on online payment later.

Online checkout needs **both** Paystack and Firebase. If either is missing the
site stays in WhatsApp-ordering mode.

Copy `.env.example` to `.env.local` and fill it in.

### Paystack (payments — M-Pesa and card)

1. Create an account at [paystack.com](https://paystack.com) and complete
   business verification.
2. Settings → API Keys & Webhooks → copy the **secret key** into
   `PAYSTACK_SECRET_KEY`.
3. On the same page, set the webhook URL to:
   `https://your-domain.com/api/webhooks/paystack`

The webhook is what actually confirms a payment. Without it, orders stay
`pending` even after a customer pays.

Test with card `4084 0840 8408 4081`, any future expiry, any CVV.

### Firebase (order records)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
   and enable **Firestore**.
2. Project settings → Service accounts → **Generate new private key**.
3. From the downloaded JSON, copy `project_id`, `client_email` and
   `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and
   `FIREBASE_PRIVATE_KEY`.

`FIREBASE_PRIVATE_KEY` must stay wrapped in double quotes with its `\n`
sequences intact.

### Admin order list

```bash
ADMIN_PASSWORD=<choose a strong password>
ADMIN_COOKIE_SECRET=$(openssl rand -hex 32)
```

Orders are then visible at `/admin/orders`.

### How a purchase flows

```
cart (browser)
  → POST /api/checkout
  → server re-prices every line from content/merch.ts   ← client prices ignored
  → order written to Firestore as "pending"
  → Paystack hosted checkout (M-Pesa or card)
  → webhook confirms payment  ← the source of truth
  → receipt at /merch/order/<reference>
```

Prices are always recomputed on the server. A customer who edits the price in
their browser is charged the real amount.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js settings
   are detected automatically.
3. Add your environment variables under Settings → Environment Variables
   (only needed for online checkout).
4. Set `NEXT_PUBLIC_SITE_URL` to your real domain, and update `url` in
   `content/site.ts` to match.

Every push to `main` deploys. Every pull request gets a preview URL.

---

## Project structure

```
content/      All editable content. Start here.
lib/          Pure logic: pricing, cart, formatting, WhatsApp links, integrations
components/   layout/ ui/ media/ content/ forms/ commerce/
app/          Routes (Next.js App Router)
proxy.ts      Gates /admin  (Next 16 renamed "middleware" to "proxy")
tests/        Unit tests for lib/ and content integrity
docs/superpowers/   Design spec and implementation plans
```

## Design

Two themes. **Dark is the default and the brand identity** — black ground, gold
hairlines, red reserved for giving. **Light is opt-in**, chosen with the toggle
in the header and remembered in `localStorage`.

The light theme is not an inversion. It is built from four layered warm whites
— page `#fbfaf7`, alternating section `#f2f0e9`, cards pure `#ffffff` — where
separation between components comes from **shadow**, not from a border or a
darker fill. The `surface-card` / `surface-media` / `surface-panel` /
`surface-header` classes in `app/globals.css` carry that elevation; in dark
they resolve to `none`, because contrast between the ink shades already does
the job.

Three rules worth keeping if you extend the site:

- **Gold is a line, not a fill.** Hairlines, letterspaced small-caps labels and
  numerals — no gold gradients or glows.
- **Red means the blood of Christ, so it is reserved for giving actions.** Red
  anywhere other than a Support/Give button is a mistake.
- **Never use an opacity modifier on a themed colour.** Tailwind compiles
  `border-gold-700/40` to a literal hex, which will *not* follow a theme
  change. Every translucent value the design depends on is a named token
  (`border-rule`, `bg-veil`, `via-scrim-mid`, …) in `app/globals.css`.

Colour tokens live in `app/globals.css`: the `@theme` block is dark, and
`:root[data-theme="light"]` overrides it. No component knows which theme is
active. Typography is Archivo (headings and UI) with Crimson Pro for scripture.

### Contrast is tested

`tests/contrast.test.ts` parses `app/globals.css` and asserts WCAG AA (4.5:1)
for every text/background pair **in both themes**. Change a colour and the
tests tell you if you have made it unreadable.

The trap it exists to catch: brand gold `#d4af37` is 1.9:1 on white and
completely unreadable, so the light theme darkens it to `#7d5f0e`. Red has the
same problem in reverse, so it is split into two tokens — `--color-blood-bright`
is red *as text* on a dark ground, `--color-blood-hover` is a *fill* that must
stay dark enough to carry white text.
