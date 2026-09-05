import type { NewsItem } from './types'

// TODO: Replace with real events, reports, prayer points and testimonies.
export const newsItems: NewsItem[] = [
  {
    slug: 'upcoming-school-visits-term-three',
    title: 'Upcoming School Visits — Term Three',
    category: 'upcoming-visit',
    date: '2026-09-20',
    location: 'TODO: County / region',
    excerpt: 'TODO: List the schools the team is visiting this term and the dates.',
    body: [
      'TODO: Name each school, the date of the visit, and what the team will be doing there.',
      'TODO: Explain how a school can request a visit.',
    ],
  },
  {
    slug: 'mission-report-term-two',
    title: 'Mission Report — Term Two',
    category: 'mission-report',
    date: '2026-08-30',
    excerpt: 'TODO: Summarise what God did across the term.',
    body: [
      'TODO: Report the schools visited, students reached and decisions recorded.',
      'TODO: Include one or two specific stories, with permission from the students involved.',
    ],
  },
  {
    slug: 'prayer-points-this-month',
    title: 'Prayer Points for This Month',
    category: 'prayer-request',
    date: '2026-09-01',
    excerpt: 'Stand with us in prayer for these specific needs.',
    body: [
      'TODO: List current prayer needs — upcoming missions, transport, Bibles, students in follow-up.',
    ],
  },
  {
    slug: 'a-student-testimony',
    title: 'From the Back Row to the Front Line',
    category: 'testimony',
    date: '2026-08-12',
    excerpt: 'TODO: Summarise this testimony.',
    body: [
      "TODO: Publish this testimony only with the student's explicit permission, and use a first name or initials for a minor.",
    ],
  },
]

export const NEWS_CATEGORY_LABELS: Record<NewsItem['category'], string> = {
  'upcoming-visit': 'Upcoming Visit',
  'mission-report': 'Mission Report',
  'prayer-request': 'Prayer Request',
  testimony: 'Testimony',
}
