import type { SiteConfig } from './types'

/**
 * Every real-world detail the ministry must supply lives in this file and
 * nowhere else. Search for TODO to find everything that needs filling in
 * before launch.
 */
export const site: SiteConfig = {
  name: 'Word Mission Team',
  shortName: 'Word Mission',
  tagline: 'Reaching the next generation',
  missionStatement:
    'Reaching the next generation with the Gospel of Jesus Christ through high school missions, discipleship, media, and the Word of God.',
  url: 'https://wordmissionteam.org', // TODO: real domain

  contact: {
    whatsapp: '+254700000000', // TODO: real WhatsApp number
    phone: '+254700000000', // TODO: real phone number
    email: 'hello@wordmissionteam.org', // TODO: real email
    location: 'Nairobi, Kenya', // TODO: confirm base location
  },

  socials: {
    youtube: 'https://youtube.com/@wordmissiontv', // TODO: real channel
    facebook: 'https://facebook.com/wordmissionteam', // TODO
    instagram: 'https://instagram.com/wordmissionteam', // TODO
    tiktok: 'https://tiktok.com/@wordmissionteam', // TODO
    x: 'https://x.com/wordmissionteam', // TODO
  },

  giving: {
    message:
      'Every gift helps us reach more students with the Gospel. Your support enables school missions, discipleship, Bibles, transport, and follow-up ministry.',
    mpesa: {
      paybill: '000000', // TODO: real paybill
      account: 'WORDMISSION', // TODO: real account name
      sendMoneyPhone: '+254700000000', // TODO: real number
    },
    bank: {
      bankName: 'TODO Bank Name',
      branch: 'TODO Branch',
      accountName: 'Word Mission Team',
      accountNumber: '0000000000', // TODO
      swiftCode: 'TODOKENA', // TODO: for international transfers
    },
    internationalNote:
      'Giving from outside Kenya? Send us a message on WhatsApp and we will share the fastest route for your country.',
  },

  // "Support Us" is deliberately absent — it renders as a standing red CTA
  // beside the nav so giving is never just one link among nine.
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'TV', href: '/tv' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'The Word', href: '/word' },
    { label: 'News', href: '/news' },
    { label: 'Shop', href: '/merch' },
    { label: 'Contact', href: '/contact' },
  ],
}
