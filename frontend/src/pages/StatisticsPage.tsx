import { useEffect, useState } from 'react'
import {
  getMostSeenFleets,
  getMostSeenVehicles,
  getMostVisitedStations,
  getSightingsByFamily,
  getSightingsByMonth,
  getSightingsByOperator,
} from '../api/client'
import { StatList } from '../components/StatList'
import type { StatItem } from '../components/StatList'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface Statistics {
  vehicles: StatItem[]
  fleets: StatItem[]
  stations: StatItem[]
  families: StatItem[]
  operators: StatItem[]
  monthly: StatItem[]
}

export function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      getMostSeenVehicles(),
      getMostSeenFleets(),
      getMostVisitedStations(),
      getSightingsByFamily(),
      getSightingsByOperator(),
      getSightingsByMonth(),
    ])
      .then(([vehicles, fleets, stations, families, operators, monthly]) => {
        setStats({
          vehicles: vehicles.map((v) => ({
            label: v.vehicleTypeName ? `${v.number} (${v.vehicleTypeName})` : v.number,
            count: v.count,
          })),
          fleets: fleets.map((f) => ({ label: f.name, count: f.count })),
          stations: stations.map((s) => ({ label: s.station, count: s.count })),
          families: families.map((f) => ({ label: f.family, count: f.count })),
          operators: operators.map((o) => ({ label: o.operator, count: o.count })),
          monthly: monthly.map((m) => ({
            label: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
            count: m.count,
          })),
        })
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Statistics</h2>
      <p className="mt-1 text-sm text-dim">Overview of your sightings.</p>

      {error && <p className="mt-4 text-sm text-danger">Could not load statistics.</p>}

      {stats === null && !error && <p className="mt-4 text-sm text-dim">Loading...</p>}

      {stats && (
        <>
          <StatList title="Most seen vehicles" items={stats.vehicles} />
          <StatList title="Most seen fleets" items={stats.fleets} />
          <StatList title="Most visited stations" items={stats.stations} />
          <StatList title="Sightings by family" items={stats.families} />
          <StatList title="Sightings by operator" items={stats.operators} />
          <StatList title="Sightings per month" items={stats.monthly} />
        </>
      )}
    </div>
  )
}
