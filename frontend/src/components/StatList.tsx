export interface StatItem {
  label: string
  count: number
}

export function StatList({ title, items }: { title: string; items: StatItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span className="w-32 shrink-0 truncate">{item.label}</span>
              <div className="h-2 flex-1 rounded bg-slate-100">
                <div
                  className="h-2 rounded bg-slate-900"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-slate-500">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
