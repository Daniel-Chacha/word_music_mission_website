import type {
  BibleStudy,
  Devotional,
  MemoryVerse,
  Sermon,
  TeachingNote,
} from './types'

// Scripture quotations are from the World English Bible, which is public
// domain. TODO: If the ministry prefers another translation, check its licence
// for web use first — NIV and ESV both restrict online quotation.
export const devotionals: Devotional[] = [
  {
    slug: 'called-while-young',
    title: 'Called While You Are Young',
    date: '2026-09-05',
    verseRef: '1 Timothy 4:12',
    verseText:
      'Let no man despise your youth; but be an example to those who believe, in word, in your way of life, in love, in spirit, in faith, and in purity.',
    body: [
      'There is a lie that says God is waiting for you to finish school, get a job and settle down before He can use you. Paul writes the opposite to a young man leading a church.',
      'Timothy was not told to wait until he was older. He was told to be an example now — in how he spoke, how he lived, how he loved, and how he kept himself pure.',
      'Your school is not a waiting room. It is your first mission field.',
    ],
    prayer:
      'Lord, use me where I am. Make my words, my life and my purity an example to the people around me today.',
  },
  {
    slug: 'the-word-is-a-lamp',
    title: 'A Lamp for the Next Step',
    date: '2026-09-04',
    verseRef: 'Psalm 119:105',
    verseText: 'Your word is a lamp to my feet, and a light for my path.',
    body: [
      'A lamp in the dark does not show you the whole journey. It shows you the next step.',
      'Many students want God to reveal their entire future before they will obey Him in anything. But Scripture offers a lamp, not a floodlight.',
      'Open the Word today for the next step, not the whole map.',
    ],
    prayer: 'Father, give me the courage to take the step I can already see.',
  },
  {
    slug: 'no-longer-my-own',
    title: 'No Longer My Own',
    date: '2026-09-03',
    verseRef: '1 Corinthians 6:19-20',
    verseText:
      "Or don't you know that your body is a temple of the Holy Spirit which is in you, which you have from God? You are not your own, for you were bought with a price.",
    body: [
      'The culture around you says your body is yours to do with as you please. Scripture says something far more valuable: you were bought at a price.',
      'That is not a restriction. It is a valuation. Someone paid for you.',
      'Live today like something expensive was spent on you — because it was.',
    ],
    prayer: 'Jesus, thank You for the price You paid. Help me to honour it.',
  },
  {
    slug: 'strength-for-the-term',
    title: 'Strength for the Term Ahead',
    date: '2026-09-02',
    verseRef: 'Isaiah 40:31',
    verseText:
      'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.',
    body: [
      'A term is long. Exams, pressure, disappointment and tiredness all arrive before it ends.',
      'Isaiah does not promise that waiting on God removes the running. He promises it changes what the running costs you.',
      'Wait on Him at the start of the term, not only when you are already exhausted.',
    ],
    prayer: 'Lord, renew my strength for what is ahead of me this term.',
  },
]

export const bibleStudies: BibleStudy[] = [
  {
    slug: 'identity-in-christ',
    title: 'Identity in Christ',
    series: 'Foundations',
    summary:
      'Four sessions on who you become the moment you trust Jesus — and why that settles the questions your school keeps asking you.',
    scriptures: ['John 1:12', '2 Corinthians 5:17', 'Ephesians 2:10', 'Romans 8:15-17'],
    sections: [
      {
        heading: 'You are received, not auditioning',
        body: [
          'John 1:12 says that as many as received Him, to them He gave the right to become children of God.',
          'TODO: Expand this session with the ministry teaching notes.',
        ],
      },
      {
        heading: 'You are new, not repaired',
        body: [
          '2 Corinthians 5:17 does not describe an improvement. It describes a new creation.',
          'TODO: Expand this session.',
        ],
      },
      {
        heading: 'You are made for works prepared beforehand',
        body: [
          'Ephesians 2:10 calls you His workmanship, created for good works God prepared in advance.',
          'TODO: Expand this session.',
        ],
      },
    ],
  },
  {
    slug: 'standing-firm-in-school',
    title: 'Standing Firm in School',
    series: 'Foundations',
    summary:
      'Practical sessions on peer pressure, purity, discipline and witness inside a Kenyan high school.',
    scriptures: ['Daniel 1:8', 'Romans 12:2', '1 Peter 3:15'],
    sections: [
      {
        heading: 'Daniel decided beforehand',
        body: [
          'Daniel 1:8 says he purposed in his heart. The decision was made before the pressure arrived.',
          'TODO: Expand this session.',
        ],
      },
      {
        heading: 'Be ready to give an answer',
        body: [
          '1 Peter 3:15 tells us to be ready to give an answer, with humility and respect.',
          'TODO: Expand this session.',
        ],
      },
    ],
  },
]

export const sermons: Sermon[] = [
  {
    slug: 'the-cost-and-the-crown',
    title: 'The Cost and the Crown',
    preacher: 'TODO: Preacher name',
    date: '2026-08-24',
    summary: 'TODO: Summarise this message.',
    youtubeId: 'GGGGGGGGGGG', // TODO: real video ID
  },
  {
    slug: 'who-told-you',
    title: 'Who Told You?',
    preacher: 'TODO: Preacher name',
    date: '2026-07-27',
    summary: 'TODO: Summarise this message.',
    youtubeId: 'HHHHHHHHHHH', // TODO: real video ID
  },
]

export const memoryVerses: MemoryVerse[] = [
  {
    reference: 'Joshua 1:9',
    text: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    week: '2026-W36',
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ, who strengthens me.',
    week: '2026-W35',
  },
  {
    reference: 'Proverbs 3:5-6',
    text: "Trust in Yahweh with all your heart, and don't lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.",
    week: '2026-W34',
  },
]

// TODO: Upload the real PDFs to public/notes/ and update fileUrl + fileSizeLabel.
export const teachingNotes: TeachingNote[] = [
  {
    slug: 'identity-in-christ-notes',
    title: 'Identity in Christ — Teaching Notes',
    description:
      'Full notes for the four-session Identity in Christ study, formatted for group leaders.',
    fileUrl: '/notes/identity-in-christ.pdf',
    fileSizeLabel: 'TODO KB',
    pages: 12,
  },
  {
    slug: 'school-mission-followup',
    title: 'School Mission Follow-Up Guide',
    description:
      'How to walk with a student in the first thirty days after they give their life to Christ.',
    fileUrl: '/notes/school-mission-followup.pdf',
    fileSizeLabel: 'TODO KB',
    pages: 8,
  },
]
