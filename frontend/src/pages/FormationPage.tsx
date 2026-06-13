import { useState } from 'react'
import { getFormation } from '../api/client'
import type { DepartureResponse, FormationResponse } from '../api/types'
import { DepartureLookup } from '../components/DepartureLookup'
import { StationAutocomplete } from '../components/StationAutocomplete'
import { FormationDiagram } from '../components/FormationDiagram'
import { Field } from '../components/Field'
import { TextInput } from '../components/Input'
import { Button } from '../components/Button'
import { toDateOnly } from '../lib/datetime'

export function FormationPage() {
  const [trainNumber, setTrainNumber] = useState('')
  const [date, setDate] = useState(() => toDateOnly(new Date()))
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
    setDate(departureDate)
    if (departure.operator) setOperator(departure.operator)
    void lookup(train, departureDate, departure.operator ?? operator)
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Formation</h2>
      <p className="mt-1 text-sm text-slate-500">Look up the carriage formation of a train.</p>

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
          <DepartureLookup station={lookupStation} when={`${date}T12:00`} onSelect={applyDeparture} />
        )}

        <Field label="Train number">
          <TextInput type="text" value={trainNumber} onChange={(event) => setTrainNumber(event.target.value)} />
        </Field>

        <Field label="Date">
          <TextInput type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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
          <p className="text-sm text-slate-500">No formation data for this train.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600">Could not load formation. Try again.</p>
        )}
        {status === 'done' && formation && <FormationDiagram formation={formation} />}
      </div>
    </div>
  )
}
