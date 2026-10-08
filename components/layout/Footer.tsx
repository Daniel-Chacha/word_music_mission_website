import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/content/site'
import { Container } from './Container'
import { GoldRule } from '@/components/ui/GoldRule'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { socialProfiles } from '@/lib/socials'
import logo from '@/public/images/wm_logo.jpeg'

const LINK_CLASS =
  'inline-flex items-center gap-3 text-sm text-bone-dim transition-colors hover:text-gold-300'

export function Footer() {
  const socials = socialProfiles(site.socials, site.socialNames)
  const email = site.contact.email.trim()

  return (
    <footer className="on-brand">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Image src={logo} alt="" sizes="96px" className="h-14 w-auto rounded-sm" />
              <p className="text-lg font-extrabold uppercase tracking-[0.08em]">{site.name}</p>
            </div>
            <p className="mt-4 max-w-sm text-sm text-bone-dim">{site.missionStatement}</p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Explore</p>
            {/* Two columns, filled top to bottom: the first half of the links,
                then the rest. */}
            <ul
              className="mt-4 grid grid-flow-col gap-x-12 gap-y-2"
              style={{ gridTemplateRows: `repeat(${Math.ceil(site.nav.length / 2)}, auto)` }}
            >
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
              {socials.map(({ key, label, url, handle }) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // The visible handle alone does not say which network it is.
                    aria-label={handle ? `${label}: ${handle}` : label}
                    className={LINK_CLASS}
                  >
                    <SocialIcon name={key} className="size-5 shrink-0" />
                    <span>{handle ?? label}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${email}`} className={LINK_CLASS}>
                  <SocialIcon name="email" className="size-5 shrink-0" />
                  <span>{email}</span>
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
