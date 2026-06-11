package ch.railobserver.statistics.projection;

public interface MonthlyCountProjection {
    Integer getYear();

    Integer getMonth();

    Long getCount();
}
