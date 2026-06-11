import { Link } from 'react-router-dom'

export interface ChipItem {
  key: string
  label: string
  to?: string
}

interface ChipListProps {
  title?: string
  items: ChipItem[]
  emptyText: string
}

export function ChipList({ title, items, emptyText }: ChipListProps) {
  const content =
    items.length === 0 ? (
      <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
    ) : (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) =>
          item.to ? (
            <Link
              key={item.key}
              to={item.to}
              className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white"
            >
              {item.label}
            </Link>
          ) : (
            <span key={item.key} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {item.label}
            </span>
          ),
        )}
      </div>
    )

  if (!title) return content

  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {content}
    </section>
  )
}
