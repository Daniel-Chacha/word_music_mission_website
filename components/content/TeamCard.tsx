import Image from 'next/image'
import type { TeamMember } from '@/content/types'

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article>
      {member.photo && (
        <div className="grain relative aspect-[3/4] overflow-hidden bg-ink-800">
          <Image
            src={member.photo.src}
            alt={member.photo.alt}
            width={member.photo.width}
            height={member.photo.height}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h3 className="mt-5 text-xl font-bold">{member.name}</h3>
      <p className="eyebrow mt-2">{member.role}</p>
      <p className="mt-3 text-sm text-bone-dim">{member.bio}</p>
    </article>
  )
}
