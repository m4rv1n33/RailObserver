package ch.railobserver.statistics;

import ch.railobserver.sighting.SightingVehicle;
import ch.railobserver.statistics.projection.FamilyCountProjection;
import ch.railobserver.statistics.projection.FleetCountProjection;
import ch.railobserver.statistics.projection.OperatorCountProjection;
import ch.railobserver.statistics.projection.VehicleCountProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SightingVehicleStatisticsRepository extends JpaRepository<SightingVehicle, Long> {

    @Query("""
            SELECT v.id AS vehicleId, v.number AS number, vt.name AS vehicleTypeName, COUNT(sv) AS count
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            LEFT JOIN v.vehicleType vt
            GROUP BY v.id, v.number, vt.name
            ORDER BY COUNT(sv) DESC
            """)
    List<VehicleCountProjection> findMostSeenVehicles(Pageable pageable);

    @Query("""
            SELECT vt.id AS vehicleTypeId, vt.name AS name, COUNT(sv) AS count
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            JOIN v.vehicleType vt
            GROUP BY vt.id, vt.name
            ORDER BY COUNT(sv) DESC
            """)
    List<FleetCountProjection> findMostSeenFleets(Pageable pageable);

    @Query("""
            SELECT vt.family AS family, COUNT(sv) AS count
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            LEFT JOIN v.vehicleType vt
            GROUP BY vt.family
            ORDER BY COUNT(sv) DESC
            """)
    List<FamilyCountProjection> countByFamily();

    @Query("""
            SELECT v.operator AS operator, COUNT(sv) AS count
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            GROUP BY v.operator
            ORDER BY COUNT(sv) DESC
            """)
    List<OperatorCountProjection> countByOperator();
}
