import { usePersistentState } from './usePersistentState'

export function useVehicleNumbers(storageKey: string) {
  const [numbers, setNumbers] = usePersistentState<string[]>(`${storageKey}:numbers`, [])
  const [input, setInput] = usePersistentState<string>(`${storageKey}:input`, '')

  function add() {
    const trimmed = input.trim()
    if (!trimmed) return
    setNumbers((prev) => [...prev, trimmed])
    setInput('')
  }

  function remove(index: number) {
    setNumbers((prev) => prev.filter((_, i) => i !== index))
  }

  function set(next: string[]) {
    setNumbers(next)
    setInput('')
  }

  function reset() {
    setNumbers([])
    setInput('')
  }

  function all(): string[] {
    return [...numbers, ...(input.trim() ? [input.trim()] : [])]
  }

  return { numbers, input, setInput, add, remove, set, reset, all }
}
