package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.FamilyCountProjection;

public record FamilyCountResponse(
        String family,
        long count
) {

    public static FamilyCountResponse from(FamilyCountProjection projection) {
        String family = projection.getFamily() != null ? projection.getFamily() : "Unknown";
        return new FamilyCountResponse(family, projection.getCount());
    }
}
