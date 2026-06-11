import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createSighting } from '../api/client'

export function QuickPage() {
  const [numbers, setNumbers] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function addNumber() {
    const trimmed = input.trim()
    if (!trimmed) return
    setNumbers((prev) => [...prev, trimmed])
    setInput('')
  }

  function removeNumber(index: number) {
    setNumbers((prev) => prev.filter((_, i) => i !== index))
  }

  async function save() {
    const vehicleNumbers = [...numbers, ...(input.trim() ? [input.trim()] : [])]
    if (vehicleNumbers.length === 0) return

    setStatus('saving')
    try {
      await createSighting({ vehicleNumbers })
      setNumbers([])
      setInput('')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void save()
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Quick</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter a vehicle number and save. Add more for a composition.
      </p>

      {numbers.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {numbers.map((number, index) => (
            <li
              key={`${number}-${index}`}
              className="flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-sm"
            >
              {number}
              <button
                type="button"
                onClick={() => removeNumber(index)}
                className="text-slate-500"
                aria-label={`Remove ${number}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Vehicle number"
          className="flex-1 rounded-md border border-slate-300 px-3 py-3 text-lg"
        />
        <button
          type="button"
          onClick={addNumber}
          disabled={!input.trim()}
          className="rounded-md border border-slate-300 px-4 text-lg font-medium text-slate-600 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={status === 'saving' || (numbers.length === 0 && !input.trim())}
        className="mt-4 w-full rounded-md bg-slate-900 py-3 text-lg font-semibold text-white disabled:opacity-40"
      >
        {status === 'saving' ? 'Saving...' : 'Save sighting'}
      </button>

      {status === 'saved' && <p className="mt-3 text-sm text-emerald-600">Sighting saved.</p>}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">Could not save sighting. Try again.</p>
      )}
    </div>
  )
}
