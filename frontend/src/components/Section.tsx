import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-dim">{title}</h3>
      <div className="mt-2 rounded border border-line bg-surface p-3">{children}</div>
    </section>
  )
}
