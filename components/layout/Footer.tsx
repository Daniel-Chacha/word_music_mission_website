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
    <footer className="border-t border-hairline bg-ink-800">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-lg font-extrabold uppercase tracking-[0.08em]">{site.name}</p>
            <p className="mt-4 max-w-sm text-sm text-bone-dim">{site.missionStatement}</p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 flex flex-col gap-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-bone-dim hover:text-gold-300">
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
