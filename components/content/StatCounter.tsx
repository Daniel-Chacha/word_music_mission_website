'use client'

import { useEffect, useRef, useState } from 'react'
import type { ImpactStat } from '@/content/types'

/**
 * Counts up when scrolled into view.
 *
 * The initial state is the true figure, so the real number is in the server
 * HTML and remains correct with JavaScript disabled. The count-up is pure
 * enhancement: it only rewinds to zero for a stat that mounts below the fold,
 * which avoids the value visibly snapping backwards on first paint.
 */
export function StatCounter({ stat }: { stat: ImpactStat }) {
  const [value, setValue] = useState(stat.value)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || stat.value === 0) return

    let frame = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (done.current) return

        if (!entry.isIntersecting) {
          // Parked below the fold — rewind so the count-up has a run-up.
          setValue(0)
          return
        }

        done.current = true

        const duration = 1400
        const start = performance.now()

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          // Ease-out cubic so the number decelerates into place.
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(stat.value * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stat.value])

  return (
    <div ref={ref} className="border-t border-rule pt-6">
      <p className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-none tabular-nums text-gold-500">
        {value.toLocaleString('en-US')}
        {stat.suffix}
      </p>
      <p className="eyebrow mt-3">{stat.label}</p>
    </div>
  )
}
