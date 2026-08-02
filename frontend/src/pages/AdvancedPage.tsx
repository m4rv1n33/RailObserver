import { useState } from 'react'
import { createSighting, getFormation } from '../api/client'
import type { DepartureResponse, FormationResponse } from '../api/types'
import { useVehicleNumbers } from '../hooks/useVehicleNumbers'
import { VehicleNumberInput } from '../components/VehicleNumberInput'
import { FormationDiagram } from '../components/FormationDiagram'
import { Field } from '../components/Field'
import { DepartureLookup } from '../components/DepartureLookup'
import { StationAutocomplete } from '../components/StationAutocomplete'
import { TextInput, Textarea } from '../components/Input'
import { Button } from '../components/Button'
import { toDateOnly, toDateTimeLocal } from '../lib/datetime'

export function AdvancedPage() {
  const vehicles = useVehicleNumbers()
  const [observedAt, setObservedAt] = useState(toDateTimeLocal(new Date()))
  const [station, setStation] = useState('')
  const [lookupStation, setLookupStation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'error'>('idle')
  const [locationSource, setLocationSource] = useState<'none' | 'station' | 'gps'>('none')
  const [line, setLine] = useState('')
  const [trainNumber, setTrainNumber] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [formationStatus, setFormationStatus] = useState<'idle' | 'detecting' | 'done' | 'empty'>('idle')
  const [formation, setFormation] = useState<FormationResponse | null>(null)

  // Service data comes only from picking a departure, so it is either fully
  // populated or absent.
  const hasService = Boolean(line || trainNumber || destination || departureTime)

  function clearService() {
    setLine('')
    setTrainNumber('')
    setDestination('')
    setDepartureTime('')
    setFormationStatus('idle')
    setFormation(null)
  }

  async function applyDeparture(departure: DepartureResponse) {
    if (departure.line) setLine(departure.line)
    if (departure.trainNumber) setTrainNumber(departure.trainNumber)
    if (departure.destination) setDestination(departure.destination)
    if (departure.departureTime) setDepartureTime(toDateTimeLocal(new Date(departure.departureTime)))

    if (!departure.trainNumber) return
    setFormation(null)
    setFormationStatus('detecting')
    try {
      const date = departure.departureTime ? toDateOnly(new Date(departure.departureTime)) : undefined
      const result = await getFormation(departure.trainNumber, date, departure.operator ?? undefined)
      if (result.units.length === 0 && result.cars.length === 0) {
        setFormationStatus('empty')
        return
      }
      vehicles.set(result.units.map((unit) => unit.number))
      setFormation(result)
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
        setLocationSource('gps')
        setLocationStatus('idle')
      },
      () => setLocationStatus('error'),
    )
  }

  function reset() {
    vehicles.reset()
    setObservedAt(toDateTimeLocal(new Date()))
    setStation('')
    setLookupStation('')
    setLatitude(null)
    setLongitude(null)
    setLocationStatus('idle')
    setLocationSource('none')
    setLine('')
    setTrainNumber('')
    setDestination('')
    setDepartureTime('')
    setNotes('')
    setFormationStatus('idle')
    setFormation(null)
  }

  async function save() {
    const vehicleNumbers = vehicles.all()
    if (vehicleNumbers.length === 0) return

    setStatus('saving')
    try {
      await createSighting({
        observedAt: observedAt ? new Date(observedAt).toISOString() : null,
        station: station.trim() || null,
        latitude,
        longitude,
        notes: notes.trim() || null,
        formation,
        service: hasService
          ? {
              line: line || null,
              trainNumber: trainNumber || null,
              destination: destination || null,
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
    <div className="flex min-h-full flex-col p-4">
      <h2 className="text-xl font-semibold tracking-tight">Advanced</h2>
      <p className="mt-1 text-sm text-dim">Log a sighting with full details.</p>

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
            <p className="mt-1 text-sm text-dim">Detecting formation...</p>
          )}
          {formation && (
            <div className="mt-2">
              <FormationDiagram formation={formation} />
            </div>
          )}
          {formationStatus === 'empty' && (
            <p className="mt-1 text-sm text-dim">No formation data for this train.</p>
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
          <StationAutocomplete
            value={station}
            onChange={setStation}
            onSelect={(selected) => {
              setStation(selected.name)
              setLookupStation(selected.name)
              // A picked station puts the sighting on the map without GPS, but a
              // real GPS fix is more precise and keeps precedence once taken.
              if (
                locationSource !== 'gps' &&
                typeof selected.latitude === 'number' &&
                typeof selected.longitude === 'number'
              ) {
                setLatitude(selected.latitude)
                setLongitude(selected.longitude)
                setLocationSource('station')
              }
            }}
          />
        </Field>

        <Field label="Location">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={captureLocation} className="px-3 py-2 text-sm font-medium">
              {locationStatus === 'locating' ? 'Locating...' : 'Use current location'}
            </Button>
            {latitude !== null && longitude !== null && (
              <span className="text-sm text-dim">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
                {locationSource === 'station' && ' (station)'}
              </span>
            )}
          </div>
          {locationStatus === 'error' && (
            <p className="mt-1 text-sm text-danger">Could not determine location.</p>
          )}
        </Field>

        <fieldset className="space-y-2 rounded-md border border-line p-3">
          <legend className="px-1 text-sm font-medium text-fg">Service</legend>

          {hasService ? (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-medium text-accent">
                  {[line, trainNumber].filter(Boolean).join(' ')}
                </span>
                {destination && <span className="text-dim">{' to '}</span>}
                {destination}
              </span>
              <button type="button" onClick={clearService} className="text-sm text-dim underline">
                Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-dim">Departures for the station and observed time above.</p>
          )}
          <DepartureLookup station={lookupStation} when={observedAt} onSelect={applyDeparture} />
        </fieldset>

        <Field label="Notes">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </Field>
      </div>

      {/* Sticks to the bottom of the scroll container so saving never requires
          scrolling past the departure list. */}
      <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-auto border-t border-line bg-canvas px-4 py-3">
        {status === 'saved' && <p className="mb-2 text-sm text-success">Sighting saved.</p>}
        {status === 'error' && (
          <p className="mb-2 text-sm text-danger">Could not save sighting. Try again.</p>
        )}
        <Button
          onClick={() => void save()}
          disabled={status === 'saving' || vehicles.all().length === 0}
          className="w-full py-3 text-lg font-semibold"
        >
          {status === 'saving' ? 'Saving...' : 'Save sighting'}
        </Button>
      </div>
    </div>
  )
}
