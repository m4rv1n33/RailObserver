package ch.railobserver.statistics.projection;

public interface VehicleCountProjection {
    Long getVehicleId();

    String getNumber();

    String getVehicleTypeName();

    Long getCount();
}
