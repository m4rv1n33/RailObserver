package ch.railobserver.fleet;

import ch.railobserver.fleet.projection.FleetNumberProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RosterVehicleRepository extends JpaRepository<RosterVehicle, Long> {

    @Query("SELECT r.number FROM RosterVehicle r WHERE r.vehicleType.id = :vehicleTypeId")
    List<String> findNumbersByVehicleTypeId(@Param("vehicleTypeId") Long vehicleTypeId);

    @Query("SELECT r.vehicleType.id AS vehicleTypeId, r.number AS number FROM RosterVehicle r")
    List<FleetNumberProjection> findAllNumbersByFleet();
}
