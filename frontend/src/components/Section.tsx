import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">{children}</div>
    </section>
  )
}
