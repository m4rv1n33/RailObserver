import type {
  CreateSightingRequest,
  CreateVehicleRequest,
  SightingResponse,
  VehicleResponse,
  VehicleTypeResponse,
} from './types'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function getVehicles(): Promise<VehicleResponse[]> {
  return request('/vehicles')
}

export function getVehicle(id: number): Promise<VehicleResponse> {
  return request(`/vehicles/${id}`)
}

export function createVehicle(body: CreateVehicleRequest): Promise<VehicleResponse> {
  return request('/vehicles', { method: 'POST', body: JSON.stringify(body) })
}

export function deleteVehicle(id: number): Promise<void> {
  return request(`/vehicles/${id}`, { method: 'DELETE' })
}

export function getVehicleTypes(): Promise<VehicleTypeResponse[]> {
  return request('/vehicle-types')
}

export function getVehicleType(id: number): Promise<VehicleTypeResponse> {
  return request(`/vehicle-types/${id}`)
}

export function getSightings(): Promise<SightingResponse[]> {
  return request('/sightings')
}

export function getSighting(id: number): Promise<SightingResponse> {
  return request(`/sightings/${id}`)
}

export function createSighting(body: CreateSightingRequest): Promise<SightingResponse> {
  return request('/sightings', { method: 'POST', body: JSON.stringify(body) })
}

export function deleteSighting(id: number): Promise<void> {
  return request(`/sightings/${id}`, { method: 'DELETE' })
}
