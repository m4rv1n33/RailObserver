package ch.railobserver.vehicle.dto;

import ch.railobserver.vehicle.Vehicle;
import ch.railobserver.vehicle.projection.VehicleSightingSummaryProjection;
import ch.railobserver.vehicletype.dto.VehicleTypeResponse;

import java.time.Instant;
import java.util.List;

public record VehicleDetailResponse(
        Long id,
        String number,
        VehicleTypeResponse vehicleType,
        String operator,
        String manufacturer,
        String notes,
        Instant firstSeen,
        Instant lastSeen,
        long sightingCount,
        List<String> observedServices,
        List<String> observedLocations
) {

    public static VehicleDetailResponse from(Vehicle vehicle,
                                               VehicleSightingSummaryProjection summary,
                                               List<String> observedServices,
                                               List<String> observedLocations) {
        VehicleTypeResponse vehicleType = vehicle.getVehicleType() != null
                ? VehicleTypeResponse.from(vehicle.getVehicleType())
                : null;
        return new VehicleDetailResponse(
                vehicle.getId(),
                vehicle.getNumber(),
                vehicleType,
                vehicle.getOperator(),
                vehicle.getManufacturer(),
                vehicle.getNotes(),
                summary.getFirstSeen(),
                summary.getLastSeen(),
                summary.getSightingCount(),
                observedServices,
                observedLocations
        );
    }
}
