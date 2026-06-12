import { Link } from 'react-router-dom'

export interface ChipItem {
  key: string
  label: string
  to?: string
}

interface ChipListProps {
  items: ChipItem[]
  emptyText: string
}

export function ChipList({ items, emptyText }: ChipListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
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
}
