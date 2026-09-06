import { useState, type FormEvent } from 'react'
import { ApiError, login } from '../api/client'
import { Button } from './Button'
import { TextInput } from './Input'

export function LockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!pin || busy) return

    setBusy(true)
    setError(null)
    try {
      await login(pin)
      setPin('')
      onUnlocked()
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0
      setError(
        status === 429
          ? 'Too many attempts. Wait a few minutes before trying again.'
          : status === 401
            ? 'Incorrect access code'
            : 'Could not reach the server.',
      )
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-svh flex-col items-center justify-center bg-canvas px-6 text-fg">
      <form onSubmit={submit} className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center border border-accent bg-accent font-num text-sm font-bold leading-none text-accent-fg">
            RO
          </span>
          <h1 className="text-2xl font-bold tracking-tight">RailObserver is locked</h1>
          <p className="text-sm text-dim">This instance is for personal use only.</p>
        </div>

        <TextInput
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          placeholder="Code"
          aria-label="Code"
          className="text-center font-num tracking-[0.3em]"
        />

        {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={!pin || busy} className="mt-6 w-full px-4 py-2.5 font-medium">
          {busy ? 'Checking...' : 'Unlock'}
        </Button>
      </form>

      <a
        href="https://m4rv1n.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 text-xs text-faint transition-colors hover:text-dim"
      >
        m4rv1n.dev
      </a>
    </div>
  )
}
