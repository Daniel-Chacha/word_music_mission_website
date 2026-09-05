'use client'

import { THEME_STORAGE_KEY } from '@/lib/theme'

/**
 * Switches between the dark brand identity and the light alternative.
 *
 * The button holds no React state: which icon and which label are shown is
 * decided by CSS from the `data-theme` attribute on <html> (see the
 * .theme-when-* rules in globals.css). That means the server and the client
 * render identical markup, so a visitor who has chosen the light theme cannot
 * trigger a hydration mismatch.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  function toggle() {
    const root = document.documentElement
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked — the choice simply does not outlive the page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-2 text-bone transition-colors hover:text-gold-300 ${className}`}
    >
      <span className="sr-only theme-when-dark">Switch to light theme</span>
      <span className="sr-only theme-when-light">Switch to dark theme</span>

      {/* Sun: shown on dark, offering the light theme. */}
      <svg
        className="theme-when-dark"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Moon: shown on light, offering the dark theme. */}
      <svg
        className="theme-when-light"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 14.4A8.5 8.5 0 0 1 9.6 4a8.5 8.5 0 1 0 10.4 10.4z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
