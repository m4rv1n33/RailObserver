// SBB icons (https://github.com/sbb-design-systems/sbb-icons), Apache License 2.0.
// Inlined as path data so the diagram has no asset/runtime dependency. All are
// from the cohesive "timetable / service attribute" family (sa-rs wheelchair,
// sa-vo bicycle, sa-nf low-floor, sa-wr restaurant, sa-fz family zone, sa-bz
// business zone) so they share size and weight; recoloured via currentColor.

interface IconDef {
  viewBox: string
  path: string
  fillRule?: 'evenodd' | 'nonzero'
}

const ICONS: Record<string, IconDef> = {
  wheelchair: {
    viewBox: '0 0 13 16',
    path: 'M5.718 3.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M9.334 11l.862 2.38a.94.94 0 0 0 .872.62c.645 0 1.1-.65.873-1.26l-1.289-3.58a.98.98 0 0 0-.931-.66H7.194V5.75c0-.83-.664-1.5-1.487-1.5-.822 0-1.486.67-1.486 1.5V9.5c0 .83.664 1.5 1.486 1.5zm-.743.68.614 1.7v.01c-.862.98-2.1 1.61-3.498 1.61C3.111 15 1 12.87 1 10.25c0-1.7.892-3.18 2.23-4.02V8.2a3.24 3.24 0 0 0-.744 2.05c0 1.79 1.447 3.25 3.221 3.25 1.269 0 2.359-.75 2.884-1.82',
  },
  bike: {
    viewBox: '0 0 28 16',
    fillRule: 'nonzero',
    path: 'M21.75 4.5c-.79 0-1.53.19-2.2.5l-.8-1.22V2.5H21V1h-3.75v2.25h-5.76l-.39-.75h.9V1H8v1.5h1.41l.71 1.38-1.16 1.4a5.17 5.17 0 0 0-2.72-.78C3.35 4.5.99 6.85.99 9.75S3.35 15 6.24 15c2.64 0 4.81-1.96 5.17-4.5h2.97l3.59-5.16.32.49c-1.09.96-1.8 2.36-1.8 3.92 0 2.9 2.36 5.25 5.25 5.25s5.25-2.35 5.25-5.25-2.36-5.25-5.25-5.25zM12.77 9h-1.35a5.1 5.1 0 0 0-1.3-2.76l.75-.91L12.76 9zM9.16 7.41c.37.46.65.99.77 1.59H7.85zM6.25 13.5c-2.07 0-3.75-1.68-3.75-3.75S4.18 6 6.25 6c.64 0 1.22.17 1.75.45L4.66 10.5h5.27c-.35 1.71-1.86 3-3.67 3zm7.85-5.2-1.83-3.55h4.3zm7.65 5.2c-2.07 0-3.75-1.68-3.75-3.75 0-1.04.43-1.98 1.12-2.66l2.01 3.07 1.26-.82-2-3.07c.43-.17.89-.27 1.37-.27 2.07 0 3.75 1.68 3.75 3.75s-1.68 3.75-3.75 3.75z',
  },
  lowFloor: {
    viewBox: '0 0 28 16',
    path: 'M10.562 11.63 12.842 1h2.641l-3.021 14H8.86L5.941 4.27h-.04L3.68 15H1L4 1h3.54l2.982 10.63zM15.559 15 18.5 1h7.702l-.48 2.206h-4.88l-.74 3.449h4.66l-.44 2.208h-4.682L18.36 15z',
  },
  restaurant: {
    viewBox: '0 0 12 16',
    path: 'M5 5V1h1v4c0 1.11-.74 2.05-1.75 2.37V15h-1.5V7.37A2.49 2.49 0 0 1 1 5V1h1v4h1V1h1v4zm3 5V4c0-1.66 1.34-3 3-3v14H9.5v-5z',
  },
  familyZone: {
    viewBox: '0 0 21 16',
    path: 'M16.817 1c1.749 0 3.163 1.441 3.163 3.222H20a3.22 3.22 0 0 1-2.25 3.082c.03.27.05.55.05.831 0 3.793-3.272 6.865-7.3 6.865s-7.3-3.072-7.3-6.865c0-.28.01-.56.05-.83A3.21 3.21 0 0 1 1 4.222C1 2.441 2.415 1 4.163 1c1.032 0 1.946.5 2.525 1.28 1.1-.63 2.407-1 3.802-1s2.692.36 3.802 1A3.14 3.14 0 0 1 16.817 1M8.516 6.004c0-.55-.443-1.001-.983-1.001s-.982.45-.982 1c0 .551.442 1.001.982 1.001s.983-.45.983-1M6.55 10.507c0 1.661 1.758 3.002 3.93 3.002 2.17 0 3.929-1.341 3.929-3.002s-1.758-3.002-3.93-3.002c-2.17 0-3.93 1.34-3.93 3.002m6.385-4.503c0 .55.443 1 .983 1s.982-.45.982-1-.442-1.001-.982-1.001-.983.45-.983 1m-.982 4.002c0 .83-.66 1.502-1.474 1.502s-1.473-.672-1.473-1.502c0-.829.66-1.5 1.473-1.5s1.474.671 1.474 1.5',
  },
  businessZone: {
    viewBox: '0 0 24 16',
    path: 'M19.181 1c.96 0 1.75.79 1.75 1.75V12h-18.5V2.75c0-.96.79-1.75 1.75-1.75zm-15.25 9.5h15.5V2.75c0-.14-.11-.25-.25-.25h-15c-.14 0-.25.11-.25.25zm9.85 3.5v-1h8.9c0 1.1-.9 2-2 2h-18c-1.1 0-2-.9-2-2h9.1v1z',
  },
}

export type SbbIconName = keyof typeof ICONS

export function SbbIcon({ name, title, className }: { name: SbbIconName; title?: string; className?: string }) {
  const icon = ICONS[name]
  const rule = icon.fillRule ?? 'evenodd'
  return (
    <svg viewBox={icon.viewBox} fill="currentColor" className={className} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <path fillRule={rule} clipRule={rule} d={icon.path} />
    </svg>
  )
}
