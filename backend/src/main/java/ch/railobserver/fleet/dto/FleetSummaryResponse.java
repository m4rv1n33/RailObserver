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

    public static FleetSummaryResponse from(VehicleType vehicleType, Integer fleetSize, long seenCount, long missingCount) {
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
