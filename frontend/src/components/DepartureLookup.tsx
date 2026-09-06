import { useEffect, useState } from 'react'
import { getDepartures } from '../api/client'
import type { DepartureResponse } from '../api/types'

interface DepartureLookupProps {
  station: string
  when?: string
  onSelect: (departure: DepartureResponse) => void
}

function formatTime(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function DepartureLookup({ station, when, onSelect }: DepartureLookupProps) {
  // A result carries the query it was fetched for. Comparing that against the
  // current query during render replaces clearing the state from the effect,
  // and makes showing the previous station's board impossible.
  const [result, setResult] = useState<{ key: string; departures: DepartureResponse[] | null } | null>(
    null,
  )

  const trimmed = station.trim()
  const key = `${trimmed}|${when ?? ''}`

  useEffect(() => {
    if (!trimmed) return
    let cancelled = false
    getDepartures(trimmed, 8, when)
      .then((departures) => {
        if (!cancelled) setResult({ key, departures })
      })
      .catch(() => {
        if (!cancelled) setResult({ key, departures: null })
      })
    return () => {
      cancelled = true
    }
  }, [trimmed, when, key])

  if (!trimmed) {
    return <p className="text-sm text-dim">Pick a station to list its departures.</p>
  }

  const current = result !== null && result.key === key ? result : null
  const departures = current?.departures ?? null

  return (
    <div className="space-y-2">
      {current === null && <p className="text-sm text-dim">Loading departures...</p>}
      {current !== null && departures === null && (
        <p className="text-sm text-danger">Could not load departures.</p>
      )}

      {departures !== null && departures.length === 0 && (
        <p className="text-sm text-dim">No departures around this time.</p>
      )}

      {departures !== null && departures.length > 0 && (
        <ul className="max-h-64 divide-y divide-line overflow-y-auto border border-line">
          {departures.map((departure, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelect(departure)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-subtle"
              >
                <span>
                  <span className="font-medium text-accent">
                    {[departure.line, departure.trainNumber].filter(Boolean).join(' ')}
                  </span>
                  <span className="text-dim">{' to '}</span>
                  {departure.destination}
                  {departure.platform ? ` (Pl. ${departure.platform})` : ''}
                </span>
                <span className="text-dim">{formatTime(departure.departureTime)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
