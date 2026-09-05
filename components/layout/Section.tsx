export function Section({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`py-20 lg:py-32 ${className}`}>
      {children}
    </section>
  )
}
