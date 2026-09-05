export function ScriptureBlock({
  reference,
  text,
  className = '',
}: {
  reference: string
  text: string
  className?: string
}) {
  return (
    <figure className={`border-l-2 border-gold-500 pl-6 lg:pl-8 ${className}`}>
      <blockquote className="scripture">{text}</blockquote>
      <figcaption className="eyebrow mt-4">{reference}</figcaption>
    </figure>
  )
}
