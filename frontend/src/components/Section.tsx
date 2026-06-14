import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <div className="mt-2 rounded-xl border border-line bg-surface p-3 shadow-sm">{children}</div>
    </section>
  )
}
