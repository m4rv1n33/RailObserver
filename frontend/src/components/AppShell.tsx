import { useRef, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'

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
  const { authRequired, lock } = useAuth()

  // Easter egg: tapping the title five times opens the hidden sample formations.
  function tapTitle() {
    taps.current += 1
    if (taps.current >= 5) {
      taps.current = 0
      navigate('/secret/formations')
    }
  }

  return (
    <div className="flex h-svh flex-col bg-canvas text-fg">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface/85 px-4 backdrop-blur-md">
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
          {authRequired && (
            <button
              type="button"
              onClick={lock}
              aria-label="Lock"
              title="Lock"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-dim transition-colors hover:bg-subtle hover:text-fg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path strokeLinecap="round" d="M8 10V7a4 4 0 1 1 8 0v3" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* min-h-0 keeps main the scroll container instead of letting the flex
          column grow the window, so sticky footers inside pages land on top of
          the nav rather than under it. */}
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

      <nav className="shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-7">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `border-t-2 py-2.5 text-center text-[0.8rem] font-medium tracking-tight transition-colors ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-dim hover:text-fg'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
