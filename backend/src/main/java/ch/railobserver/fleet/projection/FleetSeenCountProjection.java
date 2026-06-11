package ch.railobserver.fleet.projection;

public interface FleetSeenCountProjection {
    Long getVehicleTypeId();

    Long getSeenCount();
}
