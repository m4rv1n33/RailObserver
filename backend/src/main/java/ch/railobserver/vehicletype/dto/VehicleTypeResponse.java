package ch.railobserver.vehicletype.dto;

import ch.railobserver.vehicletype.VehicleType;

public record VehicleTypeResponse(
        Long id,
        String name,
        String family,
        String manufacturer,
        Integer fleetSize,
        String numberPrefix
) {

    public static VehicleTypeResponse from(VehicleType vehicleType) {
        return new VehicleTypeResponse(
                vehicleType.getId(),
                vehicleType.getName(),
                vehicleType.getFamily(),
                vehicleType.getManufacturer(),
                vehicleType.getFleetSize(),
                vehicleType.getNumberPrefix()
        );
    }
}
