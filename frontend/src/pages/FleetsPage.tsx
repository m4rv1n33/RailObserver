import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFleets } from '../api/client'
import type { FleetSummaryResponse } from '../api/types'

export function FleetsPage() {
  const [fleets, setFleets] = useState<FleetSummaryResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getFleets()
      .then(setFleets)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Fleets</h2>
      <p className="mt-1 text-sm text-dim">Seen vehicles per fleet.</p>

      {error && <p className="mt-4 text-sm text-danger">Could not load fleets.</p>}

      {fleets === null && !error && <p className="mt-4 text-sm text-dim">Loading...</p>}

      {fleets !== null && fleets.length === 0 && (
        <p className="mt-4 text-sm text-dim">No fleets yet.</p>
      )}

      {fleets !== null && fleets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {fleets.map((fleet) => {
            const ratio = fleet.fleetSize ? fleet.seenCount / fleet.fleetSize : 0
            return (
              <li key={fleet.id}>
                <Link
                  to={`/fleets/${fleet.id}`}
                  className="block rounded-xl border border-line bg-surface p-3 shadow-sm transition-colors hover:border-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{fleet.name}</span>
                    <span className="text-sm text-dim">
                      {fleet.seenCount}
                      {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
                    </span>
                  </div>
                  {fleet.fleetSize !== null && (
                    <div className="mt-2 h-2 rounded bg-subtle">
                      <div
                        className="h-2 rounded bg-accent"
                        style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                      />
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
