package ch.railobserver.sighting.dto;

import ch.railobserver.sighting.ServiceInfo;

import java.time.Instant;

public record ServiceInfoResponse(
        String line,
        String trainNumber,
        String destination,
        Instant departureTime
) {

    public static ServiceInfoResponse from(ServiceInfo serviceInfo) {
        if (serviceInfo == null || serviceInfo.isEmpty()) {
            return null;
        }
        return new ServiceInfoResponse(
                serviceInfo.getLine(),
                serviceInfo.getTrainNumber(),
                serviceInfo.getDestination(),
                serviceInfo.getDepartureTime()
        );
    }
}
