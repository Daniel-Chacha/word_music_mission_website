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
