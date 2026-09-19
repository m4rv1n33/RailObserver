import { Link } from 'react-router-dom'

const readout = 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 font-mono text-xs uppercase tracking-widest text-dim'

// Mirrors the INTEGRA status-bar header and footer of the static error pages,
// scaled down to sit inside AppShell and drawn with the app's theme tokens.
export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className={`${readout} min-h-12 border-b border-line py-3`}>
        <p className="flex min-w-0 items-center gap-2.5">
          <strong className="font-sans text-sm font-bold tracking-[0.12em] text-fg">INTEGRA</strong>
          <span className="truncate normal-case tracking-normal">/ RailObserver</span>
        </p>
        <p className="flex items-center gap-2 text-fg">
          <span className="inline-block h-2 w-2 bg-accent" aria-hidden="true" /> Not found
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-5 text-center">
        <div className="max-w-xl">
          <h1 className="text-[clamp(4.5rem,20vw,8rem)] font-bold leading-none tracking-tight">404</h1>
          <h2 className="mt-4 border-b border-line pb-6 text-[clamp(1.875rem,6vw,2.25rem)] font-bold tracking-tight">
            Not Found
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-dim">This page does not exist.</p>
          <Link
            to="/"
            className="mt-6 inline-block font-mono text-sm text-dim underline-offset-4 hover:text-accent hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>

      <div className={`${readout} border-t border-line py-4`}>
        <p>INTEGRA homelab</p>
        <p>
          HTTP <span className="text-accent">404</span>
        </p>
      </div>
    </div>
  )
}
