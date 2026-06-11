package ch.railobserver.sighting;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

public interface SightingRepository extends JpaRepository<Sighting, Long>, JpaSpecificationExecutor<Sighting> {

    @EntityGraph(attributePaths = {"vehicles.vehicle", "vehicles.vehicle.vehicleType"})
    List<Sighting> findAllByOrderByObservedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"vehicles.vehicle", "vehicles.vehicle.vehicleType"})
    Optional<Sighting> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"vehicles.vehicle"})
    List<Sighting> findAll(Specification<Sighting> spec, Sort sort);
}
