import { Eyebrow } from './Eyebrow'

export function SectionHeading({
  eyebrow,
  number,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string
  number?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start'
  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      {eyebrow && <Eyebrow number={number}>{eyebrow}</Eyebrow>}
      <h2 className="max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
        {title}
      </h2>
      {description && <p className="max-w-2xl text-bone-dim">{description}</p>}
    </div>
  )
}
