package ch.railobserver.sighting.dto;

import ch.railobserver.sighting.Sighting;

import java.time.Instant;
import java.util.List;

public record SightingLocationResponse(
        Long id,
        Double latitude,
        Double longitude,
        Instant observedAt,
        String station,
        List<String> vehicleNumbers
) {

    public static SightingLocationResponse from(Sighting sighting) {
        return new SightingLocationResponse(
                sighting.getId(),
                sighting.getLatitude(),
                sighting.getLongitude(),
                sighting.getObservedAt(),
                sighting.getStation(),
                sighting.getVehicles().stream()
                        .map(sv -> sv.getVehicle().getNumber())
                        .toList()
        );
    }
}
