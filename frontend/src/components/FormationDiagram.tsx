import { Fragment, type ReactNode } from 'react'
import type { FormationCar, FormationResponse } from '../api/types'
import { SbbIcon } from './sbbIcons'
import type { SbbIconName } from './sbbIcons'

interface Amenity {
  key: 'wheelchair' | 'lowFloor' | 'bike' | 'restaurant' | 'familyZone' | 'businessZone'
  icon: SbbIconName
  label: string
}

// Per-car amenities, with their SBB icon. All are read from the formation API's
// FormationShortString (NF, BHP, VH, ...) and per-vehicle properties.
const AMENITIES: Amenity[] = [
  { key: 'wheelchair', icon: 'wheelchair', label: 'Wheelchair access' },
  { key: 'lowFloor', icon: 'lowFloor', label: 'Low-floor entry' },
  { key: 'bike', icon: 'bike', label: 'Bike spaces' },
  { key: 'restaurant', icon: 'restaurant', label: 'Restaurant / bistro' },
  { key: 'familyZone', icon: 'familyZone', label: 'Family zone' },
  { key: 'businessZone', icon: 'businessZone', label: 'Business zone' },
]

function classLabel(car: FormationCar): string {
  if (car.tractive && !car.travelClass) return 'Loco'
  switch (car.travelClass) {
    case '1':
      return '1.'
    case '2':
      return '2.'
    case '12':
      return '1./2.'
    default:
      return ''
  }
}

function carStyle(car: FormationCar): string {
  if (car.tractive && !car.travelClass) {
    return 'border-fg bg-fg text-surface'
  }
  switch (car.travelClass) {
    case '1':
      return 'border-first-border bg-first-bg text-first'
    case '12':
      return 'border-first-border bg-gradient-to-r from-first-bg to-subtle text-fg'
    case '2':
      return 'border-line bg-subtle text-fg'
    default:
      return 'border-line bg-surface text-dim'
  }
}

// Drop trailing qualifiers (e.g. "Bt511-ETCS(FR)" -> "Bt511") and insert a dash
// between the letter code and the running number ("AB511" -> "AB-511").
function shortType(car: FormationCar): string {
  if (!car.typeName) return ''
  const base = car.typeName.split('-')[0]
  const match = base.match(/^([A-Za-z]+)(\d+)$/)
  return match ? `${match[1]}-${match[2]}` : base
}

// roundLeft / roundRight mark the leading and trailing car of a coupled unit, so
// each unit in a multi-traction train gets its own rounded nose and tail.
function Car({ car, roundLeft, roundRight }: { car: FormationCar; roundLeft: boolean; roundRight: boolean }) {
  const ends = `${roundLeft ? 'rounded-l-2xl ' : ''}${roundRight ? 'rounded-r-2xl ' : ''}`
  return (
    <div className="flex w-20 shrink-0 flex-col items-center gap-1">
      <div className="flex h-5 items-center text-xs font-medium text-dim">
        {car.sectors && <span className="bg-subtle2 px-1 py-0.5 font-mono">{car.sectors}</span>}
      </div>
      <div
        className={`relative flex h-24 w-full flex-col items-center justify-between rounded-md border-2 p-1 ${carStyle(car)} ${ends}`}
      >
        <span className="text-base font-bold leading-none">{classLabel(car)}</span>
        {/* Centered on the body, not between the rows above and below it, so a
            second row of amenity icons does not push it off the connector line. */}
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-num text-[10px] leading-none opacity-70">
          {shortType(car)}
        </span>
        {/* Point amenities stay on top; low-floor (NF) always gets its own bottom
            row so the layout is stable instead of wrapping in icon order. */}
        <span className="flex min-h-4 flex-col items-center gap-0.5">
          <span className="flex items-center justify-center gap-0.5">
            {AMENITIES.filter((amenity) => amenity.key !== 'lowFloor' && car[amenity.key]).map((amenity) => (
              <SbbIcon key={amenity.key} name={amenity.icon} title={amenity.label} className="h-3.5 w-auto" />
            ))}
          </span>
          {car.lowFloor && <SbbIcon name="lowFloor" title="Low-floor entry" className="h-3.5 w-auto" />}
        </span>
      </div>
    </div>
  )
}

// Two adjacent cars belong to different coupled units (no walk-through between
// them) when their recordable unit numbers differ.
function isUnitBreak(left: FormationCar, right: FormationCar): boolean {
  return left.unitNumber !== right.unitNumber
}

function NoPassage() {
  return (
    <span className="flex w-4" title="No passage between units">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 text-faint">
        <circle cx="8" cy="8" r="6" />
        <line x1="3.8" y1="3.8" x2="12.2" y2="12.2" />
      </svg>
    </span>
  )
}

// A gap between two cars. The sector-label header (h-5 + gap) sits above the
// car body, so a connector must reserve that same space to line up with the
// vertical center of the body rather than the whole column.
function Connector({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="h-5" />
      <div className="flex h-24 items-center">{children}</div>
    </div>
  )
}

// Cars are listed in running order with the leading car (position 1) first, so
// the train moves toward the front of the diagram (left).
function DirectionOfTravel() {
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-dim">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5">
        <line x1="14" y1="8" x2="3" y2="8" />
        <polyline points="7,4 3,8 7,12" />
      </svg>
      <span>Direction of travel</span>
    </div>
  )
}

export function FormationDiagram({ formation }: { formation: FormationResponse }) {
  if (formation.cars.length === 0 && formation.units.length === 0) {
    return null
  }

  const present = AMENITIES.filter((amenity) => formation.cars.some((car) => car[amenity.key]))
  const hasUnitBreak = formation.cars.some(
    (car, index) => index > 0 && isUnitBreak(formation.cars[index - 1], car),
  )

  return (
    <div className="space-y-3">
      {formation.cars.length > 0 && (
        <div className="space-y-1">
          <DirectionOfTravel />
          <div className="overflow-x-auto pb-1">
            <div className="flex items-stretch">
              {formation.cars.map((car, index) => (
                <Fragment key={car.position}>
                  {index > 0 &&
                    (isUnitBreak(formation.cars[index - 1], car) ? (
                      <Connector>
                        <NoPassage />
                      </Connector>
                    ) : (
                      <Connector>
                        <div className="h-1.5 w-2 bg-subtle2" />
                      </Connector>
                    ))}
                  <Car
                    car={car}
                    roundLeft={index === 0 || isUnitBreak(formation.cars[index - 1], car)}
                    roundRight={
                      index === formation.cars.length - 1 ||
                      isUnitBreak(car, formation.cars[index + 1])
                    }
                  />
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {(present.length > 0 || hasUnitBreak) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-dim">
          {hasUnitBreak && (
            <span className="inline-flex items-center gap-1">
              <NoPassage />
              No passage between units
            </span>
          )}
          {present.map((amenity) => (
            <span key={amenity.key} className="inline-flex items-center gap-1">
              <SbbIcon name={amenity.icon} title={amenity.label} className="h-4 w-auto text-dim" />
              {amenity.label}
            </span>
          ))}
        </div>
      )}

      {formation.units.length > 0 && (
        <ul className="space-y-1 text-sm">
          {formation.units.map((unit) => (
            <li key={unit.number} className="flex items-baseline gap-2">
              {unit.positionLabel && (
                <span className="bg-subtle2 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-dim">
                  {unit.positionLabel}
                </span>
              )}
              <span className="font-medium">{unit.detectedFleet ?? 'Unknown fleet'}</span>
              <span className="font-num text-dim">{unit.number}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
