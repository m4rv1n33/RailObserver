package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.FleetCountProjection;

public record FleetCountResponse(
        Long vehicleTypeId,
        String name,
        long count
) {

    public static FleetCountResponse from(FleetCountProjection projection) {
        return new FleetCountResponse(
                projection.getVehicleTypeId(),
                projection.getName(),
                projection.getCount()
        );
    }
}
