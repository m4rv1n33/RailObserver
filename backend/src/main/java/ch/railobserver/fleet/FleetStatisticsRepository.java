package ch.railobserver.fleet;

import ch.railobserver.fleet.projection.FleetNumberProjection;
import ch.railobserver.fleet.projection.SeenVehicleProjection;
import ch.railobserver.sighting.SightingVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FleetStatisticsRepository extends JpaRepository<SightingVehicle, Long> {

    @Query("""
            SELECT DISTINCT v.id AS id, v.number AS number
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            WHERE v.vehicleType.id = :vehicleTypeId
            """)
    List<SeenVehicleProjection> findSeenVehicles(@Param("vehicleTypeId") Long vehicleTypeId);

    @Query("""
            SELECT DISTINCT vt.id AS vehicleTypeId, v.number AS number
            FROM SightingVehicle sv
            JOIN sv.vehicle v
            JOIN v.vehicleType vt
            """)
    List<FleetNumberProjection> findSeenNumbersByFleet();
}
