import type { SocialLinks } from '@/content/types'

/**
 * Path segments that name a page type rather than an account, so a link
 * built on them carries no handle (Facebook share links, YouTube channel IDs).
 */
const NOT_A_HANDLE = new Set(['share', 'profile.php', 'channel', 'c', 'user', 'p', 'reel'])

/**
 * The public @handle in a social profile URL, or null when the link does not
 * contain one. Query strings (share tracking) are ignored.
 */
export function socialHandle(url: string): string | null {
  let path: string
  try {
    path = new URL(url).pathname
  } catch {
    return null
  }

  const first = path.split('/').filter(Boolean)[0]
  if (!first || NOT_A_HANDLE.has(first)) return null

  return `@${first.replace(/^@/, '')}`
}

export type SocialKey = keyof SocialLinks

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
}

export interface SocialProfile {
  key: SocialKey
  label: string
  url: string
  /** What to show beside the icon: a configured name, else the URL's @handle. */
  handle: string | null
}

/** The configured social profiles, in config order, ready to render. */
export function socialProfiles(
  socials: SocialLinks,
  names: Partial<Record<SocialKey, string>> = {},
): SocialProfile[] {
  return (Object.entries(socials) as [SocialKey, string | undefined][])
    .filter((entry): entry is [SocialKey, string] => Boolean(entry[1]))
    .map(([key, url]) => ({
      key,
      label: SOCIAL_LABELS[key],
      url,
      handle: names[key] ?? socialHandle(url),
    }))
}
