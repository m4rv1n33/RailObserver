import { Link } from 'react-router-dom'
import type { FormationCar, FormationResponse } from '../api/types'
import { FormationDiagram } from '../components/FormationDiagram'
import { COLOR_STYLES, useColorStyle } from '../hooks/useColorStyle'

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

function ColorStylePicker() {
  const { style, setStyle } = useColorStyle()

  return (
    <div className="grid grid-cols-2 gap-2">
      {COLOR_STYLES.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setStyle(option.id)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            style === option.id
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line text-dim hover:bg-subtle hover:text-fg'
          }`}
        >
          <span
            className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: option.swatch }}
          />
          {option.label}
        </button>
      ))}
    </div>
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
        <h3 className="text-sm font-semibold text-fg">Color style</h3>
        <p className="mb-2 text-xs text-dim">
          Pick an accent palette. Works in both light and dark mode (toggle in the header).
        </p>
        <ColorStylePicker />
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
