import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSession, logout, setUnauthorizedHandler } from '../api/client'
import type { SessionResponse } from '../api/types'
import { AuthContext } from '../hooks/useAuth'
import { LockScreen } from './LockScreen'

type Status = 'pending' | 'locked' | 'unlocked'

// A 401 means the session is gone; anything else (server down, offline) also
// lands on the lock screen, where retrying is the obvious action.
async function probeSession(): Promise<SessionResponse> {
  try {
    return await getSession()
  } catch {
    return { authenticated: false, authRequired: true }
  }
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('pending')
  const [authRequired, setAuthRequired] = useState(false)

  const apply = useCallback((session: SessionResponse) => {
    setAuthRequired(session.authRequired)
    setStatus(session.authenticated ? 'unlocked' : 'locked')
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const session = await probeSession()
      if (!cancelled) {
        apply(session)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apply])

  useEffect(() => {
    setUnauthorizedHandler(() => setStatus('locked'))
    return () => setUnauthorizedHandler(null)
  }, [])

  const lock = useCallback(async () => {
    try {
      await logout()
    } finally {
      setStatus('locked')
    }
  }, [])

  const value = useMemo(() => ({ authRequired, lock: () => void lock() }), [authRequired, lock])

  if (status === 'pending') {
    return <div className="h-svh bg-canvas" />
  }

  if (status === 'locked') {
    return <LockScreen onUnlocked={() => void probeSession().then(apply)} />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
