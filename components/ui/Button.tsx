import Link from 'next/link'

type Variant = 'gold' | 'give' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-300',
  // The only red surface on the site. White on --color-blood is 5.9:1.
  give: 'bg-blood text-white hover:bg-blood-bright',
  ghost: 'border border-gold-700 text-bone hover:border-gold-500 hover:text-gold-300',
}

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export function Button({
  href,
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...rest
}: {
  href?: string
  variant?: Variant
  size?: keyof typeof SIZES
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.12em] transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
