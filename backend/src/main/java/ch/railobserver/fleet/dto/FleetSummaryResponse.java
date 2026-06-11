package ch.railobserver.fleet.dto;

import ch.railobserver.vehicletype.VehicleType;

public record FleetSummaryResponse(
        Long id,
        String name,
        String family,
        Integer fleetSize,
        long seenCount,
        long missingCount
) {

    public static FleetSummaryResponse from(VehicleType vehicleType, long seenCount) {
        Integer fleetSize = vehicleType.getFleetSize();
        long missingCount = fleetSize != null ? Math.max(0, fleetSize - seenCount) : 0;
        return new FleetSummaryResponse(
                vehicleType.getId(),
                vehicleType.getName(),
                vehicleType.getFamily(),
                fleetSize,
                seenCount,
                missingCount
        );
    }
}
