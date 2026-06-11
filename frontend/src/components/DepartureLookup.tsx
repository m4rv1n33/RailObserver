import { useEffect, useState } from 'react'
import { getDepartures, getStations } from '../api/client'
import type { DepartureResponse, StationResponse } from '../api/types'
import { Field } from './Field'
import { TextInput } from './Input'
import { Button } from './Button'

interface DepartureLookupProps {
  onSelect: (departure: DepartureResponse) => void
  initialQuery?: string
}

function formatTime(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function DepartureLookup({ onSelect, initialQuery = '' }: DepartureLookupProps) {
  const [expanded, setExpanded] = useState(false)
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

  function toggle() {
    if (!expanded && query.trim() === '' && initialQuery.trim() !== '') {
      setQuery(initialQuery)
    }
    setExpanded((prev) => !prev)
  }

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

  function selectDeparture(departure: DepartureResponse) {
    onSelect(departure)
    setExpanded(false)
  }

  return (
    <div>
      <Button variant="secondary" onClick={toggle} className="w-full px-3 py-2 text-sm font-medium">
        {expanded ? 'Hide timetable lookup' : 'Look up from timetable'}
      </Button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <Field label="Station">
            <div className="relative">
              <TextInput
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setStation(null)
                }}
                placeholder="Search station..."
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
            <Button variant="ghost" onClick={clearStation} className="text-sm underline">
              Clear
            </Button>
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
                    onClick={() => selectDeparture(departure)}
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
        </div>
      )}
    </div>
  )
}
