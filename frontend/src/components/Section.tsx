import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="font-mono text-xs uppercase tracking-widest text-faint">{title}</h3>
      <div className="mt-2 border border-line bg-surface p-4">{children}</div>
    </section>
  )
}
