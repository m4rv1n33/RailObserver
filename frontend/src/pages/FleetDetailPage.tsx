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
      <Link to="/fleets" className="text-sm text-dim hover:text-fg">
        &larr; Back to fleets
      </Link>

      {error && <p className="mt-4 text-sm text-danger">Could not load fleet.</p>}

      {fleet === null && !error && <p className="mt-4 text-sm text-dim">Loading...</p>}

      {fleet && (
        <>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">{fleet.name}</h2>
          {fleet.family && <p className="mt-1 text-sm text-dim">{fleet.family}</p>}
          <p className="mt-1 text-sm text-dim">
            Seen {fleet.seenCount}
            {fleet.fleetSize !== null ? ` / ${fleet.fleetSize}` : ''}
            {fleet.fleetSize !== null ? ` (${fleet.missingCount} missing)` : ''}
          </p>
          {fleet.fleetSize !== null && (
            <div className="mt-2 h-2 bg-subtle">
              <div
                className="h-2 bg-accent"
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
