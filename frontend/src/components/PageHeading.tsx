interface PageHeadingProps {
  index: string
  label: string
  title: string
  subtitle?: string
}

export function PageHeading({ index, label, title, subtitle }: PageHeadingProps) {
  return (
    <div className="mb-5">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-faint">
        <span className="text-accent">{index}</span> / {label}
      </p>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-dim">{subtitle}</p>}
    </div>
  )
}
