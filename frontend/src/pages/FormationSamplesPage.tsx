import { Link } from 'react-router-dom'
import type { FormationCar, FormationResponse } from '../api/types'
import { FormationDiagram } from '../components/FormationDiagram'
import { useSbbStyle } from '../hooks/useSbbStyle'

// Hidden page with hand-built formations for exercising the diagram without live
// API data, in particular multi-unit (double traction) trains. Reach it via the
// easter egg in AppShell (tap the title five times).

interface CarSpec {
  typeName: string
  tractive?: boolean
  travelClass?: string
  wheelchair?: boolean
  bike?: boolean
  familyZone?: boolean
}

// A typical 4-car FLIRT (RABe 523): low-floor throughout, driving cars at the
// ends, a wheelchair car, a mixed-class car and a bike car.
function flirtUnit(unitNumber: string, start: number, sector: string): FormationCar[] {
  const specs: CarSpec[] = [
    { typeName: 'Bt523', tractive: true },
    { typeName: 'B523', wheelchair: true },
    { typeName: 'AB523', travelClass: '12', bike: true },
    { typeName: 'Bt523', tractive: true, familyZone: true },
  ]
  return specs.map((spec, index) => ({
    position: start + index,
    number: unitNumber,
    typeName: spec.typeName,
    tractive: spec.tractive ?? false,
    travelClass: spec.travelClass ?? '2',
    sectors: sector,
    wheelchair: spec.wheelchair ?? false,
    lowFloor: true,
    bike: spec.bike ?? false,
    restaurant: false,
    familyZone: spec.familyZone ?? false,
    businessZone: false,
    unitNumber,
  }))
}

const SAMPLES: { title: string; description: string; formation: FormationResponse }[] = [
  {
    title: 'Double traction',
    description: 'Two coupled FLIRT units. Exactly two units, so they get front / back labels.',
    formation: {
      cars: [...flirtUnit('523-015', 1, 'A'), ...flirtUnit('523-016', 5, 'B')],
      units: [
        { number: '523-015', detectedFleet: 'RABe 523', positionLabel: 'front' },
        { number: '523-016', detectedFleet: 'RABe 523', positionLabel: 'back' },
      ],
    },
  },
  {
    title: 'Triple traction',
    description: 'Three coupled units. More than two, so no front / back labels.',
    formation: {
      cars: [
        ...flirtUnit('523-015', 1, 'A'),
        ...flirtUnit('523-016', 5, 'B'),
        ...flirtUnit('523-017', 9, 'C'),
      ],
      units: [
        { number: '523-015', detectedFleet: 'RABe 523', positionLabel: null },
        { number: '523-016', detectedFleet: 'RABe 523', positionLabel: null },
        { number: '523-017', detectedFleet: 'RABe 523', positionLabel: null },
      ],
    },
  },
]

function SbbStyleToggle() {
  const { enabled, toggle } = useSbbStyle()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-fg">SBB style</span>
        <span className="block text-xs text-dim">Swap the palette for SBB red and greys.</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-accent' : 'bg-subtle2'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function FormationSamplesPage() {
  return (
    <div className="p-4">
      <Link to="/" className="text-sm text-dim hover:text-fg">
        &larr; Back
      </Link>

      <h2 className="mt-2 text-base font-semibold">Secret menu</h2>
      <p className="mt-1 text-sm text-dim">Hidden settings and test data.</p>

      <section className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-fg">Appearance</h3>
        <SbbStyleToggle />
      </section>

      <h3 className="mt-6 text-sm font-semibold text-fg">Formation samples</h3>
      <p className="text-xs text-dim">Hidden test data. Not real sightings.</p>

      <div className="mt-3 space-y-6">
        {SAMPLES.map((sample) => (
          <section key={sample.title}>
            <h3 className="text-sm font-semibold">{sample.title}</h3>
            <p className="mb-2 text-xs text-dim">{sample.description}</p>
            <FormationDiagram formation={sample.formation} />
          </section>
        ))}
      </div>
    </div>
  )
}
