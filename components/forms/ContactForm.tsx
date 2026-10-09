'use client'

import { useState } from 'react'
import { formatDateTimeLocal } from '@/lib/format'
import { Field } from '@/components/ui/Field'

export interface FormField {
  label: string
  name: string
  type?: string
  required?: boolean
  rows?: number
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

/** Emails the filled-in fields to the team. Nothing is stored on the site. */
export function ContactForm({
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
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const entries: Record<string, string> = {}
    for (const field of fields) {
      const value = String(data.get(field.name) ?? '')
      entries[field.label] = field.type === 'datetime-local' ? formatDateTimeLocal(value) : value
    }

    setStatus({ kind: 'sending' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preamble,
          fields: entries,
          website: String(data.get('website') ?? ''),
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'We could not send your message.')

      form.reset()
      setStatus({ kind: 'sent' })
    } catch (cause) {
      setStatus({
        kind: 'error',
        message:
          cause instanceof Error ? cause.message : 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-card p-8">
      <h3 className="text-xl font-bold">{heading}</h3>
      <p className="mt-3 text-sm text-bone-dim">{intro}</p>

      {/* Two columns from md up; multi-line answers span both. */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.rows ? 'md:col-span-2' : ''}>
            <Field {...field} />
          </div>
        ))}
      </div>

      {/* Honeypot for spam bots: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="mt-8 inline-flex items-center justify-center bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300 disabled:opacity-50"
      >
        {status.kind === 'sending' ? 'Sending…' : submitLabel}
      </button>

      <div aria-live="polite" className="mt-4 text-sm">
        {status.kind === 'sent' && (
          <p className="text-gold-300">Thank you — your message has been sent. We will be in touch.</p>
        )}
        {status.kind === 'error' && (
          <p role="alert" className="text-blood-bright">
            {status.message}
          </p>
        )}
      </div>
    </form>
  )
}
