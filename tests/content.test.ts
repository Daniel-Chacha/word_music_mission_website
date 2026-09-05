import { describe, it, expect } from 'vitest'
import { site } from '@/content/site'

describe('site config', () => {
  it('uses the exact mission statement from the spec', () => {
    expect(site.missionStatement).toBe(
      'Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God.',
    )
  })

  it('does not list Support Us in the main nav', () => {
    const labels = site.nav.map((n) => n.label.toLowerCase())
    expect(labels).not.toContain('support us')
  })

  it('has unique nav hrefs', () => {
    const hrefs = site.nav.map((n) => n.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('exposes a WhatsApp number in international format', () => {
    expect(site.contact.whatsapp).toMatch(/^\+\d{10,15}$/)
  })
})
