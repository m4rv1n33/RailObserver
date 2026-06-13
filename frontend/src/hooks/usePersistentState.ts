import { useEffect, useRef, useState } from 'react'

// useState that survives a page reload by mirroring to localStorage. Mobile
// browsers discard backgrounded tabs/PWAs and reload on return, which would
// otherwise wipe an in-progress sighting draft.
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  // Skip the write on the very first render so a fresh mount does not clobber
  // an existing stored value with the initial.
  const hydrated = useRef(false)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage being unavailable or full
    }
  }, [key, value])

  return [value, setValue] as const
}
