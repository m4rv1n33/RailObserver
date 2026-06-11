package ch.railobserver.vehicletype;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {

    Optional<VehicleType> findByNumberPrefix(String numberPrefix);
}
