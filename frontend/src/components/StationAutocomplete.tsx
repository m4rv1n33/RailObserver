import { useEffect, useRef, useState } from 'react'
import { getStations } from '../api/client'
import type { StationResponse } from '../api/types'
import { TextInput } from './Input'

// Roughly three suggestion rows. Less room than this below the field and the
// list opens upwards instead.
const DROPDOWN_MIN_SPACE = 160

interface StationAutocompleteProps {
  value: string
  onChange: (name: string) => void
  onSelect?: (station: StationResponse) => void
  placeholder?: string
}

export function StationAutocomplete({ value, onChange, onSelect, placeholder }: StationAutocompleteProps) {
  const [result, setResult] = useState<StationResponse[] | null>(null)
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const skipNextQuery = useRef(false)

  const trimmed = value.trim()
  // Derived rather than cleared from the effect. Too short a query hides the
  // list; otherwise the last result stays up while the next one is in flight,
  // so the dropdown does not flicker on every keystroke.
  const suggestions = trimmed.length < 2 ? [] : (result ?? [])

  useEffect(() => {
    // Picking a suggestion sets the value to the station name; don't immediately
    // re-query for that exact name.
    if (skipNextQuery.current) {
      skipNextQuery.current = false
      return
    }
    if (trimmed.length < 2) return

    let cancelled = false
    const timeout = setTimeout(() => {
      getStations(trimmed)
        .then((stations) => {
          if (!cancelled) {
            setResult(stations)
            setOpen(true)
          }
        })
        .catch(() => {
          if (!cancelled) setResult([])
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [trimmed])

  // The keyboard takes the lower half of the screen, which is exactly where a
  // suggestion list under the field would land. Flip it above the field when
  // the visible viewport has no room left below.
  useEffect(() => {
    if (!open || suggestions.length === 0) return
    const element = wrapper.current
    if (!element) return
    const viewport = window.visualViewport
    const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
    setDropUp(visibleBottom - element.getBoundingClientRect().bottom < DROPDOWN_MIN_SPACE)
  }, [open, suggestions.length, value])

  function select(station: StationResponse) {
    skipNextQuery.current = true
    onChange(station.name)
    onSelect?.(station)
    setResult(null)
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapper}>
      <TextInput
        type="text"
        value={value}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder ?? 'Search station...'}
      />
      {open && suggestions.length > 0 && (
        <ul
          className={`absolute z-20 max-h-56 w-full overflow-auto overscroll-contain rounded-md border border-line bg-surface shadow-lg ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {suggestions.map((station) => (
            <li key={station.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(station)}
                className="block w-full px-3 py-3 text-left text-sm text-fg hover:bg-subtle"
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
