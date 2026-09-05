export function Field({
  label,
  name,
  type = 'text',
  required = false,
  rows,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  rows?: number
}) {
  const id = `field-${name}`
  const shared =
    'mt-2 w-full border border-ink-600 bg-ink-900 px-4 py-3 text-bone placeholder:text-bone-dim focus:border-gold-500 focus:outline-none'

  return (
    <div>
      <label htmlFor={id} className="eyebrow">
        {label}
        {required && <span className="text-blood-bright"> *</span>}
      </label>
      {rows ? (
        <textarea id={id} name={name} rows={rows} required={required} className={shared} />
      ) : (
        <input id={id} name={name} type={type} required={required} className={shared} />
      )}
    </div>
  )
}
