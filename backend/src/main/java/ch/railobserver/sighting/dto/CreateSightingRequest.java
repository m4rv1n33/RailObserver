package ch.railobserver.sighting.dto;

import ch.railobserver.sighting.FormationSnapshot;
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
        FormationSnapshot formation,
        @NotEmpty List<@NotBlank String> vehicleNumbers
) {
}
