export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border border-gold-700/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-300">
      {children}
    </span>
  )
}
