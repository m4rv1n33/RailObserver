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
      <p className="mt-1 text-sm text-slate-500">Seen vehicles per fleet.</p>

      {error && <p className="mt-4 text-sm text-red-600">Could not load fleets.</p>}

      {fleets === null && !error && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {fleets !== null && fleets.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No fleets yet.</p>
      )}

      {fleets !== null && fleets.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
          {fleets.map((fleet) => {
            const ratio = fleet.fleetSize ? fleet.seenCount / fleet.fleetSize : 0
            return (
              <li key={fleet.id}>
                <Link to={`/fleets/${fleet.id}`} className="block py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{fleet.name}</span>
                    <span className="text-sm text-slate-500">
                      {fleet.seenCount}
                      {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
                    </span>
                  </div>
                  {fleet.fleetSize !== null && (
                    <div className="mt-2 h-2 rounded bg-slate-100">
                      <div
                        className="h-2 rounded bg-slate-900"
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
