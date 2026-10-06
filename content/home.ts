import type { Photo } from './types'

/**
 * Landing page hero carousel, shown in this order.
 *
 * Drop each photo into public/images/ and add an entry here. `src` is the path
 * after `public`; `width` and `height` are the file's real pixel size (run
 * `file public/images/<name>`). `caption` is the short label on the thumbnail.
 * `alt` stays empty: the headline sits over the photo, so it is decorative.
 *
 * Wide landscape photos work best. The bottom is darkened behind the text and
 * the edges are cropped on phones, so keep the subject near the centre.
 */
export const heroSlides: Photo[] = [
  {
    // TODO: Replace with a real photograph from a high school outreach.
    src: '/images/IMG_20260520_164243_110.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'School missions',
  },
  {
    src: '/images/IMG_20260913_103435_279.jpg',
    alt: '',
    width: 3968,
    height: 2976,
    caption: 'Word Mission TV',
  },
  {
    // TODO: Replace with a real photograph.
    src: '/images/IMG_20260712_100700_0.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'Camps',
  },
  {
    // TODO: Replace with a real photograph.
    src: '/images/IMG_20260719_093720_6.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'Worship',
  },
  {
    // TODO: Replace with a real photograph.
    src: '/images/IMG_20260913_103430_091.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'Worship',
  },
  {
    // TODO: Replace with a real photograph.
    src: '/images/IMG_20260531_100515_642.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'Worship',
  },
  {
    // TODO: Replace with a real photograph.
    src: '/images/IMG_20260920_084503_143.jpg',
    alt: '',
    width: 1600,
    height: 1067,
    caption: 'Worship',
  },

]
