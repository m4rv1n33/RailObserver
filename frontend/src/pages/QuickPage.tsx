import { useState } from 'react'
import { createSighting } from '../api/client'
import { useVehicleNumbers } from '../hooks/useVehicleNumbers'
import { VehicleNumberInput } from '../components/VehicleNumberInput'
import { Button } from '../components/Button'
import { PageHeading } from '../components/PageHeading'

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
      <PageHeading
        index="02"
        label="Quick"
        title="Quick"
        subtitle="Enter a vehicle number and save. Add more for a composition."
      />

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

      <Button
        variant="accent"
        onClick={() => void save()}
        disabled={status === 'saving' || vehicles.all().length === 0}
        className="mt-4 w-full py-3 text-lg font-semibold"
      >
        {status === 'saving' ? 'Saving...' : 'Save sighting'}
      </Button>

      {status === 'saved' && <p className="mt-3 text-sm text-success">Sighting saved.</p>}
      {status === 'error' && (
        <p className="mt-3 text-sm text-danger">Could not save sighting. Try again.</p>
      )}
    </div>
  )
}
