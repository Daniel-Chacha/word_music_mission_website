import { ImageResponse } from 'next/og'
import { site } from '@/content/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${site.name} — ${site.tagline}`

// ImageResponse supports flexbox but not grid — this layout uses flex only.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: 8,
            color: '#d4af37',
            textTransform: 'uppercase',
          }}
        >
          Word Mission Team
        </div>
        <div
          style={{
            display: 'flex',
            width: 160,
            height: 3,
            backgroundColor: '#d4af37',
            marginTop: 32,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 900,
            color: '#faf8f3',
            marginTop: 40,
            lineHeight: 1.05,
          }}
        >
          Reaching the next generation
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#a8a49b', marginTop: 32 }}>
          High school missions · Discipleship · Media · The Word
        </div>
      </div>
    ),
    size,
  )
}
