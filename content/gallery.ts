import type { Album, Photo } from './types'

// TODO: Replace every placeholder photo with a real ministry photograph.
function placeholders(count: number, label: string): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    src: '/images/placeholder.jpg',
    alt: `TODO: Describe this ${label} photo`,
    width: 1600,
    height: 1067,
    caption: `TODO: caption ${i + 1}`,
  }))
}

const cover: Photo = {
  src: '/images/placeholder.jpg',
  alt: 'TODO: Describe this album cover photo',
  width: 1600,
  height: 1067,
}

export const albums: Album[] = [
  {
    slug: 'school-missions',
    title: 'School Missions',
    description: 'Assemblies, classrooms and fields across Kenyan high schools.',
    date: '2026-08-14',
    category: 'school',
    cover,
    photos: placeholders(6, 'school mission'),
  },
  {
    slug: 'camps',
    title: 'Camps',
    description: 'Residential camps where students go deeper in the Word.',
    date: '2026-07-05',
    category: 'camp',
    cover,
    photos: placeholders(6, 'camp'),
  },
  {
    slug: 'prayer-meetings',
    title: 'Prayer Meetings',
    description: 'Students and team seeking God together before every mission.',
    date: '2026-06-18',
    category: 'prayer',
    cover,
    photos: placeholders(6, 'prayer meeting'),
  },
  {
    slug: 'guidance-and-counselling',
    title: 'Guidance & Counselling',
    description: 'One-to-one sessions walking with students through real struggles.',
    date: '2026-05-22',
    category: 'counseling',
    cover,
    photos: placeholders(6, 'counselling session'),
  },
  {
    slug: 'student-testimonies',
    title: 'Student Testimonies',
    description: 'Students telling their own stories of meeting Jesus.',
    date: '2026-04-30',
    category: 'testimony',
    cover,
    photos: placeholders(6, 'testimony'),
  },
]
