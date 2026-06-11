package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.VehicleCountProjection;

public record VehicleCountResponse(
        Long vehicleId,
        String number,
        String vehicleTypeName,
        long count
) {

    public static VehicleCountResponse from(VehicleCountProjection projection) {
        return new VehicleCountResponse(
                projection.getVehicleId(),
                projection.getNumber(),
                projection.getVehicleTypeName(),
                projection.getCount()
        );
    }
}
