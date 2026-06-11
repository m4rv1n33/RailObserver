import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </section>
  )
}
