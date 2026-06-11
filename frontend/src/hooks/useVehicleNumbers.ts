import { useState } from 'react'

export function useVehicleNumbers() {
  const [numbers, setNumbers] = useState<string[]>([])
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed) return
    setNumbers((prev) => [...prev, trimmed])
    setInput('')
  }

  function remove(index: number) {
    setNumbers((prev) => prev.filter((_, i) => i !== index))
  }

  function reset() {
    setNumbers([])
    setInput('')
  }

  function all(): string[] {
    return [...numbers, ...(input.trim() ? [input.trim()] : [])]
  }

  return { numbers, input, setInput, add, remove, reset, all }
}
