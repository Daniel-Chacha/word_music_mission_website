export function Eyebrow({
  number,
  children,
}: {
  number?: string
  children: React.ReactNode
}) {
  return (
    <p className="eyebrow flex items-center gap-3">
      {number && <span className="text-gold-700">{number}</span>}
      {number && <span aria-hidden="true" className="h-px w-6 bg-gold-700" />}
      <span>{children}</span>
    </p>
  )
}
