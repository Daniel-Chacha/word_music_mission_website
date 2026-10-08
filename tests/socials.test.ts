import { describe, it, expect } from 'vitest'
import { socialHandle, socialProfiles } from '@/lib/socials'

describe('socialHandle', () => {
  it('reads an @handle from a YouTube channel URL, ignoring tracking params', () => {
    expect(socialHandle('https://youtube.com/@wordmusic_ke?si=MO5FbS2shPBMu_k1')).toBe(
      '@wordmusic_ke',
    )
  })

  it('reads the profile name from an Instagram URL', () => {
    expect(
      socialHandle('https://www.instagram.com/word_mission_team?stkn=MWF2bTMzOTE5Y2M0Yg=='),
    ).toBe('@word_mission_team')
  })

  it('reads the profile name from TikTok and X URLs', () => {
    expect(socialHandle('https://tiktok.com/@wordmissionteam')).toBe('@wordmissionteam')
    expect(socialHandle('https://x.com/wordmissionteam')).toBe('@wordmissionteam')
  })

  it('reads a Facebook page name', () => {
    expect(socialHandle('https://www.facebook.com/wordmissionteam/')).toBe('@wordmissionteam')
  })

  it('returns null for links that carry no handle', () => {
    expect(socialHandle('https://www.facebook.com/share/1cmzSbYDZm/')).toBeNull()
    expect(socialHandle('https://www.facebook.com/profile.php?id=100')).toBeNull()
    expect(socialHandle('https://youtube.com/channel/UC123')).toBeNull()
    expect(socialHandle('not a url')).toBeNull()
  })
})

describe('socialProfiles', () => {
  it('lists configured networks with label, URL and best display name', () => {
    expect(
      socialProfiles(
        {
          youtube: 'https://youtube.com/@wordmusic_ke?si=x',
          facebook: 'https://www.facebook.com/share/1cmzSbYDZm/',
          instagram: 'https://www.instagram.com/word_mission_team',
          tiktok: undefined,
        },
        { facebook: 'Word Mission Team' },
      ),
    ).toEqual([
      { key: 'youtube', label: 'YouTube', url: 'https://youtube.com/@wordmusic_ke?si=x', handle: '@wordmusic_ke' },
      { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/share/1cmzSbYDZm/', handle: 'Word Mission Team' },
      { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/word_mission_team', handle: '@word_mission_team' },
    ])
  })

  it('falls back to null when neither the link nor a name gives a handle', () => {
    expect(socialProfiles({ facebook: 'https://www.facebook.com/share/abc/' })[0].handle).toBeNull()
  })
})
