package ch.railobserver.transport.dto;

import java.time.Instant;

public record DepartureResponse(
        String line,
        String trainNumber,
        String destination,
        Instant departureTime,
        String platform,
        String operator
) {
}
