package ch.railobserver.sighting;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SightingRepository extends JpaRepository<Sighting, Long> {

    @EntityGraph(attributePaths = {"vehicles.vehicle", "vehicles.vehicle.vehicleType"})
    List<Sighting> findAllByOrderByObservedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"vehicles.vehicle", "vehicles.vehicle.vehicleType"})
    Optional<Sighting> findById(Long id);
}
