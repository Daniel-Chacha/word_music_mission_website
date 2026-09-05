'use client'

import { site } from '@/content/site'
import { whatsappLink, buildEnquiry } from '@/lib/whatsapp'
import { Field } from '@/components/ui/Field'

export interface FormField {
  label: string
  name: string
  type?: string
  required?: boolean
  rows?: number
}

/**
 * Builds a pre-filled wa.me link from the form fields and opens it.
 * Nothing is transmitted to this site and nothing is stored.
 */
export function WhatsAppForm({
  heading,
  intro,
  fields,
  submitLabel,
  preamble,
}: {
  heading: string
  intro: string
  fields: FormField[]
  submitLabel: string
  preamble: string
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const entries: Record<string, string> = {}
    for (const field of fields) {
      entries[field.label] = String(data.get(field.name) ?? '')
    }

    const message = `${preamble}\n\n${buildEnquiry(entries)}`
    window.open(whatsappLink(site.contact.whatsapp, message), '_blank', 'noopener')
  }

  return (
    <form onSubmit={onSubmit} className="surface-card p-8">
      <h3 className="text-xl font-bold">{heading}</h3>
      <p className="mt-3 text-sm text-bone-dim">{intro}</p>

      <div className="mt-8 flex flex-col gap-6">
        {fields.map((field) => (
          <Field key={field.name} {...field} />
        ))}
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300"
      >
        {submitLabel}
      </button>
      <p className="mt-4 text-xs text-bone-dim">
        This opens WhatsApp with your message ready to send. Nothing is stored on this
        website.
      </p>
    </form>
  )
}
