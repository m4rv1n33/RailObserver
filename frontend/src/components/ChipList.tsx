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
    return <p className="text-sm text-dim">{emptyText}</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) =>
        item.to ? (
          <Link
            key={item.key}
            to={item.to}
            className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.key} className="rounded-md bg-subtle px-2 py-1 text-xs font-medium text-dim">
            {item.label}
          </span>
        ),
      )}
    </div>
  )
}
