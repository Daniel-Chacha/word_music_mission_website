import type { Metadata } from 'next'
import { teachingNotes } from '@/content/word'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = {
  title: 'Teaching Notes',
  description: 'Downloadable teaching notes and leader guides.',
}

export default function NotesPage() {
  return (
    <Section>
      <Container>
        <p className="eyebrow">The Word</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
          Teaching Notes
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-bone-dim">
          Download these and teach them. They are free, and they are meant to be used.
        </p>

        <div className="mt-14">
          {teachingNotes.map((note) => (
            <article
              key={note.slug}
              className="flex flex-wrap items-center justify-between gap-6 border-t border-gold-700/40 py-8"
            >
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold">{note.title}</h2>
                <p className="mt-2 text-bone-dim">{note.description}</p>
                <p className="eyebrow mt-3">
                  PDF · {note.fileSizeLabel}
                  {note.pages ? ` · ${note.pages} pages` : ''}
                </p>
              </div>
              <a
                href={note.fileUrl}
                download
                className="inline-flex items-center gap-2 border border-gold-700 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:border-gold-500 hover:text-gold-300"
              >
                Download
              </a>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
