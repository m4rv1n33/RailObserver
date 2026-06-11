package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.MonthlyCountProjection;

public record MonthlyCountResponse(
        int year,
        int month,
        long count
) {

    public static MonthlyCountResponse from(MonthlyCountProjection projection) {
        return new MonthlyCountResponse(
                projection.getYear(),
                projection.getMonth(),
                projection.getCount()
        );
    }
}
