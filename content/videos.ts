import type { Video } from './types'

// TODO: Replace every youtubeId with a real video ID from the ministry channel.
// A YouTube ID is the 11 characters after `watch?v=` in the video URL.
// Placeholder IDs are 11 characters so the shape test still guards real edits.
export const videos: Video[] = [
  {
    slug: 'school-mission-highlights',
    youtubeId: 'AAAAAAAAAAA',
    title: 'School Mission Highlights',
    description:
      'TODO: Describe this mission — which school, what happened, how students responded.',
    category: 'school-mission',
    date: '2026-08-14',
    school: 'TODO: School name',
    featured: true,
  },
  {
    slug: 'student-testimony',
    youtubeId: 'BBBBBBBBBBB',
    title: 'A Student Tells Her Story',
    description: 'TODO: Describe this testimony.',
    category: 'testimony',
    date: '2026-07-30',
  },
  {
    slug: 'worship-session',
    youtubeId: 'CCCCCCCCCCC',
    title: 'Worship Session',
    description: 'TODO: Describe this worship session.',
    category: 'worship',
    date: '2026-07-12',
  },
  {
    slug: 'interview-with-a-chaplain',
    youtubeId: 'DDDDDDDDDDD',
    title: 'Interview With a School Chaplain',
    description: 'TODO: Describe this interview.',
    category: 'interview',
    date: '2026-06-20',
  },
  {
    slug: 'mission-documentary',
    youtubeId: 'EEEEEEEEEEE',
    title: 'Mission Documentary',
    description: 'TODO: Describe this documentary.',
    category: 'documentary',
    date: '2026-05-09',
  },
  {
    slug: 'camp-worship-night',
    youtubeId: 'FFFFFFFFFFF',
    title: 'Camp Worship Night',
    description: 'TODO: Describe this worship night.',
    category: 'worship',
    date: '2026-04-18',
  },
]

export const VIDEO_CATEGORY_LABELS: Record<Video['category'], string> = {
  'school-mission': 'School Missions',
  testimony: 'Testimonies',
  worship: 'Worship',
  interview: 'Interviews',
  documentary: 'Documentaries',
}
