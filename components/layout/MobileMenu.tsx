'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { site } from '@/content/site'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function MobileMenu() {
  const pathname = usePathname()
  // The menu remembers the route it was opened on, so `open` is derived:
  // any navigation makes the stored path stale and closes it. No effect,
  // and the back button closes it as reliably as a link does.
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath !== null && openPath === pathname

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const trigger = triggerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenPath(null)
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      ;(previouslyFocused ?? trigger)?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpenPath(pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="p-2 text-bone lg:hidden"
      >
        <span className="sr-only">Open menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink-900 px-6 py-6 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpenPath(null)}
              className="p-2 text-bone"
            >
              <span className="sr-only">Close menu</span>
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenPath(null)}
                className="border-b border-ink-600 py-4 text-2xl font-bold tracking-[-0.01em] text-bone"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/support"
              onClick={() => setOpenPath(null)}
              className="mt-6 bg-blood px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white"
            >
              Support Us
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
