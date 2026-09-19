import { Link } from 'react-router-dom'

// Borrows only the INTEGRA footer readout from the static error pages; AppShell
// already provides the header.
export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col">
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

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line px-5 py-4 font-mono text-xs uppercase tracking-widest text-dim">
        <p>INTEGRA homelab</p>
        <p>
          HTTP <span className="text-accent">404</span>
        </p>
      </div>
    </div>
  )
}
