export interface VehicleTypeResponse {
  id: number
  name: string
  family: string | null
  manufacturer: string | null
  fleetSize: number | null
  numberPrefix: string | null
}

export interface VehicleResponse {
  id: number
  number: string
  vehicleType: VehicleTypeResponse | null
  operator: string | null
  manufacturer: string | null
}

export interface ServiceInfoResponse {
  line: string | null
  trainNumber: string | null
  destination: string | null
  departureTime: string | null
}

export interface ServiceInfoRequest {
  line?: string | null
  trainNumber?: string | null
  destination?: string | null
  departureTime?: string | null
}

export interface SightingResponse {
  id: number
  observedAt: string
  station: string | null
  latitude: number | null
  longitude: number | null
  direction: string | null
  service: ServiceInfoResponse | null
  notes: string | null
  vehicles: VehicleResponse[]
}

export interface CreateVehicleRequest {
  number: string
  vehicleTypeId?: number | null
  operator?: string | null
  manufacturer?: string | null
}

export interface CreateSightingRequest {
  observedAt?: string | null
  station?: string | null
  latitude?: number | null
  longitude?: number | null
  direction?: string | null
  service?: ServiceInfoRequest | null
  notes?: string | null
  vehicleNumbers: string[]
}
