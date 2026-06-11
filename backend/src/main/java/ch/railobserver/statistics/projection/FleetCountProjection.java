package ch.railobserver.statistics.projection;

public interface FleetCountProjection {
    Long getVehicleTypeId();

    String getName();

    Long getCount();
}
