import { Section } from './Section'

export interface StatItem {
  label: string
  count: number
}

export function StatList({ title, items }: { title: string; items: StatItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <Section title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-dim">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span className="w-32 shrink-0 truncate">{item.label}</span>
              <div className="h-2 flex-1 rounded-full bg-subtle">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-dim">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
