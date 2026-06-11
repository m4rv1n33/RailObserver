package ch.railobserver.vehicle;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByNumber(String number);

    boolean existsByNumber(String number);

    @Override
    @EntityGraph(attributePaths = "vehicleType")
    List<Vehicle> findAll();

    @Override
    @EntityGraph(attributePaths = "vehicleType")
    Optional<Vehicle> findById(Long id);
}
