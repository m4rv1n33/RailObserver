import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useMobileViewport } from '../hooks/useMobileViewport'
import { getMeta } from '../api/client'

// Read once per load. A failure is not worth surfacing: the label is an aid to
// the person deploying, and an app that renders an error because it could not
// name its own host is worse than one that stays quiet about it.
function useInstanceLabel(): string | null {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const meta = await getMeta()
        const parts = [meta.serverName, meta.environment].filter(Boolean)
        if (!cancelled && parts.length > 0) {
          setLabel(parts.join(' · '))
        }
      } catch {
        // Stays null, so nothing renders.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return label
}

const tabs = [
  { to: '/', label: 'Advanced', end: true },
  { to: '/quick', label: 'Quick', end: false },
  { to: '/sightings', label: 'Sightings', end: false },
  { to: '/fleets', label: 'Fleets', end: false },
  { to: '/formation', label: 'Consists', end: false },
  { to: '/map', label: 'Map', end: false },
  { to: '/statistics', label: 'Stats', end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const taps = useRef(0)
  const instance = useInstanceLabel()
  const { keyboardOpen } = useMobileViewport()

  // Easter egg: tapping the title five times opens the hidden sample formations.
  function tapTitle() {
    taps.current += 1
    if (taps.current >= 5) {
      taps.current = 0
      navigate('/secret/formations')
    }
  }

  return (
    <div className="flex h-[var(--app-height)] flex-col bg-canvas text-fg">
      {/* viewport-fit=cover puts the header under the status bar / notch, so
          the bar's own height is added on top of the 3.5rem content row. */}
      <header className="flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-line bg-surface/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <h1
          className="flex select-none items-center gap-2.5 text-lg font-bold tracking-tight"
          onClick={tapTitle}
        >
          <span className="grid h-7 w-7 place-items-center border border-accent bg-accent font-num text-[0.7rem] font-bold leading-none text-accent-fg">
            RO
          </span>
          <span>
            RailObserver
            <span className="ml-1 align-middle text-accent">·</span>
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* min-h-0 keeps main the scroll container instead of letting the flex
          column grow the window, so sticky footers inside pages land on top of
          the nav rather than under it. */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>

      {/* Which machine and which deployment this is. Prod and staging run on
          the same host and look identical otherwise, so the line has to be
          present on every screen rather than behind a menu; it stays small
          enough to read past. Absent entirely when unconfigured. */}
      {instance && !keyboardOpen && (
        <div className="shrink-0 border-t border-line bg-surface px-4 py-1 text-center font-num text-[0.65rem] tracking-tight text-dim">
          {instance}
        </div>
      )}

      {/* Hidden while the keyboard is up: seven tabs plus the instance line are
          a third of what is left of a phone screen, and neither is reachable
          without dismissing the keyboard first. */}
      {!keyboardOpen && (
        <nav className="shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-7">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-12 items-center justify-center border-t-2 px-0.5 text-center text-[0.625rem] font-medium leading-tight tracking-tight transition-colors min-[360px]:text-[0.7rem] sm:text-[0.8rem] ${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-dim hover:text-fg'
                  }`
                }
              >
                <span className="block w-full truncate">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
