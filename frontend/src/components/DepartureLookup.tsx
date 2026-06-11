import { useEffect, useState } from 'react'
import { getDepartures, getStations } from '../api/client'
import type { DepartureResponse, StationResponse } from '../api/types'
import { Field } from './Field'

const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-base'

interface DepartureLookupProps {
  onSelect: (departure: DepartureResponse) => void
}

function formatTime(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function DepartureLookup({ onSelect }: DepartureLookupProps) {
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<StationResponse[]>([])
  const [station, setStation] = useState<StationResponse | null>(null)
  const [departures, setDepartures] = useState<DepartureResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (station) return
    let cancelled = false
    const timeout = setTimeout(() => {
      const trimmed = query.trim()
      if (trimmed.length < 2) {
        if (!cancelled) setStations([])
        return
      }
      getStations(trimmed)
        .then((result) => {
          if (!cancelled) setStations(result)
        })
        .catch(() => {
          if (!cancelled) setStations([])
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, station])

  useEffect(() => {
    if (!station) return
    let cancelled = false
    getDepartures(station.name, 8)
      .then((result) => {
        if (!cancelled) {
          setDepartures(result)
          setError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [station])

  function selectStation(selected: StationResponse) {
    setStation(selected)
    setQuery(selected.name)
    setStations([])
    setDepartures(null)
    setError(false)
  }

  function clearStation() {
    setStation(null)
    setQuery('')
    setDepartures(null)
    setError(false)
  }

  return (
    <fieldset className="space-y-3 rounded-md border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-slate-700">Live departures</legend>

      <Field label="Station">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setStation(null)
            }}
            placeholder="Search station..."
            className={inputClass}
          />
          {stations.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
              {stations.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => selectStation(suggestion)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    {suggestion.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      {station && (
        <button type="button" onClick={clearStation} className="text-sm text-slate-500 underline">
          Clear
        </button>
      )}

      {error && <p className="text-sm text-red-600">Could not load departures.</p>}

      {station && departures === null && !error && (
        <p className="text-sm text-slate-500">Loading departures...</p>
      )}

      {departures !== null && departures.length === 0 && (
        <p className="text-sm text-slate-500">No upcoming departures.</p>
      )}

      {departures !== null && departures.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
          {departures.map((departure, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelect(departure)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100"
              >
                <span>
                  <span className="font-medium">{departure.line ?? departure.trainNumber}</span>
                  {' to '}
                  {departure.destination}
                  {departure.platform ? ` (Platform ${departure.platform})` : ''}
                </span>
                <span className="text-slate-500">{formatTime(departure.departureTime)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
