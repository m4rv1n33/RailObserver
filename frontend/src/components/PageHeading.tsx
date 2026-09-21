interface PageHeadingProps {
  index: string
  label: string
  title: string
  subtitle?: string
}

export function PageHeading({ index, label, title, subtitle }: PageHeadingProps) {
  return (
    <div className="mb-4 sm:mb-5">
      <p className="font-mono text-xs uppercase tracking-widest text-faint sm:mb-2">
        <span className="text-accent">{index}</span> / {label}
      </p>
      {/* Below sm the eyebrow is the whole heading. The display title repeats
          the label, the tab bar already names the screen, and together with the
          subtitle they cost a phone roughly one form field of height. */}
      <h2 className="sr-only sm:not-sr-only sm:block sm:text-2xl sm:font-bold sm:tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-1.5 hidden text-sm text-dim sm:block">{subtitle}</p>}
    </div>
  )
}
