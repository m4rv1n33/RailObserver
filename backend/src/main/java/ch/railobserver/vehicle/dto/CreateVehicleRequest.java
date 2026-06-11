package ch.railobserver.vehicle.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateVehicleRequest(
        @NotBlank String number,
        Long vehicleTypeId,
        String operator,
        String manufacturer
) {
}
