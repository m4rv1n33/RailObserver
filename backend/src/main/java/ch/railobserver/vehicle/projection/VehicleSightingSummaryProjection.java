package ch.railobserver.vehicle.projection;

import java.time.Instant;

public interface VehicleSightingSummaryProjection {
    Instant getFirstSeen();
    Instant getLastSeen();
    long getSightingCount();
}
