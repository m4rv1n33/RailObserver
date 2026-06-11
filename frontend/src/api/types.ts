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
  notes: string | null
}

export interface VehicleDetailResponse {
  id: number
  number: string
  vehicleType: VehicleTypeResponse | null
  operator: string | null
  manufacturer: string | null
  notes: string | null
  firstSeen: string | null
  lastSeen: string | null
  sightingCount: number
  observedServices: string[]
  observedLocations: string[]
}

export interface UpdateVehicleRequest {
  notes?: string | null
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

export interface VehicleCountResponse {
  vehicleId: number
  number: string
  vehicleTypeName: string | null
  count: number
}

export interface FleetCountResponse {
  vehicleTypeId: number
  name: string
  count: number
}

export interface StationCountResponse {
  station: string
  count: number
}

export interface FamilyCountResponse {
  family: string
  count: number
}

export interface OperatorCountResponse {
  operator: string
  count: number
}

export interface MonthlyCountResponse {
  year: number
  month: number
  count: number
}

export interface SightingLocationResponse {
  id: number
  latitude: number | null
  longitude: number | null
  observedAt: string
  station: string | null
  vehicleNumbers: string[]
}

export interface FleetSummaryResponse {
  id: number
  name: string
  family: string | null
  fleetSize: number | null
  seenCount: number
  missingCount: number
}

export interface SeenVehicleResponse {
  id: number
  number: string
}

export interface FleetDetailResponse {
  id: number
  name: string
  family: string | null
  fleetSize: number | null
  seenCount: number
  missingCount: number
  seenVehicles: SeenVehicleResponse[]
  missingNumbers: string[]
}

export interface StationResponse {
  id: string
  name: string
}

export interface DepartureResponse {
  line: string | null
  trainNumber: string | null
  destination: string | null
  departureTime: string | null
  platform: string | null
}
