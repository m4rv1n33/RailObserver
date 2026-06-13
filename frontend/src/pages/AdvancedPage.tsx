import { useState } from 'react'
import { createSighting, getFormation } from '../api/client'
import type { DepartureResponse } from '../api/types'
import { useVehicleNumbers } from '../hooks/useVehicleNumbers'
import { VehicleNumberInput } from '../components/VehicleNumberInput'
import { Field } from '../components/Field'
import { DepartureLookup } from '../components/DepartureLookup'
import { TextInput, Textarea } from '../components/Input'
import { Button } from '../components/Button'
import { toDateOnly, toDateTimeLocal } from '../lib/datetime'

export function AdvancedPage() {
  const vehicles = useVehicleNumbers()
  const [observedAt, setObservedAt] = useState(() => toDateTimeLocal(new Date()))
  const [station, setStation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'error'>('idle')
  const [line, setLine] = useState('')
  const [trainNumber, setTrainNumber] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [formationStatus, setFormationStatus] = useState<'idle' | 'detecting' | 'done' | 'empty'>('idle')
  const [detected, setDetected] = useState<string[]>([])

  async function applyDeparture(departure: DepartureResponse) {
    if (departure.line) setLine(departure.line)
    if (departure.trainNumber) setTrainNumber(departure.trainNumber)
    if (departure.destination) setDestination(departure.destination)
    if (departure.departureTime) setDepartureTime(toDateTimeLocal(new Date(departure.departureTime)))

    if (!departure.trainNumber) return
    setDetected([])
    setFormationStatus('detecting')
    try {
      const date = departure.departureTime ? toDateOnly(new Date(departure.departureTime)) : undefined
      const formation = await getFormation(departure.trainNumber, date)
      if (formation.length === 0) {
        setFormationStatus('empty')
        return
      }
      vehicles.set(formation.map((vehicle) => vehicle.number))
      setDetected(formation.map((vehicle) => vehicle.detectedFleet ?? vehicle.number))
      setFormationStatus('done')
    } catch {
      setFormationStatus('empty')
    }
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    setLocationStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationStatus('idle')
      },
      () => setLocationStatus('error'),
    )
  }

  function reset() {
    vehicles.reset()
    setObservedAt(toDateTimeLocal(new Date()))
    setStation('')
    setLatitude(null)
    setLongitude(null)
    setLocationStatus('idle')
    setLine('')
    setTrainNumber('')
    setDestination('')
    setDepartureTime('')
    setNotes('')
    setFormationStatus('idle')
    setDetected([])
  }

  async function save() {
    const vehicleNumbers = vehicles.all()
    if (vehicleNumbers.length === 0) return

    const hasService = line.trim() || trainNumber.trim() || destination.trim() || departureTime

    setStatus('saving')
    try {
      await createSighting({
        observedAt: observedAt ? new Date(observedAt).toISOString() : null,
        station: station.trim() || null,
        latitude,
        longitude,
        notes: notes.trim() || null,
        service: hasService
          ? {
              line: line.trim() || null,
              trainNumber: trainNumber.trim() || null,
              destination: destination.trim() || null,
              departureTime: departureTime ? new Date(departureTime).toISOString() : null,
            }
          : null,
        vehicleNumbers,
      })
      reset()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Advanced</h2>
      <p className="mt-1 text-sm text-slate-500">Log a sighting with full details.</p>

      <div className="mt-4 space-y-4">
        <Field label="Vehicles">
          <VehicleNumberInput
            numbers={vehicles.numbers}
            input={vehicles.input}
            onInputChange={vehicles.setInput}
            onAdd={vehicles.add}
            onRemove={vehicles.remove}
          />
          {formationStatus === 'detecting' && (
            <p className="mt-1 text-sm text-slate-500">Detecting formation...</p>
          )}
          {formationStatus === 'done' && (
            <p className="mt-1 text-sm text-emerald-600">Detected from formation: {detected.join(', ')}</p>
          )}
          {formationStatus === 'empty' && (
            <p className="mt-1 text-sm text-slate-500">No formation data for this train.</p>
          )}
        </Field>

        <Field label="Observed at">
          <TextInput
            type="datetime-local"
            value={observedAt}
            onChange={(event) => setObservedAt(event.target.value)}
          />
        </Field>

        <Field label="Station">
          <TextInput type="text" value={station} onChange={(event) => setStation(event.target.value)} />
        </Field>

        <Field label="Location">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={captureLocation} className="px-3 py-2 text-sm font-medium">
              {locationStatus === 'locating' ? 'Locating...' : 'Use current location'}
            </Button>
            {latitude !== null && longitude !== null && (
              <span className="text-sm text-slate-500">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            )}
          </div>
          {locationStatus === 'error' && (
            <p className="mt-1 text-sm text-red-600">Could not determine location.</p>
          )}
        </Field>

        <fieldset className="space-y-4 rounded-md border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium text-slate-700">Service</legend>

          <DepartureLookup onSelect={applyDeparture} initialQuery={station} />

          <Field label="Line">
            <TextInput type="text" value={line} onChange={(event) => setLine(event.target.value)} />
          </Field>

          <Field label="Train number">
            <TextInput type="text" value={trainNumber} onChange={(event) => setTrainNumber(event.target.value)} />
          </Field>

          <Field label="Destination">
            <TextInput type="text" value={destination} onChange={(event) => setDestination(event.target.value)} />
          </Field>

          <Field label="Departure time">
            <TextInput
              type="datetime-local"
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
            />
          </Field>
        </fieldset>

        <Field label="Notes">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </Field>
      </div>

      <Button
        onClick={() => void save()}
        disabled={status === 'saving' || vehicles.all().length === 0}
        className="mt-4 w-full py-3 text-lg font-semibold"
      >
        {status === 'saving' ? 'Saving...' : 'Save sighting'}
      </Button>

      {status === 'saved' && <p className="mt-3 text-sm text-emerald-600">Sighting saved.</p>}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">Could not save sighting. Try again.</p>
      )}
    </div>
  )
}
