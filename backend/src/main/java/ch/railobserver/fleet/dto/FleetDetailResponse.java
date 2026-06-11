package ch.railobserver.fleet.dto;

import ch.railobserver.vehicletype.VehicleType;

import java.util.List;

public record FleetDetailResponse(
        Long id,
        String name,
        String family,
        Integer fleetSize,
        long seenCount,
        long missingCount,
        List<SeenVehicleResponse> seenVehicles,
        List<String> missingNumbers
) {

    public static FleetDetailResponse from(VehicleType vehicleType, List<SeenVehicleResponse> seenVehicles, List<String> missingNumbers) {
        return new FleetDetailResponse(
                vehicleType.getId(),
                vehicleType.getName(),
                vehicleType.getFamily(),
                vehicleType.getFleetSize(),
                seenVehicles.size(),
                missingNumbers.size(),
                seenVehicles,
                missingNumbers
        );
    }
}
