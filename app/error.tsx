'use client'

import { site } from '@/content/site'
import { whatsappLink } from '@/lib/whatsapp'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-32">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05]">
        We hit an error
      </h1>
      <p className="mt-6 text-bone-dim">
        Try again. If it keeps happening, tell us on WhatsApp and we will fix it.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          onClick={reset}
          className="bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900"
        >
          Try again
        </button>
        <a
          href={whatsappLink(site.contact.whatsapp, 'I hit an error on the website.')}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gold-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone"
        >
          Report it
        </a>
      </div>
    </div>
  )
}
