package ch.railobserver.sighting.dto;

import java.time.Instant;

public record ServiceInfoRequest(
        String line,
        String trainNumber,
        String destination,
        Instant departureTime
) {
}
