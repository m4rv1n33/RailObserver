import { useState } from 'react'
import { getFormation } from '../api/client'
import type { DepartureResponse, FormationResponse } from '../api/types'
import { DepartureLookup } from '../components/DepartureLookup'
import { StationAutocomplete } from '../components/StationAutocomplete'
import { FormationDiagram } from '../components/FormationDiagram'
import { Field } from '../components/Field'
import { TextInput } from '../components/Input'
import { Button } from '../components/Button'
import { toDateOnly, toDateTimeLocal } from '../lib/datetime'

export function FormationPage() {
  const [trainNumber, setTrainNumber] = useState('')
  // The formation API works per operating day, but the departure list below needs
  // a time of day, so one datetime field feeds both.
  const [when, setWhen] = useState(() => toDateTimeLocal(new Date()))
  const date = when.slice(0, 10)
  const [operator, setOperator] = useState('')
  const [station, setStation] = useState('')
  const [lookupStation, setLookupStation] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'empty' | 'error'>('idle')
  const [formation, setFormation] = useState<FormationResponse | null>(null)

  async function lookup(train: string, lookupDate?: string, lookupOperator?: string) {
    if (!train.trim()) return
    setFormation(null)
    setStatus('loading')
    try {
      const result = await getFormation(train.trim(), lookupDate, lookupOperator?.trim() || undefined)
      if (result.units.length === 0 && result.cars.length === 0) {
        setStatus('empty')
        return
      }
      setFormation(result)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  function applyDeparture(departure: DepartureResponse) {
    const train = departure.trainNumber ?? ''
    const departureDate = departure.departureTime ? toDateOnly(new Date(departure.departureTime)) : date
    setTrainNumber(train)
    if (departure.departureTime) {
      setWhen(toDateTimeLocal(new Date(departure.departureTime)))
    }
    if (departure.operator) setOperator(departure.operator)
    void lookup(train, departureDate, departure.operator ?? operator)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold tracking-tight">Formation</h2>
      <p className="mt-1 text-sm text-dim">Look up the carriage formation of a train.</p>

      <div className="mt-4 space-y-4">
        <Field label="Find by station (optional)">
          <StationAutocomplete
            value={station}
            onChange={setStation}
            onSelect={(selected) => {
              setStation(selected.name)
              setLookupStation(selected.name)
            }}
          />
        </Field>

        {lookupStation && (
          <DepartureLookup station={lookupStation} when={when} onSelect={applyDeparture} />
        )}

        <Field label="Train number">
          <TextInput type="text" value={trainNumber} onChange={(event) => setTrainNumber(event.target.value)} />
        </Field>

        <Field label="Date and time">
          <TextInput
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
          <p className="mt-1 text-xs text-dim">
            The formation is looked up per day; the time only picks the departures shown above.
          </p>
        </Field>

        <Field label="Operator">
          <TextInput
            type="text"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            placeholder="SBB"
          />
        </Field>

        <Button
          onClick={() => void lookup(trainNumber, date, operator)}
          disabled={status === 'loading' || trainNumber.trim() === ''}
          className="w-full py-3 text-lg font-semibold"
        >
          {status === 'loading' ? 'Loading...' : 'Show formation'}
        </Button>

        {status === 'empty' && (
          <p className="text-sm text-dim">No formation data for this train.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-danger">Could not load formation. Try again.</p>
        )}
        {status === 'done' && formation && <FormationDiagram formation={formation} />}
      </div>
    </div>
  )
}
