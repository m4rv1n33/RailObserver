import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import 'leaflet.heat'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { getFleets, getSightingLocations, getVehicles } from '../api/client'
import type { FleetSummaryResponse, SightingLocationResponse, VehicleResponse } from '../api/types'
import { Field } from '../components/Field'
import { Select, TextInput } from '../components/Input'
import { Button } from '../components/Button'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

const SWITZERLAND_CENTER: L.LatLngTuple = [46.8182, 8.2275]
const DEFAULT_ZOOM = 8

type ViewMode = 'markers' | 'heatmap'

function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString()
}

function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString()
}

function buildPopupContent(location: SightingLocationResponse): HTMLElement {
  const container = document.createElement('div')
  container.className = 'text-sm'

  const title = document.createElement('strong')
  title.textContent = location.station ?? 'Unknown location'
  container.appendChild(title)

  container.appendChild(document.createElement('br'))
  container.appendChild(document.createTextNode(new Date(location.observedAt).toLocaleString()))

  if (location.vehicleNumbers.length > 0) {
    container.appendChild(document.createElement('br'))
    container.appendChild(document.createTextNode(location.vehicleNumbers.join(', ')))
  }

  return container
}

function MarkerClusterLayer({ locations }: { locations: SightingLocationResponse[] }) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup()
    for (const location of locations) {
      if (location.latitude === null || location.longitude === null) continue
      const marker = L.marker([location.latitude, location.longitude])
      marker.bindPopup(buildPopupContent(location))
      cluster.addLayer(marker)
    }
    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
    }
  }, [map, locations])

  return null
}

function HeatmapLayer({ locations }: { locations: SightingLocationResponse[] }) {
  const map = useMap()

  useEffect(() => {
    const points: L.HeatLatLngTuple[] = locations
      .filter((location) => location.latitude !== null && location.longitude !== null)
      .map((location) => [location.latitude as number, location.longitude as number, 1])

    const heat = L.heatLayer(points, { radius: 25 })
    map.addLayer(heat)
    return () => {
      map.removeLayer(heat)
    }
  }, [map, locations])

  return null
}

function FitBounds({ locations }: { locations: SightingLocationResponse[] }) {
  const map = useMap()

  useEffect(() => {
    const points = locations
      .filter((location) => location.latitude !== null && location.longitude !== null)
      .map((location) => L.latLng(location.latitude as number, location.longitude as number))

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32] })
    }
  }, [map, locations])

  return null
}

export function MapPage() {
  const [locations, setLocations] = useState<SightingLocationResponse[] | null>(null)
  const [error, setError] = useState(false)
  const [fleets, setFleets] = useState<FleetSummaryResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [fleetId, setFleetId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('markers')

  useEffect(() => {
    getFleets().then(setFleets).catch(() => {})
    getVehicles().then(setVehicles).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    getSightingLocations({
      fleetId: fleetId ? Number(fleetId) : undefined,
      vehicleId: vehicleId ? Number(vehicleId) : undefined,
      from: from ? startOfDayIso(from) : undefined,
      to: to ? endOfDayIso(to) : undefined,
    })
      .then((data) => {
        if (cancelled) return
        setLocations(data)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [fleetId, vehicleId, from, to])

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Map</h2>
      <p className="mt-1 text-sm text-dim">Where you have seen vehicles.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Fleet">
          <Select value={fleetId} onChange={(event) => setFleetId(event.target.value)}>
            <option value="">All fleets</option>
            {fleets.map((fleet) => (
              <option key={fleet.id} value={fleet.id}>
                {fleet.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Vehicle">
          <Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
            <option value="">All vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.number}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="From">
          <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>

        <Field label="To">
          <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant={viewMode === 'markers' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('markers')}
          className="flex-1 px-3 py-2 text-sm font-medium"
        >
          Markers
        </Button>
        <Button
          variant={viewMode === 'heatmap' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('heatmap')}
          className="flex-1 px-3 py-2 text-sm font-medium"
        >
          Heatmap
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-danger">Could not load sighting locations.</p>}

      <div className="mt-4 h-[60vh] overflow-hidden rounded-md border border-line">
        <MapContainer center={SWITZERLAND_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations && viewMode === 'markers' && <MarkerClusterLayer locations={locations} />}
          {locations && viewMode === 'heatmap' && <HeatmapLayer locations={locations} />}
          {locations && <FitBounds locations={locations} />}
        </MapContainer>
      </div>

      {locations !== null && locations.length === 0 && (
        <p className="mt-2 text-sm text-dim">No located sightings match these filters.</p>
      )}
    </div>
  )
}
