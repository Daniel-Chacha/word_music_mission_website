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

## Email setup (shop orders and contact forms)

The site keeps no database. Shop orders and contact-page forms are sent to the
team by email, from a Gmail account, and a member of the team follows up.

1. Pick the Gmail account the site should send from and turn on
   **2-Step Verification** for it.
2. Create an **app password** at
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Copy `.env.example` to `.env.local` and fill in `GMAIL_USER` (the address)
   and `GMAIL_APP_PASSWORD` (the 16-character app password).
4. Optionally set `MAIL_TO` to the inbox that should receive orders and
   messages. It defaults to the contact email in `content/site.ts`.

Without these the site still runs, but submitting an order or a contact form
shows an "email us instead" message.

### How an order flows

```
cart (browser)
  → checkout form: name, email, phone, delivery location
  → POST /api/order
  → server re-prices every line from content/merch.ts   ← client prices ignored
  → email to the team (reply goes straight to the customer)
  → confirmation email to the customer
  → /merch/order-received
  → the team contacts the customer to arrange delivery and payment
```

Gmail allows roughly 500 sent emails a day per account, which is plenty here.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js settings
   are detected automatically.
3. Add the email environment variables under Settings → Environment Variables.
4. Update `url` in `content/site.ts` to your real domain.

Every push to `main` deploys. Every pull request gets a preview URL.

---

## Project structure

```
content/      All editable content. Start here.
lib/          Pure logic: pricing, cart, formatting, WhatsApp links, email
components/   layout/ ui/ media/ content/ forms/ commerce/
app/          Routes (Next.js App Router)
tests/        Unit tests for lib/ and content integrity
docs/superpowers/   Design spec and implementation plans
```

## Design

Two themes. **Dark is the default and the brand identity** — black ground, gold
hairlines, red reserved for giving. **Light is opt-in**, chosen with the toggle
in the header and remembered in `localStorage`.

The light theme is not an inversion. It is built from layered near-whites —
page white `#ffffff`, alternating sections and cards azure `#f0ffff` — where
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

The trap it exists to catch: the logo copper `#e19c65` is 2.2:1 on white and
unreadable as text, so the light theme darkens it to `#8f4a17`. Red has the
same problem in reverse, so it is split into two tokens — `--color-blood-bright`
is red *as text* on a dark ground, `--color-blood-hover` is a *fill* that must
stay dark enough to carry white text.
