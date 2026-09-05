import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Guards WCAG 2.2 AA contrast for BOTH palettes, parsed from the real
 * stylesheet. Gold on white is the trap here: the brand gold #d4af37 is only
 * 1.9:1 on a white ground, so the light theme has to darken it. This test
 * fails if anyone tunes a colour past the point of readability.
 */

const CSS = readFileSync(resolve(import.meta.dirname, '../app/globals.css'), 'utf8')

function block(pattern: RegExp): Record<string, string> {
  const match = CSS.match(pattern)
  if (!match) throw new Error(`token block not found: ${pattern}`)
  const tokens: Record<string, string> = {}
  for (const [, name, value] of match[1].matchAll(
    /(--color-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    tokens[name] = value
  }
  return tokens
}

const dark = block(/@theme\s*\{([\s\S]*?)\n\}/)
const light = block(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)

function luminance(hex: string): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = channel(parseInt(hex.slice(1, 3), 16))
  const g = channel(parseInt(hex.slice(3, 5), 16))
  const b = channel(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** [foreground, background, label] — all rendered as normal-size text. */
const TEXT_PAIRS: [string, string, string][] = [
  ['--color-bone', '--color-ink-900', 'body text on page'],
  ['--color-bone', '--color-ink-800', 'body text on alt section'],
  ['--color-bone', '--color-ink-700', 'body text on card'],
  ['--color-bone-dim', '--color-ink-900', 'secondary text on page'],
  ['--color-bone-dim', '--color-ink-800', 'secondary text on alt section'],
  ['--color-bone-dim', '--color-ink-700', 'secondary text on card'],
  ['--color-gold-500', '--color-ink-900', 'eyebrow on page'],
  ['--color-gold-500', '--color-ink-800', 'eyebrow on alt section'],
  ['--color-gold-300', '--color-ink-900', 'gold link on page'],
  ['--color-gold-300', '--color-ink-700', 'gold price on card'],
  ['--color-blood-bright', '--color-ink-900', 'error text on page'],
  // Inverted: the gold button paints ink-900 as its label colour.
  ['--color-ink-900', '--color-gold-500', 'gold button label'],
  ['--color-ink-900', '--color-gold-300', 'gold button label on hover'],
]

for (const [themeName, tokens] of [
  ['dark', dark],
  ['light', light],
] as const) {
  describe(`${themeName} theme contrast`, () => {
    for (const [fg, bg, label] of TEXT_PAIRS) {
      it(`${label} meets AA (4.5:1)`, () => {
        const value = ratio(tokens[fg], tokens[bg])
        expect(
          value,
          `${label}: ${tokens[fg]} on ${tokens[bg]} = ${value.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5)
      })
    }

    it('white on the give button meets AA', () => {
      const value = ratio('#ffffff', tokens['--color-blood'])
      expect(value, `white on ${tokens['--color-blood']}`).toBeGreaterThanOrEqual(4.5)
    })

    it('white on the give button hover meets AA', () => {
      // Regression guard: the hover fill originally reused --color-blood-bright,
      // which is tuned as TEXT on a dark ground and gives only 3.4:1 under white.
      const value = ratio('#ffffff', tokens['--color-blood-hover'])
      expect(
        value,
        `white on ${tokens['--color-blood-hover']} = ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5)
    })

    it('the four surfaces are visually distinct', () => {
      const surfaces = [
        tokens['--color-ink-900'],
        tokens['--color-ink-800'],
        tokens['--color-ink-700'],
      ]
      expect(new Set(surfaces).size).toBe(3)
    })
  })
}

describe('light theme intent', () => {
  it('is built from shades of white, not grey', () => {
    // Every surface should be near-white and warm (red channel >= blue).
    for (const token of ['--color-ink-900', '--color-ink-800', '--color-ink-700']) {
      const hex = light[token]
      expect(luminance(hex), `${token} ${hex} should be near-white`).toBeGreaterThan(0.8)
      const r = parseInt(hex.slice(1, 3), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      expect(r, `${token} ${hex} should be warm`).toBeGreaterThanOrEqual(b)
    }
  })

  it('darkens gold, which is unreadable at brand value on white', () => {
    expect(ratio(dark['--color-gold-500'], light['--color-ink-900'])).toBeLessThan(4.5)
    expect(ratio(light['--color-gold-500'], light['--color-ink-900'])).toBeGreaterThanOrEqual(4.5)
  })
})
