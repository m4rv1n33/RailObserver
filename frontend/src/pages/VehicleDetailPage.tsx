import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVehicleDetail, updateVehicle } from '../api/client'
import type { VehicleDetailResponse } from '../api/types'
import { ChipList } from '../components/ChipList'
import { Section } from '../components/Section'
import { Textarea } from '../components/Input'
import { Button } from '../components/Button'

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
      <Link to="/sightings" className="text-sm text-slate-500 hover:text-slate-700">
        &larr; Back
      </Link>

      {error && <p className="mt-4 text-sm text-red-600">Could not load vehicle.</p>}

      {vehicle === null && !error && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {vehicle && (
        <>
          <h2 className="mt-2 text-lg font-semibold">{vehicle.number}</h2>
          {vehicle.vehicleType && (
            <p className="mt-1 text-sm text-slate-500">{vehicle.vehicleType.name}</p>
          )}
          {(vehicle.operator || vehicle.manufacturer) && (
            <p className="mt-1 text-sm text-slate-500">
              {[vehicle.operator, vehicle.manufacturer].filter(Boolean).join(' · ')}
            </p>
          )}

          <Section title="Observation history">
            <p className="text-sm text-slate-500">
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
          </Section>

          <Section title="Observed services">
            <ChipList
              items={vehicle.observedServices.map((service) => ({ key: service, label: service }))}
              emptyText="No services recorded yet."
            />
          </Section>

          <Section title="Observed locations">
            <ChipList
              items={vehicle.observedLocations.map((location) => ({ key: location, label: location }))}
              emptyText="No locations recorded yet."
            />
          </Section>

          <Section title="Notes">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Siemens obstacle detection system installed for testing"
              className="text-sm"
            />
            <Button
              onClick={() => void saveNotes()}
              disabled={saveStatus === 'saving'}
              className="mt-2 px-4 py-2 text-sm font-semibold"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save notes'}
            </Button>
            {saveStatus === 'saved' && (
              <p className="mt-2 text-sm text-emerald-600">Notes saved.</p>
            )}
            {saveStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600">Could not save notes. Try again.</p>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
