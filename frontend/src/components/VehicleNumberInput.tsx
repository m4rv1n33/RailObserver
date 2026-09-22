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
              className="flex min-h-9 items-center gap-1 border border-accent/40 bg-accent-soft py-1 pl-2.5 font-num text-sm text-accent"
            >
              {number}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-8 w-8 items-center justify-center text-lg leading-none text-accent/70 hover:text-accent"
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
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          autoFocus={autoFocus}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Vehicle number"
          className="flex-1 rounded-md border border-line bg-surface px-3 py-3 font-num text-lg text-fg placeholder:font-sans placeholder:text-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!input.trim()}
          aria-label="Add vehicle number"
          className="w-14 shrink-0 rounded-md border border-line text-xl font-medium text-dim transition-colors hover:bg-subtle hover:text-fg disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
