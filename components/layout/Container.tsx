export function Container({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  )
}
