package ch.railobserver.vehicle;

import ch.railobserver.sighting.SightingVehicle;
import ch.railobserver.vehicle.projection.VehicleSightingSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleStatisticsRepository extends JpaRepository<SightingVehicle, Long> {

    @Query("""
            SELECT MIN(s.observedAt) AS firstSeen, MAX(s.observedAt) AS lastSeen, COUNT(sv) AS sightingCount
            FROM SightingVehicle sv
            JOIN sv.sighting s
            WHERE sv.vehicle.id = :vehicleId
            """)
    VehicleSightingSummaryProjection findSightingSummary(@Param("vehicleId") Long vehicleId);

    @Query("""
            SELECT DISTINCT s.service.line
            FROM SightingVehicle sv
            JOIN sv.sighting s
            WHERE sv.vehicle.id = :vehicleId AND s.service.line IS NOT NULL
            ORDER BY s.service.line
            """)
    List<String> findObservedServices(@Param("vehicleId") Long vehicleId);

    @Query("""
            SELECT DISTINCT s.station
            FROM SightingVehicle sv
            JOIN sv.sighting s
            WHERE sv.vehicle.id = :vehicleId AND s.station IS NOT NULL
            ORDER BY s.station
            """)
    List<String> findObservedLocations(@Param("vehicleId") Long vehicleId);
}
