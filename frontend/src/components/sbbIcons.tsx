// SBB icons (https://github.com/sbb-design-systems/sbb-icons), Apache License 2.0.
// Inlined as path data so the diagram has no asset/runtime dependency. The
// pictograms (wheelchair, bicycle) and the formation service-attribute icons
// (sa-nf low-floor, sa-wr restaurant, sa-fz family zone, sa-bz business zone)
// are recoloured via currentColor.

interface IconDef {
  viewBox: string
  path: string
}

const ICONS: Record<string, IconDef> = {
  wheelchair: {
    viewBox: '0 0 24 24',
    path: 'M10.5 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-.5 8.5V8h1v5h5v6h-1v-5h-5zm-3.995 1c0-1.75 1.01-3.27 2.471-4.014l.454.891A3.51 3.51 0 0 0 7.005 14.5c0 1.922 1.578 3.5 3.5 3.5 1.39 0 2.605-.826 3.168-2.018l.904.428A4.52 4.52 0 0 1 10.505 19a4.514 4.514 0 0 1-4.5-4.5',
  },
  bike: {
    viewBox: '0 0 24 24',
    path: 'M16.5 6H13v1h2.566l-1.334 2H8.65l-.12.329-.644 1.77A4.002 4.002 0 0 0 3 15c0 2.206 1.794 4 4 4s4-1.794 4-4a4 4 0 0 0-2.174-3.559L9.35 10h4.828l.725 1.595A4 4 0 0 0 17.002 19c2.206 0 4-1.794 4-4a4.004 4.004 0 0 0-5.188-3.82l-.743-1.634 1.846-2.77.518-.776zm-2.499 9a3 3 0 0 1 1.32-2.485l1.225 2.691.91-.413-1.224-2.693Q16.6 12 17 12c1.654 0 3 1.346 3 3s-1.346 3-3 3c-1.655 0-3-1.346-3-3m-6.46-2.951-1.01 2.78.939.341 1.01-2.778A3 3 0 0 1 10 15c0 1.654-1.346 3-3 3s-3-1.346-3-3a3.004 3.004 0 0 1 3.54-2.951M7.208 8h2.793V7H7.209z',
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
  return (
    <svg viewBox={icon.viewBox} fill="currentColor" className={className} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <path fillRule="evenodd" clipRule="evenodd" d={icon.path} />
    </svg>
  )
}
