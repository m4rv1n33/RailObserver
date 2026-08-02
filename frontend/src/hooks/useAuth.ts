import { createContext, useContext } from 'react'

export interface AuthState {
  // False when the backend runs without a PIN, so the UI can hide the lock button.
  authRequired: boolean
  lock: () => void
}

export const AuthContext = createContext<AuthState>({ authRequired: false, lock: () => {} })

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
