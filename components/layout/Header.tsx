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
