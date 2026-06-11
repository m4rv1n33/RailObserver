import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFleet } from '../api/client'
import type { FleetDetailResponse } from '../api/types'

function ChipList({
  title,
  items,
  emptyText,
}: {
  title: string
  items: { key: string; label: string; to?: string }[]
  emptyText: string
}) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {items.length === 0 ? (
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
              <span
                key={item.key}
                className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {item.label}
              </span>
            ),
          )}
        </div>
      )}
    </section>
  )
}

export function FleetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [fleet, setFleet] = useState<FleetDetailResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    getFleet(Number(id))
      .then(setFleet)
      .catch(() => setError(true))
  }, [id])

  return (
    <div className="p-4">
      <Link to="/fleets" className="text-sm text-slate-500">
        Back to fleets
      </Link>

      {error && <p className="mt-4 text-sm text-red-600">Could not load fleet.</p>}

      {fleet === null && !error && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {fleet && (
        <>
          <h2 className="mt-2 text-base font-semibold">{fleet.name}</h2>
          {fleet.family && <p className="mt-1 text-sm text-slate-500">{fleet.family}</p>}
          <p className="mt-1 text-sm text-slate-500">
            Seen {fleet.seenCount}
            {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
            {fleet.fleetSize !== null ? ` (${fleet.missingCount} missing)` : ''}
          </p>

          <ChipList
            title="Seen"
            items={fleet.seenVehicles.map((v) => ({
              key: v.number,
              label: v.number,
              to: `/vehicles/${v.id}`,
            }))}
            emptyText="None seen yet."
          />
          <ChipList
            title="Missing"
            items={fleet.missingNumbers.map((number) => ({ key: number, label: number }))}
            emptyText="None missing."
          />
        </>
      )}
    </div>
  )
}
