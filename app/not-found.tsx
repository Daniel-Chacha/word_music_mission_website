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
          <Button href="/" variant="gold">
            Home
          </Button>
          <Button href="/tv" variant="ghost">
            Watch videos
          </Button>
          <Button href="/word" variant="ghost">
            Read the Word
          </Button>
        </div>
      </Container>
    </Section>
  )
}
