package ch.railobserver.vehicle.dto;

import ch.railobserver.vehicle.Vehicle;
import ch.railobserver.vehicletype.dto.VehicleTypeResponse;

public record VehicleResponse(
        Long id,
        String number,
        VehicleTypeResponse vehicleType,
        String operator,
        String manufacturer
) {

    public static VehicleResponse from(Vehicle vehicle) {
        VehicleTypeResponse vehicleType = vehicle.getVehicleType() != null
                ? VehicleTypeResponse.from(vehicle.getVehicleType())
                : null;
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getNumber(),
                vehicleType,
                vehicle.getOperator(),
                vehicle.getManufacturer()
        );
    }
}
