import { useEffect, useRef, useState } from 'react'
import { getStations } from '../api/client'
import type { StationResponse } from '../api/types'
import { TextInput } from './Input'

interface StationAutocompleteProps {
  value: string
  onChange: (name: string) => void
  onSelect?: (station: StationResponse) => void
  placeholder?: string
}

export function StationAutocomplete({ value, onChange, onSelect, placeholder }: StationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<StationResponse[]>([])
  const [open, setOpen] = useState(false)
  const skipNextQuery = useRef(false)

  useEffect(() => {
    // Picking a suggestion sets the value to the station name; don't immediately
    // re-query for that exact name.
    if (skipNextQuery.current) {
      skipNextQuery.current = false
      return
    }
    const trimmed = value.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timeout = setTimeout(() => {
      getStations(trimmed)
        .then((result) => {
          if (!cancelled) {
            setSuggestions(result)
            setOpen(true)
          }
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [value])

  function select(station: StationResponse) {
    skipNextQuery.current = true
    onChange(station.name)
    onSelect?.(station)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <TextInput
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder ?? 'Search station...'}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-surface shadow-lg">
          {suggestions.map((station) => (
            <li key={station.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(station)}
                className="block w-full px-3 py-2 text-left text-sm text-fg hover:bg-subtle"
              >
                {station.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
