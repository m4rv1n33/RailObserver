import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFleet } from '../api/client'
import type { FleetDetailResponse } from '../api/types'
import { ChipList } from '../components/ChipList'
import { Section } from '../components/Section'

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
      <Link to="/fleets" className="text-sm text-slate-500 hover:text-slate-700">
        &larr; Back to fleets
      </Link>

      {error && <p className="mt-4 text-sm text-red-600">Could not load fleet.</p>}

      {fleet === null && !error && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {fleet && (
        <>
          <h2 className="mt-2 text-lg font-semibold">{fleet.name}</h2>
          {fleet.family && <p className="mt-1 text-sm text-slate-500">{fleet.family}</p>}
          <p className="mt-1 text-sm text-slate-500">
            Seen {fleet.seenCount}
            {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
            {fleet.fleetSize !== null ? ` (${fleet.missingCount} missing)` : ''}
          </p>
          {fleet.fleetSize !== null && (
            <div className="mt-2 h-2 rounded bg-slate-100">
              <div
                className="h-2 rounded bg-slate-900"
                style={{ width: `${Math.min(fleet.seenCount / fleet.fleetSize, 1) * 100}%` }}
              />
            </div>
          )}

          <Section title="Seen">
            <ChipList
              items={fleet.seenVehicles.map((v) => ({
                key: v.number,
                label: v.number,
                to: `/vehicles/${v.id}`,
              }))}
              emptyText="None seen yet."
            />
          </Section>
          <Section title="Missing">
            <ChipList
              items={fleet.missingNumbers.map((number) => ({ key: number, label: number }))}
              emptyText="None missing."
            />
          </Section>
        </>
      )}
    </div>
  )
}
