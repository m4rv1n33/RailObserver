package ch.railobserver.sighting.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.Instant;
import java.util.List;

public record CreateSightingRequest(
        Instant observedAt,
        String station,
        Double latitude,
        Double longitude,
        String direction,
        @Valid ServiceInfoRequest service,
        String notes,
        @NotEmpty List<@NotBlank String> vehicleNumbers
) {
}
