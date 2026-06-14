import type { KeyboardEvent } from 'react'

interface VehicleNumberInputProps {
  numbers: string[]
  input: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onEnter?: () => void
  autoFocus?: boolean
}

export function VehicleNumberInput({
  numbers,
  input,
  onInputChange,
  onAdd,
  onRemove,
  onEnter,
  autoFocus,
}: VehicleNumberInputProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onEnter?.()
    }
  }

  return (
    <div>
      {numbers.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {numbers.map((number, index) => (
            <li
              key={`${number}-${index}`}
              className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent"
            >
              {number}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-accent/70 hover:text-accent"
                aria-label={`Remove ${number}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Vehicle number"
          className="flex-1 rounded-md border border-line bg-surface px-3 py-3 text-lg text-fg placeholder:text-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!input.trim()}
          className="rounded-md border border-line px-4 text-lg font-medium text-dim transition-colors hover:bg-subtle hover:text-fg disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
