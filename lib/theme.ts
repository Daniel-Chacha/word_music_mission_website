/**
 * Shared by a Server Component (ThemeScript) and a Client Component
 * (ThemeToggle), so this must NOT carry a 'use client' directive: importing a
 * value across that boundary from the server side yields a client reference,
 * not the string, and the inline script would read localStorage.getItem(undefined).
 */
export const THEME_STORAGE_KEY = 'wmt.theme'

export type Theme = 'dark' | 'light'

/** The brand identity. Light is opt-in. */
export const DEFAULT_THEME: Theme = 'dark'
