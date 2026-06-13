import type { FormationCar, FormationResponse } from '../api/types'

function classLabel(car: FormationCar): string | null {
  switch (car.travelClass) {
    case '1':
      return '1.'
    case '2':
      return '2.'
    case '12':
      return '1./2.'
    default:
      return null
  }
}

function carStyle(car: FormationCar): string {
  if (car.tractive && !car.travelClass) {
    return 'bg-slate-800 text-white border-slate-800'
  }
  switch (car.travelClass) {
    case '1':
      return 'bg-amber-50 border-amber-400 text-amber-900'
    case '12':
      return 'bg-gradient-to-r from-amber-50 to-slate-50 border-slate-300 text-slate-700'
    case '2':
      return 'bg-slate-50 border-slate-300 text-slate-700'
    default:
      return 'bg-white border-slate-300 text-slate-700'
  }
}

function Car({ car }: { car: FormationCar }) {
  const label = classLabel(car)
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1">
      <div className="h-4 text-xs font-medium text-slate-500">{car.sectors ?? ''}</div>
      <div
        className={`flex h-20 w-full flex-col items-center justify-between rounded-lg border p-1 ${carStyle(car)}`}
      >
        <div className="flex h-4 items-center gap-1 text-xs">
          {car.wheelchair && <span aria-label="Wheelchair accessible">&#9855;</span>}
          {car.lowFloor && <span className="font-semibold" aria-label="Low-floor entry">NF</span>}
        </div>
        <div className="text-sm font-semibold">{car.tractive && !label ? 'Loco' : label}</div>
        <div className="h-4 text-[10px] leading-none opacity-70">{car.number ?? ''}</div>
      </div>
    </div>
  )
}

export function FormationDiagram({ formation }: { formation: FormationResponse }) {
  if (formation.cars.length === 0 && formation.units.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {formation.cars.length > 0 && (
        <div className="overflow-x-auto pb-1">
          <div className="flex items-end gap-1">
            {formation.cars.map((car) => (
              <Car key={car.position} car={car} />
            ))}
          </div>
        </div>
      )}

      {formation.units.length > 0 && (
        <ul className="space-y-0.5 text-sm">
          {formation.units.map((unit) => (
            <li key={unit.number} className="flex items-baseline gap-2">
              {unit.positionLabel && (
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium uppercase text-slate-600">
                  {unit.positionLabel}
                </span>
              )}
              <span className="font-medium">{unit.detectedFleet ?? 'Unknown fleet'}</span>
              <span className="text-slate-500">{unit.number}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
