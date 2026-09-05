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
