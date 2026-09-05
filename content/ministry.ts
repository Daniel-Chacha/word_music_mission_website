import type { Ministry } from './types'

const PLACEHOLDER_PHOTO = {
  src: '/images/placeholder.jpg',
  alt: 'Placeholder portrait',
  width: 1600,
  height: 1067,
}

export const ministry: Ministry = {
  vision:
    'A generation of Kenyan students who know Jesus Christ personally, stand firm in His Word, and carry the Gospel to their schools, their homes, and their nation.',

  mission:
    'We go into high schools with the Gospel, we disciple the students who respond, and we keep walking with them through media, mentorship, and the teaching of the Word.',

  values: [
    {
      title: 'The Word first',
      description:
        'Every mission, video and conversation is anchored in Scripture. We do not offer opinion where God has already spoken.',
    },
    {
      title: 'Reaching them where they are',
      description:
        'Students are in school. So we go to school — into assemblies, classrooms, dormitories and fields, not waiting for them to find a church.',
    },
    {
      title: 'Discipleship, not events',
      description:
        'A crusade that ends when we drive away is not ministry. We follow up, we mentor, and we stay reachable.',
    },
    {
      title: 'Integrity in everything',
      description:
        'We account for every shilling given, we protect every student we meet, and we tell the truth about our numbers.',
    },
  ],

  story: [
    'Word Mission Team began with a burden for students who were being reached by everything except the Gospel.',
    'TODO: Replace with the real founding story — when the ministry started, the first school visited, and what happened there.',
    'TODO: Describe how the team grew and what the ministry looks like today.',
  ],

  // TODO: Replace every value below with the real figure before launch.
  // Zeros are deliberate. Never publish estimated or invented numbers —
  // tests/content.test.ts enforces that a non-zero stat carries no TODO note.
  stats: [
    { label: 'Schools visited', value: 0, note: 'TODO: real figure' },
    { label: 'Students reached', value: 0, note: 'TODO: real figure' },
    { label: 'Decisions for Christ', value: 0, note: 'TODO: real figure' },
    { label: 'Bibles distributed', value: 0, note: 'TODO: real figure' },
  ],

  // TODO: Replace with the real team. Names below are placeholders.
  team: [
    {
      name: 'TODO: Team Leader Name',
      role: 'Team Leader',
      bio: 'TODO: Short bio — calling, background, and role in the ministry.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Media Lead Name',
      role: 'Media & Word Mission TV',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Discipleship Lead Name',
      role: 'Discipleship & Follow-up',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
    {
      name: 'TODO: Worship Lead Name',
      role: 'Worship',
      bio: 'TODO: Short bio.',
      photo: PLACEHOLDER_PHOTO,
    },
  ],
}
