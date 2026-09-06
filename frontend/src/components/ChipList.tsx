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

const chipClass = 'border px-2.5 py-1 font-num text-xs transition-colors'

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
            className={`${chipClass} border-subtle2 bg-surface text-fg hover:border-accent hover:text-accent`}
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.key} className={`${chipClass} border-line bg-canvas text-faint`}>
            {item.label}
          </span>
        ),
      )}
    </div>
  )
}
