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
