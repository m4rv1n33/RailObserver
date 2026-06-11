import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Quick', end: true },
  { to: '/advanced', label: 'Advanced', end: false },
  { to: '/sightings', label: 'Sightings', end: false },
  { to: '/fleets', label: 'Fleets', end: false },
  { to: '/map', label: 'Map', end: false },
  { to: '/statistics', label: 'Stats', end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold">RailObserver</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6 gap-1 p-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
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
