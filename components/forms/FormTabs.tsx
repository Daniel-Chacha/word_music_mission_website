'use client'

import { useId, useRef, useState } from 'react'
import { ContactForm, type FormField } from './ContactForm'

export interface TabbedForm {
  /** Short label for the tab itself. */
  tab: string
  heading: string
  intro: string
  preamble: string
  submitLabel: string
  fields: FormField[]
}

/**
 * Shows one form at a time behind a row of tabs (WAI-ARIA tabs pattern:
 * arrow keys move between tabs, Home/End jump to the ends). Inactive panels
 * are hidden rather than unmounted, so switching tabs keeps what was typed.
 */
export function FormTabs({ forms }: { forms: TabbedForm[] }) {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  function select(index: number) {
    const next = (index + forms.length) % forms.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: forms.length - 1,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(moves[event.key])
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose a form"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2"
      >
        {forms.map((form, index) => {
          const selected = index === active
          return (
            <button
              key={form.tab}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                selected
                  ? 'border-gold-500 bg-gold-500 text-ink-900'
                  : 'border-rule-strong text-bone-dim hover:border-gold-500 hover:text-gold-300'
              }`}
            >
              {form.tab}
            </button>
          )
        })}
      </div>

      {forms.map(({ tab, ...form }, index) => (
        <div
          key={tab}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          className="mt-8"
        >
          <ContactForm {...form} />
        </div>
      ))}
    </div>
  )
}
