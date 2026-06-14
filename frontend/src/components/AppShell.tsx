import { useRef, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const tabs = [
  { to: '/', label: 'Advanced', end: true },
  { to: '/quick', label: 'Quick', end: false },
  { to: '/sightings', label: 'Sightings', end: false },
  { to: '/fleets', label: 'Fleets', end: false },
  { to: '/formation', label: 'Trains', end: false },
  { to: '/map', label: 'Map', end: false },
  { to: '/statistics', label: 'Stats', end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const taps = useRef(0)

  // Easter egg: tapping the title five times opens the hidden sample formations.
  function tapTitle() {
    taps.current += 1
    if (taps.current >= 5) {
      taps.current = 0
      navigate('/secret/formations')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-canvas text-fg">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 shadow-sm">
        <h1
          className="flex select-none items-center gap-2 text-lg font-semibold tracking-tight"
          onClick={tapTitle}
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-fg shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <rect x="5" y="3" width="14" height="13" rx="3" />
              <path strokeLinecap="round" d="M5 10h14M9 16l-2 4m8-4 2 4M9.5 7h5" />
              <circle cx="9" cy="13" r="0.6" fill="currentColor" />
              <circle cx="15" cy="13" r="0.6" fill="currentColor" />
            </svg>
          </span>
          Rail<span className="text-accent">Observer</span>
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-7 gap-1 p-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-faint hover:text-fg'
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
