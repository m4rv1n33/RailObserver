import type {
  CreateSightingRequest,
  CreateVehicleRequest,
  FamilyCountResponse,
  FleetCountResponse,
  FleetDetailResponse,
  FleetSummaryResponse,
  MonthlyCountResponse,
  OperatorCountResponse,
  SightingLocationResponse,
  SightingResponse,
  StationCountResponse,
  UpdateVehicleRequest,
  VehicleCountResponse,
  VehicleDetailResponse,
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

export function getVehicleDetail(id: number): Promise<VehicleDetailResponse> {
  return request(`/vehicles/${id}/detail`)
}

export function updateVehicle(id: number, body: UpdateVehicleRequest): Promise<VehicleResponse> {
  return request(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
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

export function getMostSeenVehicles(limit?: number): Promise<VehicleCountResponse[]> {
  return request(`/statistics/vehicles${limit ? `?limit=${limit}` : ''}`)
}

export function getMostSeenFleets(limit?: number): Promise<FleetCountResponse[]> {
  return request(`/statistics/fleets${limit ? `?limit=${limit}` : ''}`)
}

export function getMostVisitedStations(limit?: number): Promise<StationCountResponse[]> {
  return request(`/statistics/stations${limit ? `?limit=${limit}` : ''}`)
}

export function getSightingsByFamily(): Promise<FamilyCountResponse[]> {
  return request('/statistics/families')
}

export function getSightingsByOperator(): Promise<OperatorCountResponse[]> {
  return request('/statistics/operators')
}

export function getSightingsByMonth(): Promise<MonthlyCountResponse[]> {
  return request('/statistics/monthly')
}

export function getFleets(): Promise<FleetSummaryResponse[]> {
  return request('/fleets')
}

export interface SightingLocationFilters {
  vehicleId?: number
  fleetId?: number
  from?: string
  to?: string
}

export function getSightingLocations(filters: SightingLocationFilters = {}): Promise<SightingLocationResponse[]> {
  const params = new URLSearchParams()
  if (filters.vehicleId) params.set('vehicleId', String(filters.vehicleId))
  if (filters.fleetId) params.set('fleetId', String(filters.fleetId))
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  const query = params.toString()
  return request(`/sightings/locations${query ? `?${query}` : ''}`)
}

export function getFleet(id: number): Promise<FleetDetailResponse> {
  return request(`/fleets/${id}`)
}
