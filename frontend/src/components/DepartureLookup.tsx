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
  const [departures, setDepartures] = useState<DepartureResponse[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    const trimmed = station.trim()
    if (!trimmed) {
      setDepartures(null)
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    getDepartures(trimmed, 8, when)
      .then((result) => {
        if (!cancelled) {
          setDepartures(result)
          setStatus('idle')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [station, when])

  if (!station.trim()) {
    return <p className="text-sm text-dim">Pick a station to list its departures.</p>
  }

  return (
    <div className="space-y-2">
      {status === 'loading' && <p className="text-sm text-dim">Loading departures...</p>}
      {status === 'error' && <p className="text-sm text-danger">Could not load departures.</p>}

      {status === 'idle' && departures !== null && departures.length === 0 && (
        <p className="text-sm text-dim">No departures around this time.</p>
      )}

      {departures !== null && departures.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line">
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
