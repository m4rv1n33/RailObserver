package ch.railobserver.statistics.dto;

import ch.railobserver.statistics.projection.OperatorCountProjection;

public record OperatorCountResponse(
        String operator,
        long count
) {

    public static OperatorCountResponse from(OperatorCountProjection projection) {
        String operator = projection.getOperator() != null ? projection.getOperator() : "Unknown";
        return new OperatorCountResponse(operator, projection.getCount());
    }
}
