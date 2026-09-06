import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSighting } from '../api/client'
import type { ServiceInfoResponse, SightingResponse } from '../api/types'
import { FormationDiagram } from '../components/FormationDiagram'
import { Section } from '../components/Section'

function formatService(service: ServiceInfoResponse): string {
  const parts: string[] = []
  if (service.line) parts.push(service.line)
  if (service.trainNumber) parts.push(service.trainNumber)
  if (service.destination) parts.push(`to ${service.destination}`)
  return parts.join(' · ')
}

export function SightingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [sighting, setSighting] = useState<SightingResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    getSighting(Number(id))
      .then(setSighting)
      .catch(() => setError(true))
  }, [id])

  return (
    <div className="p-4">
      <Link to="/sightings" className="text-sm text-dim hover:text-fg">
        &larr; Back
      </Link>

      {error && <p className="mt-4 text-sm text-danger">Could not load sighting.</p>}

      {sighting === null && !error && <p className="mt-4 text-sm text-dim">Loading...</p>}

      {sighting && (
        <>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            {new Date(sighting.observedAt).toLocaleString()}
          </h2>
          {(sighting.station || sighting.direction) && (
            <p className="mt-1 text-sm text-dim">
              {[sighting.station, sighting.direction].filter(Boolean).join(' · ')}
            </p>
          )}
          {sighting.service && (
            <p className="mt-1 text-sm text-dim">{formatService(sighting.service)}</p>
          )}

          <Section title="Vehicles">
            <ul className="space-y-1 text-sm">
              {sighting.vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <Link to={`/vehicles/${vehicle.id}`} className="underline">
                    {vehicle.vehicleType ? `${vehicle.number} (${vehicle.vehicleType.name})` : vehicle.number}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          {sighting.formation && (
            <Section title="Formation">
              <FormationDiagram formation={sighting.formation} />
            </Section>
          )}

          {sighting.notes && (
            <Section title="Notes">
              <p className="text-sm">{sighting.notes}</p>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
