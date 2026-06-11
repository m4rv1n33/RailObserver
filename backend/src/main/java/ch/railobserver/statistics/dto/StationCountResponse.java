package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.StationCountProjection;

public record StationCountResponse(
        String station,
        long count
) {

    public static StationCountResponse from(StationCountProjection projection) {
        return new StationCountResponse(
                projection.getStation(),
                projection.getCount()
        );
    }
}
