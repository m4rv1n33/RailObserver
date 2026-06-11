import { useState } from 'react'
import { createSighting } from '../api/client'
import { useVehicleNumbers } from '../hooks/useVehicleNumbers'
import { VehicleNumberInput } from '../components/VehicleNumberInput'

export function QuickPage() {
  const vehicles = useVehicleNumbers()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    const vehicleNumbers = vehicles.all()
    if (vehicleNumbers.length === 0) return

    setStatus('saving')
    try {
      await createSighting({ vehicleNumbers })
      vehicles.reset()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold">Quick</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter a vehicle number and save. Add more for a composition.
      </p>

      <div className="mt-4">
        <VehicleNumberInput
          numbers={vehicles.numbers}
          input={vehicles.input}
          onInputChange={vehicles.setInput}
          onAdd={vehicles.add}
          onRemove={vehicles.remove}
          onEnter={() => void save()}
          autoFocus
        />
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={status === 'saving' || vehicles.all().length === 0}
        className="mt-4 w-full rounded-md bg-slate-900 py-3 text-lg font-semibold text-white disabled:opacity-40"
      >
        {status === 'saving' ? 'Saving...' : 'Save sighting'}
      </button>

      {status === 'saved' && <p className="mt-3 text-sm text-emerald-600">Sighting saved.</p>}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">Could not save sighting. Try again.</p>
      )}
    </div>
  )
}
