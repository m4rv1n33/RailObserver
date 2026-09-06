import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteSighting, getSightings } from '../api/client'
import type { ServiceInfoResponse, SightingResponse, VehicleResponse } from '../api/types'
import { Button } from '../components/Button'
import { PageHeading } from '../components/PageHeading'

function formatVehicle(vehicle: VehicleResponse): string {
  return vehicle.vehicleType ? `${vehicle.number} (${vehicle.vehicleType.name})` : vehicle.number
}

function formatService(service: ServiceInfoResponse): string {
  const parts: string[] = []
  if (service.line) parts.push(service.line)
  if (service.trainNumber) parts.push(service.trainNumber)
  if (service.destination) parts.push(`to ${service.destination}`)
  return parts.join(' · ')
}

export function SightingsPage() {
  const [sightings, setSightings] = useState<SightingResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getSightings()
      .then(setSightings)
      .catch(() => setError(true))
  }, [])

  async function handleDelete(id: number) {
    try {
      await deleteSighting(id)
      setSightings((prev) => prev?.filter((sighting) => sighting.id !== id) ?? null)
    } catch {
      setError(true)
    }
  }

  return (
    <div className="p-4">
      <PageHeading
        index="03"
        label="Sightings"
        title="Sightings"
        subtitle="Your recent sightings."
      />

      {error && <p className="mt-4 text-sm text-danger">Could not load sightings.</p>}

      {sightings === null && !error && (
        <p className="mt-4 text-sm text-dim">Loading...</p>
      )}

      {sightings !== null && sightings.length === 0 && (
        <p className="mt-4 text-sm text-dim">No sightings yet.</p>
      )}

      {sightings !== null && sightings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {sightings.map((sighting) => (
            <li
              key={sighting.id}
              className="flex items-start justify-between gap-2 border border-line border-l-2 border-l-accent bg-surface p-3"
            >
              <div>
                <Link to={`/sightings/${sighting.id}`} className="font-num text-xs text-dim hover:text-fg">
                  {new Date(sighting.observedAt).toLocaleString()}
                  {sighting.formation && <span className="ml-1 font-sans text-faint">· formation</span>}
                </Link>
                <p className="mt-0.5 font-num font-medium">
                  {sighting.vehicles.map((vehicle, index) => (
                    <span key={vehicle.id}>
                      {index > 0 && ', '}
                      <Link to={`/vehicles/${vehicle.id}`} className="text-accent hover:underline">
                        {formatVehicle(vehicle)}
                      </Link>
                    </span>
                  ))}
                </p>
                {(sighting.station || sighting.direction) && (
                  <p className="text-sm text-dim">
                    {[sighting.station, sighting.direction].filter(Boolean).join(' · ')}
                  </p>
                )}
                {sighting.service && (
                  <p className="text-sm text-dim">{formatService(sighting.service)}</p>
                )}
                {sighting.notes && <p className="mt-1 text-sm">{sighting.notes}</p>}
              </div>
              <Button
                variant="danger"
                onClick={() => void handleDelete(sighting.id)}
                className="shrink-0 px-2 py-1 text-sm font-medium"
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
