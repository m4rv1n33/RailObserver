import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFleets } from '../api/client'
import type { FleetSummaryResponse } from '../api/types'
import { PageHeading } from '../components/PageHeading'

// Only these operators are shown in the fleet list.
const VISIBLE_OPERATORS = ['SBB', 'SBB Cargo', 'SOB', 'Thurbo', 'Railcare']

export function FleetsPage() {
  const [fleets, setFleets] = useState<FleetSummaryResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getFleets()
      .then(setFleets)
      .catch(() => setError(true))
  }, [])

  const visibleFleets = (fleets ?? []).filter(
    (fleet) => fleet.operator !== null && VISIBLE_OPERATORS.includes(fleet.operator),
  )

  return (
    <div className="p-4">
      <PageHeading
        index="04"
        label="Fleets"
        title="Fleets"
        subtitle="Seen vehicles per fleet."
      />

      {error && <p className="mt-4 text-sm text-danger">Could not load fleets.</p>}

      {fleets === null && !error && <p className="mt-4 text-sm text-dim">Loading...</p>}

      {fleets !== null && visibleFleets.length === 0 && (
        <p className="mt-4 text-sm text-dim">No fleets yet.</p>
      )}

      {visibleFleets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {visibleFleets.map((fleet, index) => {
            const ratio = fleet.fleetSize ? fleet.seenCount / fleet.fleetSize : 0
            const operator = fleet.operator ?? 'Other'
            const showHeader = index === 0 || operator !== (visibleFleets[index - 1].operator ?? 'Other')
            return (
              <li key={fleet.id}>
                {showHeader && (
                  <h3
                    className={`mb-2 font-mono text-xs uppercase tracking-widest text-faint ${
                      index === 0 ? '' : 'mt-4'
                    }`}
                  >
                    {operator}
                  </h3>
                )}
                <Link
                  to={`/fleets/${fleet.id}`}
                  className="block border border-line border-l-2 border-l-transparent bg-surface p-3 transition-colors hover:border-accent hover:border-l-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{fleet.name}</span>
                    <span className="font-num text-sm text-dim">
                      {fleet.seenCount}
                      {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
                    </span>
                  </div>
                  {fleet.fleetSize !== null && (
                    <div className="mt-2 h-1.5 bg-subtle">
                      <div
                        className="h-1.5 bg-accent"
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
