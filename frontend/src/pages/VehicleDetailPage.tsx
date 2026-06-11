import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVehicleDetail, updateVehicle } from '../api/client'
import type { VehicleDetailResponse } from '../api/types'

function ChipList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
  }
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {item}
        </span>
      ))}
    </div>
  )
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<VehicleDetailResponse | null>(null)
  const [error, setError] = useState(false)
  const [notes, setNotes] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (!id) return
    getVehicleDetail(Number(id))
      .then((data) => {
        setVehicle(data)
        setNotes(data.notes ?? '')
      })
      .catch(() => setError(true))
  }, [id])

  async function saveNotes() {
    if (!id) return
    setSaveStatus('saving')
    try {
      await updateVehicle(Number(id), { notes: notes.trim() === '' ? null : notes })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  return (
    <div className="p-4">
      <Link to="/sightings" className="text-sm text-slate-500">
        Back
      </Link>

      {error && <p className="mt-4 text-sm text-red-600">Could not load vehicle.</p>}

      {vehicle === null && !error && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {vehicle && (
        <>
          <h2 className="mt-2 text-base font-semibold">{vehicle.number}</h2>
          {vehicle.vehicleType && (
            <p className="mt-1 text-sm text-slate-500">{vehicle.vehicleType.name}</p>
          )}
          {(vehicle.operator || vehicle.manufacturer) && (
            <p className="mt-1 text-sm text-slate-500">
              {[vehicle.operator, vehicle.manufacturer].filter(Boolean).join(' · ')}
            </p>
          )}

          <section className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Observation history</h3>
            <p className="mt-1 text-sm text-slate-500">
              {vehicle.sightingCount} sighting{vehicle.sightingCount === 1 ? '' : 's'}
            </p>
            {vehicle.firstSeen && (
              <p className="mt-1 text-sm text-slate-500">
                First seen: {new Date(vehicle.firstSeen).toLocaleString()}
              </p>
            )}
            {vehicle.lastSeen && (
              <p className="mt-1 text-sm text-slate-500">
                Last seen: {new Date(vehicle.lastSeen).toLocaleString()}
              </p>
            )}
          </section>

          <section className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Observed services</h3>
            <ChipList items={vehicle.observedServices} emptyText="No services recorded yet." />
          </section>

          <section className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Observed locations</h3>
            <ChipList items={vehicle.observedLocations} emptyText="No locations recorded yet." />
          </section>

          <section className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Siemens obstacle detection system installed for testing"
              className="mt-2 w-full rounded-md border border-slate-300 p-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void saveNotes()}
              disabled={saveStatus === 'saving'}
              className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save notes'}
            </button>
            {saveStatus === 'saved' && (
              <p className="mt-2 text-sm text-emerald-600">Notes saved.</p>
            )}
            {saveStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">Could not save notes. Try again.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
